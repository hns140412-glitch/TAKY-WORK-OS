(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceEffectGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();
  const canon=v=>{
    if(v===null||typeof v!=='object') return JSON.stringify(v);
    if(Array.isArray(v)) return '['+v.map(canon).join(',')+']';
    return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';
  };

  function evaluate({compiled,application_receipts=[],probe_evidence={},professional_family={},generic_layout_detected=false,explanation_required_to_notice_gain=false}={}){
    const blocks=[];
    if(!compiled?.ok) blocks.push('REFERENCE_COMPILE_REQUIRED');

    const receipts=new Map();
    for(const r of application_receipts||[]){
      const p=clean(r.parameter);
      if(!p) continue;
      receipts.set(p,r);
    }

    for(const effect of compiled?.effects||[]){
      for(const [parameter,expected] of Object.entries(effect.engine_parameters||{})){
        const r=receipts.get(parameter);
        if(!r){blocks.push('APPLICATION_RECEIPT_REQUIRED:'+parameter);continue;}
        if(canon(r.applied_value)!==canon(expected)) blocks.push('APPLICATION_VALUE_MISMATCH:'+parameter);
        if(!clean(r.engine_owner)) blocks.push('APPLICATION_ENGINE_OWNER_REQUIRED:'+parameter);
        if(!clean(r.artifact_ref)) blocks.push('APPLICATION_ARTIFACT_REF_REQUIRED:'+parameter);
      }
      const p=probe_evidence?.[effect.validation_probe];
      if(!p){blocks.push('PROBE_EVIDENCE_REQUIRED:'+effect.validation_probe);continue;}
      if(clean(p.status).toUpperCase()!=='PASS') blocks.push('PROBE_NOT_PASS:'+effect.validation_probe);
      if(!clean(p.validator)) blocks.push('PROBE_VALIDATOR_REQUIRED:'+effect.validation_probe);
      if(!Array.isArray(p.evidence_refs)||p.evidence_refs.length===0||p.evidence_refs.some(x=>!clean(x))) blocks.push('PROBE_EVIDENCE_REF_REQUIRED:'+effect.validation_probe);
      if(!clean(p.observed_effect)) blocks.push('OBSERVED_EFFECT_REQUIRED:'+effect.validation_probe);
    }

    if(generic_layout_detected===true) blocks.push('GENERIC_LAYOUT_DETECTED');
    if(explanation_required_to_notice_gain===true) blocks.push('REFERENCE_EFFECT_NOT_SELF_EVIDENT');

    if(clean(professional_family.status).toUpperCase()!=='PASS') blocks.push('PROFESSIONAL_FAMILY_NOT_PASS');
    if(!clean(professional_family.validator)) blocks.push('PROFESSIONAL_FAMILY_VALIDATOR_REQUIRED');
    if(!Array.isArray(professional_family.evidence_refs)||professional_family.evidence_refs.length===0||professional_family.evidence_refs.some(x=>!clean(x))){
      blocks.push('PROFESSIONAL_FAMILY_EVIDENCE_REQUIRED');
    }

    return Object.freeze({
      ok:blocks.length===0,
      status:blocks.length===0?'PASS':'FAIL',
      proof_type:'REFERENCE_EFFECT_RECEIPT',
      blocks:Object.freeze(blocks),
      invariant:'REFERENCE_NAME -> DNA -> TOKEN -> PARAMETER -> APPLICATION_RECEIPT -> OUTPUT_EFFECT -> PROFESSIONAL_FAMILY_VALIDATION'
    });
  }

  return Object.freeze({version:'1.0.0',evaluate});
});