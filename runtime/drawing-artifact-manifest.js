(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingArtifactManifest=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const REQUIRED_BY_LAYER=Object.freeze({
    L0_SOURCE:['source_id','source_digest','revision'],
    L1_GEOMETRY:['geometry_digest'],
    L2_SEMANTIC:['semantic_state'],
    L3_PRESENTATION:['artifact_uri'],
    L4_ENTOURAGE:['artifact_uri'],
    L5_ANNOTATION:['artifact_uri'],
    L6_AI_ATMOSPHERE:['artifact_uri'],
    L7_FINAL_OVERLAY_VALIDATION:['artifact_uri','validation_state']
  });

  function validateArtifact(a={}){
    const layer=a.layer_id;
    if(!REQUIRED_BY_LAYER[layer]) return {ok:false,reason:'UNKNOWN_LAYER'};
    const missing=REQUIRED_BY_LAYER[layer].filter(k=>a[k]===undefined||a[k]===null||a[k]==='');
    return {ok:missing.length===0,missing};
  }

  function buildManifest({source_key,artifacts=[]}={}){
    if(!source_key) return {ok:false,reason:'SOURCE_KEY_REQUIRED'};
    const invalid=[];
    const seen=new Set();
    for(const [idx,a] of artifacts.entries()){
      const v=validateArtifact(a);
      if(!v.ok) invalid.push({index:idx,layer_id:a.layer_id,missing:v.missing||[],reason:v.reason||'INVALID_ARTIFACT'});
      const key=(a.view_id||'SHARED')+'::'+a.layer_id;
      if(seen.has(key)) invalid.push({index:idx,layer_id:a.layer_id,reason:'DUPLICATE_LAYER_ARTIFACT',key});
      seen.add(key);
    }
    return Object.freeze({
      ok:invalid.length===0,
      source_key,
      artifacts:Object.freeze(artifacts.map(x=>Object.freeze({...x}))),
      invalid:Object.freeze(invalid)
    });
  }

  return Object.freeze({version:'1.0.0',REQUIRED_BY_LAYER,validateArtifact,buildManifest});
});
