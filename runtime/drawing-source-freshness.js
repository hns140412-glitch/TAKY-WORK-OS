(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSourceFreshness=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();

  function compare(a={},b={}){
    const aDigest=clean(a.content_digest||a.source_digest);
    const bDigest=clean(b.content_digest||b.source_digest);
    if(!aDigest || !bDigest){
      return Object.freeze({ok:false,decision:'HOLD',reason:'CONTENT_DIGEST_REQUIRED_FOR_FRESHNESS'});
    }
    if(aDigest===bDigest){
      return Object.freeze({
        ok:true,
        relation:'CONTENT_IDENTICAL',
        newer_by_date:null,
        supersession:'FORBIDDEN_BY_DATE_ALONE',
        reason:'DATE != CONTENT CHANGE'
      });
    }
    return Object.freeze({
      ok:true,
      relation:'CONTENT_CHANGED',
      newer_by_date:null,
      supersession:'REQUIRES_AUTHORITY_REVISION_REVIEW',
      reason:'CONTENT_CHANGE != AUTOMATIC AUTHORITY_CHANGE'
    });
  }

  function maySupersede({candidate={},current={}}={}){
    const cmp=compare(candidate,current);
    if(!cmp.ok) return cmp;
    if(cmp.relation==='CONTENT_IDENTICAL') return Object.freeze({...cmp,allowed:false});
    const authority=clean(candidate.authority).toUpperCase();
    const currentAuthority=clean(current.authority).toUpperCase();
    const revisionEvidence=clean(candidate.revision_evidence);
    const allowed=Boolean(revisionEvidence) && authority && authority===currentAuthority;
    return Object.freeze({...cmp,allowed,reason:allowed?'CONTENT_DELTA_WITH_REVISION_EVIDENCE':'CONTENT_DELTA_NEEDS_REVISION_EVIDENCE'});
  }

  return Object.freeze({version:'1.0.0',compare,maySupersede});
});