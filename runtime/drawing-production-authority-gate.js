(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProductionAuthorityGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const REQUIRED_BASE=Object.freeze(['SOURCE','GEOMETRY','FACT','SEMANTIC','REFERENCE_EFFECT','ARCHITECTURAL_READABILITY','USER_EFFECT']);
  const FORBIDDEN_PRODUCTION=Object.freeze(['DESTRUCTIVE_RASTER_MASK','GENERATIVE_GEOMETRY_REDRAW','ONE_OFF_RENDERER','UNVERIFIED_SEMANTIC_INFERENCE']);
  const PRODUCTION_CLASSES=Object.freeze(['PREVIEW','FINAL','USER_FACING']);
  const up=v=>String(v??'').trim().toUpperCase();
  function evaluate(input={}){
    const artifactClass=up(input.artifact_class||'EXPERIMENT');
    const route=up(input.execution_route);
    const engine=String(input.engine_id||'').trim();
    const operations=(input.operations||[]).map(up);
    const gates={}; for(const [k,v] of Object.entries(input.gates||{})) gates[up(k)]=up(v);
    const blocks=[];
    if(PRODUCTION_CLASSES.includes(artifactClass)){
      if(route!=='AUTHORIZED_ENGINE') blocks.push('PRODUCTION_REQUIRES_AUTHORIZED_ENGINE');
      if(!engine) blocks.push('ENGINE_ID_REQUIRED');
      if(input.one_off===true) blocks.push('ONE_OFF_PRODUCTION_FORBIDDEN');
      for(const op of operations) if(FORBIDDEN_PRODUCTION.includes(op)) blocks.push('FORBIDDEN_PRODUCTION_OPERATION:'+op);
      const required=[...REQUIRED_BASE];
      if(input.narrative_present===true) required.push('NARRATIVE_EVIDENCE');
      if(input.a3_required===true) required.push('A3');
      for(const g of required) if(gates[g]!=='PASS') blocks.push('GATE_NOT_PASS:'+g);
    } else if((artifactClass==='EXPERIMENT'||artifactClass==='DIAGNOSTIC') && input.user_exposure===true){
      blocks.push('NON_PRODUCTION_ARTIFACT_CANNOT_BE_USER_FACING');
    }
    const ok=blocks.length===0;
    return Object.freeze({ok,decision:ok?(PRODUCTION_CLASSES.includes(artifactClass)?'SHOW':'ALLOW_INTERNAL'):'HOLD',invariant:'NO_PASS_NO_SHOW',artifact_class:artifactClass,blocks:Object.freeze(blocks)});
  }
  return Object.freeze({version:'2.0.0',REQUIRED_BASE,FORBIDDEN_PRODUCTION,PRODUCTION_CLASSES,evaluate});
});
