const assert=require('assert');
const v=require('./drawing-pre-user-validation');

const base={
  source_gate_pass:true,
  geometry_gate_pass:true,
  fact_gate_pass:true,
  semantic_gate_pass:true,
  reference_effect_pass:true,
  architectural_readability_pass:true,
  user_effect_pass:true,
  defects:[]
};

assert.equal(v.evaluate(base).decision,'PASS');
assert.equal(v.evaluate({...base,defects:['WALL_DELETED']}).decision,'FAIL');
assert.deepEqual(v.evaluate({...base,defects:['CORE_DELETED']}).blocking_defects,['CORE_DELETED']);
assert.equal(v.evaluate({...base,reference_effect_pass:false}).decision,'FAIL');
assert.equal(v.evaluate({...base,narrative_present:true,narrative_evidence_pass:false}).gates.NARRATIVE_EVIDENCE,'FAIL');
assert.equal(v.evaluate({...base,a3_required:true,a3_gate_pass:false}).gates.A3,'FAIL');
console.log('drawing-pre-user-validation: PASS');
