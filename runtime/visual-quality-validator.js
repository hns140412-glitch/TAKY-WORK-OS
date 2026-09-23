'use strict';

function validateA3(metrics={}){
  const findings=[];
  if(metrics.width_mm!==420 || metrics.height_mm!==297) findings.push('A3_MEDIA_BOX_INVALID');
  if(typeof metrics.margin_mm!=='number' || metrics.margin_mm<8) findings.push('MARGIN_TOO_SMALL');
  if(typeof metrics.hero_ratio!=='number' || metrics.hero_ratio<0.60 || metrics.hero_ratio>0.85) findings.push('HERO_RATIO_OUT_OF_RANGE');
  if(typeof metrics.support_diagram_count!=='number' || metrics.support_diagram_count>3) findings.push('TOO_MANY_SUPPORT_DIAGRAMS');
  if(metrics.text_clipped===true) findings.push('TEXT_CLIPPED');
  return Object.freeze({ok:findings.length===0,gate:findings.length?'FAIL':'PASS',findings:Object.freeze(findings)});
}

function validateArchitecturalReadability(metrics={}){
  const findings=[];
  if(metrics.main_drawing_identifiable_ms===undefined || metrics.main_drawing_identifiable_ms>2000) findings.push('MAIN_DRAWING_NOT_IMMEDIATE');
  if(metrics.hierarchy_score===undefined || metrics.hierarchy_score<0.70) findings.push('HIERARCHY_TOO_WEAK');
  if(metrics.figure_ground_score===undefined || metrics.figure_ground_score<0.70) findings.push('FIGURE_GROUND_TOO_WEAK');
  if(metrics.support_competition_score===undefined || metrics.support_competition_score>0.35) findings.push('SUPPORT_COMPETES_WITH_HERO');
  return Object.freeze({ok:findings.length===0,gate:findings.length?'FAIL':'PASS',findings:Object.freeze(findings)});
}

function validateUserEffect(metrics={}){
  const findings=[];
  if(metrics.reference_effect_visible_without_explanation!==true) findings.push('REFERENCE_EFFECT_NOT_SELF_EVIDENT');
  if(metrics.decision_value_score===undefined || metrics.decision_value_score<0.70) findings.push('DECISION_VALUE_TOO_LOW');
  if(metrics.generic_layout_detected===true) findings.push('GENERIC_LAYOUT_DETECTED');
  return Object.freeze({ok:findings.length===0,gate:findings.length?'FAIL':'PASS',findings:Object.freeze(findings)});
}

module.exports=Object.freeze({
  version:'1.0.0',
  validateA3,
  validateArchitecturalReadability,
  validateUserEffect
});
