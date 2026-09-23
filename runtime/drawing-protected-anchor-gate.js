(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProtectedAnchorGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function evaluate({before=[],after=[]}={}){
    const norm=x=>String(x?.id||x||'').trim();
    const b=new Set((before||[]).map(norm).filter(Boolean));
    const a=new Set((after||[]).map(norm).filter(Boolean));
    const missing=[...b].filter(id=>!a.has(id));
    return Object.freeze({
      ok:missing.length===0,
      missing:Object.freeze(missing),
      finding:missing.length? 'PROTECTED_ARCHITECTURE_DELETED':null
    });
  }
  return Object.freeze({version:'1.0.0',evaluate});
});