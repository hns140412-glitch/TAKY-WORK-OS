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
const geometryAdapter=path.resolve(__dirname,'../../tools/drawing_geometry_primitive_adapter.py');
const visualAdapter=path.resolve(__dirname,'../../tools/drawing_visual_metric_extractor.py');
const reviewImageExporter=path.resolve(__dirname,'../../tools/drawing_review_image_exporter.py');

const Router=require('../../runtime/work-os-router.js');
const ArtifactBroker=require('../../runtime/artifact-broker.js');
const Pipeline=require('../../runtime/production-pipeline.js');
const ReferenceCompiler=require('../../runtime/reference-compiler.js');
const Measurement=require('../../runtime/visual-measurement-receipt.js');
const VisionReview=require('../../runtime/vision-review-receipt.js');
const VisionParser=require('../../runtime/vision-review-parser.js');

function runPython(args){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    execFile(python,[geometryAdapter,...args],{maxBuffer:20*1024*1024},(err,stdout,stderr)=>{
      if(err){
        reject(new Error(stderr||err.message));
        return;
      }
      try{ resolve(JSON.parse(stdout)); }
      catch(parseErr){ reject(new Error('GEOMETRY_ADAPTER_JSON_INVALID:'+parseErr.message)); }
    });
  });
}

function runVisualPython(args){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    execFile(python,[visualAdapter,...args],{maxBuffer:20*1024*1024},(err,stdout,stderr)=>{
      if(err){ reject(new Error(stderr||err.message)); return; }
      try{ resolve(JSON.parse(stdout)); }
      catch(parseErr){ reject(new Error('VISUAL_METRIC_JSON_INVALID:'+parseErr.message)); }
    });
  });
}

function renderReviewPng(sourcePath,pageIndex=0){
  return new Promise((resolve,reject)=>{
    const python=process.env.TAKY_PYTHON||'python3';
    const out=path.join(os.tmpdir(),'taky-review-'+crypto.randomUUID()+'.png');
    execFile(python,[
      reviewImageExporter,sourcePath,'--out',out,'--page',String(pageIndex),'--max-edge','2000'
    ],{maxBuffer:20*1024*1024},(err,stdout,stderr)=>{
      if(err){ reject(new Error(stderr||err.message)); return; }
      resolve(out);
    });
  });
}

async function callIndependentVision({baselinePng,candidatePng,referencePngs=[]}){
  const apiKey=process.env.ANTHROPIC_API_KEY;
  if(!apiKey) throw new Error('ANTHROPIC_API_KEY_REQUIRED');
  const model=process.env.TAKY_VISION_MODEL||'claude-sonnet-5';

  const imageBlock=(filePath)=>({
    type:'image',
    source:{
      type:'base64',
      media_type:'image/png',
      data:fs.readFileSync(filePath).toString('base64')
    }
  });

  const content=[
    {type:'text',text:'BASELINE / reference-off source:'},
    imageBlock(baselinePng),
    {type:'text',text:'CANDIDATE / proposed user-facing artifact:'},
    imageBlock(candidatePng)
  ];
  referencePngs.forEach((p,i)=>{
    content.push({type:'text',text:'REFERENCE '+(i+1)+' / professional presentation benchmark:'});
    content.push(imageBlock(p));
  });
  content.push({
    type:'text',
    text:[
      'Evaluate only visible presentation evidence. Geometry/fact correctness is validated elsewhere.',
      'Return exactly one JSON object with these boolean fields:',
      'professional_family_pass, reference_effect_visible_without_explanation, generic_layout_detected, decision_value_pass,',
      'plus reasons as an array of short strings.',
      'professional_family_pass: candidate belongs to the same broad professional architectural-presentation family as the supplied references, without requiring literal copying.',
      'reference_effect_visible_without_explanation: candidate is visibly more reference-grade than baseline without needing a verbal explanation.',
      'generic_layout_detected: true when the candidate still reads as a generic report/template rather than a deliberate architectural presentation.',
      'decision_value_pass: page hierarchy makes the architectural point or decision legible, not merely prettier.',
      'Be strict. If evidence is ambiguous, return false for positive pass fields.'
    ].join('\n')
  });

  const response=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'x-api-key':apiKey,
      'anthropic-version':'2023-06-01'
    },
    body:JSON.stringify({
      model,
      max_tokens:1200,
      system:'You are an independent architectural presentation QA validator. You did not create the candidate. Do not reward novelty alone. Do not assess geometry or legal facts. Output JSON only.',
      messages:[{role:'user',content}]
    })
  });
  if(!response.ok){
    throw new Error('VISION_API_HTTP_'+response.status+':'+(await response.text()).slice(0,500));
  }
  const data=await response.json();
  const textBlock=(data.content||[]).find(x=>x.type==='text');
  if(!textBlock?.text) throw new Error('VISION_API_TEXT_RESPONSE_REQUIRED');
  const parsed=VisionParser.parseVisionReview(textBlock.text);
  if(!parsed.ok) throw new Error(parsed.reason);
  return {model,review:parsed.review};
}

function projectSafe(rawPath){
  const root=path.resolve(process.env.CLAUDE_PROJECT_DIR||path.resolve(__dirname,'../..'));
  const candidate=path.resolve(rawPath);
  return candidate===root || candidate.startsWith(root+path.sep);
}

function result(value){
  return {
    content:[{
      type:'text',
      text:JSON.stringify(value)
    }]
  };
}

export function buildServer(){
  const server=new McpServer({
    name:'taky-work-os-production-gateway',
    version:'0.1.0'
  });

  server.registerTool(
    'extract-geometry-primitives',
    {
      description:'Parse local DXF or vector PDF source into normalized geometry primitives without architectural semantic inference. DWG remains conversion-required.',
      inputSchema:z.object({
        source_path:z.string().min(1),
        source_type:z.enum(['DXF','PDF','VECTOR_PDF','DWG']),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        const args=[input.source_path,'--type',input.source_type,'--page',String(input.page_index??0)];
        return result(await runPython(args));
      }catch(error){
        return result({ok:false,reason:'GEOMETRY_ADAPTER_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'review-visual-artifact',
    {
      description:'Independently review baseline, candidate, and professional reference images with Claude Vision. Issues a signed candidate-digest-bound VISION_VALIDATOR_V1 receipt. Geometry and facts are intentionally out of scope.',
      inputSchema:z.object({
        baseline_path:z.string().min(1),
        candidate_path:z.string().min(1),
        reference_paths:z.array(z.string().min(1)).min(1).max(3),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      const temp=[];
      try{
        const paths=[input.baseline_path,input.candidate_path,...input.reference_paths];
        if(paths.some(p=>!projectSafe(p))) return result({ok:false,reason:'VISION_REVIEW_PATH_OUTSIDE_PROJECT'});

        const baseline=await renderReviewPng(input.baseline_path,input.page_index??0); temp.push(baseline);
        const candidate=await renderReviewPng(input.candidate_path,input.page_index??0); temp.push(candidate);
        const refs=[];
        for(const refPath of input.reference_paths){
          const p=await renderReviewPng(refPath,input.page_index??0); temp.push(p); refs.push(p);
        }

        const candidateDigest=ArtifactBroker.sha256File(input.candidate_path);
        const reviewed=await callIndependentVision({
          baselinePng:baseline,
          candidatePng:candidate,
          referencePngs:refs
        });
        const signed=VisionReview.signReview({
          artifact_digest:candidateDigest,
          ...reviewed.review
        });
        return result({
          ...signed,
          artifact_digest:candidateDigest,
          validator_id:VisionReview.VALIDATOR_ID,
          model:reviewed.model,
          review:reviewed.review
        });
      }catch(error){
        return result({ok:false,reason:'VISION_REVIEW_FAILED',error:String(error?.message||error)});
      }finally{
        for(const p of temp){ try{ fs.unlinkSync(p); }catch(e){} }
      }
    }
  );

  server.registerTool(
    'measure-visual-artifact',
    {
      description:'Measure objective visual properties from a project PDF/PNG/JPG/WEBP and issue a signed receipt bound to the exact artifact SHA256. Does not claim professional quality.',
      inputSchema:z.object({
        artifact_path:z.string().min(1),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        if(!projectSafe(input.artifact_path)) return result({ok:false,reason:'ARTIFACT_PATH_OUTSIDE_PROJECT'});
        const digest=ArtifactBroker.sha256File(input.artifact_path);
        const metrics=await runVisualPython([input.artifact_path,'--page',String(input.page_index??0)]);
        const issued=Measurement.issueVisualMeasurement({artifact_digest:digest,metrics});
        return result({...issued,artifact_digest:digest,metrics});
      }catch(error){
        return result({ok:false,reason:'VISUAL_MEASUREMENT_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'measure-reference-effect',
    {
      description:'Compare reference-off baseline and reference-on candidate artifacts objectively and issue a signed candidate-digest-bound effect receipt. Professional-family judgment remains separate.',
      inputSchema:z.object({
        baseline_path:z.string().min(1),
        candidate_path:z.string().min(1),
        reference_ids:z.array(z.string()).min(1),
        page_index:z.number().int().min(0).default(0)
      })
    },
    async(input)=>{
      try{
        if(!projectSafe(input.baseline_path)||!projectSafe(input.candidate_path)){
          return result({ok:false,reason:'REFERENCE_ARTIFACT_PATH_OUTSIDE_PROJECT'});
        }
        const baselineDigest=ArtifactBroker.sha256File(input.baseline_path);
        const candidateDigest=ArtifactBroker.sha256File(input.candidate_path);
        const measured=await runVisualPython([
          input.candidate_path,'--page',String(input.page_index??0),'--baseline',input.baseline_path
        ]);
        const issued=Measurement.issueReferenceEffect({
          baseline_digest:baselineDigest,
          candidate_digest:candidateDigest,
          reference_ids:input.reference_ids,
          comparison:measured.comparison
        });
        return result({...issued,baseline_digest:baselineDigest,candidate_digest:candidateDigest,comparison:measured.comparison});
      }catch(error){
        return result({ok:false,reason:'REFERENCE_EFFECT_MEASUREMENT_FAILED',error:String(error?.message||error)});
      }
    }
  );

  server.registerTool(
    'route-production-task',
    {
      description:'Issue a signed TAKY production authorization only for an approved Work OS route.',
      inputSchema:z.object({
        task_type:z.enum(['ARCH_DRAWING_PRESENTATION','ARCH_REPORT_ASSEMBLY']),
        requested_output:z.enum(['INTERNAL_PREVIEW','VALIDATED_PREVIEW','USER_FACING','FINAL']).default('INTERNAL_PREVIEW'),
        requested_producer_id:z.string().optional()
      })
    },
    async(input)=>result(Router.routeProductionTask(input))
  );

  server.registerTool(
    'finalize-staged-production',
    {
      description:'Run TAKY computed production validation against a staging artifact. Returns a digest-bound exposure grant only when every mandatory gate passes.',
      inputSchema:z.object({
        staging_path:z.string().min(1),
        task:z.object({
          task_type:z.enum(['ARCH_DRAWING_PRESENTATION','ARCH_REPORT_ASSEMBLY']),
          requested_output:z.enum(['VALIDATED_PREVIEW','USER_FACING','FINAL']).default('USER_FACING'),
          requested_producer_id:z.string().optional()
        }),
        source_identity:z.record(z.string(),z.any()),
        geometry:z.record(z.string(),z.any()),
        semantics:z.array(z.record(z.string(),z.any())).default([]),
        claims:z.array(z.record(z.string(),z.any())).default([]),
        reference:z.record(z.string(),z.any()),
        visual_measurement_receipt:z.string().min(1),
        reference_effect_receipt:z.string().min(1),
        vision_review_receipt:z.string().min(1),
        provenance:z.record(z.string(),z.any()),
        report_package:z.record(z.string(),z.any()).optional(),
        sources:z.array(z.record(z.string(),z.any())).optional(),
        facts:z.array(z.record(z.string(),z.any())).optional(),
        exposure_target:z.enum(['VALIDATED_PREVIEW','USER_VISIBLE','FINAL_APPROVABLE']).default('FINAL_APPROVABLE')
      })
    },
    async(input)=>result(Pipeline.finalizeStagedProduction(input))
  );

  server.registerTool(
    'publish-production-artifact',
    {
      description:'Copy a validated artifact from TAKY staging into the protected production directory. Requires a valid signed exposure grant matching producer and execution graph.',
      inputSchema:z.object({
        artifact_id:z.string().min(1),
        artifact_type:z.string().min(1),
        producer_id:z.string().min(1),
        execution_graph_id:z.string().min(1),
        source_ids:z.array(z.string()).default([]),
        staging_path:z.string().min(1),
        file_name:z.string().min(1),
        exposure_grant:z.string()
      })
    },
    async(input)=>result(ArtifactBroker.publishProductionArtifact(input))
  );

  server.registerTool(
    'compile-reference-profile',
    {
      description:'Compile known reference DNA into context-adapted presentation policies. This does not mark the reference effective without proof.',
      inputSchema:z.object({
        reference_ids:z.array(z.string()).min(1),
        context:z.object({
          scale:z.string().min(1),
          output_size:z.string().min(1),
          source_density:z.string().min(1)
        })
      })
    },
    async(input)=>result(ReferenceCompiler.compileReferenceProfile(input))
  );


  return server;
}

if(process.env.TAKY_MCP_SMOKE_ONLY!=='1'){
  serveStdio(()=>buildServer());
}
