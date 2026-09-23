'use strict';

const Verifier=require('./validator-receipt-verifier.js');

const MEASURER_ID='OBJECTIVE_VISUAL_MEASURER_V1';

function publicKey(){
  return process.env.TAKY_MEASUREMENT_PUBLIC_KEY_PEM||null;
}

function verifyVisualMeasurement(receipt,expectedDigest){
  const verified=Verifier.verifySignedReceipt(receipt,{
    expected_type:'TAKY_VISUAL_MEASUREMENT_RECEIPT',
    public_key_pem:publicKey(),
    validator_id:MEASURER_ID
  });
  if(!verified.ok) return verified;
  const p=verified.payload;
  if(expectedDigest && p.artifact_digest!==expectedDigest){
    return Object.freeze({ok:false,reason:'VISUAL_MEASUREMENT_DIGEST_MISMATCH'});
  }
  if(!p.metrics || p.metrics.schema!=='TAKY_OBJECTIVE_VISUAL_METRICS_V1'){
    return Object.freeze({ok:false,reason:'OBJECTIVE_VISUAL_METRICS_REQUIRED'});
  }
  return Object.freeze({ok:true,payload:p,validator_id:MEASURER_ID});
}

function verifyReferenceEffect(receipt,expectedCandidateDigest,expectedReferenceIds=[],expectedCompileDigest=null,expectedEffectSchemas=[]){
  const verified=Verifier.verifySignedReceipt(receipt,{
    expected_type:'TAKY_REFERENCE_EFFECT_RECEIPT',
    public_key_pem:publicKey(),
    validator_id:MEASURER_ID
  });
  if(!verified.ok) return verified;
  const p=verified.payload;
  if(expectedCandidateDigest && p.candidate_digest!==expectedCandidateDigest){
    return Object.freeze({ok:false,reason:'REFERENCE_EFFECT_DIGEST_MISMATCH'});
  }
  if(expectedCompileDigest && p.reference_compile_digest!==expectedCompileDigest){
    return Object.freeze({ok:false,reason:'REFERENCE_COMPILE_DIGEST_MISMATCH'});
  }
  const expectedSchemas=[...(expectedEffectSchemas||[])].filter(Boolean);
  if(expectedSchemas.length>1){
    return Object.freeze({ok:false,reason:'MULTI_EFFECT_RECEIPT_SET_REQUIRED',expected_effect_schemas:Object.freeze(expectedSchemas)});
  }
  if(expectedSchemas.length===1 && p.effect_schema!==expectedSchemas[0]){
    return Object.freeze({
      ok:false,
      reason:'REFERENCE_EFFECT_SCHEMA_MISMATCH',
      expected:expectedSchemas[0],
      actual:p.effect_schema||null
    });
  }
  const actual=new Set(p.reference_ids||[]);
  for(const id of expectedReferenceIds||[]){
    if(!actual.has(id)) return Object.freeze({ok:false,reason:'REFERENCE_TRACEABILITY_MISSING',reference_id:id});
  }
  if(p.objective_effect_pass!==true || p.clarity_only_suspected===true){
    return Object.freeze({ok:false,reason:'OBJECTIVE_REFERENCE_EFFECT_FAIL',payload:p});
  }
  return Object.freeze({ok:true,payload:p,validator_id:MEASURER_ID});
}

module.exports=Object.freeze({
  version:'2.0.0',
  MEASURER_ID,
  key_mode:'VERIFY_ONLY',
  verifyVisualMeasurement,
  verifyReferenceEffect
});
