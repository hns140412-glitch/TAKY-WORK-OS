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
assert.equal(c.composeSvg({source_linework:''}).ok,false);
assert.equal(c.composeSvg({source_linework:'<script>alert(1)</script>'}).reason,'UNSAFE_SVG_FRAGMENT');
assert.equal(c.composeSvg({source_linework:'<path d="M0 0L1 1"/>',presentation_layers:[{content:'<image href="https://evil.example/a.png"/>'}]}).reason,'UNSAFE_SVG_FRAGMENT');
console.log('svg-presentation-compositor: PASS');
