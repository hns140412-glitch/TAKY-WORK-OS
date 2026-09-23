'use strict';

const ExecutionContract=require('./execution-contract.js');
const IndependentValidator=require('./independent-validator.js');
const Capability=require('./capability-token.js');

function authorizeExposure(input={}){
  const {authorization,validation_receipt,target='USER_VISIBLE'}=input;

  const auth=ExecutionContract.verifyProductionAuthorization(authorization);
  if(!auth.ok) return Object.freeze({ok:false,reason:'NO_PASS_NO_SHOW',detail:auth});

  const validation=IndependentValidator.verifyValidationReceipt(validation_receipt,authorization);
  if(!validation.ok) return Object.freeze({ok:false,reason:'NO_PASS_NO_SHOW',detail:validation});

  if(!['VALIDATED_PREVIEW','USER_VISIBLE','FINAL_APPROVABLE'].includes(target)){
    return Object.freeze({ok:false,reason:'INVALID_EXPOSURE_TARGET',target});
  }

  const signed=Capability.signPayload('TAKY_EXPOSURE_GRANT',{
    target,
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    validator_id:validation.payload.validator_id,
    artifact_digest:validation.payload.artifact_digest||null,
    validation_status:'PASS'
  });
  if(!signed.ok) return signed;
  return Object.freeze({ok:true,grant:signed.token});
}

function verifyExposureGrant(grant){
  return Capability.verifyToken(grant,'TAKY_EXPOSURE_GRANT');
}

module.exports=Object.freeze({
  version:'3.0.0',
  authorizeExposure,
  verifyExposureGrant
});
