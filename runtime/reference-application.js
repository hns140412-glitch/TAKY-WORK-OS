'use strict';

function clone(v){ return JSON.parse(JSON.stringify(v||{})); }

function applyToPresentationProfile(profile={},compiled={}){
  if(!compiled?.ok || !compiled.compile_digest){
    return Object.freeze({ok:false,reason:'COMPILED_REFERENCE_REQUIRED'});
  }

  const out=clone(profile);
  out.a3=out.a3||{};
  out.a3.layout=out.a3.layout||{};

  const applied=[];
  const deferred=[];
  const sourceStyleRequests=[];
  const diagramStyleRequests=[];

  for(const item of compiled.compiled||[]){
    const patch=item.engine_patch||{};

    if(patch.a3_layout){
      const p=patch.a3_layout;
      const beforeMargin=Number(out.a3.margin_mm??0);
      if(Number.isFinite(p.margin_min_mm) && beforeMargin<p.margin_min_mm){
        out.a3.margin_mm=p.margin_min_mm;
        applied.push(Object.freeze({
          reference_id:item.reference_id,
          parameter:'a3.margin_mm',
          before:beforeMargin,
          after:p.margin_min_mm
        }));
      }

      const beforeHero=Number(out.a3.layout.hero_ratio??0);
      if(Number.isFinite(p.hero_ratio_min) && beforeHero<p.hero_ratio_min){
        const target=Number(p.hero_ratio_target||p.hero_ratio_min);
        out.a3.layout.hero_ratio=target;
        out.a3.layout.support_ratio=Number((1-target).toFixed(4));
        applied.push(Object.freeze({
          reference_id:item.reference_id,
          parameter:'a3.layout.hero_ratio',
          before:beforeHero,
          after:target
        }));
        applied.push(Object.freeze({
          reference_id:item.reference_id,
          parameter:'a3.layout.support_ratio',
          before:Number(profile?.a3?.layout?.support_ratio??0),
          after:out.a3.layout.support_ratio
        }));
      }
    }

    if(patch.source_style_policy?.requires_verified_roles){
      if(patch.source_style_policy.fallback_mode==='SOURCE_STYLE_RANK'){
        sourceStyleRequests.push(Object.freeze({
          reference_id:item.reference_id,
          mode:'SOURCE_STYLE_RANK',
          compile_digest:compiled.compile_digest,
          policy:Object.freeze({
            hierarchy:Object.freeze([...(patch.source_style_policy.fallback_hierarchy||[])]),
            multipliers:Object.freeze({...patch.source_style_policy.multipliers}),
            semantic_inference:false
          })
        }));
      }else{
        deferred.push(Object.freeze({
          reference_id:item.reference_id,
          component:'source_style_policy',
          reason:'VERIFIED_PRESENTATION_ROLES_REQUIRED'
        }));
      }
    }
    if(patch.diagram_policy){
      if(patch.diagram_policy.adapter_mode){
        diagramStyleRequests.push(Object.freeze({
          reference_id:item.reference_id,
          mode:patch.diagram_policy.adapter_mode,
          compile_digest:compiled.compile_digest,
          policy:Object.freeze(clone(patch.diagram_policy)),
          semantic_inference:false
        }));
      }else{
        deferred.push(Object.freeze({
          reference_id:item.reference_id,
          component:'diagram_policy',
          reason:'DIAGRAM_COMPONENT_ADAPTER_NOT_ACTIVE'
        }));
      }
    }
  }

  return Object.freeze({
    ok:true,
    profile:Object.freeze(out),
    compile_digest:compiled.compile_digest,
    applied_parameters:Object.freeze(applied),
    source_style_requests:Object.freeze(sourceStyleRequests),
    diagram_style_requests:Object.freeze(diagramStyleRequests),
    deferred:Object.freeze(deferred),
    presentation_only:true,
    geometry_mutation:false,
    fact_mutation:false
  });
}

function validateSourceStyleApplication(application={},compiled={}){
  if(!application || application.schema!=='TAKY_SOURCE_STYLE_RANK_V1'){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_APPLICATION_REQUIRED'});
  }
  if(application.compile_digest!==compiled?.compile_digest){
    return Object.freeze({ok:false,reason:'REFERENCE_COMPILE_DIGEST_MISMATCH'});
  }
  if(application.mode!=='SOURCE_STYLE_RANK'){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_MODE_INVALID'});
  }
  if(application.semantic_inference!==false){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_SEMANTIC_INFERENCE_FORBIDDEN'});
  }
  if(application.geometry_preserved!==true){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_GEOMETRY_PRESERVATION_REQUIRED'});
  }
  if(application.monotonic_order_preserved!==true){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_ORDER_PRESERVATION_REQUIRED'});
  }
  if(application.applied!==true || Number(application.styled_elements||0)<=0){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_EFFECT_NOT_APPLIED'});
  }
  const refs=new Set((compiled?.compiled||[]).map(x=>x.reference_id));
  if(application.reference_id && !refs.has(application.reference_id)){
    return Object.freeze({ok:false,reason:'SOURCE_STYLE_REFERENCE_ID_MISMATCH'});
  }
  return Object.freeze({
    ok:true,
    reference_id:application.reference_id||null,
    styled_elements:Number(application.styled_elements||0)
  });
}

function validateDiagramStyleApplication(application={},compiled={}){
  if(!application || application.schema!=='TAKY_DIAGRAM_REFERENCE_APPLICATION_V1'){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_APPLICATION_REQUIRED'});
  }
  if(application.compile_digest!==compiled?.compile_digest){
    return Object.freeze({ok:false,reason:'REFERENCE_COMPILE_DIGEST_MISMATCH'});
  }
  if(application.semantic_inference!==false){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_SEMANTIC_INFERENCE_FORBIDDEN'});
  }
  if(application.role_contract!=='DECLARED_ONLY'){
    return Object.freeze({ok:false,reason:'DECLARED_DIAGRAM_ROLE_CONTRACT_REQUIRED'});
  }
  if(application.presentation_only!==true || application.geometry_preserved!==true){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_PRESENTATION_ONLY_REQUIRED'});
  }
  if(application.applied!==true || Number(application.changed_elements||0)<=0){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_EFFECT_NOT_APPLIED'});
  }
  if(!application.candidate_svg_sha256){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_CANDIDATE_DIGEST_REQUIRED'});
  }
  const item=(compiled?.compiled||[]).find(x=>x.reference_id===application.reference_id);
  if(!item){
    return Object.freeze({ok:false,reason:'DIAGRAM_REFERENCE_ID_MISMATCH'});
  }
  const expectedMode=item.engine_patch?.diagram_policy?.adapter_mode||null;
  if(!expectedMode || application.mode!==expectedMode){
    return Object.freeze({
      ok:false,
      reason:'DIAGRAM_REFERENCE_MODE_MISMATCH',
      expected_mode:expectedMode,
      actual_mode:application.mode||null
    });
  }
  return Object.freeze({
    ok:true,
    reference_id:application.reference_id,
    mode:application.mode,
    changed_elements:Number(application.changed_elements||0),
    candidate_svg_sha256:application.candidate_svg_sha256
  });
}

function validateApplicationCoverage(application={},sourceStyleApplications=[],diagramStyleApplications=[],compiled=null){
  if(compiled===null){
    compiled=diagramStyleApplications||{};
    diagramStyleApplications=[];
  }
  if(!compiled?.ok) return Object.freeze({ok:false,reason:'COMPILED_REFERENCE_REQUIRED'});

  const covered=new Set();
  const findings=[];

  if(application?.ok && application.compile_digest===compiled.compile_digest){
    for(const item of application.applied_parameters||[]){
      if(item?.reference_id) covered.add(item.reference_id);
    }
  }else if(application?.ok){
    findings.push(Object.freeze({reason:'REFERENCE_COMPILE_DIGEST_MISMATCH',component:'PROFILE_APPLICATION'}));
  }

  const styleList=Array.isArray(sourceStyleApplications)
    ? sourceStyleApplications
    : (sourceStyleApplications && typeof sourceStyleApplications==='object' ? [sourceStyleApplications] : []);

  for(const style of styleList){
    const checked=validateSourceStyleApplication(style,compiled);
    if(checked.ok && checked.reference_id){
      covered.add(checked.reference_id);
    }else if(style && Object.keys(style).length){
      findings.push(Object.freeze({
        reason:checked.reason||'SOURCE_STYLE_APPLICATION_INVALID',
        reference_id:style.reference_id||null
      }));
    }
  }

  const diagramList=Array.isArray(diagramStyleApplications)
    ? diagramStyleApplications
    : (diagramStyleApplications && typeof diagramStyleApplications==='object' ? [diagramStyleApplications] : []);
  for(const diagram of diagramList){
    const checked=validateDiagramStyleApplication(diagram,compiled);
    if(checked.ok && checked.reference_id){
      covered.add(checked.reference_id);
    }else if(diagram && Object.keys(diagram).length){
      findings.push(Object.freeze({
        reason:checked.reason||'DIAGRAM_REFERENCE_APPLICATION_INVALID',
        reference_id:diagram.reference_id||null
      }));
    }
  }

  const expected=(compiled.compiled||[]).map(x=>x.reference_id);
  const missing=expected.filter(id=>!covered.has(id));
  for(const id of missing){
    findings.push(Object.freeze({reason:'REFERENCE_CAUSAL_APPLICATION_MISSING',reference_id:id}));
  }

  return Object.freeze({
    ok:findings.length===0,
    covered_reference_ids:Object.freeze([...covered].sort()),
    missing_reference_ids:Object.freeze(missing),
    findings:Object.freeze(findings)
  });
}

function validateApplication(application={},compiled={}){
  if(!application?.ok) return Object.freeze({ok:false,reason:'REFERENCE_APPLICATION_REQUIRED'});
  if(application.compile_digest!==compiled?.compile_digest){
    return Object.freeze({ok:false,reason:'REFERENCE_COMPILE_DIGEST_MISMATCH'});
  }
  if(application.geometry_mutation!==false || application.fact_mutation!==false){
    return Object.freeze({ok:false,reason:'REFERENCE_AUTHORITY_VIOLATION'});
  }
  if(!Array.isArray(application.applied_parameters) || application.applied_parameters.length===0){
    return Object.freeze({ok:false,reason:'REFERENCE_NOT_CAUSALLY_APPLIED',deferred:application.deferred||[]});
  }
  return Object.freeze({ok:true,applied_parameters:application.applied_parameters});
}

module.exports=Object.freeze({
  version:'1.1.0',
  applyToPresentationProfile,
  validateApplication,
  validateApplicationCoverage,
  validateSourceStyleApplication,
  validateDiagramStyleApplication
});
