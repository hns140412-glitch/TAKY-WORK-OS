(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSemanticVerificationGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function evaluate(records=[]){
    const findings=[];
    for(const r of records||[]){
      const state=String(r?.state||'UNKNOWN').toUpperCase();
      const used=Boolean(r?.used_in_presentation);
      if(used && !['VERIFIED','SOURCE_EXPLICIT','USER_CONFIRMED'].includes(state)){
        findings.push({code:'UNVERIFIED_SEMANTIC_USED',semantic:r?.semantic||null,state});
      }
    }
    return Object.freeze({ok:findings.length===0,findings:Object.freeze(findings)});
  }
  return Object.freeze({version:'1.0.0',evaluate});
});