'use strict';

const REQUIRED=[
  'professional_family_pass',
  'reference_effect_visible_without_explanation',
  'generic_layout_detected',
  'decision_value_pass'
];

function cleanJsonText(text=''){
  let s=String(text||'').trim();
  if(s.startsWith('```')){
    s=s.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  }
  return s.trim();
}

function parseVisionReview(text=''){
  let parsed;
  try{ parsed=JSON.parse(cleanJsonText(text)); }
  catch(e){ return Object.freeze({ok:false,reason:'VISION_REVIEW_JSON_INVALID'}); }

  for(const key of REQUIRED){
    if(typeof parsed[key]!=='boolean'){
      return Object.freeze({ok:false,reason:'VISION_REVIEW_BOOLEAN_REQUIRED',field:key});
    }
  }
  if(!Array.isArray(parsed.reasons)){
    return Object.freeze({ok:false,reason:'VISION_REVIEW_REASONS_REQUIRED'});
  }
  return Object.freeze({
    ok:true,
    review:Object.freeze({
      professional_family_pass:parsed.professional_family_pass,
      reference_effect_visible_without_explanation:parsed.reference_effect_visible_without_explanation,
      generic_layout_detected:parsed.generic_layout_detected,
      decision_value_pass:parsed.decision_value_pass,
      reasons:Object.freeze(parsed.reasons.map(String).slice(0,12))
    })
  });
}

module.exports=Object.freeze({version:'1.0.0',parseVisionReview});
