'use strict';

const ExecutionContract=require('./execution-contract.js');

const MANDATORY_GATES=Object.freeze([
  'SOURCE_GATE',
  'GEOMETRY_GATE',
  'FACT_GATE',
  'SEMANTIC_GATE',
  'REFERENCE_EFFECT_GATE',
  'ARCHITECTURAL_READABILITY_GATE',
  'A3_GATE',
  'NARRATIVE_EVIDENCE_GATE',
  'PROVENANCE_GATE',
  'USER_EFFECT_GATE'
]);

const receipts=new WeakSet();

function validateForExposure(input={}) {
  const {authorization, validator_id, gate_results={}}=input;
  const auth=ExecutionContract.verifyProductionAuthorization(authorization);
  if(!auth.ok) return Object.freeze({ok:false,reason:'AUTHORIZATION_INVALID',detail:auth});

  if(!validator_id) return Object.freeze({ok:false,reason:'VALIDATOR_ID_REQUIRED'});
  if(validator_id===authorization.producer_id){
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

  const receipt=Object.freeze({
    kind:'TAKY_INDEPENDENT_VALIDATION_RECEIPT',
    validator_id,
    producer_id:authorization.producer_id,
    execution_graph_id:authorization.execution_graph_id,
    mandatory_gates:Object.freeze([...MANDATORY_GATES]),
    status:'PASS'
  });
  receipts.add(receipt);
  return Object.freeze({ok:true,receipt});
}

function verifyValidationReceipt(receipt,authorization){
  if(!receipt || !receipts.has(receipt)) return Object.freeze({ok:false,reason:'INVALID_OR_FORGED_VALIDATION_RECEIPT'});
  if(receipt.status!=='PASS') return Object.freeze({ok:false,reason:'VALIDATION_NOT_PASS'});
  if(authorization){
    if(receipt.producer_id!==authorization.producer_id || receipt.execution_graph_id!==authorization.execution_graph_id){
      return Object.freeze({ok:false,reason:'VALIDATION_SCOPE_MISMATCH'});
    }
  }
  return Object.freeze({ok:true});
}

module.exports=Object.freeze({
  version:'1.0.0',
  MANDATORY_GATES,
  validateForExposure,
  verifyValidationReceipt
});
