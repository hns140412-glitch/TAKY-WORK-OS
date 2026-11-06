const assert=require('assert');
const g=require('./drawing-sales-mask-gate');

let r=g.route({
  requested_profile:'SALES_TEXTURED',
  masks:[
    {mask_id:'SOURCE_LINE',validation_state:'SOURCE_DERIVED'},
    {mask_id:'ROOM_MATERIAL',semantic_state:'CAD_RULE_VERIFIED'},
    {mask_id:'ANNOTATION',source_trace:'cad:text'},
    {mask_id:'FURNITURE',presentation_only:true}
  ],
  user_intent:{allow_presentation_furniture:true}
});
assert.equal(r.status,'REQUESTED_PROFILE_ALLOWED');
assert.equal(r.profile,'SALES_TEXTURED');

r=g.route({
  requested_profile:'SALES_TEXTURED',
  masks:[
    {mask_id:'SOURCE_LINE'},
    {mask_id:'ROOM_MATERIAL',semantic_state:'DERIVED_UNVERIFIED'}
  ]
});
assert.equal(r.status,'FALLBACK_APPLIED');
assert.equal(r.profile,'PUBLICATION');
assert(r.gate.findings.some(x=>x.code==='ROOM_MATERIAL_MASK_NOT_CONFIRMED'));

r=g.route({
  requested_profile:'SALES_PLAN',
  masks:[{mask_id:'SOURCE_LINE'}]
});
assert.equal(r.profile,'PUBLICATION');

r=g.route({requested_profile:'SECTION_PRESENTATION',masks:[]});
assert.equal(r.status,'REQUESTED_PROFILE_ALLOWED');
assert.equal(r.profile,'SECTION_PRESENTATION');

console.log('drawing-sales-mask-gate: PASS');
