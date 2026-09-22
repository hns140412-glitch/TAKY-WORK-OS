const assert=require('assert');
const b=require('./drawing-mask-gate-bridge');

const masks=b.toGateMasks({
 source_line:{artifact_uri:'mem://line'},
 manifest:{mask_summaries:[
  {mask_id:'ROOM_MATERIAL',validation_state:'CAD_RULE_VERIFIED',record_count:3,source_trace:{layers:['A-AREA']}},
  {mask_id:'ANNOTATION',validation_state:'CAD_RULE_VERIFIED',record_count:4,source_trace:{layers:['A-ANNO']}}
 ]}
});
assert.equal(masks.length,3);
assert.equal(masks[0].mask_id,'SOURCE_LINE');
assert.equal(masks[1].validation_state,'CAD_RULE_VERIFIED');
assert(masks[2].source_trace);
console.log('drawing-mask-gate-bridge: PASS');
