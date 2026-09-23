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

const gates={SOURCE:'PASS',GEOMETRY:'PASS',FACT:'PASS',SEMANTIC:'PASS',REFERENCE_EFFECT:'PASS',ARCHITECTURAL_READABILITY:'PASS',USER_EFFECT:'PASS'};
assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['VECTOR_STYLE_LAYER'],gates
}).decision,'SHOW');

assert.equal(f.decideUserExposure({
  artifact_class:'FINAL',execution_route:'ONE_OFF_SCRIPT',one_off:true,
  operations:['ONE_OFF_RENDERER'],gates
}).decision,'HOLD');

assert.equal(f.decideUserExposure({
  artifact_class:'PREVIEW',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',
  operations:['GENERATIVE_GEOMETRY_REDRAW'],gates
}).decision,'HOLD');

console.log('drawing-finalization-orchestrator: PASS');
