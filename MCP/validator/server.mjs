import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';

const require=createRequire(import.meta.url);
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const projectRoot=path.resolve(__dirname,'../..');
const visualAdapter=path.resolve(projectRoot,'tools/drawing_visual_metric_extractor.py');
const reviewImageExporter=path.resolve(projectRoot,'tools/drawing_review_image_exporter.py');
const sourceFidelityAdapter=path.resolve(projectRoot,'tools/drawing_source_fidelity_validator.py');
const lineHierarchyAdapter=path.resolve(projectRoot,'tools/drawing_line_hierarchy_metric.py');

const Signer=require('./receipt-signer.cjs');
const VisionParser=require('../../runtime/vision-review-parser.js');
const HumanIntent=require('../../runtime/human-intent-contract.js');

function result(value){
  return {content:[{type:'text',text:JSON.stringify(value)}]};
}

function privateKeyReadiness(envName){
  const pem=process.env[envName]||'';
  if(!pem) return {present:false,valid:false,public_fingerprint:null};
  try{
    const privateKey=crypto.createPrivateKey(pem);
    const publicKey=crypto.createPublicKey(privateKey);
    const der=publicKey.export({type:'spki',format:'der'});
    return {
      present:true,
      valid:true,
      public_fingerprint:crypto.createHash('sha256').update(der).digest('hex').slice(0,24)
    };
  }catch(e){
    return {present:true,valid:false,public_fingerprint:null};
  }
}

function projectSafe(rawPath){
  const root=path.resolve(process.env.CLAUDE_PROJECT_DIR||projectRoot);
  const candidate=path.resolve(rawPath);
  return candidate===root || candidate.startsWith(root+path.sep);
}

function sha256File(filePath){
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function runJsonPython(script,args){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    execFile(python,[script,...args],{maxBuffer:40*1024*1024},(err,stdout,stderr)=>{
      if(err){ reject(new Error(stderr||stdout||err.message)); return; }
      try{ resolve(JSON.parse(stdout)); }
      catch(e){ reject(new Error('VALIDATOR_JSON_INVALID:'+e.message)); }
    });
  });
}

function runVisualPython(args){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    execFile(python,[visualAdapter,...args],{maxBuffer:20*1024*1024},(err,stdout,stderr)=>{
      if(err){ reject(new Error(stderr||err.message)); return; }
      try{ resolve(JSON.parse(stdout)); }
      catch(e){ reject(new Error('VISUAL_METRIC_JSON_INVALID:'+e.message)); }
    });
  });
}

function renderReviewPng(sourcePath,pageIndex=0){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    const out=path.join(os.tmpdir(),'taky-validator-'+crypto.randomUUID()+'.png');
    execFile(python,[reviewImageExporter,sourcePath,'--out',out,'--page',String(pageIndex),'--max-edge','2000'],
      {maxBuffer:20*1024*1024},(err,stdout,stderr)=>{
        if(err){ reject(new Error(stderr||err.message)); return; }
        resolve(out);
      });
  });
}

async function callIndependentVision({baselinePng,candidatePng,referencePngs=[],humanIntent}){
  const apiKey=process.env.ANTHROPIC_API_KEY;
  if(!apiKey) throw new Error('ANTHROPIC_API_KEY_REQUIRED');
  const model=process.env.TAKY_VISION_MODEL||'claude-sonnet-5';

  const imageBlock=filePath=>({
    type:'image',
    source:{type:'base64',media_type:'image/png',data:fs.readFileSync(filePath).toString('base64')}
  });

  const content=[
    {type:'text',text:'BASELINE / reference-off artifact:'},
    imageBlock(baselinePng),
    {type:'text',text:'CANDIDATE / proposed user-facing artifact:'},
    imageBlock(candidatePng)
  ];
  referencePngs.forEach((p,i)=>{
    content.push({type:'text',text:'REFERENCE '+(i+1)+' / professional presentation benchmark:'});
    content.push(imageBlock(p));
  });
  content.push({type:'text',text:[
    'HUMAN DESIRED OUTCOME: '+humanIntent.desired_outcome,
    'SUCCESS CRITERIA: '+(humanIntent.success_criteria.length?humanIntent.success_criteria.join(' | '):'none explicitly stated'),
    'Evaluate only visible architectural-presentation evidence against that human purpose.',
    'Return exactly one JSON object with booleans:',
    'professional_family_pass, reference_effect_visible_without_explanation, generic_layout_detected, decision_value_pass,',
    'plus reasons as an array of short strings.',
    'Be strict. Ambiguous evidence must fail positive pass fields.'
  ].join('\n')});

  const response=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'x-api-key':apiKey,
      'anthropic-version':'2023-06-01'
    },
    body:JSON.stringify({
      model,max_tokens:1200,
      system:'You are an independent architectural presentation QA validator. You did not create the candidate. Output JSON only.',
      messages:[{role:'user',content}]
    })
  });
  if(!response.ok) throw new Error('VISION_API_HTTP_'+response.status+':'+(await response.text()).slice(0,500));
  const data=await response.json();
  const textBlock=(data.content||[]).find(x=>x.type==='text');
  if(!textBlock?.text) throw new Error('VISION_API_TEXT_RESPONSE_REQUIRED');
  const parsed=VisionParser.parseVisionReview(textBlock.text);
  if(!parsed.ok) throw new Error(parsed.reason);
  return {model,review:parsed.review};
}

export function buildServer(){
  const server=new McpServer({name:'taky-independent-validation',version:'0.1.0'});

  server.registerTool(
    'get-validation-readiness',
    {
      description:'Report validator readiness without exposing private keys or API secrets.',
      inputSchema:z.object({})
    },
    async()=>{
      const measurement=privateKeyReadiness('TAKY_MEASUREMENT_PRIVATE_KEY_PEM');
      const vision=privateKeyReadiness('TAKY_VISION_PRIVATE_KEY_PEM');
      const apiPresent=Boolean(process.env.ANTHROPIC_API_KEY);
      const model=process.env.TAKY_VISION_MODEL||'claude-sonnet-5';

      const objectiveReady=measurement.valid===true;
      const visionReady=vision.valid===true && apiPresent;
      return result({
        ok:true,
        objective_validation_ready:objectiveReady,
        vision_review_ready:visionReady,
        user_facing_validation_ready:Boolean(objectiveReady && visionReady),
        measurement_key:measurement,
        vision_key:vision,
        anthropic_api_key_present:apiPresent,
        vision_model:model,
        warnings:[
          ...(measurement.valid?[]:['MEASUREMENT_PRIVATE_KEY_NOT_READY']),
          ...(vision.valid?[]:['VISION_PRIVATE_KEY_NOT_READY']),
          ...(apiPresent?[]:['ANTHROPIC_API_KEY_NOT_READY'])
        ]
      });
    }
  );

  server.registerTool(
    'verify-source-fidelity',
    {
      description:'Independently verify source PDF -> controlled SVG -> canonical SVG -> actual candidate artifact fidelity and sign an artifact-bound receipt.',
      inputSchema:z.object({
        source_pdf_path:z.string().min(1),
        controlled_svg_path:z.string().min(1),
        canonical_svg_path:z.string().min(1),
        candidate_path:z.string().min(1),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        const paths=[input.source_pdf_path,input.controlled_svg_path,input.canonical_svg_path,input.candidate_path];
        if(paths.some(p=>!projectSafe(p))) return result({ok:false,reason:'SOURCE_FIDELITY_PATH_OUTSIDE_PROJECT'});
        const evidence=await runJsonPython(sourceFidelityAdapter,[
          input.source_pdf_path,
          input.controlled_svg_path,
          input.canonical_svg_path,
          input.candidate_path,
          '--page',String(input.page_index??0)
        ]);
        if(evidence.ok!==true) return result({ok:false,reason:'SOURCE_FIDELITY_FAIL',evidence});
        const receipt=Signer.signSourceFidelity({evidence});
        return result({
          ok:true,
          receipt,
          candidate_digest:evidence.candidate_sha256,
          source_digest:evidence.source_sha256,
          validator_id:'SOURCE_FIDELITY_VALIDATOR_V1',
          evidence
        });
      }catch(error){
        return result({ok:false,reason:'SOURCE_FIDELITY_VALIDATION_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'measure-visual-artifact',
    {
      description:'Objectively measure a PDF/image and sign a receipt with the independent measurement key.',
      inputSchema:z.object({
        artifact_path:z.string().min(1),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        if(!projectSafe(input.artifact_path)) return result({ok:false,reason:'ARTIFACT_PATH_OUTSIDE_PROJECT'});
        const digest=sha256File(input.artifact_path);
        const metrics=await runVisualPython([input.artifact_path,'--page',String(input.page_index??0)]);
        const receipt=Signer.signVisualMeasurement({artifact_digest:digest,metrics});
        return result({ok:true,receipt,artifact_digest:digest,metrics,validator_id:'OBJECTIVE_VISUAL_MEASURER_V1'});
      }catch(error){
        return result({ok:false,reason:'VISUAL_MEASUREMENT_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'measure-reference-effect',
    {
      description:'Measure same-source baseline/candidate visual delta and sign a reference-effect receipt.',
      inputSchema:z.object({
        baseline_path:z.string().min(1),
        candidate_path:z.string().min(1),
        reference_ids:z.array(z.string()).min(1),
        reference_compile_digest:z.string().min(16),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        if(!projectSafe(input.baseline_path)||!projectSafe(input.candidate_path)){
          return result({ok:false,reason:'REFERENCE_ARTIFACT_PATH_OUTSIDE_PROJECT'});
        }
        const baselineDigest=sha256File(input.baseline_path);
        const candidateDigest=sha256File(input.candidate_path);
        const measured=await runVisualPython([
          input.candidate_path,'--page',String(input.page_index??0),'--baseline',input.baseline_path
        ]);
        const receipt=Signer.signReferenceEffect({
          baseline_digest:baselineDigest,
          candidate_digest:candidateDigest,
          reference_ids:input.reference_ids,
          reference_compile_digest:input.reference_compile_digest,
          comparison:measured.comparison
        });
        return result({ok:true,receipt,baseline_digest:baselineDigest,candidate_digest:candidateDigest,reference_compile_digest:input.reference_compile_digest,comparison:measured.comparison});
      }catch(error){
        return result({ok:false,reason:'REFERENCE_EFFECT_MEASUREMENT_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'measure-line-hierarchy-effect',
    {
      description:'Measure semantic-free source line-hierarchy change on matched SVG paths and bind the result to the final candidate artifact digest.',
      inputSchema:z.object({
        baseline_svg_path:z.string().min(1),
        candidate_svg_path:z.string().min(1),
        candidate_artifact_path:z.string().min(1),
        reference_ids:z.array(z.string()).min(1),
        reference_compile_digest:z.string().min(16)
      })
    },
    async(input)=>{
      try{
        const paths=[input.baseline_svg_path,input.candidate_svg_path,input.candidate_artifact_path];
        if(paths.some(p=>!projectSafe(p))){
          return result({ok:false,reason:'LINE_HIERARCHY_PATH_OUTSIDE_PROJECT'});
        }
        const comparison=await runJsonPython(lineHierarchyAdapter,[
          input.baseline_svg_path,
          input.candidate_svg_path
        ]);
        if(comparison.ok!==true){
          return result({ok:false,reason:'LINE_HIERARCHY_MEASUREMENT_FAILED',comparison});
        }
        const baselineDigest=sha256File(input.baseline_svg_path);
        const effectInputDigest=sha256File(input.candidate_svg_path);
        const candidateDigest=sha256File(input.candidate_artifact_path);
        const receipt=Signer.signReferenceEffect({
          baseline_digest:baselineDigest,
          candidate_digest:candidateDigest,
          effect_input_digest:effectInputDigest,
          reference_ids:input.reference_ids,
          reference_compile_digest:input.reference_compile_digest,
          comparison
        });
        return result({
          ok:true,
          receipt,
          baseline_digest:baselineDigest,
          effect_input_digest:effectInputDigest,
          candidate_digest:candidateDigest,
          reference_compile_digest:input.reference_compile_digest,
          comparison
        });
      }catch(error){
        return result({ok:false,reason:'LINE_HIERARCHY_EFFECT_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'review-visual-artifact',
    {
      description:'Run independent Vision review and sign a candidate-digest-bound professional-quality receipt.',
      inputSchema:z.object({
        baseline_path:z.string().min(1),
        candidate_path:z.string().min(1),
        reference_paths:z.array(z.string().min(1)).min(1).max(3),
        human_intent:z.object({
          desired_outcome:z.string().min(1),
          success_criteria:z.array(z.string()).default([])
        }),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      const temp=[];
      try{
        const all=[input.baseline_path,input.candidate_path,...input.reference_paths];
        if(all.some(p=>!projectSafe(p))) return result({ok:false,reason:'VISION_REVIEW_PATH_OUTSIDE_PROJECT'});
        const baseline=await renderReviewPng(input.baseline_path,input.page_index??0); temp.push(baseline);
        const candidate=await renderReviewPng(input.candidate_path,input.page_index??0); temp.push(candidate);
        const refs=[];
        for(const refPath of input.reference_paths){
          const p=await renderReviewPng(refPath,input.page_index??0); temp.push(p); refs.push(p);
        }
        const intent=HumanIntent.compileHumanIntent(input.human_intent);
        if(!intent.ok) return result({ok:false,reason:intent.reason});
        const reviewed=await callIndependentVision({
          baselinePng:baseline,
          candidatePng:candidate,
          referencePngs:refs,
          humanIntent:intent
        });
        const digest=sha256File(input.candidate_path);
        const receipt=Signer.signVisionReview({
          artifact_digest:digest,
          intent_digest:intent.intent_digest,
          ...reviewed.review
        });
        return result({
          ok:true,
          receipt,
          artifact_digest:digest,
          intent_digest:intent.intent_digest,
          validator_id:'VISION_VALIDATOR_V1',
          model:reviewed.model,
          review:reviewed.review
        });
      }catch(error){
        return result({ok:false,reason:'VISION_REVIEW_FAILED',error:String(error?.message||error)});
      }finally{
        for(const p of temp){ try{fs.unlinkSync(p);}catch(e){} }
      }
    }
  );

  return server;
}

if(process.env.TAKY_VALIDATOR_SMOKE_ONLY!=='1'){
  serveStdio(()=>buildServer());
}
