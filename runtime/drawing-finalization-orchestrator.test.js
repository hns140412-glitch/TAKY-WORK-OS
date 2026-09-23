const assert=require('assert');
const f=require('./drawing-finalization-orchestrator');

const p=f.buildFinalizationPlan({view_id:'SALE',profile:'SALES_PLAN'});
assert.equal(p.steps[p.steps.length-1].action,'SHIP_ONLY_AFTER_ALL_PASS');
assert.equal(p.steps[p.steps.length-2].action,'NO_PASS_NO_SHOW_USER_EXPOSURE_GATE');
assert.equal(p.retry.on_format_failure,'REEXPORT_FROM_CANONICAL_A3_SVG');

assert.equal(f.nextAction({fidelity:'FAIL',quality:'PASS',formats:'PASS'}),'RETURN_TO_KEY_STATE');
assert.equal(f.nextAction({fidelity:'PASS',quality:'NEEDS_REVISION',formats:'PASS'}),'REVISE_PRESENTATION_LAYER');
assert.equal(f.nextAction({fidelity:'PASS',quality:'PASS',formats:'FAIL'}),'REEXPORT_A3_BUNDLE');
assert.equal(f.nextAction({fidelity:'PASS',quality:'PASS',formats:'PASS'}),'SHIP');

const validation={source_gate_pass:true,geometry_gate_pass:true,fact_gate_pass:true,semantic_gate_pass:true,reference_effect_pass:true,architectural_readability_pass:true,user_effect_pass:true,defects:[]};
assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['VECTOR_STYLE_LAYER'],validation_evidence:validation
}).decision,'SHOW');

assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'ONE_OFF_SCRIPT',one_off:true,
  operations:['ONE_OFF_RENDERER'],validation_evidence:validation
}).decision,'HOLD');

assert.equal(f.decideUserExposure({
  artifact_class:'PREVIEW',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['GENERATIVE_GEOMETRY_REDRAW'],validation_evidence:validation
}).decision,'HOLD');

assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['VECTOR_STYLE_LAYER'],validation_evidence:{...validation,defects:['WALL_DELETED']}
}).decision,'HOLD');

assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['VECTOR_STYLE_LAYER']
}).decision,'HOLD');

console.log('drawing-finalization-orchestrator: PASS');
