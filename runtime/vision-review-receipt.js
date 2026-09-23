'use strict';

const Verifier=require('./validator-receipt-verifier.js');

const VALIDATOR_ID='VISION_VALIDATOR_V1';

function publicKey(){
  return process.env.TAKY_VISION_PUBLIC_KEY_PEM||null;
}

function verifyReview(receipt,expectedDigest){
  const verified=Verifier.verifySignedReceipt(receipt,{
    expected_type:'TAKY_VISION_REVIEW_RECEIPT',
    public_key_pem:publicKey(),
    validator_id:VALIDATOR_ID
  });
  if(!verified.ok) return verified;

  const p=verified.payload;
  if(expectedDigest && p.artifact_digest!==expectedDigest){
    return Object.freeze({ok:false,reason:'VISION_REVIEW_DIGEST_MISMATCH'});
  }
  const pass=
    p.professional_family_pass===true &&
    p.reference_effect_visible_without_explanation===true &&
    p.generic_layout_detected===false &&
    p.decision_value_pass===true;
  if(!pass) return Object.freeze({ok:false,reason:'VISION_REVIEW_GATE_FAILED',payload:p});
  return Object.freeze({ok:true,payload:p,validator_id:VALIDATOR_ID});
}

module.exports=Object.freeze({
  version:'3.0.0',
  VALIDATOR_ID,
  key_mode:'VERIFY_ONLY',
  verifyReview
});
