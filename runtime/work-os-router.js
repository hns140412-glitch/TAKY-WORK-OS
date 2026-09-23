'use strict';

const ExecutionContract=require('./execution-contract.js');

const ROUTES=Object.freeze({
  ARCH_DRAWING_PRESENTATION:Object.freeze({
    producer_id:'DRAWING_ENGINE_V2',
    execution_graph_id:'DRAWING_PLAN_PRESENTATION_V2'
  }),
  ARCH_REPORT_ASSEMBLY:Object.freeze({
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2'
  })
});

const DIAGNOSTIC_ONLY_PRODUCERS=new Set([
  'PYTHON_ONE_OFF',
  'GENERIC_HTML',
  'REPORTLAB_ONE_OFF',
  'IMAGE_GENERATOR_DIRECT'
]);

function routeProductionTask(task={}) {
  const task_type=task.task_type;
  const requested_output=task.requested_output||'INTERNAL_PREVIEW';

  if(DIAGNOSTIC_ONLY_PRODUCERS.has(task.requested_producer_id)){
    return Object.freeze({
      ok:false,
      reason:'DIAGNOSTIC_PRODUCER_CANNOT_CREATE_PRODUCTION_ARTIFACT',
      requested_producer_id:task.requested_producer_id
    });
  }

  const route=ROUTES[task_type];
  if(!route) return Object.freeze({ok:false,reason:'NO_AUTHORIZED_ROUTE',task_type});

  if(task.requested_producer_id && task.requested_producer_id!==route.producer_id){
    return Object.freeze({
      ok:false,
      reason:'ROUTE_BYPASS_ATTEMPT',
      expected_producer_id:route.producer_id,
      requested_producer_id:task.requested_producer_id
    });
  }

  return ExecutionContract.issueProductionAuthorization({
    task_type,
    producer_id:route.producer_id,
    execution_graph_id:route.execution_graph_id,
    execution_mode:'PRODUCTION',
    requested_output
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  ROUTES,
  DIAGNOSTIC_ONLY_PRODUCERS,
  routeProductionTask
});
