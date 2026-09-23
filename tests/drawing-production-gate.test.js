'use strict';
const assert=require('assert');
const {authorizeProduction}=require('../runtime/drawing-production-router');
const {compileReference,validateEffect}=require('../runtime/reference-compiler');
const {validatePreUser}=require('../runtime/pre-user-validation');

const passGates=['SOURCE_GATE','GEOMETRY_GATE','FACT_GATE','SEMANTIC_GATE','REFERENCE_EFFECT_GATE','ARCHITECTURAL_READABILITY_GATE','A3_GATE','USER_EFFECT_GATE'].map(g=>({gate:g,status:'PASS'}));

let r=authorizeProduction({artifact_class:'FINAL',producer_type:'PYTHON_ONE_OFF',registered_engine:false,engine_available:true,bypass_used:true,gate_receipts:passGates});
assert.equal(r.ok,false);
assert(r.findings.includes('ENGINE_AVAILABLE_BYPASS_USED_GOVERNANCE_FAILURE'));

r=authorizeProduction({artifact_class:'FINAL',producer_type:'DRAWING_ENGINE',registered_engine:true,engine_id:'DRAWING_ENGINE_V4',gate_receipts:passGates});
assert.equal(r.ok,true); assert.equal(r.showable,true);

let c=compileReference({reference_id:'ArchDaily',dna_id:'PLAN_LINE_HIERARCHY',token_id:'LINE_HIERARCHY',engine_parameter:{wall:0.4},expected_effect:'visible hierarchy',validation_metric:'detectable_delta',mutates_geometry:false});
assert.equal(c.ok,true);
assert.equal(validateEffect(c.receipt,{detectable:true,geometry_diff:0}).ok,true);
assert.equal(validateEffect(c.receipt,{detectable:false,geometry_diff:0}).ok,false);

let v=validatePreUser({gates:Object.fromEntries(passGates.map(x=>[x.gate,x.status])),protected_geometry_changes:1,invented_semantics:false,unsupported_narrative:false,reference_effect_detectable:true,user_effect_pass:true});
assert.equal(v.ok,false); assert(v.findings.includes('PROTECTED_GEOMETRY_CHANGED'));

v=validatePreUser({gates:Object.fromEntries(passGates.map(x=>[x.gate,x.status])),protected_geometry_changes:0,invented_semantics:false,unsupported_narrative:false,reference_effect_detectable:true,user_effect_pass:true});
assert.equal(v.ok,true); assert.equal(v.showable,true);

console.log('drawing-production-gate: PASS');
