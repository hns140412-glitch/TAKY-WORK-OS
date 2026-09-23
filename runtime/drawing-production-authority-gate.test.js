const assert=require('assert');
const g=require('./drawing-production-authority-gate');
const pass={SOURCE:'PASS',GEOMETRY:'PASS',FACT:'PASS',SEMANTIC:'PASS',REFERENCE_EFFECT:'PASS',ARCHITECTURAL_READABILITY:'PASS',USER_EFFECT:'PASS'};
const receipt={
  receipt_type:'AUTHORIZED_ENGINE_EXECUTION',route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
  engine_id:'DRAWING_ENGINE_V2',engine_version:'2.3.0',engine_commit_sha:'abc123',
  source_digest:'sha256:source',artifact_digest:'sha256:artifact',validation_bundle_id:'VB-001',
  operation_ids:['VECTOR_STYLE_LAYER']
};
const base={artifact_class:'FINAL',operations:['VECTOR_STYLE_LAYER'],gates:pass,execution_receipt:receipt,validation_bundle_id:'VB-001',source_digest:'sha256:source',artifact_digest:'sha256:artifact'};
assert.equal(g.evaluate(base).decision,'SHOW');
assert.equal(g.evaluate({...base,execution_receipt:{...receipt,route:'ONE_OFF_SCRIPT'}}).decision,'HOLD');
assert.equal(g.evaluate({...base,one_off:true}).decision,'HOLD');
assert.equal(g.evaluate({...base,operations:['DESTRUCTIVE_RASTER_MASK']}).decision,'HOLD');
assert.equal(g.evaluate({...base,operations:['GENERATIVE_GEOMETRY_REDRAW']}).decision,'HOLD');
assert.equal(g.evaluate({...base,gates:{...pass,REFERENCE_EFFECT:'FAIL'}}).decision,'HOLD');
assert.equal(g.evaluate({artifact_class:'DIAGNOSTIC',user_exposure:true}).decision,'HOLD');
assert.equal(g.evaluate({...base,narrative_present:true}).decision,'HOLD');
assert.equal(g.evaluate({...base,validation_bundle_id:'VB-FORGED'}).decision,'HOLD');
console.log('drawing-production-authority-gate: PASS');
