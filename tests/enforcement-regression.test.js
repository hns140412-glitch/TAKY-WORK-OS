'use strict';

const assert=require('assert');
const Router=require('../runtime/work-os-router.js');
const Contract=require('../runtime/execution-contract.js');
const Validator=require('../runtime/independent-validator.js');
const Exposure=require('../runtime/exposure-gate.js');
const Report=require('../runtime/drawing-report-package.js');
const ReferenceCompiler=require('../runtime/reference-compiler.js');
const GeometryGuard=require('../runtime/geometry-guard.js');
const SemanticGate=require('../runtime/semantic-gate.js');
const NarrativeGate=require('../runtime/narrative-evidence-gate.js');
const Pipeline=require('../runtime/production-pipeline.js');

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

(function testDestructiveMaskBlocked(){
  const r=GeometryGuard.validateGeometryIntegrity({
    source_fingerprint:'GEO-1',
    output_fingerprint:'GEO-1',
    protected_anchors_source:['WALL-A','CORE-A','ENTRY-A'],
    protected_anchors_output:['WALL-A','CORE-A','ENTRY-A'],
    mask_intersections:['WALL-A']
  });
  assert.equal(r.ok,false);
  assert.equal(r.code,'DESTRUCTIVE_MASK_INTERSECTS_PROTECTED_GEOMETRY');
})();

(function testUnknownSemanticCannotBeStyled(){
  const r=SemanticGate.validateSemanticAssignments([
    {region_id:'R1',state:'UNKNOWN',presentation_token:'SOIL'}
  ]);
  assert.equal(r.ok,false);
  assert.equal(r.findings[0].code,'UNVERIFIED_SEMANTIC_STYLING_FORBIDDEN');
})();

(function testNarrativeOverclaimBlocked(){
  const r=NarrativeGate.validateClaims([
    {
      claim_id:'C1',
      evidence_refs:['SRC-PLAN'],
      evidence_state:'SUPPORTED',
      strength:'CONFIRMED',
      text:'완벽한 프라이버시'
    }
  ]);
  assert.equal(r.ok,false);
  assert.equal(r.findings[0].code,'CLAIM_STRENGTH_EXCEEDS_EVIDENCE');
})();

(function testEndToEndProductionPipeline(){
  const pass=true;
  const r=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    validator_id:'VALIDATION_ENGINE_V1',
    geometry:{
      source_fingerprint:'GEO-LOCK-1',
      output_fingerprint:'GEO-LOCK-1',
      protected_anchors_source:['WALL','CORE','ENTRY'],
      protected_anchors_output:['WALL','CORE','ENTRY'],
      crop_source:[0,0,100,100],
      crop_output:[0,0,100,100],
      rotation_source:0,
      rotation_output:0,
      scale_source:'1:200',
      scale_output:'1:200',
      mask_intersections:[]
    },
    semantics:[
      {region_id:'ROAD-1',state:'VERIFIED',presentation_token:'ROAD'}
    ],
    claims:[
      {claim_id:'C1',evidence_refs:['SRC-1'],evidence_state:'SUPPORTED',strength:'SUPPORTED',text:'도면상 독립성이 강화된 구성으로 읽힌다'}
    ],
    reference:{
      reference_ids:['ARCHDAILY_PLAN_HIERARCHY','OMA_RELATION_FIRST'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_effect_proof:{
      TRACEABILITY_PASS:pass,
      EFFECT_PASS:pass,
      FIT_PASS:pass,
      FIDELITY_PASS:pass,
      REFERENCE_ABLATION_TEST_PASS:pass
    },
    external_gates:{
      SOURCE_GATE:'PASS',
      FACT_GATE:'PASS',
      ARCHITECTURAL_READABILITY_GATE:'PASS',
      A3_GATE:'PASS',
      PROVENANCE_GATE:'PASS',
      USER_EFFECT_GATE:'PASS'
    },
    report_package:minimalPackage(),
    exposure_target:'FINAL_APPROVABLE'
  });
  assert.equal(r.ok,true);
  assert.equal(r.status,'FINAL_APPROVABLE');
})();

console.log('TAKY enforcement regression: PASS');
