const assert=require('assert');
const c=require('./drawing-section-perspective-compiler');

const masks=[
  {mask_id:'SOURCE_LINE',validation_state:'SOURCE_DERIVED',source_trace:'s'},
  {mask_id:'INTERIOR_FURNITURE',validation_state:'USER_CONFIRMED',source_trace:'i'},
  {mask_id:'SECTION_CUT',validation_state:'USER_CONFIRMED',source_trace:'c'}
];
const input={
  width_px:3072,
  height_px:2048,
  dimensions_off:true,
  text_off:true,
  furniture_hatch_off:true,
  structure_line_only:true
};

const out=c.compile({
  mask_records:masks,
  input_meta:input,
  variant:'WARM_EDITORIAL',
  controlnet_model:'LINEART'
});
assert.equal(out.ok,true);
assert.equal(out.generation.controlnet_primary.weight_seed,0.79);
assert.deepEqual(out.generation.controlnet_primary.weight_band,[0.78,0.80]);
assert.equal(out.generation.controlnet_primary.ending_control_step,0.80);
assert.deepEqual(out.generation.first_pass.denoise_band,[0.60,0.65]);
assert.equal(out.generation.second_pass.denoise_seed,0.30);
assert.equal(out.final_composite.top.opacity,0.35);

const low=c.compile({
  mask_records:masks,
  input_meta:{...input,width_px:1200,height_px:900}
});
assert.equal(low.ok,false);
assert.equal(low.reason,'INPUT_PREFLIGHT_BLOCKED');

const bad=c.compile({
  mask_records:masks.filter(x=>x.mask_id!=='SECTION_CUT'),
  input_meta:input
});
assert.equal(bad.ok,false);
assert.equal(bad.reason,'MASK_GATE_BLOCKED');

console.log('drawing-section-perspective-compiler PASS');