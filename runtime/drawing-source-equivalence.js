(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSourceEquivalence=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict'; const clean=v=>String(v??'').trim();
  function classify(a={},b={}){
    const da=clean(a.content_digest),db=clean(b.content_digest);
    if(da&&db&&da===db) return Object.freeze({state:'SAME_CONTENT',stale:false,reason:'CONTENT_DIGEST_EQUAL'});
    if(da&&db&&da!==db) return Object.freeze({state:'CONTENT_CHANGED',stale:true,reason:'CONTENT_DIGEST_DIFF'});
    return Object.freeze({state:'UNKNOWN_CONTENT_RELATION',stale:null,reason:'DIGEST_REQUIRED_DATE_IS_NOT_CONTENT_CHANGE'});
  }
  return Object.freeze({version:'1.0.0',classify});
});
