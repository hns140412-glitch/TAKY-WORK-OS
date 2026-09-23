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

function verifyReferenceEffectSet(receipts,expectedCandidateDigest,compiledReference){
  if(!compiledReference?.ok){
    return Object.freeze({ok:false,reason:'REFERENCE_NOT_COMPILED'});
  }

  const compiled=compiledReference.compiled||[];
  const missingMetric=compiled
    .filter(x=>!x.effect_metric)
    .map(x=>x.reference_id);
  if(missingMetric.length){
    return Object.freeze({
      ok:false,
      reason:'REFERENCE_EFFECT_METRIC_NOT_IMPLEMENTED',
      reference_ids:Object.freeze(missingMetric)
    });
  }

  const list=Array.isArray(receipts)
    ? receipts.filter(Boolean)
    : (receipts ? [receipts] : []);
  if(!list.length){
    return Object.freeze({ok:false,reason:'REFERENCE_EFFECT_RECEIPT_SET_REQUIRED'});
  }

  const expectedBySchema=new Map();
  const metricByReference=new Map();
  for(const item of compiled){
    metricByReference.set(item.reference_id,item.effect_metric);
    if(!expectedBySchema.has(item.effect_metric)) expectedBySchema.set(item.effect_metric,new Set());
    expectedBySchema.get(item.effect_metric).add(item.reference_id);
  }

  const payloads=[];
  const findings=[];
  for(const receipt of list){
    const verified=Verifier.verifySignedReceipt(receipt,{
      expected_type:'TAKY_REFERENCE_EFFECT_RECEIPT',
      public_key_pem:publicKey(),
      validator_id:MEASURER_ID
    });
    if(!verified.ok){
      findings.push(Object.freeze({reason:verified.reason||'REFERENCE_EFFECT_RECEIPT_INVALID'}));
      continue;
    }
    const p=verified.payload;
    if(expectedCandidateDigest && p.candidate_digest!==expectedCandidateDigest){
      findings.push(Object.freeze({reason:'REFERENCE_EFFECT_DIGEST_MISMATCH',effect_schema:p.effect_schema||null}));
      continue;
    }
    if(p.reference_compile_digest!==compiledReference.compile_digest){
      findings.push(Object.freeze({reason:'REFERENCE_COMPILE_DIGEST_MISMATCH',effect_schema:p.effect_schema||null}));
      continue;
    }
    if(p.objective_effect_pass!==true || p.clarity_only_suspected===true){
      findings.push(Object.freeze({reason:'OBJECTIVE_REFERENCE_EFFECT_FAIL',effect_schema:p.effect_schema||null}));
      continue;
    }
    if(!expectedBySchema.has(p.effect_schema)){
      findings.push(Object.freeze({reason:'UNEXPECTED_REFERENCE_EFFECT_SCHEMA',effect_schema:p.effect_schema||null}));
      continue;
    }

    let schemaMismatch=false;
    for(const id of p.reference_ids||[]){
      if(metricByReference.get(id)!==p.effect_schema){
        findings.push(Object.freeze({
          reason:'REFERENCE_EFFECT_REFERENCE_SCHEMA_MISMATCH',
          reference_id:id,
          expected_schema:metricByReference.get(id)||null,
          actual_schema:p.effect_schema||null
        }));
        schemaMismatch=true;
      }
    }
    if(schemaMismatch) continue;

    payloads.push(Object.freeze(p));
  }

  const coveredBySchema=new Map();
  for(const payload of payloads){
    if(!coveredBySchema.has(payload.effect_schema)) coveredBySchema.set(payload.effect_schema,new Set());
    for(const id of payload.reference_ids||[]) coveredBySchema.get(payload.effect_schema).add(id);
  }

  for(const [schema,ids] of expectedBySchema.entries()){
    const covered=coveredBySchema.get(schema)||new Set();
    for(const id of ids){
      if(!covered.has(id)){
        findings.push(Object.freeze({
          reason:'REFERENCE_EFFECT_RECEIPT_COVERAGE_MISSING',
          reference_id:id,
          effect_schema:schema
        }));
      }
    }
  }

  return Object.freeze({
    ok:findings.length===0,
    payloads:Object.freeze(payloads),
    findings:Object.freeze(findings),
    expected_effect_schemas:Object.freeze([...expectedBySchema.keys()])
  });
}

module.exports=Object.freeze({
  version:'2.0.0',
  MEASURER_ID,
  key_mode:'VERIFY_ONLY',
  verifyVisualMeasurement,
  verifyReferenceEffect,
  verifyReferenceEffectSet
});
