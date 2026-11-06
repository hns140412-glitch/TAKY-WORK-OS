'use strict';

function validateA3Measured(metrics={}){
  const findings=[];
  if(metrics.width_mm===null || metrics.height_mm===null || metrics.width_mm===undefined || metrics.height_mm===undefined){
    findings.push('PHYSICAL_MEDIA_SIZE_UNAVAILABLE');
  } else {
    if(Math.abs(metrics.width_mm-420)>2 || Math.abs(metrics.height_mm-297)>2){
      findings.push('A3_MEDIA_BOX_INVALID');
    }
  }
  if(metrics.landscape!==true) findings.push('LANDSCAPE_REQUIRED');
  if(metrics.text_bbox_outside_page===true) findings.push('TEXT_CLIPPED_OR_OUTSIDE_PAGE');
  if(metrics.ink_ratio!==undefined && (metrics.ink_ratio<0.01 || metrics.ink_ratio>0.80)){
    findings.push('CONTENT_OCCUPANCY_OUT_OF_RANGE');
  }
  return Object.freeze({
    ok:findings.length===0,
    gate:findings.length?'FAIL':'PASS',
    scope:'OBJECTIVE_MEASURED',
    findings:Object.freeze(findings)
  });
}

function validateArchitecturalReadabilityObjective(metrics={}){
  const findings=[];
  if(typeof metrics.contrast_std_norm!=='number' || metrics.contrast_std_norm<0.04){
    findings.push('CONTRAST_TOO_WEAK');
  }
  if(typeof metrics.edge_density!=='number' || metrics.edge_density<0.001){
    findings.push('EDGE_STRUCTURE_TOO_WEAK');
  }
  if(typeof metrics.ink_ratio!=='number' || metrics.ink_ratio<0.01){
    findings.push('DRAWING_TOO_SPARSE_OR_EMPTY');
  }
  if(typeof metrics.ink_ratio==='number' && metrics.ink_ratio>0.80){
    findings.push('DRAWING_OVERDENSE');
  }
  return Object.freeze({
    ok:findings.length===0,
    gate:findings.length?'FAIL':'PASS',
    scope:'OBJECTIVE_PRESCREEN_ONLY',
    professional_quality_claim:false,
    findings:Object.freeze(findings)
  });
}

module.exports=Object.freeze({
  version:'2.0.0',
  validateA3Measured,
  validateArchitecturalReadabilityObjective
});
