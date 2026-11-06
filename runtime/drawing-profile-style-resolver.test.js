const assert=require('assert');
const r=require('./drawing-profile-style-resolver');

const base={roles:{
  CUT:{stroke_width_mm:0.7},
  PRIMARY:{stroke_width_mm:0.38},
  CONTEXT:{stroke_width_mm:0.14,opacity:0.55},
  FURNITURE:{stroke_width_mm:0.16,opacity:0.72}
}};
const registry={profiles:[
  {profile_id:'SALES_PLAN',role_overrides:{CONTEXT:{opacity:0.25},FURNITURE:{opacity:0.9}},composition:{white_space:'medium'},output_checks:['buyer readability']},
  {profile_id:'PUBLICATION',role_overrides:{CONTEXT:{opacity:0.4}},composition:{white_space:'high'},output_checks:['editorial hierarchy']}
]};

let x=r.resolve({base_tokens:base,profile_registry:registry,profile_id:'SALES_PLAN'});
assert.equal(x.ok,true);
assert.equal(x.roles.CUT.stroke_width_mm,0.7);
assert.equal(x.roles.CONTEXT.opacity,0.25);
assert.equal(x.roles.FURNITURE.opacity,0.9);
assert.equal(x.composition.white_space,'medium');

x=r.resolve({base_tokens:base,profile_registry:registry,profile_id:'publication'});
assert.equal(x.ok,true);
assert.equal(x.roles.CONTEXT.opacity,0.4);

assert.equal(r.resolve({base_tokens:base,profile_registry:registry,profile_id:'NOPE'}).ok,false);

console.log('drawing-profile-style-resolver: PASS');
