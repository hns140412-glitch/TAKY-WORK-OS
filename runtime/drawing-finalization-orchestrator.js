(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingFinalizer=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function buildFinalizationPlan({view_id='VIEW',profile='PUBLICATION',required_formats=['html','pdf','png','pptx','xlsx']}={}){
    const steps=[
      {id:view_id+':COMPOSITE',stage:1,action:'COMPOSE_PRESENTATION_LAYERS'},
      {id:view_id+':SOURCE_OVERLAY',stage:2,action:'APPLY_SOURCE_LINE_AND_OPTIONAL_SNAPSHOT_OVERLAY'},
      {id:view_id+':FIDELITY',stage:3,action:'RUN_GEOMETRY_SEMANTIC_EDGE_FIDELITY_GATES'},
      {id:view_id+':QUALITY',stage:4,action:'RUN_PROFILE_QUALITY_REVIEW',profile},
      {id:view_id+':A3_SVG',stage:5,action:'LOCK_CANONICAL_A3_SVG_BOARD'},
      {id:view_id+':EXPORT',stage:6,action:'EXPORT_A3_BUNDLE',formats:[...required_formats]},
      {id:view_id+':FORMAT_GATE',stage:7,action:'VALIDATE_EVERY_A3_FORMAT'},
      {id:view_id+':SHIP',stage:8,action:'SHIP_ONLY_AFTER_ALL_PASS'}
    ];
    return Object.freeze({
      view_id,
      profile,
      steps:Object.freeze(steps),
      retry:Object.freeze({
        on_format_failure:'REEXPORT_FROM_CANONICAL_A3_SVG',
        on_quality_failure:'RERUN_ONLY_AFFECTED_PRESENTATION_LAYER',
        on_fidelity_failure:'REJECT_OUTPUT_AND_RETURN_TO_PRESERVED_KEY_STATE',
        max_format_reexports:2
      }),
      invariant:'OUTPUT_FORMAT_FAILURE_MUST_NOT_MUTATE_SOURCE_OR_GEOMETRY'
    });
  }

  function nextAction({fidelity='PASS',quality='PASS',formats='PASS'}={}){
    if(fidelity!=='PASS') return 'RETURN_TO_KEY_STATE';
    if(quality!=='PASS') return 'REVISE_PRESENTATION_LAYER';
    if(formats!=='PASS') return 'REEXPORT_A3_BUNDLE';
    return 'SHIP';
  }

  return Object.freeze({version:'1.0.0',buildFinalizationPlan,nextAction});
});
