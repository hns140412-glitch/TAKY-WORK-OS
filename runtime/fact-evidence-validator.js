'use strict';

const ALLOWED_STATES=new Set(['CONFIRMED','CALCULATED','PENDING','CONFLICT','REFERENCE_ONLY']);

function validateFacts(input={}){
  const sources=new Set((input.sources||[]).map(s=>s?.source_id).filter(Boolean));
  const findings=[];

  for(const f of input.facts||[]){
    if(!f?.fact_id){
      findings.push({code:'FACT_ID_REQUIRED'});
      continue;
    }
    if(!ALLOWED_STATES.has(f.evidence_state)){
      findings.push({code:'INVALID_EVIDENCE_STATE',fact_id:f.fact_id});
      continue;
    }
    if(f.evidence_state==='PENDING' && f.value!==null && f.value!==undefined){
      findings.push({code:'PENDING_FACT_VALUE_FORBIDDEN',fact_id:f.fact_id});
    }
    if(['CONFIRMED','CALCULATED'].includes(f.evidence_state)){
      if(!Array.isArray(f.source_refs) || !f.source_refs.length){
        findings.push({code:'AUTHORITATIVE_FACT_SOURCE_REQUIRED',fact_id:f.fact_id});
      }
    }
    for(const ref of f.source_refs||[]){
      if(!sources.has(ref)) findings.push({code:'FACT_SOURCE_NOT_FOUND',fact_id:f.fact_id,source_ref:ref});
    }
  }

  return Object.freeze({
    ok:findings.length===0,
    gate:findings.length?'FAIL':'PASS',
    findings:Object.freeze(findings)
  });
}

module.exports=Object.freeze({version:'1.0.0',validateFacts});
