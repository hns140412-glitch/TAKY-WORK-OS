'use strict';

const crypto=require('crypto');

function privateKey(envName){
  const pem=process.env[envName];
  if(!pem) throw new Error(envName+'_REQUIRED');
  return crypto.createPrivateKey(pem);
}

function sign(type,validatorId,payload,privateEnv,ttlMs=600000){
  const now=Date.now();
  const body=JSON.stringify({
    v:1,
    alg:'Ed25519',
    type,
    validator_id:validatorId,
    jti:crypto.randomUUID(),
    payload,
    iat:now,
    exp:now+ttlMs
  });
  const encoded=Buffer.from(body).toString('base64url');
  const sig=crypto.sign(null,Buffer.from(encoded),privateKey(privateEnv)).toString('base64url');
  return encoded+'.'+sig;
}

function signVisualMeasurement({artifact_digest,metrics}={}){
  if(!artifact_digest) throw new Error('ARTIFACT_DIGEST_REQUIRED');
  if(!metrics || metrics.schema!=='TAKY_OBJECTIVE_VISUAL_METRICS_V1') throw new Error('OBJECTIVE_VISUAL_METRICS_REQUIRED');
  return sign('TAKY_VISUAL_MEASUREMENT_RECEIPT','OBJECTIVE_VISUAL_MEASURER_V1',{
    artifact_digest,
    metrics,
    professional_quality_claim:false
  },'TAKY_MEASUREMENT_PRIVATE_KEY_PEM');
}

function signReferenceEffect({baseline_digest,candidate_digest,reference_ids,reference_compile_digest,comparison}={}){
  if(!baseline_digest || !candidate_digest) throw new Error('REFERENCE_DIGESTS_REQUIRED');
  if(!Array.isArray(reference_ids)||!reference_ids.length) throw new Error('REFERENCE_IDS_REQUIRED');
  if(!reference_compile_digest) throw new Error('REFERENCE_COMPILE_DIGEST_REQUIRED');
  if(!comparison || comparison.schema!=='TAKY_OBJECTIVE_REFERENCE_DELTA_V1') throw new Error('OBJECTIVE_REFERENCE_COMPARISON_REQUIRED');
  return sign('TAKY_REFERENCE_EFFECT_RECEIPT','OBJECTIVE_VISUAL_MEASURER_V1',{
    baseline_digest,
    candidate_digest,
    reference_ids:[...reference_ids],
    reference_compile_digest,
    comparison,
    objective_effect_pass:comparison.objective_effect_detected===true,
    clarity_only_suspected:comparison.clarity_only_suspected===true,
    professional_family_claim:false
  },'TAKY_MEASUREMENT_PRIVATE_KEY_PEM');
}

function signVisionReview(payload={}){
  if(!payload.artifact_digest) throw new Error('ARTIFACT_DIGEST_REQUIRED');
  return sign('TAKY_VISION_REVIEW_RECEIPT','VISION_VALIDATOR_V1',{
    artifact_digest:payload.artifact_digest,
    professional_family_pass:payload.professional_family_pass===true,
    reference_effect_visible_without_explanation:payload.reference_effect_visible_without_explanation===true,
    generic_layout_detected:payload.generic_layout_detected===true,
    decision_value_pass:payload.decision_value_pass===true
  },'TAKY_VISION_PRIVATE_KEY_PEM');
}

module.exports=Object.freeze({
  signVisualMeasurement,
  signReferenceEffect,
  signVisionReview
});
