const assert=require('assert');
const p=require('./vision-review-parser.js');

let r=p.parseVisionReview(JSON.stringify({
  professional_family_pass:true,
  reference_effect_visible_without_explanation:true,
  generic_layout_detected:false,
  decision_value_pass:true,
  reasons:['clear hierarchy']
}));
assert.equal(r.ok,true);

r=p.parseVisionReview('{"professional_family_pass":true}');
assert.equal(r.ok,false);

r=p.parseVisionReview('not json');
assert.equal(r.ok,false);

console.log('vision-review-parser: PASS');
