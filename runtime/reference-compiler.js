'use strict';

const REFERENCE_DNA=Object.freeze({
  ARCHDAILY_PLAN_HIERARCHY:Object.freeze({
    intent:'PLAN_LINE_HIERARCHY',
    relation:Object.freeze(['CUT','PRIMARY','SECONDARY','ANNOTATION']),
    expected_effect:Object.freeze(['VISIBLE_HIERARCHY','FIGURE_GROUND'])
  }),
  DIVISARE_EDITORIAL_RESTRAINT:Object.freeze({
    intent:'EDITORIAL_RESTRAINT',
    relation:Object.freeze(['HERO_DOMINANT','WHITESPACE_PROTECTED','CAPTION_SUBORDINATE']),
    expected_effect:Object.freeze(['LOWER_NOISE','DRAWING_DOMINANCE'])
  }),
  OMA_RELATION_FIRST:Object.freeze({
    intent:'RELATION_FIRST',
    relation:Object.freeze(['ONE_RELATION_PER_DIAGRAM','DECORATION_SUPPRESSED']),
    expected_effect:Object.freeze(['DECISION_CLARITY'])
  }),
  BIG_ONE_MOVE:Object.freeze({
    intent:'ONE_MOVE',
    relation:Object.freeze(['BASE_CONDITION','MOVE','RESULT']),
    expected_effect:Object.freeze(['SEQUENCE_CLARITY'])
  }),
  SOM_FOSTER_TECHNICAL_CLARITY:Object.freeze({
    intent:'TECHNICAL_CLARITY',
    relation:Object.freeze(['STRUCTURE','PROGRAM','ENVELOPE']),
    expected_effect:Object.freeze(['SYSTEM_READABILITY'])
  })
});

function compileReferenceProfile(input={}) {
  const {reference_ids=[], context={}}=input;
  if(!Array.isArray(reference_ids) || !reference_ids.length){
    return Object.freeze({ok:false,reason:'REFERENCE_IDS_REQUIRED'});
  }
  const scale=context.scale;
  const output_size=context.output_size;
  const source_density=context.source_density;
  if(!scale || !output_size || !source_density){
    return Object.freeze({ok:false,reason:'CONTEXT_ADAPTER_INPUT_REQUIRED',required:['scale','output_size','source_density']});
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
      expected_effect:dna.expected_effect
    }));
  }

  return Object.freeze({
    ok:true,
    status:'COMPILED',
    compiled:Object.freeze(compiled),
    proof_required:Object.freeze([
      'TRACEABILITY_PASS',
      'EFFECT_PASS',
      'FIT_PASS',
      'FIDELITY_PASS',
      'REFERENCE_ABLATION_TEST_PASS'
    ])
  });
}

function validateReferenceEffect(proof={}) {
  const required=['TRACEABILITY_PASS','EFFECT_PASS','FIT_PASS','FIDELITY_PASS','REFERENCE_ABLATION_TEST_PASS'];
  const missing=required.filter(k=>proof[k]!==true);
  return Object.freeze({
    ok:missing.length===0,
    status:missing.length?'CANDIDATE':'VERIFIED_EFFECTIVE',
    missing:Object.freeze(missing)
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  REFERENCE_DNA,
  compileReferenceProfile,
  validateReferenceEffect
});
