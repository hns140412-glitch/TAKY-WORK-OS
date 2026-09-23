const assert=require('assert');
const r=require('./drawing-execution-receipt');
const good={
  receipt_type:'AUTHORIZED_ENGINE_EXECUTION',
  route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
  engine_id:'DRAWING_ENGINE_V2',
  engine_version:'2.3.0',
  engine_commit_sha:'abc123',
  source_digest:'sha256:source',
  artifact_digest:'sha256:artifact',
  validation_bundle_id:'VB-001',
  operation_ids:['VECTOR_STYLE_LAYER']
};
assert.equal(r.validate(good).ok,true);
assert.equal(r.validate({...good,route:'ONE_OFF_SCRIPT'}).ok,false);
assert.equal(r.validate({...good,validation_bundle_id:''}).ok,false);
console.log('drawing-execution-receipt: PASS');
