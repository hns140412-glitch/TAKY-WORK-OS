(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();
  function compile(records=[]){
    const effects=[],blocks=[];
    (records||[]).forEach((r,i)=>{
      const name=clean(r.reference_name),dna=clean(r.mined_dna);
      const tokens=r.design_tokens&&typeof r.design_tokens==='object'?r.design_tokens:null;
      const params=r.engine_parameters&&typeof r.engine_parameters==='object'?r.engine_parameters:null;
      const effect=clean(r.output_effect),probe=clean(r.validation_probe);
      if(!name) blocks.push({index:i,code:'REFERENCE_NAME_REQUIRED'});
      if(!dna) blocks.push({index:i,code:'MINED_DNA_REQUIRED'});
      if(!tokens||!Object.keys(tokens).length) blocks.push({index:i,code:'DESIGN_TOKEN_REQUIRED'});
      if(!params||!Object.keys(params).length) blocks.push({index:i,code:'ENGINE_PARAMETER_REQUIRED'});
      if(!effect) blocks.push({index:i,code:'OUTPUT_EFFECT_REQUIRED'});
      if(!probe) blocks.push({index:i,code:'VALIDATION_PROBE_REQUIRED'});
      if(name&&dna&&tokens&&params&&effect&&probe) effects.push(Object.freeze({reference_name:name,mined_dna:dna,design_tokens:Object.freeze({...tokens}),engine_parameters:Object.freeze({...params}),output_effect:effect,validation_probe:probe}));
    });
    return Object.freeze({ok:blocks.length===0&&effects.length>0,effects:Object.freeze(effects),blocks:Object.freeze(blocks),trace:'REFERENCE_NAME -> MINED_DNA -> DESIGN_TOKEN -> ENGINE_PARAMETER -> OUTPUT_EFFECT -> VALIDATION'});
  }
  function validateApplied(compiled={},observed={}){
    if(!compiled.ok) return {ok:false,reason:'REFERENCE_COMPILE_FAILED'};
    const applied=new Set((observed.applied_parameters||[]).map(String)), measured=new Set((observed.passed_probes||[]).map(String)), missing=[];
    for(const e of compiled.effects||[]){
      for(const p of Object.keys(e.engine_parameters||{})) if(!applied.has(p)) missing.push('PARAMETER_NOT_APPLIED:'+p);
      if(!measured.has(e.validation_probe)) missing.push('PROBE_NOT_PASSED:'+e.validation_probe);
    }
    return Object.freeze({ok:missing.length===0,missing:Object.freeze(missing)});
  }
  return Object.freeze({version:'1.0.0',compile,validateApplied});
});
