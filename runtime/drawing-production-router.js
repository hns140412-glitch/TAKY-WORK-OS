'use strict';

const USER_FACING=new Set(['USER_PREVIEW','FINAL']);
const ONE_OFF=new Set(['PYTHON_ONE_OFF','REPORTLAB_ONE_OFF','GENERIC_HTML_ONE_OFF','UNREGISTERED_SCRIPT']);
const REQUIRED_GATES=['SOURCE_GATE','GEOMETRY_GATE','FACT_GATE','SEMANTIC_GATE','REFERENCE_EFFECT_GATE','ARCHITECTURAL_READABILITY_GATE','A3_GATE','USER_EFFECT_GATE'];

function normalizeGateReceipts(receipts=[]){
  const m=new Map();
  for(const r of receipts||[]) if(r&&r.gate) m.set(r.gate,String(r.status||'').toUpperCase());
  return m;
}
function authorizeProduction(req={}){
  const artifactClass=String(req.artifact_class||'').toUpperCase();
  const producer=String(req.producer_type||'').toUpperCase();
  const registered=Boolean(req.registered_engine);
  const findings=[];
  if(!artifactClass) findings.push('ARTIFACT_CLASS_REQUIRED');
  if(USER_FACING.has(artifactClass) && !registered) findings.push('USER_FACING_REQUIRES_REGISTERED_ENGINE');
  if((artifactClass==='INTERNAL_PREVIEW'||USER_FACING.has(artifactClass)) && ONE_OFF.has(producer)) findings.push('ONE_OFF_PRODUCER_FORBIDDEN_FOR_PREVIEW_OR_FINAL');
  if(req.engine_available===true && req.bypass_used===true) findings.push('ENGINE_AVAILABLE_BYPASS_USED_GOVERNANCE_FAILURE');
  const gates=normalizeGateReceipts(req.gate_receipts);
  if(USER_FACING.has(artifactClass)){
    for(const g of REQUIRED_GATES){
      if(gates.get(g)!=='PASS') findings.push('GATE_NOT_PASS:'+g);
    }
  }
  const ok=findings.length===0;
  return Object.freeze({
    ok,
    showable:ok && USER_FACING.has(artifactClass),
    production_authorized:ok,
    artifact_class:artifactClass,
    producer_type:producer,
    required_gates:[...REQUIRED_GATES],
    findings:Object.freeze(findings),
    receipt:ok?Object.freeze({
      contract:'DRAWING_PRODUCTION_AUTHORIZATION_V1',
      route:'TASK->PRODUCTION_ROUTER->AUTHORIZED_ENGINE->L0..L8->OUTPUT',
      engine_id:req.engine_id||null,
      artifact_class:artifactClass,
      no_pass_no_show:true
    }):null
  });
}
function canShow(auth={}){
  return Boolean(auth && auth.ok===true && auth.showable===true && auth.production_authorized===true);
}
module.exports=Object.freeze({REQUIRED_GATES,authorizeProduction,canShow});
