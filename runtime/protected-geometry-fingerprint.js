(function(root,factory){
  const api=factory(typeof require==='function' ? require('crypto') : null);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyProtectedGeometryFingerprint=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(crypto){
  'use strict';

  const PROTECTED=Object.freeze(['wall','core','entry']);

  function canonical(value){
    if(Array.isArray(value)) return '['+value.map(canonical).sort().join(',')+']';
    if(value && typeof value==='object'){
      return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    }
    return JSON.stringify(value);
  }

  function hash(value){
    const payload=canonical(value);
    if(crypto) return crypto.createHash('sha256').update(payload).digest('hex');
    let h=2166136261;
    for(let i=0;i<payload.length;i++){ h^=payload.charCodeAt(i); h=Math.imul(h,16777619); }
    return ('00000000'+(h>>>0).toString(16)).slice(-8);
  }

  function compare(source={},candidate={}){
    const findings=[];
    const fingerprints={};
    for(const key of PROTECTED){
      const s=hash(source[key]||[]);
      const c=hash(candidate[key]||[]);
      fingerprints[key]={source:s,candidate:c,equal:s===c};
      if(s!==c) findings.push({code:'PROTECTED_GEOMETRY_FINGERPRINT_MISMATCH',element:key,source:s,candidate:c});
    }
    return Object.freeze({ok:findings.length===0,fingerprints:Object.freeze(fingerprints),findings:Object.freeze(findings)});
  }

  return Object.freeze({version:'1.0.0',PROTECTED,hash,compare});
});