(function(root,factory){
  const api=factory(typeof require==='function' ? require('crypto') : null);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakySourceFreshness=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(crypto){
  'use strict';

  function contentHash(content){
    const payload=typeof content==='string' ? content : JSON.stringify(content);
    if(!crypto) throw new Error('CRYPTO_REQUIRED_FOR_CONTENT_FINGERPRINT');
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  function compare(a={},b={}){
    const aHash=a.content_hash || (a.content!==undefined ? contentHash(a.content) : null);
    const bHash=b.content_hash || (b.content!==undefined ? contentHash(b.content) : null);
    if(!aHash || !bHash) return Object.freeze({ok:false,reason:'CONTENT_FINGERPRINT_REQUIRED'});
    if(aHash===bHash){
      return Object.freeze({
        ok:true,
        relation:'CONTENT_IDENTICAL',
        supersession_allowed:false,
        reason:'DATE != CONTENT CHANGE',
        a_modified:a.modified_at||null,
        b_modified:b.modified_at||null
      });
    }
    return Object.freeze({
      ok:true,
      relation:'CONTENT_CHANGED',
      supersession_allowed:null,
      reason:'CONTENT_DELTA_REQUIRES_AUTHORITY_AND_REVISION_REVIEW',
      a_modified:a.modified_at||null,
      b_modified:b.modified_at||null
    });
  }

  return Object.freeze({version:'1.0.0',contentHash,compare});
});