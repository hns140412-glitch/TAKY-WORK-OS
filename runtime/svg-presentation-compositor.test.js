const assert=require('assert');
const c=require('./svg-presentation-compositor');

const out=c.composeSvg({
  width:100,
  height:50,
  presentation_layers:[{id:'materials',content:'<rect width="100" height="50" fill="#eee"/>'}],
  source_linework:'<path d="M0 0L100 0" stroke="black"/>'
});
assert.equal(out.ok,true);
assert.equal(out.source_overlay_last,true);
assert(out.svg.includes('data-authority="source"'));
assert(out.svg.includes('data-presentation-only="true"'));

const layered=c.composeLayeredSvg({
  width:100,
  height:100,
  layer_outputs:[
    {layer_id:'L6_AI_ATMOSPHERE',id:'ai',content:'<rect width="100" height="100" fill="#ddd"/>'},
    {layer_id:'L3_PRESENTATION',id:'material',content:'<rect width="100" height="100" fill="#eee"/>'},
    {layer_id:'L4_ENTOURAGE',id:'furniture',content:'<circle cx="50" cy="50" r="10"/>'},
    {layer_id:'L5_ANNOTATION',id:'labels',content:'<text x="5" y="10">ROOM</text>'}
  ],
  source_snapshot_fragment:'<path d="M0 5L100 5" stroke="#666"/>',
  source_linework:'<path d="M0 0L100 0" stroke="black"/>'
});
assert.equal(layered.ok,true);
assert.equal(layered.source_overlay_last,true);
assert.deepEqual(layered.layer_order,['L3_PRESENTATION','L4_ENTOURAGE','L6_AI_ATMOSPHERE','L5_ANNOTATION']);
assert.equal(layered.l7_inputs.has_source_snapshot,true);
assert(layered.svg.indexOf('id="l3_presentation"') < layered.svg.indexOf('id="l4_entourage"'));
assert(layered.svg.indexOf('id="l4_entourage"') < layered.svg.indexOf('id="l6_ai_atmosphere"'));
assert(layered.svg.indexOf('id="l6_ai_atmosphere"') < layered.svg.indexOf('id="l5_annotation"'));
assert(layered.svg.indexOf('source-snapshot-support') < layered.svg.indexOf('source-linework-final'));

assert.equal(c.composeSvg({source_linework:''}).ok,false);
assert.equal(c.composeLayeredSvg({
  source_linework:'<path d="M0 0L1 1"/>',
  layer_outputs:[{layer_id:'L2_SEMANTIC',content:'<path d="M0 0L1 1"/>'}]
}).reason,'INVALID_LAYER_ID');
assert.equal(c.composeSvg({source_linework:'<script>alert(1)</script>'}).reason,'UNSAFE_SVG_FRAGMENT');
assert.equal(c.composeSvg({
  source_linework:'<path d="M0 0L1 1"/>',
  presentation_layers:[{content:'<image href="https://evil.example/a.png"/>'}]
}).reason,'UNSAFE_SVG_FRAGMENT');

console.log('svg-presentation-compositor: PASS');
