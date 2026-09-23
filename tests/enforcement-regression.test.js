'use strict';

const assert=require('assert');
const Router=require('../runtime/work-os-router.js');
const Contract=require('../runtime/execution-contract.js');
const Validator=require('../runtime/independent-validator.js');
const Exposure=require('../runtime/exposure-gate.js');
const Report=require('../runtime/drawing-report-package.js');
const ReferenceCompiler=require('../runtime/reference-compiler.js');

function minimalPackage(){
  return {
    package_id:'TEST',
    project:{title:'Test project'},
    sources:[],
    facts:[],
    review_items:[],
    cases:[],
    methods:[],
    pages:[]
  };
}

(function testUnauthorizedProducerDenied(){
  const r=Router.routeProductionTask({
    task_type:'ARCH_DRAWING_PRESENTATION',
    requested_producer_id:'PYTHON_ONE_OFF',
    requested_output:'USER_FACING'
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'DIAGNOSTIC_PRODUCER_CANNOT_CREATE_PRODUCTION_ARTIFACT');
})();

(function testRouteBypassDenied(){
  const r=Router.routeProductionTask({
    task_type:'ARCH_DRAWING_PRESENTATION',
    requested_producer_id:'REPORT_ENGINE_V2',
    requested_output:'USER_FACING'
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'ROUTE_BYPASS_ATTEMPT');
})();

(function testForgedAuthorizationDenied(){
  const forged={
    kind:'TAKY_PRODUCTION_AUTHORIZATION',
    task_type:'ARCH_REPORT_ASSEMBLY',
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2'
  };
  const r=Contract.verifyProductionAuthorization(forged);
  assert.equal(r.ok,false);
  assert.equal(r.reason,'INVALID_OR_FORGED_AUTHORIZATION');
})();

(function testLegacyBuildOutputPlanCannotBypassAuthorization(){
  const r=Report.buildOutputPlan(minimalPackage());
  assert.equal(r.ok,false);
  assert.equal(r.reason,'PRODUCTION_AUTHORIZATION_REQUIRED');
})();

(function testEngineCannotCertifyItself(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  assert.equal(routed.ok,true);

  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const r=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:routed.authorization.producer_id,
    gate_results:gates
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'ENGINE_CANNOT_CERTIFY_ITSELF');
})();

(function testMissingGateBlocksExposure(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  gates.GEOMETRY_GATE='FAIL';
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates
  });
  assert.equal(v.ok,false);
  assert.equal(v.reason,'MANDATORY_GATE_FAILED');

  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });
  assert.equal(e.ok,false);
  assert.equal(e.reason,'NO_PASS_NO_SHOW');
})();

(function testFullPassAllowsExposureAndOutputPlan(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  assert.equal(routed.ok,true);

  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates
  });
  assert.equal(v.ok,true);

  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });
  assert.equal(e.ok,true);

  const plan=Report.buildOutputPlan(minimalPackage(),routed.authorization);
  assert.equal(plan.ok,true);
})();

(function testReferenceCompilerRequiresEffectProof(){
  const c=ReferenceCompiler.compileReferenceProfile({
    reference_ids:['ARCHDAILY_PLAN_HIERARCHY','OMA_RELATION_FIRST'],
    context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
  });
  assert.equal(c.ok,true);
  assert.equal(c.status,'COMPILED');

  const weak=ReferenceCompiler.validateReferenceEffect({
    TRACEABILITY_PASS:true,
    EFFECT_PASS:true,
    FIT_PASS:true,
    FIDELITY_PASS:true,
    REFERENCE_ABLATION_TEST_PASS:false
  });
  assert.equal(weak.ok,false);
  assert.equal(weak.status,'CANDIDATE');

  const strong=ReferenceCompiler.validateReferenceEffect({
    TRACEABILITY_PASS:true,
    EFFECT_PASS:true,
    FIT_PASS:true,
    FIDELITY_PASS:true,
    REFERENCE_ABLATION_TEST_PASS:true
  });
  assert.equal(strong.ok,true);
  assert.equal(strong.status,'VERIFIED_EFFECTIVE');
})();

console.log('TAKY enforcement regression: PASS');
