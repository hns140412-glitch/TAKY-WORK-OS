(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();
  const canonical=v=>{
    if(v===null||typeof v!=='object') return JSON.stringify(v);
    if(Array.isArray(v)) return '['+v.map(canonical).join(',')+']';
    return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
  };

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
      if(name&&dna&&tokens&&params&&effect&&probe){
        effects.push(Object.freeze({
          reference_name:name,
          mined_dna:dna,
          design_tokens:Object.freeze({...tokens}),
          engine_parameters:Object.freeze({...params}),
          output_effect:effect,
          validation_probe:probe
        }));
      }
    });
    return Object.freeze({
      ok:blocks.length===0&&effects.length>0,
      effects:Object.freeze(effects),
      blocks:Object.freeze(blocks),
      trace:'REFERENCE_NAME -> MINED_DNA -> DESIGN_TOKEN -> ENGINE_PARAMETER -> OUTPUT_EFFECT -> VALIDATION'
    });
  }

  function validateApplied(compiled={},observed={}){
    if(!compiled.ok) return Object.freeze({ok:false,missing:Object.freeze(['REFERENCE_COMPILE_FAILED'])});

    const applied=(observed.applied_parameters && !Array.isArray(observed.applied_parameters) && typeof observed.applied_parameters==='object')
      ? observed.applied_parameters : null;
    const probes=(observed.probe_evidence && typeof observed.probe_evidence==='object') ? observed.probe_evidence : null;
    const missing=[];

    if(!applied) missing.push('APPLIED_PARAMETER_VALUES_REQUIRED');
    if(!probes) missing.push('PROBE_EVIDENCE_REQUIRED');

    for(const e of compiled.effects||[]){
      for(const [name,expected] of Object.entries(e.engine_parameters||{})){
        if(!applied || !(name in applied)){
          missing.push('PARAMETER_NOT_APPLIED:'+name);
        }else if(canonical(applied[name])!==canonical(expected)){
          missing.push('PARAMETER_VALUE_MISMATCH:'+name);
        }
      }

      const proof=probes?.[e.validation_probe];
      if(!proof || typeof proof!=='object'){
        missing.push('PROBE_EVIDENCE_MISSING:'+e.validation_probe);
        continue;
      }
      if(String(proof.status||'').toUpperCase()!=='PASS') missing.push('PROBE_NOT_PASS:'+e.validation_probe);
      if(!clean(proof.validator)) missing.push('PROBE_VALIDATOR_REQUIRED:'+e.validation_probe);
      if(!Array.isArray(proof.evidence_refs)||proof.evidence_refs.length===0||proof.evidence_refs.some(x=>!clean(x))){
        missing.push('PROBE_EVIDENCE_REF_REQUIRED:'+e.validation_probe);
      }
      if(!clean(proof.observed_effect)) missing.push('OBSERVED_EFFECT_REQUIRED:'+e.validation_probe);
    }

    return Object.freeze({
      ok:missing.length===0,
      missing:Object.freeze(missing),
      invariant:'REFERENCE_MENTIONED != REFERENCE_APPLIED__NO_SELF_ASSERTED_REFERENCE_EFFECT'
    });
  }

  return Object.freeze({version:'2.0.0',compile,validateApplied});
});