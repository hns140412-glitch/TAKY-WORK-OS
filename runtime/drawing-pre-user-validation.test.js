const assert=require('assert');
const v=require('./drawing-pre-user-validation');

const gate=(validator,ref)=>({status:'PASS',validator,evidence_refs:[ref]});
const base={
  validation_bundle_id:'VB-001',
  source_digest:'sha256:source',
  artifact_digest:'sha256:artifact',
  gates:{
    SOURCE:gate('source-lock','SRC-1'),
    GEOMETRY:gate('geometry-diff','GEO-1'),
    FACT:gate('fact-validator','FACT-1'),
    SEMANTIC:gate('semantic-validator','SEM-1'),
    REFERENCE_EFFECT:gate('reference-effect','REF-1'),
    ARCHITECTURAL_READABILITY:gate('readability-validator','READ-1'),
    USER_EFFECT:gate('user-effect-validator','USER-1')
  },
  defects:[]
};

assert.equal(v.evaluate(base).decision,'PASS');
assert.equal(v.evaluate({...base,defects:['WALL_DELETED']}).decision,'FAIL');
assert.deepEqual(v.evaluate({...base,defects:['CORE_DELETED']}).blocking_defects,['CORE_DELETED']);
assert.equal(v.evaluate({...base,gates:{...base.gates,REFERENCE_EFFECT:{status:'PASS'}}}).decision,'FAIL');
assert.equal(v.evaluate({...base,validation_bundle_id:''}).decision,'FAIL');
assert.equal(v.evaluate({...base,narrative_present:true,gates:{...base.gates,NARRATIVE_EVIDENCE:gate('narrative-evidence','NAR-1')}}).decision,'PASS');
assert.equal(v.evaluate({...base,narrative_present:true}).decision,'FAIL');
assert.equal(v.evaluate({...base,a3_required:true,gates:{...base.gates,A3:gate('a3-validator','A3-1')}}).decision,'PASS');
console.log('drawing-pre-user-validation: PASS');
