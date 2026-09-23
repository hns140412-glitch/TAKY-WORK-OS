'use strict';

const crypto=require('crypto');

const REFERENCE_DNA=Object.freeze({
  ARCHDAILY_PLAN_HIERARCHY:Object.freeze({
    intent:'PLAN_LINE_HIERARCHY',
    relation:Object.freeze(['CUT','PRIMARY','SECONDARY','ANNOTATION']),
    expected_effect:Object.freeze(['VISIBLE_HIERARCHY','FIGURE_GROUND']),
    engine_patch:Object.freeze({
      source_style_policy:Object.freeze({
        requires_verified_roles:true,
        hierarchy:Object.freeze(['CUT','PRIMARY','SECONDARY','ANNOTATION'])
      })
    })
  }),
  DIVISARE_EDITORIAL_RESTRAINT:Object.freeze({
    intent:'EDITORIAL_RESTRAINT',
    relation:Object.freeze(['HERO_DOMINANT','WHITESPACE_PROTECTED','CAPTION_SUBORDINATE']),
    expected_effect:Object.freeze(['LOWER_NOISE','DRAWING_DOMINANCE']),
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
    relation:Object.freeze(['ONE_RELATION_PER_DIAGRAM','DECORATION_SUPPRESSED']),
    expected_effect:Object.freeze(['DECISION_CLARITY']),
    engine_patch:Object.freeze({
      diagram_policy:Object.freeze({
        relation_per_diagram_max:1,
        decoration:'SUPPRESS'
      })
    })
  }),
  BIG_ONE_MOVE:Object.freeze({
    intent:'ONE_MOVE',
    relation:Object.freeze(['BASE_CONDITION','MOVE','RESULT']),
    expected_effect:Object.freeze(['SEQUENCE_CLARITY']),
    engine_patch:Object.freeze({
      diagram_policy:Object.freeze({
        sequence:Object.freeze(['BASE_CONDITION','MOVE','RESULT'])
      })
    })
  }),
  SOM_FOSTER_TECHNICAL_CLARITY:Object.freeze({
    intent:'TECHNICAL_CLARITY',
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
      relation:dna.relation,
      parameter_policy:'RELATION_LOCKED_VALUE_ADAPTED',
      adapter_context:Object.freeze({scale,output_size,source_density}),
      engine_patch:dna.engine_patch,
      expected_effect:dna.expected_effect
    }));
  }

  const canonical={
    reference_ids:[...reference_ids],
    context:{scale,output_size,source_density},
    compiled
  };
  const compile_digest=digest(canonical);

  return Object.freeze({
    ok:true,
    status:'COMPILED',
    compile_digest,
    compiled:Object.freeze(compiled),
    proof_required:Object.freeze([
      'APPLICATION_TRACE_PASS',
      'EFFECT_PASS',
      'FIT_PASS',
      'FIDELITY_PASS',
      'REFERENCE_ABLATION_TEST_PASS'
    ])
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
  version:'2.0.0',
  REFERENCE_DNA,
  stable,
  digest,
  compileReferenceProfile,
  validateReferenceEffect
});
