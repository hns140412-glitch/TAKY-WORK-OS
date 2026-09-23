(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DNA_TO_PARAMETERS=Object.freeze({
    PLAN_LINE_HIERARCHY:{
      wall_lineweight:0.40,
      primary_lineweight:0.28,
      secondary_lineweight:0.18,
      annotation_lineweight:0.09
    },
    EDITORIAL_RESTRAINT:{
      whitespace_ratio_min:0.28,
      caption_density:'LOW',
      palette_saturation:'LOW',
      hero_dominance_min:0.55
    },
    RELATION_FIRST:{
      diagram_relation_max:1,
      decorative_duplication:false
    },
    ONE_MOVE:{
      sequence:['CONSTRAINT','MOVE','RESULT'],
      diagram_move_max:1
    },
    TYPE_COMPARISON:{
      same_scale_required:true,
      same_metric_required:true,
      exception_visibility_required:true
    },
    TECHNICAL_CLARITY:{
      structure_program_envelope_separation:true,
      critical_annotation_priority:'HIGH'
    }
  });

  function compile(records=[]){
    const params={};
    const trace=[];
    const findings=[];
    for(const rec of records||[]){
      const dna=String(rec.dna||'').toUpperCase();
      const mapping=DNA_TO_PARAMETERS[dna];
      if(!mapping){
        findings.push({code:'REFERENCE_DNA_NOT_COMPILED',reference:rec.reference||null,dna});
        continue;
      }
      Object.assign(params,mapping);
      trace.push({
        reference:rec.reference||null,
        mined_dna:dna,
        engine_parameters:Object.keys(mapping)
      });
    }
    return Object.freeze({
      ok:findings.length===0 && trace.length>0,
      design_tokens:Object.freeze({...params}),
      trace:Object.freeze(trace),
      findings:Object.freeze(findings)
    });
  }

  function validateEffect({compiled,observed_effects={}}={}){
    if(!compiled?.ok) return {ok:false,reason:'REFERENCE_COMPILE_REQUIRED'};
    const missing=[];
    for(const key of Object.keys(compiled.design_tokens||{})){
      if(!(key in observed_effects)) missing.push(key);
    }
    return Object.freeze({
      ok:missing.length===0,
      missing_effects:Object.freeze(missing),
      rule:'REFERENCE_EFFECT_MUST_BE_OBSERVABLE_WITHOUT_EXPLANATION'
    });
  }

  return Object.freeze({version:'1.0.0',DNA_TO_PARAMETERS,compile,validateEffect});
});