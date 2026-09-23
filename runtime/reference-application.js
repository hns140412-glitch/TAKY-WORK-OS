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
      deferred.push(Object.freeze({
        reference_id:item.reference_id,
        component:'source_style_policy',
        reason:'VERIFIED_PRESENTATION_ROLES_REQUIRED'
      }));
    }
    if(patch.diagram_policy){
      deferred.push(Object.freeze({
        reference_id:item.reference_id,
        component:'diagram_policy',
        reason:'DIAGRAM_COMPONENT_ADAPTER_NOT_ACTIVE'
      }));
    }
  }

  return Object.freeze({
    ok:true,
    profile:Object.freeze(out),
    compile_digest:compiled.compile_digest,
    applied_parameters:Object.freeze(applied),
    deferred:Object.freeze(deferred),
    presentation_only:true,
    geometry_mutation:false,
    fact_mutation:false
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
  version:'1.0.0',
  applyToPresentationProfile,
  validateApplication
});
