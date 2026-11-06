(function(root,factory){
  const receipt=(typeof module==='object'&&module.exports)
    ? require('./drawing-execution-receipt')
    : root.TakyDrawingExecutionReceipt;
  const api=factory(receipt);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProductionAuthorityGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(receipt){
  'use strict';
  const REQUIRED_BASE=Object.freeze(['SOURCE','GEOMETRY','FACT','SEMANTIC','REFERENCE_EFFECT','ARCHITECTURAL_READABILITY','USER_EFFECT']);
  const FORBIDDEN_PRODUCTION=Object.freeze(['DESTRUCTIVE_RASTER_MASK','GENERATIVE_GEOMETRY_REDRAW','ONE_OFF_RENDERER','UNVERIFIED_SEMANTIC_INFERENCE']);
  const FORBIDDEN_EXECUTOR_TYPES=Object.freeze(['PYTHON','REPORTLAB','GENERIC_HTML','RASTER_MASK_SCRIPT','GENERATIVE_REDRAW','ONE_OFF_SCRIPT']);
  const PRODUCTION_CLASSES=Object.freeze(['PREVIEW','FINAL','USER_FACING']);
  const AUTHORIZED_EXECUTOR='AUTHORIZED_DRAWING_ENGINE';
  const ROUTE_OWNER='DRAWING_FINALIZATION_ORCHESTRATOR';
  const up=v=>String(v??'').trim().toUpperCase();

  function evaluate(input={}){
    const artifactClass=up(input.artifact_class||'EXPERIMENT');
    const operations=(input.operations||[]).map(up);
    const gates={}; for(const [k,v] of Object.entries(input.gates||{})) gates[up(k)]=up(v);
    const executorType=up(input.executor_type);
    const routeOwner=up(input.route_owner);
    const blocks=[];

    if(PRODUCTION_CLASSES.includes(artifactClass)){
      if(!executorType) blocks.push('EXECUTOR_TYPE_REQUIRED');
      if(FORBIDDEN_EXECUTOR_TYPES.includes(executorType)) blocks.push('FORBIDDEN_EXECUTOR_TYPE:'+executorType);
      if(executorType && executorType!==AUTHORIZED_EXECUTOR) blocks.push('UNAUTHORIZED_EXECUTOR_TYPE:'+executorType);
      if(routeOwner!==ROUTE_OWNER) blocks.push('INVALID_ROUTE_OWNER');

      if(!receipt || typeof receipt.validate!=='function'){
        blocks.push('EXECUTION_RECEIPT_VALIDATOR_UNAVAILABLE');
      } else {
        const rv=receipt.validate(input.execution_receipt||{});
        if(!rv.ok) blocks.push(...rv.blocks.map(x=>'EXECUTION_RECEIPT:'+x));
        if(rv.ok){
          if(String(input.validation_bundle_id||'').trim()!==rv.normalized.validation_bundle_id) blocks.push('VALIDATION_BUNDLE_RECEIPT_MISMATCH');
          if(String(input.source_digest||'').trim()!==rv.normalized.source_digest) blocks.push('SOURCE_DIGEST_RECEIPT_MISMATCH');
          if(String(input.artifact_digest||'').trim()!==rv.normalized.artifact_digest) blocks.push('ARTIFACT_DIGEST_RECEIPT_MISMATCH');
        }
      }

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
    return Object.freeze({
      ok,
      decision:ok?(PRODUCTION_CLASSES.includes(artifactClass)?'SHOW':'ALLOW_INTERNAL'):'HOLD',
      invariant:'NO_PASS_NO_SHOW__ENGINE_AVAILABLE_BYPASS_FORBIDDEN__NO_SELF_ASSERTED_ENGINE_ROUTE',
      artifact_class:artifactClass,
      executor_type:executorType||null,
      route_owner:routeOwner||null,
      blocks:Object.freeze(blocks)
    });
  }

  return Object.freeze({
    version:'4.0.0',
    REQUIRED_BASE,FORBIDDEN_PRODUCTION,FORBIDDEN_EXECUTOR_TYPES,PRODUCTION_CLASSES,
    AUTHORIZED_EXECUTOR,ROUTE_OWNER,evaluate
  });
});