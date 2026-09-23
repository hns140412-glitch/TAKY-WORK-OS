(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyReferenceCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DNA=Object.freeze({
    ARCHDAILY:{
      token:'PLAN_LINE_HIERARCHY',
      parameters:{wall:0.40,primary:0.28,secondary:0.18,annotation:0.09,poche:'STRONG_SOURCE_DERIVED'}
    },
    DIVISARE:{
      token:'EDITORIAL_RESTRAINT',
      parameters:{whitespace_ratio_min:0.22,caption_density:'LOW',drawing_dominance:'HIGH',saturation:'LOW'}
    },
    OMA:{
      token:'RELATION_FIRST',
      parameters:{relations_per_diagram:1,decoration:'SUPPRESSED'}
    },
    BIG:{
      token:'ONE_MOVE',
      parameters:{moves_per_diagram:1,sequence:['CONSTRAINT','MOVE','RESULT']}
    },
    MVRDV:{
      token:'TYPE_COMPARISON',
      parameters:{same_scale:true,same_metric:true,exception_visibility:'REQUIRED'}
    },
    SOM_FOSTER:{
      token:'TECHNICAL_CLARITY',
      parameters:{hierarchy:['STRUCTURE','PROGRAM','ENVELOPE'],ambiguity:'MINIMIZE'}
    }
  });

  function compile(input={}){
    const selected=input.references||[];
    const findings=[];
    const parameters={};
    const trace=[];
    for(const name of selected){
      const item=DNA[name];
      if(!item){ findings.push({code:'UNKNOWN_REFERENCE_DNA',reference:name}); continue; }
      parameters[item.token]=item.parameters;
      trace.push({reference:name,dna:item.token,engine_parameter:item.parameters});
    }
    if(!selected.length) findings.push({code:'REFERENCE_REQUIRED'});
    if(input.requires_line_hierarchy===true && !parameters.PLAN_LINE_HIERARCHY){
      findings.push({code:'LINE_HIERARCHY_NOT_COMPILED'});
    }
    return Object.freeze({
      ok:findings.length===0,
      parameters:Object.freeze(parameters),
      trace:Object.freeze(trace),
      findings:Object.freeze(findings)
    });
  }

  return Object.freeze({version:'1.0.0',DNA,compile});
});