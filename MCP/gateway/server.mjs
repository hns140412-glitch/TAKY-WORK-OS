import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);

const Router=require('../../runtime/work-os-router.js');
const Validator=require('../../runtime/independent-validator.js');
const Exposure=require('../../runtime/exposure-gate.js');
const ArtifactBroker=require('../../runtime/artifact-broker.js');
const ReferenceCompiler=require('../../runtime/reference-compiler.js');

function result(value){
  return {
    content:[{
      type:'text',
      text:JSON.stringify(value)
    }]
  };
}

serveStdio(()=>{
  const server=new McpServer({
    name:'taky-work-os-production-gateway',
    version:'0.1.0'
  });

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
});
