(function(root,factory){
  const authority=(typeof module==='object'&&module.exports)
    ? require('./drawing-production-authority-gate')
    : root.TakyDrawingProductionAuthorityGate;
  const preUser=(typeof module==='object'&&module.exports)
    ? require('./drawing-pre-user-validation')
    : root.TakyDrawingPreUserValidation;
  const api=factory(authority,preUser);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingFinalizer=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(authority,preUser){
  'use strict';

  function buildFinalizationPlan({view_id='VIEW',profile='PUBLICATION',required_formats=['html','pdf','png','pptx','xlsx']}={}){
    const steps=[
      {id:view_id+':COMPOSITE',stage:1,action:'COMPOSE_PRESENTATION_LAYERS'},
      {id:view_id+':SOURCE_OVERLAY',stage:2,action:'APPLY_IMMUTABLE_SOURCE_LINE_AND_OPTIONAL_SNAPSHOT_OVERLAY'},
      {id:view_id+':SOURCE_FRESHNESS',stage:3,action:'VERIFY_CONTENT_IDENTITY_AND_AUTHORITY__DATE_NE_CONTENT_CHANGE'},
      {id:view_id+':FIDELITY',stage:4,action:'RUN_SOURCE_GEOMETRY_FACT_SEMANTIC_GATES'},
      {id:view_id+':REFERENCE',stage:5,action:'RUN_REFERENCE_EFFECT_AND_ARCHITECTURAL_READABILITY_GATES',profile},
      {id:view_id+':PRE_USER',stage:6,action:'RUN_EVIDENCE_BACKED_PRE_USER_VALIDATION_SUITE'},
      {id:view_id+':A3_SVG',stage:7,action:'LOCK_CANONICAL_A3_SVG_BOARD'},
      {id:view_id+':EXPORT',stage:8,action:'EXPORT_A3_BUNDLE',formats:[...required_formats]},
      {id:view_id+':FORMAT_GATE',stage:9,action:'VALIDATE_EVERY_A3_FORMAT'},
      {id:view_id+':EXECUTION_RECEIPT',stage:10,action:'BIND_AUTHORIZED_ENGINE_RECEIPT_TO_SOURCE_ARTIFACT_AND_VALIDATION'},
      {id:view_id+':USER_EXPOSURE',stage:11,action:'NO_PASS_NO_SHOW_USER_EXPOSURE_GATE'},
      {id:view_id+':SHIP',stage:12,action:'SHIP_ONLY_AFTER_ALL_PASS'}
    ];
    return Object.freeze({
      view_id,profile,steps:Object.freeze(steps),
      retry:Object.freeze({
        on_format_failure:'REEXPORT_FROM_CANONICAL_A3_SVG',
        on_quality_failure:'RERUN_ONLY_AFFECTED_PRESENTATION_LAYER',
        on_fidelity_failure:'REJECT_OUTPUT_AND_RETURN_TO_PRESERVED_KEY_STATE',
        on_pre_user_failure:'HOLD_WITHOUT_USER_EXPOSURE',
        on_receipt_failure:'HOLD_AS_UNAUTHORIZED_ARTIFACT',
        on_freshness_failure:'HOLD_SOURCE_SELECTION_FOR_CONTENT_AUTHORITY_REVIEW',
        max_format_reexports:2
      }),
      invariant:'NO_PASS_NO_SHOW__ENGINE_AVAILABLE_BYPASS_FORBIDDEN__DATE_NE_CONTENT_CHANGE__OUTPUT_FAILURE_MUST_NOT_MUTATE_SOURCE_OR_GEOMETRY'
    });
  }

  function nextAction({fidelity='PASS',quality='PASS',formats='PASS',pre_user='PASS',production_authority='PASS',source_freshness='PASS'}={}){
    if(source_freshness!=='PASS') return 'HOLD_SOURCE_SELECTION';
    if(fidelity!=='PASS') return 'RETURN_TO_KEY_STATE';
    if(quality!=='PASS') return 'REVISE_PRESENTATION_LAYER';
    if(pre_user!=='PASS') return 'HOLD_WITHOUT_USER_EXPOSURE';
    if(production_authority!=='PASS') return 'HOLD_WITHOUT_USER_EXPOSURE';
    if(formats!=='PASS') return 'REEXPORT_A3_BUNDLE';
    return 'SHIP';
  }

  function decideUserExposure(input={}){
    if(!preUser || typeof preUser.evaluate!=='function'){
      return Object.freeze({ok:false,decision:'HOLD',blocks:Object.freeze(['PRE_USER_VALIDATOR_UNAVAILABLE']),invariant:'NO_PASS_NO_SHOW'});
    }
    if(!authority || typeof authority.evaluate!=='function'){
      return Object.freeze({ok:false,decision:'HOLD',blocks:Object.freeze(['PRODUCTION_AUTHORITY_GATE_UNAVAILABLE']),invariant:'NO_PASS_NO_SHOW'});
    }
    const evidence=input.validation_evidence;
    if(!evidence || typeof evidence!=='object'){
      return Object.freeze({ok:false,decision:'HOLD',blocks:Object.freeze(['PRE_USER_VALIDATION_EVIDENCE_REQUIRED']),invariant:'NO_PASS_NO_SHOW'});
    }
    const validation=preUser.evaluate(evidence);
    if(!validation.ok){
      return Object.freeze({
        ok:false,
        decision:'HOLD',
        blocks:Object.freeze([
          ...validation.failed_gates.map(x=>'PRE_USER_GATE_FAIL:'+x),
          ...validation.blocking_defects.map(x=>'PRE_USER_DEFECT:'+x),
          ...(validation.trace_blocks||[]).map(x=>'PRE_USER_TRACE_FAIL:'+x)
        ]),
        validation,
        invariant:'NO_PASS_NO_SHOW'
      });
    }

    const admission=authority.evaluate({
      ...input,
      route_owner:'DRAWING_FINALIZATION_ORCHESTRATOR',
      gates:validation.gates,
      validation_bundle_id:validation.validation_bundle_id,
      source_digest:validation.source_digest,
      artifact_digest:validation.artifact_digest,
      narrative_present:evidence.narrative_present===true,
      a3_required:evidence.a3_required===true,
      user_exposure:true
    });
    return Object.freeze({
      ok:admission.ok===true && admission.decision==='SHOW',
      decision:admission.ok===true && admission.decision==='SHOW'?'SHOW':'HOLD',
      blocks:admission.blocks,
      validation,
      route_owner:'DRAWING_FINALIZATION_ORCHESTRATOR',
      invariant:'NO_PASS_NO_SHOW__ENGINE_AVAILABLE_BYPASS_FORBIDDEN__NO_SELF_ASSERTED_PASS'
    });
  }

  return Object.freeze({version:'4.0.0',buildFinalizationPlan,nextAction,decideUserExposure});
});