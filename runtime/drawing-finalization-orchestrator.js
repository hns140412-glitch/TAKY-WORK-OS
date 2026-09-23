(function(root,factory){
  const authority=(typeof module==='object'&&module.exports)
    ? require('./drawing-production-authority-gate')
    : root.TakyDrawingProductionAuthorityGate;
  const api=factory(authority);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingFinalizer=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(authority){
  'use strict';

  function buildFinalizationPlan({view_id='VIEW',profile='PUBLICATION',required_formats=['html','pdf','png','pptx','xlsx']}={}){
    const steps=[
      {id:view_id+':COMPOSITE',stage:1,action:'COMPOSE_PRESENTATION_LAYERS'},
      {id:view_id+':SOURCE_OVERLAY',stage:2,action:'APPLY_IMMUTABLE_SOURCE_LINE_AND_OPTIONAL_SNAPSHOT_OVERLAY'},
      {id:view_id+':FIDELITY',stage:3,action:'RUN_SOURCE_GEOMETRY_FACT_SEMANTIC_GATES'},
      {id:view_id+':REFERENCE',stage:4,action:'RUN_REFERENCE_EFFECT_AND_ARCHITECTURAL_READABILITY_GATES',profile},
      {id:view_id+':PRE_USER',stage:5,action:'RUN_PRE_USER_VALIDATION_SUITE'},
      {id:view_id+':A3_SVG',stage:6,action:'LOCK_CANONICAL_A3_SVG_BOARD'},
      {id:view_id+':EXPORT',stage:7,action:'EXPORT_A3_BUNDLE',formats:[...required_formats]},
      {id:view_id+':FORMAT_GATE',stage:8,action:'VALIDATE_EVERY_A3_FORMAT'},
      {id:view_id+':USER_EXPOSURE',stage:9,action:'NO_PASS_NO_SHOW_USER_EXPOSURE_GATE'},
      {id:view_id+':SHIP',stage:10,action:'SHIP_ONLY_AFTER_ALL_PASS'}
    ];
    return Object.freeze({
      view_id,profile,steps:Object.freeze(steps),
      retry:Object.freeze({
        on_format_failure:'REEXPORT_FROM_CANONICAL_A3_SVG',
        on_quality_failure:'RERUN_ONLY_AFFECTED_PRESENTATION_LAYER',
        on_fidelity_failure:'REJECT_OUTPUT_AND_RETURN_TO_PRESERVED_KEY_STATE',
        on_pre_user_failure:'HOLD_WITHOUT_USER_EXPOSURE',
        max_format_reexports:2
      }),
      invariant:'NO_PASS_NO_SHOW__OUTPUT_FORMAT_FAILURE_MUST_NOT_MUTATE_SOURCE_OR_GEOMETRY'
    });
  }

  function nextAction({fidelity='PASS',quality='PASS',formats='PASS',pre_user='PASS',production_authority='PASS'}={}){
    if(fidelity!=='PASS') return 'RETURN_TO_KEY_STATE';
    if(quality!=='PASS') return 'REVISE_PRESENTATION_LAYER';
    if(pre_user!=='PASS') return 'HOLD_WITHOUT_USER_EXPOSURE';
    if(production_authority!=='PASS') return 'HOLD_WITHOUT_USER_EXPOSURE';
    if(formats!=='PASS') return 'REEXPORT_A3_BUNDLE';
    return 'SHIP';
  }

  function decideUserExposure(input={}){
    if(!authority || typeof authority.evaluate!=='function'){
      return Object.freeze({ok:false,decision:'HOLD',blocks:Object.freeze(['PRODUCTION_AUTHORITY_GATE_UNAVAILABLE']),invariant:'NO_PASS_NO_SHOW'});
    }
    const admission=authority.evaluate({...input,user_exposure:true});
    return Object.freeze({
      ok:admission.ok===true && admission.decision==='SHOW',
      decision:admission.ok===true && admission.decision==='SHOW'?'SHOW':'HOLD',
      blocks:admission.blocks,
      invariant:'NO_PASS_NO_SHOW'
    });
  }

  return Object.freeze({version:'2.1.0',buildFinalizationPlan,nextAction,decideUserExposure});
});
