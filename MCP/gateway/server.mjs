import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require=createRequire(import.meta.url);
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const geometryAdapter=path.resolve(__dirname,'../../tools/drawing_geometry_primitive_adapter.py');

const Router=require('../../runtime/work-os-router.js');
const Validator=require('../../runtime/independent-validator.js');
const Exposure=require('../../runtime/exposure-gate.js');
const ArtifactBroker=require('../../runtime/artifact-broker.js');
const ReferenceCompiler=require('../../runtime/reference-compiler.js');

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
    'validate-for-exposure',
    {
      description:'Independently validate all mandatory TAKY gates and issue a signed validation receipt. Producer self-certification is forbidden.',
      inputSchema:z.object({
        authorization:z.string(),
        validator_id:z.string().min(1),
        gate_results:z.record(z.string(),z.string())
      })
    },
    async(input)=>result(Validator.validateForExposure(input))
  );

  server.registerTool(
    'authorize-exposure',
    {
      description:'Issue a signed user-exposure grant only when production authorization and independent validation both verify.',
      inputSchema:z.object({
        authorization:z.string(),
        validation_receipt:z.string(),
        target:z.enum(['VALIDATED_PREVIEW','USER_VISIBLE','FINAL_APPROVABLE'])
      })
    },
    async(input)=>result(Exposure.authorizeExposure(input))
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
    'register-production-artifact',
    {
      description:'Register a production artifact only when a valid signed exposure grant matches its producer and execution graph.',
      inputSchema:z.object({
        artifact_id:z.string().min(1),
        artifact_type:z.string().min(1),
        producer_id:z.string().min(1),
        execution_graph_id:z.string().min(1),
        source_ids:z.array(z.string()).default([]),
        exposure_grant:z.string()
      })
    },
    async(input)=>result(ArtifactBroker.registerProductionArtifact(input))
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

  server.registerTool(
    'validate-reference-effect',
    {
      description:'Promote compiled reference DNA to VERIFIED_EFFECTIVE only after traceability, effect, fit, fidelity and ablation proof all pass.',
      inputSchema:z.object({
        TRACEABILITY_PASS:z.boolean(),
        EFFECT_PASS:z.boolean(),
        FIT_PASS:z.boolean(),
        FIDELITY_PASS:z.boolean(),
        REFERENCE_ABLATION_TEST_PASS:z.boolean()
      })
    },
    async(input)=>result(ReferenceCompiler.validateReferenceEffect(input))
  );

  return server;
}

if(process.env.TAKY_MCP_SMOKE_ONLY!=='1'){
  serveStdio(()=>buildServer());
}
