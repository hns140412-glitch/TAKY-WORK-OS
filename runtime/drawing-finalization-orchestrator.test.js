const assert=require('assert');
const f=require('./drawing-finalization-orchestrator');

const p=f.buildFinalizationPlan({view_id:'SALE',profile:'SALES_PLAN'});
assert.equal(p.steps[p.steps.length-1].action,'SHIP_ONLY_AFTER_ALL_PASS');
assert.equal(p.steps[p.steps.length-2].action,'NO_PASS_NO_SHOW_USER_EXPOSURE_GATE');
assert.equal(p.steps.some(x=>x.action==='VERIFY_CONTENT_IDENTITY_AND_AUTHORITY__DATE_NE_CONTENT_CHANGE'),true);
assert.equal(p.retry.on_format_failure,'REEXPORT_FROM_CANONICAL_A3_SVG');

assert.equal(f.nextAction({source_freshness:'FAIL'}),'HOLD_SOURCE_SELECTION');
assert.equal(f.nextAction({fidelity:'FAIL',quality:'PASS',formats:'PASS'}),'RETURN_TO_KEY_STATE');
assert.equal(f.nextAction({fidelity:'PASS',quality:'NEEDS_REVISION',formats:'PASS'}),'REVISE_PRESENTATION_LAYER');
assert.equal(f.nextAction({fidelity:'PASS',quality:'PASS',formats:'FAIL'}),'REEXPORT_A3_BUNDLE');
assert.equal(f.nextAction({fidelity:'PASS',quality:'PASS',formats:'PASS'}),'SHIP');

const gate=(validator,ref)=>({status:'PASS',validator,evidence_refs:[ref]});
const validation={
  validation_bundle_id:'VB-001',source_digest:'sha256:source',artifact_digest:'sha256:artifact',
  gates:{
    SOURCE:gate('source-lock','SRC-1'),GEOMETRY:gate('drawing-engine-core.validateKeyPreservation','GEO-1'),
    FACT:gate('fact-validator','FACT-1'),SEMANTIC:gate('semantic-validator','SEM-1'),
    REFERENCE_EFFECT:gate('drawing-reference-compiler.validateApplied','REF-1'),
    ARCHITECTURAL_READABILITY:gate('readability-validator','READ-1'),
    USER_EFFECT:gate('user-effect-validator','USER-1')
  },defects:[]
};
const receipt={
  receipt_type:'AUTHORIZED_ENGINE_EXECUTION',route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
  engine_id:'DRAWING_ENGINE_V2',engine_version:'2.3.0',engine_commit_sha:'abc123',
  source_digest:'sha256:source',artifact_digest:'sha256:artifact',validation_bundle_id:'VB-001',
  operation_ids:['VECTOR_STYLE_LAYER']
};
const good={
  artifact_class:'FINAL',executor_type:'AUTHORIZED_DRAWING_ENGINE',
  operations:['VECTOR_STYLE_LAYER'],execution_receipt:receipt,validation_evidence:validation
};

assert.equal(f.decideUserExposure(good).decision,'SHOW');
assert.equal(f.decideUserExposure({...good,executor_type:'PYTHON'}).decision,'HOLD');
assert.equal(f.decideUserExposure({...good,one_off:true,operations:['ONE_OFF_RENDERER']}).decision,'HOLD');
assert.equal(f.decideUserExposure({...good,artifact_class:'PREVIEW',operations:['GENERATIVE_GEOMETRY_REDRAW']}).decision,'HOLD');
assert.equal(f.decideUserExposure({...good,validation_evidence:{...validation,defects:['WALL_DELETED']}}).decision,'HOLD');
assert.equal(f.decideUserExposure({...good,execution_receipt:{...receipt,artifact_digest:'sha256:other'}}).decision,'HOLD');
assert.equal(f.decideUserExposure({...good,validation_evidence:{source_gate_pass:true,geometry_gate_pass:true,fact_gate_pass:true,semantic_gate_pass:true,reference_effect_pass:true,architectural_readability_pass:true,user_effect_pass:true,defects:[]}}).decision,'HOLD');
assert.equal(f.decideUserExposure({artifact_class:'FINAL',operations:['VECTOR_STYLE_LAYER']}).decision,'HOLD');

console.log('drawing-finalization-orchestrator: PASS');
