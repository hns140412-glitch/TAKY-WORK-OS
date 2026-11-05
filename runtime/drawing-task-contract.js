(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingTaskContract=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v.map(clean).filter(Boolean):[];

  function normalize(input={}){
    const contract={
      goal:clean(input.goal),
      context:clean(input.context),
      outputs:arr(input.outputs),
      completion_criteria:arr(input.completion_criteria),
      autonomy:{
        may_change:arr(input.autonomy?.may_change),
        must_keep:arr(input.autonomy?.must_keep),
        ask_before:arr(input.autonomy?.ask_before)
      },
      verification:arr(input.verification),
      source_requirements:arr(input.source_requirements)
    };

    const issues=[];
    if(!contract.goal) issues.push('GOAL_REQUIRED');
    if(contract.outputs.length===0) issues.push('OUTPUT_REQUIRED');
    if(contract.completion_criteria.length===0) issues.push('COMPLETION_CRITERIA_REQUIRED');
    if(contract.verification.length===0) issues.push('VERIFICATION_REQUIRED');

    return Object.freeze({
      ok:issues.length===0,
      contract:Object.freeze(contract),
      issues:Object.freeze(issues)
    });
  }

  function defaultForPurpose(purpose=''){
    const p=clean(purpose).toUpperCase();
    const shared={
      autonomy:{
        may_change:['presentation attributes'],
        must_keep:['source geometry','confirmed design decisions','source provenance'],
        ask_before:['architectural geometry change','ambiguous source reinterpretation']
      },
      source_requirements:['preserve original source','retain revision identity']
    };
    if(p==='SALES_PLAN'){
      return {
        ...shared,
        goal:'Make the approved plan easier for a buyer to understand without changing the design.',
        outputs:['presentation plan'],
        completion_criteria:['layout readable','room relationships readable','geometry preserved','furniture scale plausible'],
        verification:['key-state preservation','source overlay check','human readability check']
      };
    }
    if(p==='PUBLICATION'){
      return {
        ...shared,
        goal:'Raise architectural drawing communication quality without changing the architecture.',
        outputs:['publication drawing'],
        completion_criteria:['hierarchy clear','white space preserved','geometry preserved'],
        verification:['key-state preservation','line hierarchy review','legibility review']
      };
    }
    return {
      ...shared,
      goal:'Improve drawing communication while preserving the source.',
      outputs:['drawing output'],
      completion_criteria:['geometry preserved','requested output produced'],
      verification:['key-state preservation','user-intent check']
    };
  }

  return Object.freeze({version:'1.0.0',normalize,defaultForPurpose});
});
