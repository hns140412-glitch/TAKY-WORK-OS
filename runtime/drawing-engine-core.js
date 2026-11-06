(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingEngine=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const POLICIES=Object.freeze(['KEEP','CHANGE','MAY_CHANGE','UNKNOWN']);
  const MODES=Object.freeze(['FAST','CONTROLLED','AUTHORITATIVE']);
  const AUTHORITIES=Object.freeze(['AUTHORITATIVE_VECTOR','DERIVED_VECTOR','RASTER_REFERENCE','AI_DERIVED']);

  const clean=v=>String(v??'').trim();
  const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));

  function canonicalize(value){
    if(value===null || typeof value!=='object') return JSON.stringify(value);
    if(Array.isArray(value)) return '['+value.map(canonicalize).join(',')+']';
    const keys=Object.keys(value).sort();
    return '{'+keys.map(k=>JSON.stringify(k)+':'+canonicalize(value[k])).join(',')+'}';
  }

  function fnv1a(input){
    let h=0x811c9dc5;
    for(let i=0;i<input.length;i++){
      h^=input.charCodeAt(i);
      h=Math.imul(h,0x01000193)>>>0;
    }
    return h.toString(16).padStart(8,'0');
  }

  function normalizeObject(raw,index){
    const id=clean(raw?.object_id||raw?.id);
    const policy=clean(raw?.policy).toUpperCase();
    if(!id) return {ok:false,error:{index,reason:'OBJECT_ID_REQUIRED'}};
    if(!POLICIES.includes(policy)) return {ok:false,error:{index,object_id:id,reason:'INVALID_POLICY'}};
    return {ok:true,value:Object.freeze({
      object_id:id,
      object_type:clean(raw?.object_type)||'UNSPECIFIED',
      policy,
      geometry:clone(raw?.geometry??null),
      semantics:clone(raw?.semantics??null),
      presentation:clone(raw?.presentation??null),
      presentation_only:raw?.presentation_only===true,
      metadata:clone(raw?.metadata??null)
    })};
  }

  function normalizeKeyState(input={}){
    const source_id=clean(input.source_id||input.source?.source_id);
    const source_authority=clean(input.source_authority||input.source?.authority).toUpperCase();
    const revision=clean(input.revision||input.revision_id)||'REV_UNSPECIFIED';
    const source_digest=clean(input.source_digest||input.source?.digest)||null;
    const user_intent=clone(input.user_intent||null);
    if(!source_id) return {ok:false,reason:'SOURCE_ID_REQUIRED'};
    if(!AUTHORITIES.includes(source_authority)) return {ok:false,reason:'INVALID_SOURCE_AUTHORITY'};
    if(!Array.isArray(input.objects)) return {ok:false,reason:'OBJECTS_NOT_ARRAY'};
    const seen=new Set();
    const objects=[];
    const errors=[];
    input.objects.forEach((raw,index)=>{
      const n=normalizeObject(raw,index);
      if(!n.ok){errors.push(n.error);return;}
      if(seen.has(n.value.object_id)){errors.push({index,object_id:n.value.object_id,reason:'DUPLICATE_OBJECT_ID'});return;}
      seen.add(n.value.object_id);
      objects.push(n.value);
    });
    if(errors.length) return {ok:false,reason:'INVALID_OBJECTS',errors};
    return {ok:true,key_state:Object.freeze({
      key_state_version:1,
      source_id,
      source_authority,
      revision,
      source_digest,
      user_intent,
      objects:Object.freeze(objects)
    })};
  }

  function geometryFingerprint(keyState){
    const payload=(keyState?.objects||[])
      .filter(o=>!o.presentation_only)
      .map(o=>({object_id:o.object_id,object_type:o.object_type,geometry:o.geometry}))
      .sort((a,b)=>a.object_id.localeCompare(b.object_id));
    return 'gk_'+fnv1a(canonicalize(payload));
  }

  function semanticFingerprint(keyState){
    const payload=(keyState?.objects||[])
      .filter(o=>!o.presentation_only)
      .map(o=>({object_id:o.object_id,object_type:o.object_type,semantics:o.semantics,policy:o.policy}))
      .sort((a,b)=>a.object_id.localeCompare(b.object_id));
    return 'sk_'+fnv1a(canonicalize(payload));
  }

  function keyStateFingerprint(keyState){
    return 'ks_'+fnv1a(canonicalize({
      source_id:keyState?.source_id||null,
      source_authority:keyState?.source_authority||null,
      source_digest:keyState?.source_digest||null,
      geometry_key:geometryFingerprint(keyState),
      semantic_key:semanticFingerprint(keyState)
    }));
  }

  function routeExecution({purpose='',source_authority='RASTER_REFERENCE',requires_numeric_authority=false,changes_geometry=false}={}){
    const p=clean(purpose).toUpperCase();
    const a=clean(source_authority).toUpperCase();
    if(changes_geometry || requires_numeric_authority || ['AREA_ANALYSIS','CAD_EXCEL','REGULATORY_CHECK','AUTHORITATIVE_MEASUREMENT'].includes(p)){
      return {mode:'AUTHORITATIVE',reason:'NUMERIC_OR_GEOMETRY_AUTHORITY_REQUIRED'};
    }
    if(['SALES_PLAN','PUBLICATION','SECTION_PRESENTATION','SITE_PRESENTATION','CG_HANDOFF','A3_REPORT'].includes(p)){
      return {mode:'CONTROLLED',reason:'PRESENTATION_WITH_SOURCE_FIDELITY'};
    }
    if(a==='AI_DERIVED') return {mode:'CONTROLLED',reason:'LOW_AUTHORITY_SOURCE_REQUIRES_CONTROL'};
    return {mode:'FAST',reason:'STYLE_ONLY_LOW_RISK'};
  }

  function validateKeyPreservation(before,after){
    const issues=[];
    if(!before||!after) return {ok:false,issues:[{code:'KEY_STATE_REQUIRED',severity:'CRITICAL'}]};
    if(before.source_id!==after.source_id) issues.push({code:'SOURCE_ID_CHANGED',severity:'CRITICAL'});
    if(before.source_digest && before.source_digest!==after.source_digest) issues.push({code:'SOURCE_DIGEST_CHANGED_OR_MISSING',severity:'CRITICAL'});
    const bMap=new Map((before.objects||[]).map(o=>[o.object_id,o]));
    const aMap=new Map((after.objects||[]).map(o=>[o.object_id,o]));

    for(const [id,b] of bMap){
      const a=aMap.get(id);
      if(!a){issues.push({code:'MISSING_OBJECT',severity:'CRITICAL',object_id:id});continue;}
      const bg=canonicalize(b.geometry), ag=canonicalize(a.geometry);
      const bs=canonicalize(b.semantics), as=canonicalize(a.semantics);
      if(bg!==ag) issues.push({code:'GEOMETRY_DRIFT',severity:'CRITICAL',object_id:id});
      if(bs!==as) issues.push({code:'SEMANTIC_DRIFT',severity:'CRITICAL',object_id:id});
      if(b.policy==='UNKNOWN' && canonicalize(b.presentation)!==canonicalize(a.presentation)){
        issues.push({code:'UNKNOWN_SOURCE_APPEARANCE_CHANGED',severity:'HIGH',object_id:id});
      }
      if(b.policy!==a.policy) issues.push({code:'POLICY_CHANGED',severity:'HIGH',object_id:id});
    }

    for(const [id,a] of aMap){
      if(!bMap.has(id) && !a.presentation_only){
        issues.push({code:'UNAUTHORIZED_NEW_GEOMETRY_OBJECT',severity:'CRITICAL',object_id:id});
      }
    }

    return {
      ok:!issues.some(i=>i.severity==='CRITICAL'||i.severity==='HIGH'),
      geometry_key_before:geometryFingerprint(before),
      geometry_key_after:geometryFingerprint(after),
      semantic_key_before:semanticFingerprint(before),
      semantic_key_after:semanticFingerprint(after),
      key_state_before:keyStateFingerprint(before),
      key_state_after:keyStateFingerprint(after),
      fingerprint_strength:'NON_CRYPTOGRAPHIC_REGRESSION_KEY',
      source_digest_present:Boolean(before.source_digest),
      issues:Object.freeze(issues)
    };
  }

  function evaluateUserIntent({required_outcomes=[],observed_outcomes=[]}={}){
    const observed=new Set((observed_outcomes||[]).map(x=>clean(x).toUpperCase()).filter(Boolean));
    const required=(required_outcomes||[]).map(x=>clean(x).toUpperCase()).filter(Boolean);
    const missing=required.filter(x=>!observed.has(x));
    return {ok:missing.length===0,required:Object.freeze(required),missing:Object.freeze(missing)};
  }

  return Object.freeze({
    version:'1.2.0',
    POLICIES,
    MODES,
    AUTHORITIES,
    normalizeKeyState,
    geometryFingerprint,
    semanticFingerprint,
    keyStateFingerprint,
    routeExecution,
    validateKeyPreservation,
    evaluateUserIntent
  });
});
