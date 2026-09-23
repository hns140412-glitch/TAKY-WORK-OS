const assert=require('assert');
const a=require('./drawing-view-admission');

const verified=[
 {mask_id:'SOURCE_LINE',validation_state:'SOURCE_DERIVED',source_trace:true},
 {mask_id:'ROOM_MATERIAL',validation_state:'CAD_RULE_VERIFIED',semantic_state:'CAD_RULE_VERIFIED',source_trace:true},
 {mask_id:'FURNITURE',validation_state:'CAD_RULE_VERIFIED',semantic_state:'CAD_RULE_VERIFIED',source_trace:true},
 {mask_id:'ANNOTATION',validation_state:'CAD_RULE_VERIFIED',semantic_state:'CAD_RULE_VERIFIED',source_trace:true}
];
let r=a.admitAndPlan({view_id:'SALE',requested_profile:'SALES_TEXTURED',mask_records:verified});
assert.equal(r.ok,true);
assert.equal(r.effective_profile,'SALES_TEXTURED');

const unverified=[
 {mask_id:'SOURCE_LINE',validation_state:'SOURCE_DERIVED',source_trace:true},
 {mask_id:'ROOM_MATERIAL',validation_state:'UNVERIFIED',semantic_state:'UNVERIFIED',source_trace:true}
];
r=a.admitAndPlan({view_id:'SALE',requested_profile:'SALES_TEXTURED',mask_records:unverified});
assert.equal(r.effective_profile,'PUBLICATION');
assert.equal(r.admission_status,'FALLBACK_APPLIED');
assert.equal(r.ok,true);

const fan=a.admitFanout({
 source_key:'SRC',
 views:[
  {view_id:'SALE',profile:'SALES_TEXTURED',mask_records:unverified},
  {view_id:'PUB',profile:'PUBLICATION',mask_records:[{mask_id:'SOURCE_LINE'}]}
 ]
});
assert.equal(fan.ok,true);
assert.equal(fan.admissions[0].profile,'PUBLICATION');
assert.equal(fan.admissions[1].profile,'PUBLICATION');
console.log('drawing-view-admission: PASS');
