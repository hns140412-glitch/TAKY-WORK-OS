'use strict';

const ExecutionContract=require('./execution-contract.js');
const Capability=require('./capability-token.js');

const MANDATORY_GATES=Object.freeze([
  'SOURCE_GATE','GEOMETRY_GATE','FACT_GATE','SEMANTIC_GATE',
  'REFERENCE_EFFECT_GATE','ARCHITECTURAL_READABILITY_GATE','A3_GATE',
  'NARRATIVE_EVIDENCE_GATE','PROVENANCE_GATE','USER_EFFECT_GATE'
]);

function validateForExposure(input={}){
  const {authorization,validator_id,gate_results={}}=input;
  const auth=ExecutionContract.verifyProductionAuthorization(authorization);
  if(!auth.ok) return Object.freeze({ok:false,reason:'AUTHORIZATION_INVALID',detail:auth});
  if(!validator_id) return Object.freeze({ok:false,reason:'VALIDATOR_ID_REQUIRED'});
  if(validator_id===auth.payload.producer_id){
    return Object.freeze({ok:false,reason:'ENGINE_CANNOT_CERTIFY_ITSELF'});
  }

  const findings=[];
  for(const gate of MANDATORY_GATES){
    const state=gate_results[gate];
    if(state!=='PASS') findings.push(Object.freeze({gate,state:state||'MISSING'}));
  }
  if(findings.length){
    return Object.freeze({ok:false,reason:'MANDATORY_GATE_FAILED',findings:Object.freeze(findings)});
  }

  const signed=Capability.signPayload('TAKY_INDEPENDENT_VALIDATION_RECEIPT',{
    validator_id,
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    mandatory_gates:[...MANDATORY_GATES],
    status:'PASS'
  });
  if(!signed.ok) return signed;
  return Object.freeze({ok:true,receipt:signed.token});
}

function verifyValidationReceipt(receipt,authorization){
  const verified=Capability.verifyToken(receipt,'TAKY_INDEPENDENT_VALIDATION_RECEIPT');
  if(!verified.ok) return verified;
  const p=verified.payload;
  if(p.status!=='PASS') return Object.freeze({ok:false,reason:'VALIDATION_NOT_PASS'});

  if(authorization){
    const auth=ExecutionContract.verifyProductionAuthorization(authorization);
    if(!auth.ok) return Object.freeze({ok:false,reason:'AUTHORIZATION_INVALID',detail:auth});
    if(p.producer_id!==auth.payload.producer_id || p.execution_graph_id!==auth.payload.execution_graph_id){
      return Object.freeze({ok:false,reason:'VALIDATION_SCOPE_MISMATCH'});
    }
  }
  return Object.freeze({ok:true,payload:p});
}

module.exports=Object.freeze({
  version:'2.0.0',
  MANDATORY_GATES,
  validateForExposure,
  verifyValidationReceipt
});
