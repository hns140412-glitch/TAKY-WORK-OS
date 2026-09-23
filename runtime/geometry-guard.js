'use strict';

function fail(code,detail={}){ return Object.freeze({ok:false,code,...detail}); }

function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

function validateGeometryIntegrity(input={}){
  const {
    source_fingerprint,
    output_fingerprint,
    protected_anchors_source=[],
    protected_anchors_output=[],
    crop_source,
    crop_output,
    rotation_source,
    rotation_output,
    scale_source,
    scale_output,
    mask_intersections=[]
  }=input;

  if(!source_fingerprint || !output_fingerprint) return fail('GEOMETRY_FINGERPRINT_REQUIRED');
  if(source_fingerprint!==output_fingerprint) return fail('GEOMETRY_FINGERPRINT_MISMATCH');

  const out=new Set(protected_anchors_output);
  const missing=protected_anchors_source.filter(x=>!out.has(x));
  if(missing.length) return fail('PROTECTED_ANCHOR_MISSING',{missing:Object.freeze(missing)});

  if(mask_intersections.length) return fail('DESTRUCTIVE_MASK_INTERSECTS_PROTECTED_GEOMETRY',{
    intersections:Object.freeze([...mask_intersections])
  });
  if(crop_source!==undefined && !same(crop_source,crop_output)) return fail('CROP_PARITY_FAIL');
  if(rotation_source!==undefined && rotation_source!==rotation_output) return fail('ROTATION_PARITY_FAIL');
  if(scale_source!==undefined && scale_source!==scale_output) return fail('SCALE_PARITY_FAIL');

  return Object.freeze({ok:true,status:'PASS'});
}

module.exports=Object.freeze({version:'1.0.0',validateGeometryIntegrity});
