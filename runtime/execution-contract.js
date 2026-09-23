'use strict';

const Capability=require('./capability-token.js');

const AUTHORIZED_ENGINES=Object.freeze({
  DRAWING_ENGINE_V2:Object.freeze({
    tasks:Object.freeze(['ARCH_DRAWING_PRESENTATION']),
    graphs:Object.freeze(['DRAWING_PLAN_PRESENTATION_V2']),
    outputs:Object.freeze(['INTERNAL_PREVIEW','VALIDATED_PREVIEW','USER_FACING','FINAL'])
  }),
  REPORT_ENGINE_V2:Object.freeze({
    tasks:Object.freeze(['ARCH_REPORT_ASSEMBLY']),
    graphs:Object.freeze(['A3_REPORT_ASSEMBLY_V2']),
    outputs:Object.freeze(['INTERNAL_PREVIEW','VALIDATED_PREVIEW','USER_FACING','FINAL'])
  })
});

const AUTHORIZED_GRAPHS=Object.freeze({
  DRAWING_PLAN_PRESENTATION_V2:Object.freeze([
    'source_ingest','source_identity_lock','geometry_lock','semantic_verify',
    'reference_compile','presentation_render','source_overlay',
    'independent_validate','exposure_gate'
  ]),
  A3_REPORT_ASSEMBLY_V2:Object.freeze([
    'report_package_validate','fact_evidence_bind','narrative_evidence_validate',
    'a3_compose','independent_validate','exposure_gate'
  ])
});

function deny(reason,details={}){ return Object.freeze({ok:false,reason,...details}); }

function issueProductionAuthorization(request={}){
  const {task_type,producer_id,execution_graph_id,execution_mode='PRODUCTION',requested_output='INTERNAL_PREVIEW'}=request;
  if(execution_mode!=='PRODUCTION') return deny('PRODUCTION_MODE_REQUIRED',{execution_mode});
  const engine=AUTHORIZED_ENGINES[producer_id];
  if(!engine) return deny('UNAUTHORIZED_PRODUCER',{producer_id});
  if(!engine.tasks.includes(task_type)) return deny('TASK_NOT_AUTHORIZED_FOR_ENGINE',{task_type,producer_id});
  if(!engine.graphs.includes(execution_graph_id)) return deny('GRAPH_NOT_AUTHORIZED_FOR_ENGINE',{execution_graph_id,producer_id});
  if(!AUTHORIZED_GRAPHS[execution_graph_id]) return deny('UNKNOWN_EXECUTION_GRAPH',{execution_graph_id});
  if(!engine.outputs.includes(requested_output)) return deny('OUTPUT_NOT_AUTHORIZED',{requested_output,producer_id});

  const signed=Capability.signPayload('TAKY_PRODUCTION_AUTHORIZATION',{
    task_type,producer_id,execution_graph_id,requested_output,issued_for:'SYSTEM_ENFORCEMENT'
  });
  if(!signed.ok) return signed;
  return Object.freeze({ok:true,authorization:signed.token});
}

function verifyProductionAuthorization(token,expected={}){
  const verified=Capability.verifyToken(token,'TAKY_PRODUCTION_AUTHORIZATION');
  if(!verified.ok) return verified;
  const payload=verified.payload;
  for(const [key,value] of Object.entries(expected)){
    if(value!==undefined && payload[key]!==value){
      return deny('AUTHORIZATION_SCOPE_MISMATCH',{key,expected:value,actual:payload[key]});
    }
  }
  return Object.freeze({ok:true,payload});
}

function getExecutionGraph(graphId){
  const graph=AUTHORIZED_GRAPHS[graphId];
  if(!graph) return deny('UNKNOWN_EXECUTION_GRAPH',{graphId});
  return Object.freeze({ok:true,graph});
}

module.exports=Object.freeze({
  version:'3.0.0',
  AUTHORIZED_ENGINES,
  AUTHORIZED_GRAPHS,
  issueProductionAuthorization,
  verifyProductionAuthorization,
  getExecutionGraph
});
