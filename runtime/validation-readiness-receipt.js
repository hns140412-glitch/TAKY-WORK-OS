'use strict';

const Verifier=require('./validator-receipt-verifier.js');

const VALIDATOR_ID='VALIDATION_READINESS_V1';

function publicKey(){
  return process.env.TAKY_MEASUREMENT_PUBLIC_KEY_PEM||null;
}

function verifyValidationReadiness(receipt,{expected_vision_public_fingerprint=null}={}){
  const verified=Verifier.verifySignedReceipt(receipt,{
    expected_type:'TAKY_VALIDATION_READINESS_RECEIPT',
    public_key_pem:publicKey(),
    validator_id:VALIDATOR_ID
  });
  if(!verified.ok) return verified;

  const p=verified.payload;
  if(
    expected_vision_public_fingerprint &&
    p.vision_public_fingerprint!==expected_vision_public_fingerprint
  ){
    return Object.freeze({
      ok:false,
      reason:'VISION_VALIDATION_KEY_FINGERPRINT_MISMATCH',
      expected:expected_vision_public_fingerprint,
      actual:p.vision_public_fingerprint||null
    });
  }

  if(
    p.objective_validation_ready!==true ||
    p.vision_review_ready!==true ||
    p.user_facing_validation_ready!==true
  ){
    return Object.freeze({
      ok:false,
      reason:'VALIDATION_SERVICE_NOT_USER_FACING_READY',
      payload:p
    });
  }

  return Object.freeze({
    ok:true,
    payload:p,
    validator_id:VALIDATOR_ID
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  VALIDATOR_ID,
  key_mode:'VERIFY_ONLY',
  verifyValidationReadiness
});
