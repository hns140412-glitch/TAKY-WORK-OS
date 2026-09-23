'use strict';

const ExecutionContract=require('./execution-contract.js');
const IndependentValidator=require('./independent-validator.js');

const grants=new WeakSet();

function authorizeExposure(input={}) {
  const {authorization, validation_receipt, target='USER_VISIBLE'}=input;

  const auth=ExecutionContract.verifyProductionAuthorization(authorization);
  if(!auth.ok) return Object.freeze({ok:false,reason:'NO_PASS_NO_SHOW',detail:auth});

  const validation=IndependentValidator.verifyValidationReceipt(validation_receipt,authorization);
  if(!validation.ok) return Object.freeze({ok:false,reason:'NO_PASS_NO_SHOW',detail:validation});

  if(!['VALIDATED_PREVIEW','USER_VISIBLE','FINAL_APPROVABLE'].includes(target)){
    return Object.freeze({ok:false,reason:'INVALID_EXPOSURE_TARGET',target});
  }

  const grant=Object.freeze({
    kind:'TAKY_EXPOSURE_GRANT',
    target,
    producer_id:authorization.producer_id,
    execution_graph_id:authorization.execution_graph_id,
    validation_status:'PASS'
  });
  grants.add(grant);
  return Object.freeze({ok:true,grant});
}

function verifyExposureGrant(grant){
  return Object.freeze({
    ok:!!grant && grants.has(grant),
    reason:(!grant || !grants.has(grant))?'INVALID_OR_FORGED_EXPOSURE_GRANT':undefined
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  authorizeExposure,
  verifyExposureGrant
});
