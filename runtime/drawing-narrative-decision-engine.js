(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingNarrativeDecisionEngine=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clean=v=>String(v??'').trim();

  function refsExist(refs,known){
    return Array.isArray(refs) && refs.length>0 && refs.every(x=>known.has(clean(x)));
  }

  function buildKnown(pkg={}){
    const known=new Set();
    for(const s of pkg.sources||[]) if(s.source_id) known.add(clean(s.source_id));
    for(const f of pkg.facts||[]) if(f.fact_id) known.add(clean(f.fact_id));
    for(const r of pkg.review_items||[]) if(r.review_id) known.add(clean(r.review_id));
    for(const c of pkg.cases||[]) if(c.case_id) known.add(clean(c.case_id));
    return known;
  }

  function validateClaim(claim,known,field,index){
    const findings=[];
    if(!clean(claim?.text)) findings.push({code:'NARRATIVE_TEXT_REQUIRED',field,index});
    if(!refsExist(claim?.evidence_refs,known)){
      findings.push({code:'NARRATIVE_EVIDENCE_REQUIRED',field,index,evidence_refs:claim?.evidence_refs||[]});
    }
    return findings;
  }

  function compilePage({package_data,page_id}={}){
    const pkg=package_data||{};
    const page=(pkg.pages||[]).find(x=>x.page_id===page_id);
    if(!page) return {ok:false,reason:'PAGE_NOT_FOUND',page_id};

    const narrative=page.narrative||null;
    if(!narrative){
      return Object.freeze({
        ok:true,
        status:'NO_NARRATIVE_BLOCK',
        page_id,
        message:null,
        why_it_matters:null,
        decision_points:Object.freeze([]),
        claims:Object.freeze([])
      });
    }

    const known=buildKnown(pkg);
    const findings=[];
    const message=narrative.message||null;
    const why=narrative.why_it_matters||null;
    const decisions=Array.isArray(narrative.decision_points)?narrative.decision_points:[];
    const claims=Array.isArray(narrative.claims)?narrative.claims:[];

    if(message) findings.push(...validateClaim(message,known,'message',0));
    if(why) findings.push(...validateClaim(why,known,'why_it_matters',0));
    decisions.forEach((x,i)=>findings.push(...validateClaim(x,known,'decision_points',i)));
    claims.forEach((x,i)=>findings.push(...validateClaim(x,known,'claims',i)));

    if(findings.length){
      return Object.freeze({ok:false,reason:'NARRATIVE_EVIDENCE_INVALID',page_id,findings:Object.freeze(findings)});
    }

    return Object.freeze({
      ok:true,
      status:'EVIDENCE_GROUNDED',
      page_id,
      message:message?Object.freeze({...message}):null,
      why_it_matters:why?Object.freeze({...why}):null,
      decision_points:Object.freeze(decisions.map(x=>Object.freeze({...x}))),
      claims:Object.freeze(claims.map(x=>Object.freeze({...x})))
    });
  }

  return Object.freeze({version:'1.0.0',compilePage});
});