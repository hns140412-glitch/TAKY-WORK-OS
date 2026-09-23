'use strict';

const Capability=require('./capability-token.js');

const MEASURER_ID='OBJECTIVE_VISUAL_MEASURER_V1';

function issueVisualMeasurement({artifact_digest,metrics}={}){
  if(!artifact_digest) return Object.freeze({ok:false,reason:'ARTIFACT_DIGEST_REQUIRED'});
  if(!metrics || metrics.schema!=='TAKY_OBJECTIVE_VISUAL_METRICS_V1'){
    return Object.freeze({ok:false,reason:'OBJECTIVE_VISUAL_METRICS_REQUIRED'});
  }
  const signed=Capability.signPayload('TAKY_VISUAL_MEASUREMENT_RECEIPT',{
    measurer_id:MEASURER_ID,
    artifact_digest,
    metrics,
    professional_quality_claim:false
  });
  if(!signed.ok) return signed;
  return Object.freeze({ok:true,receipt:signed.token});
}

function verifyVisualMeasurement(receipt,expectedDigest){
  const verified=Capability.verifyToken(receipt,'TAKY_VISUAL_MEASUREMENT_RECEIPT');
  if(!verified.ok) return verified;
  const p=verified.payload;
  if(p.measurer_id!==MEASURER_ID) return Object.freeze({ok:false,reason:'UNTRUSTED_VISUAL_MEASURER'});
  if(expectedDigest && p.artifact_digest!==expectedDigest){
    return Object.freeze({ok:false,reason:'VISUAL_MEASUREMENT_DIGEST_MISMATCH'});
  }
  return Object.freeze({ok:true,payload:p});
}

function issueReferenceEffect({baseline_digest,candidate_digest,reference_ids,comparison}={}){
  if(!baseline_digest || !candidate_digest) return Object.freeze({ok:false,reason:'REFERENCE_DIGESTS_REQUIRED'});
  if(!Array.isArray(reference_ids)||!reference_ids.length) return Object.freeze({ok:false,reason:'REFERENCE_IDS_REQUIRED'});
  if(!comparison || comparison.schema!=='TAKY_OBJECTIVE_REFERENCE_DELTA_V1'){
    return Object.freeze({ok:false,reason:'OBJECTIVE_REFERENCE_COMPARISON_REQUIRED'});
  }
  const signed=Capability.signPayload('TAKY_REFERENCE_EFFECT_RECEIPT',{
    measurer_id:MEASURER_ID,
    baseline_digest,
    candidate_digest,
    reference_ids:[...reference_ids],
    comparison,
    objective_effect_pass:comparison.objective_effect_detected===true,
    clarity_only_suspected:comparison.clarity_only_suspected===true,
    professional_family_claim:false
  });
  if(!signed.ok) return signed;
  return Object.freeze({ok:true,receipt:signed.token});
}

function verifyReferenceEffect(receipt,expectedCandidateDigest,expectedReferenceIds=[]){
  const verified=Capability.verifyToken(receipt,'TAKY_REFERENCE_EFFECT_RECEIPT');
  if(!verified.ok) return verified;
  const p=verified.payload;
  if(p.measurer_id!==MEASURER_ID) return Object.freeze({ok:false,reason:'UNTRUSTED_REFERENCE_MEASURER'});
  if(expectedCandidateDigest && p.candidate_digest!==expectedCandidateDigest){
    return Object.freeze({ok:false,reason:'REFERENCE_EFFECT_DIGEST_MISMATCH'});
  }
  const actual=new Set(p.reference_ids||[]);
  for(const id of expectedReferenceIds||[]){
    if(!actual.has(id)) return Object.freeze({ok:false,reason:'REFERENCE_TRACEABILITY_MISSING',reference_id:id});
  }
  if(p.objective_effect_pass!==true || p.clarity_only_suspected===true){
    return Object.freeze({ok:false,reason:'OBJECTIVE_REFERENCE_EFFECT_FAIL',payload:p});
  }
  return Object.freeze({ok:true,payload:p});
}

module.exports=Object.freeze({
  version:'1.0.0',
  MEASURER_ID,
  issueVisualMeasurement,
  verifyVisualMeasurement,
  issueReferenceEffect,
  verifyReferenceEffect
});
