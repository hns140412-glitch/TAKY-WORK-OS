'use strict';

const crypto=require('crypto');

const REFERENCE_DNA=Object.freeze({
  ARCHDAILY_PLAN_HIERARCHY:Object.freeze({
    intent:'PLAN_LINE_HIERARCHY',
    applicability:Object.freeze({
      status:'PARTIAL',
      production_claimable:true,
      claim_scope:'SOURCE_LINE_HIERARCHY_ONLY',
      limitation:'NO_VERIFIED_CUT_PRIMARY_SECONDARY_SEMANTIC_ROLES'
    }),
    relation:Object.freeze(['CUT','PRIMARY','SECONDARY','ANNOTATION']),
    expected_effect:Object.freeze(['VISIBLE_HIERARCHY','FIGURE_GROUND']),
    effect_metric:'TAKY_LINE_HIERARCHY_DELTA_V1',
    engine_patch:Object.freeze({
      source_style_policy:Object.freeze({
        requires_verified_roles:true,
        hierarchy:Object.freeze(['CUT','PRIMARY','SECONDARY','ANNOTATION']),
        fallback_mode:'SOURCE_STYLE_RANK',
        fallback_hierarchy:Object.freeze(['HEAVY','PRIMARY','SECONDARY','LIGHT']),
        multipliers:Object.freeze({
          HEAVY:1.16,
          PRIMARY:1.06,
          SECONDARY:0.96,
          LIGHT:0.86
        }),
        semantic_inference:false
      })
    })
  }),
  DIVISARE_EDITORIAL_RESTRAINT:Object.freeze({
    intent:'EDITORIAL_RESTRAINT',
    applicability:Object.freeze({
      status:'FULL',
      production_claimable:true,
      claim_scope:'EDITORIAL_LAYOUT_RESTRAINT',
      limitation:null
    }),
    relation:Object.freeze(['HERO_DOMINANT','WHITESPACE_PROTECTED','CAPTION_SUBORDINATE']),
    expected_effect:Object.freeze(['LOWER_NOISE','DRAWING_DOMINANCE']),
    effect_metric:'TAKY_OBJECTIVE_REFERENCE_DELTA_V1',
    engine_patch:Object.freeze({
      a3_layout:Object.freeze({
        margin_min_mm:12,
        hero_ratio_min:0.72,
        hero_ratio_target:0.74,
        support_ratio_max:0.28
      })
    })
  }),
  OMA_RELATION_FIRST:Object.freeze({
    intent:'RELATION_FIRST',
    applicability:Object.freeze({
      status:'PARTIAL',
      production_claimable:true,
      claim_scope:'DECLARED_PRIMARY_RELATION_FOCUS_ONLY',
      limitation:'DECLARED_DIAGRAM_ROLES_REQUIRED_NO_SEMANTIC_INFERENCE'
    }),
    relation:Object.freeze(['ONE_RELATION_PER_DIAGRAM','DECORATION_SUPPRESSED']),
    expected_effect:Object.freeze(['PRIMARY_RELATION_FOCUS']),
    effect_metric:'TAKY_RELATION_FOCUS_DELTA_V1',
    engine_patch:Object.freeze({
      diagram_policy:Object.freeze({
        adapter_mode:'DECLARED_PRIMARY_RELATION_FOCUS',
        relation_per_diagram_max:1,
        decoration:'SUPPRESS',
        semantic_inference:false
      })
    })
  }),
  BIG_ONE_MOVE:Object.freeze({
    intent:'ONE_MOVE',
    applicability:Object.freeze({
      status:'PARTIAL',
      production_claimable:true,
      claim_scope:'DECLARED_BASE_MOVE_RESULT_EMPHASIS_ONLY',
      limitation:'DECLARED_DIAGRAM_ROLES_REQUIRED_NO_SEMANTIC_INFERENCE'
    }),
    relation:Object.freeze(['BASE_CONDITION','MOVE','RESULT']),
    expected_effect:Object.freeze(['MOVE_EMPHASIS_WITH_DECLARED_SEQUENCE_ROLES']),
    effect_metric:'TAKY_ONE_MOVE_EMPHASIS_DELTA_V1',
    engine_patch:Object.freeze({
      diagram_policy:Object.freeze({
        adapter_mode:'DECLARED_BASE_MOVE_RESULT_EMPHASIS',
        sequence:Object.freeze(['BASE_CONDITION','MOVE','RESULT']),
        semantic_inference:false
      })
    })
  }),
  SOM_FOSTER_TECHNICAL_CLARITY:Object.freeze({
    intent:'TECHNICAL_CLARITY',
    applicability:Object.freeze({
      status:'DEFERRED',
      production_claimable:false,
      claim_scope:null,
      limitation:'VERIFIED_PRESENTATION_ROLES_REQUIRED'
    }),
    relation:Object.freeze(['STRUCTURE','PROGRAM','ENVELOPE']),
    expected_effect:Object.freeze(['SYSTEM_READABILITY']),
    engine_patch:Object.freeze({
      source_style_policy:Object.freeze({
        requires_verified_roles:true,
        hierarchy:Object.freeze(['STRUCTURE','PROGRAM','ENVELOPE'])
      })
    })
  })
});

function stable(value){
  if(Array.isArray(value)) return value.map(stable);
  if(value && typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort()) out[key]=stable(value[key]);
    return out;
  }
  return value;
}

function digest(value){
  return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function compileReferenceProfile(input={}) {
  const {reference_ids=[],context={}}=input;
  if(!Array.isArray(reference_ids)||!reference_ids.length){
    return Object.freeze({ok:false,reason:'REFERENCE_IDS_REQUIRED'});
  }
  const {scale,output_size,source_density}=context;
  if(!scale||!output_size||!source_density){
    return Object.freeze({
      ok:false,
      reason:'CONTEXT_ADAPTER_INPUT_REQUIRED',
      required:['scale','output_size','source_density']
    });
  }

  const compiled=[];
  for(const id of reference_ids){
    const dna=REFERENCE_DNA[id];
    if(!dna) return Object.freeze({ok:false,reason:'UNKNOWN_REFERENCE_DNA',reference_id:id});
    compiled.push(Object.freeze({
      reference_id:id,
      intent:dna.intent,
      applicability:dna.applicability||Object.freeze({
        status:'DEFERRED',
        production_claimable:false,
        claim_scope:null,
        limitation:'APPLICABILITY_NOT_DECLARED'
      }),
      relation:dna.relation,
      parameter_policy:'RELATION_LOCKED_VALUE_ADAPTED',
      adapter_context:Object.freeze({scale,output_size,source_density}),
      engine_patch:dna.engine_patch,
      expected_effect:dna.expected_effect,
      effect_metric:dna.effect_metric||null
    }));
  }

  const canonical={
    reference_ids:[...reference_ids],
    context:{scale,output_size,source_density},
    compiled,
    effect_metrics:[...new Set(compiled.map(x=>x.effect_metric).filter(Boolean))],
    claimable_reference_ids:compiled.filter(x=>x.applicability?.production_claimable===true).map(x=>x.reference_id),
    deferred_reference_ids:compiled.filter(x=>x.applicability?.production_claimable!==true).map(x=>x.reference_id)
  };
  const compile_digest=digest(canonical);

  return Object.freeze({
    ok:true,
    status:'COMPILED',
    compile_digest,
    compiled:Object.freeze(compiled),
    effect_metrics:Object.freeze(canonical.effect_metrics),
    claimable_reference_ids:Object.freeze(canonical.claimable_reference_ids),
    deferred_reference_ids:Object.freeze(canonical.deferred_reference_ids),
    applicability_status:canonical.deferred_reference_ids.length?'HAS_DEFERRED':'CLAIMABLE',
    proof_required:Object.freeze([
      'APPLICATION_TRACE_PASS',
      'EFFECT_PASS',
      'FIT_PASS',
      'FIDELITY_PASS',
      'REFERENCE_ABLATION_TEST_PASS'
    ])
  });
}

function validateClaimability(compiled={}){
  if(!compiled?.ok) return Object.freeze({ok:false,reason:'REFERENCE_NOT_COMPILED'});
  const deferred=[...(compiled.deferred_reference_ids||[])];
  if(deferred.length){
    return Object.freeze({
      ok:false,
      reason:'REFERENCE_NOT_PRODUCTION_CLAIMABLE',
      deferred_reference_ids:Object.freeze(deferred),
      compiled:Object.freeze((compiled.compiled||[])
        .filter(x=>deferred.includes(x.reference_id))
        .map(x=>Object.freeze({
          reference_id:x.reference_id,
          applicability:x.applicability
        })))
    });
  }
  return Object.freeze({
    ok:true,
    claimable_reference_ids:Object.freeze([...(compiled.claimable_reference_ids||[])])
  });
}

function validateReferenceEffect(proof={}) {
  const required=['APPLICATION_TRACE_PASS','EFFECT_PASS','FIT_PASS','FIDELITY_PASS','REFERENCE_ABLATION_TEST_PASS'];
  const missing=required.filter(k=>proof[k]!==true);
  return Object.freeze({
    ok:missing.length===0,
    status:missing.length?'CANDIDATE':'VERIFIED_EFFECTIVE',
    missing:Object.freeze(missing)
  });
}

module.exports=Object.freeze({
  version:'2.1.0',
  REFERENCE_DNA,
  stable,
  digest,
  compileReferenceProfile,
  validateClaimability,
  validateReferenceEffect
});
