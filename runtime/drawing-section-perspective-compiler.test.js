const assert=require('assert');
const c=require('./drawing-section-perspective-compiler');

const masks=[
  {mask_id:'SOURCE_LINE',validation_state:'SOURCE_DERIVED',source_trace:'s'},
  {mask_id:'INTERIOR_FURNITURE',validation_state:'USER_CONFIRMED',source_trace:'i'},
  {mask_id:'SECTION_CUT',validation_state:'USER_CONFIRMED',source_trace:'c'}
];
const out=c.compile({mask_records:masks,variant:'WARM_EDITORIAL'});
assert.equal(out.ok,true);
assert.equal(out.generation.controlnet_lineart.strength,0.80);
assert.equal(out.generation.first_pass.denoise,0.60);
assert.equal(out.generation.second_pass.denoise,0.30);
assert.equal(out.final_composite.top.opacity,0.35);

const bad=c.compile({mask_records:masks.filter(x=>x.mask_id!=='SECTION_CUT')});
assert.equal(bad.ok,false);
assert.equal(bad.reason,'MASK_GATE_BLOCKED');
console.log('drawing-section-perspective-compiler PASS');