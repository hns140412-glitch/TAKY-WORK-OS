(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingNarrativeDecisionEngine=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clean=v=>String(v??'').trim();
  const FACT_STATES=new Set(['CONFIRMED','CALCULATED','PENDING','CONFLICT','REFERENCE_ONLY']);
  const CLAIM_TYPES=new Set(['OBSERVATION','INTERPRETATION','DECISION','QUESTION','REFERENCE']);

  function buildIndex(pkg={}){
    const map=new Map();
    for(const s of pkg.sources||[]) if(s.source_id) map.set(clean(s.source_id),{kind:'SOURCE',record:s});
    for(const f of pkg.facts||[]) if(f.fact_id) map.set(clean(f.fact_id),{kind:'FACT',record:f});
    for(const r of pkg.review_items||[]) if(r.review_id) map.set(clean(r.review_id),{kind:'REVIEW',record:r});
    for(const c of pkg.cases||[]) if(c.case_id) map.set(clean(c.case_id),{kind:'CASE',record:c});
    return map;
  }

  function refsExist(refs,index){
    return Array.isArray(refs) && refs.length>0 && refs.every(x=>index.has(clean(x)));
  }

  function evidenceAssessment(refs,index){
    const details=(refs||[]).map(ref=>{
      const id=clean(ref);
      const hit=index.get(id);
      if(!hit) return {ref:id,kind:'MISSING',state:'MISSING'};
      let state='TRACEABLE';
      if(hit.kind==='FACT') state=clean(hit.record.evidence_state).toUpperCase()||'UNKNOWN';
      else if(hit.kind==='REVIEW') state=clean(hit.record.state).toUpperCase()||'UNKNOWN';
      else if(hit.kind==='CASE') state='REFERENCE_ONLY';
      else if(hit.kind==='SOURCE') state='SOURCE_TRACE';
      return {ref:id,kind:hit.kind,state};
    });

    const factStates=details.filter(x=>x.kind==='FACT').map(x=>x.state);
    const reviewStates=details.filter(x=>x.kind==='REVIEW').map(x=>x.state);
    const hasPending=factStates.includes('PENDING')||reviewStates.includes('PENDING');
    const hasConflict=factStates.includes('CONFLICT');
    const hasReferenceOnly=factStates.includes('REFERENCE_ONLY')||details.some(x=>x.kind==='CASE');

    let strength='TRACEABLE';
    if(hasConflict) strength='CONFLICT';
    else if(hasPending) strength='PENDING';
    else if(hasReferenceOnly) strength='REFERENCE_ONLY';
    else if(factStates.length && factStates.every(x=>x==='CONFIRMED'||x==='CALCULATED')) strength='CONFIRMED';
    else if(details.some(x=>x.kind==='SOURCE')) strength='SOURCE_TRACE';

    return {details,strength,hasPending,hasConflict,hasReferenceOnly};
  }

  function validateClaim(claim,index,field,idx){
    const findings=[];
    const text=clean(claim?.text);
    if(!text) findings.push({code:'NARRATIVE_TEXT_REQUIRED',field,index:idx});

    if(!refsExist(claim?.evidence_refs,index)){
      findings.push({code:'NARRATIVE_EVIDENCE_REQUIRED',field,index:idx,evidence_refs:claim?.evidence_refs||[]});
      return {findings,assessment:null};
    }

    const claimType=clean(claim?.claim_type||'OBSERVATION').toUpperCase();
    if(!CLAIM_TYPES.has(claimType)){
      findings.push({code:'INVALID_CLAIM_TYPE',field,index:idx,claim_type:claimType});
    }

    const assessment=evidenceAssessment(claim.evidence_refs,index);

    // Authoritative statements must not be promoted from unresolved or reference-only evidence.
    if(['OBSERVATION','DECISION'].includes(claimType)){
      if(assessment.hasConflict){
        findings.push({code:'AUTHORITATIVE_CLAIM_CONFLICT_EVIDENCE',field,index:idx});
      }
      if(assessment.hasPending){
        findings.push({code:'AUTHORITATIVE_CLAIM_PENDING_EVIDENCE',field,index:idx});
      }
      if(assessment.hasReferenceOnly && !assessment.details.some(x=>x.kind==='SOURCE')){
        findings.push({code:'AUTHORITATIVE_CLAIM_REFERENCE_ONLY',field,index:idx});
      }
    }

    return {findings,assessment:{...assessment,claim_type:claimType}};
  }

  function compilePage({package_data,page_id}={}){
    const pkg=package_data||{};
    const page=(pkg.pages||[]).find(x=>x.page_id===page_id);
    if(!page) return {ok:false,reason:'PAGE_NOT_FOUND',page_id};

    const narrative=page.narrative||null;
    if(!narrative){
      return Object.freeze({
        ok:true,status:'NO_NARRATIVE_BLOCK',page_id,
        message:null,why_it_matters:null,
        decision_points:Object.freeze([]),claims:Object.freeze([])
      });
    }

    const index=buildIndex(pkg);
    const findings=[];
    const assessments=[];
    const message=narrative.message||null;
    const why=narrative.why_it_matters||null;
    const decisions=Array.isArray(narrative.decision_points)?narrative.decision_points:[];
    const claims=Array.isArray(narrative.claims)?narrative.claims:[];

    function check(claim,field,idx){
      if(!claim) return;
      const r=validateClaim(claim,index,field,idx);
      findings.push(...r.findings);
      if(r.assessment) assessments.push({field,index:idx,...r.assessment});
    }

    check(message,'message',0);
    check(why,'why_it_matters',0);
    decisions.forEach((x,i)=>check(x,'decision_points',i));
    claims.forEach((x,i)=>check(x,'claims',i));

    if(findings.length){
      return Object.freeze({
        ok:false,
        reason:'NARRATIVE_EVIDENCE_INVALID',
        page_id,
        findings:Object.freeze(findings),
        assessments:Object.freeze(assessments)
      });
    }

    return Object.freeze({
      ok:true,
      status:'EVIDENCE_GROUNDED',
      page_id,
      message:message?Object.freeze({...message}):null,
      why_it_matters:why?Object.freeze({...why}):null,
      decision_points:Object.freeze(decisions.map(x=>Object.freeze({...x}))),
      claims:Object.freeze(claims.map(x=>Object.freeze({...x}))),
      assessments:Object.freeze(assessments)
    });
  }

  return Object.freeze({
    version:'1.1.0',
    FACT_STATES:Object.freeze([...FACT_STATES]),
    CLAIM_TYPES:Object.freeze([...CLAIM_TYPES]),
    compilePage
  });
});