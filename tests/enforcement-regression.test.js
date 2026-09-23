'use strict';

process.env.TAKY_ENFORCEMENT_SECRET='test-only-enforcement-secret-20260923';

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
const ArtifactBroker=require('../runtime/artifact-broker.js');
const Capability=require('../runtime/capability-token.js');

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
  const forged='not-a-valid-signed-token';
  const r=Contract.verifyProductionAuthorization(forged);
  assert.equal(r.ok,false);
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
    validator_id:'REPORT_ENGINE_V2',
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
  const primitives=[
    {id:'W1',role:'WALL',type:'LINE',x1:0,y1:0,x2:10,y2:0},
    {id:'C1',role:'CORE',type:'RECT',x:2,y:2,w:2,h:3},
    {id:'E1',role:'ENTRY',type:'OPENING',x:5,y:0,w:1}
  ];
  const pkg={
    package_id:'TEST',
    project:{title:'Test project'},
    sources:[{
      source_id:'SRC-1',
      role:'CURRENT_GEOMETRY_SOURCE'
    }],
    facts:[],
    review_items:[],
    cases:[],
    methods:[],
    pages:[]
  };

  const r=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    validator_id:'VALIDATION_ENGINE_V1',
    source_identity:{
      current_content:'same-source-content',
      previous_content:'same-source-content',
      current_modified_at:'2026-09-23T10:00:00+09:00',
      previous_modified_at:'2026-09-23T09:00:00+09:00'
    },
    geometry:{
      source:{primitives},
      output:{primitives},
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
    visual_metrics:{
      a3:{
        width_mm:420,
        height_mm:297,
        margin_mm:12,
        hero_ratio:0.74,
        support_diagram_count:2,
        text_clipped:false
      },
      readability:{
        main_drawing_identifiable_ms:1000,
        hierarchy_score:0.85,
        figure_ground_score:0.82,
        support_competition_score:0.20
      },
      user_effect:{
        reference_effect_visible_without_explanation:true,
        decision_value_score:0.82,
        generic_layout_detected:false
      }
    },
    provenance:{
      source_ids:['SRC-1'],
      module_ids:['REPORT_ENGINE_V2','VALIDATION_ENGINE_V1']
    },
    report_package:pkg,
    exposure_target:'FINAL_APPROVABLE'
  });
  assert.equal(r.ok,true);
  assert.equal(r.status,'FINAL_APPROVABLE');
})();;


(function testSignedAuthorizationIsSerializable(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  assert.equal(routed.ok,true);
  assert.equal(typeof routed.authorization,'string');
  const copied=JSON.parse(JSON.stringify({token:routed.authorization})).token;
  const verified=Contract.verifyProductionAuthorization(copied,{
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2'
  });
  assert.equal(verified.ok,true);
})();

(function testArtifactBrokerRequiresExposureGrant(){
  const denied=ArtifactBroker.registerProductionArtifact({
    artifact_id:'A1',
    artifact_type:'PDF',
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2'
  });
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'VALID_EXPOSURE_GRANT_REQUIRED');
})();

(function testArtifactBrokerAcceptsValidatedProductionOnly(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
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

  const auth=Contract.verifyProductionAuthorization(routed.authorization);
  assert.equal(auth.ok,true);

  const registered=ArtifactBroker.registerProductionArtifact({
    artifact_id:'A2',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    source_ids:['SRC-1'],
    exposure_grant:e.grant
  });
  assert.equal(registered.ok,true);
  assert.equal(registered.record.status,'REGISTERED_PRODUCTION_ARTIFACT');
})();

(function testTamperedExposureGrantRejected(){
  const signed=Capability.signPayload('TAKY_EXPOSURE_GRANT',{
    target:'USER_VISIBLE',
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2',
    validation_status:'PASS'
  });
  assert.equal(signed.ok,true);
  const tampered=signed.token.slice(0,-1)+(signed.token.endsWith('A')?'B':'A');
  const r=ArtifactBroker.registerProductionArtifact({
    artifact_id:'A3',
    artifact_type:'PDF',
    producer_id:'REPORT_ENGINE_V2',
    execution_graph_id:'A3_REPORT_ASSEMBLY_V2',
    exposure_grant:tampered
  });
  assert.equal(r.ok,false);
})();


(function testTimestampAloneDoesNotChangeContentRevision(){
  const SourceIdentity=require('../runtime/source-identity-validator.js');
  const r=SourceIdentity.classifyRevision({
    current_content:'identical',
    previous_content:'identical',
    current_modified_at:'2026-09-23T12:00:00+09:00',
    previous_modified_at:'2026-09-22T12:00:00+09:00'
  });
  assert.equal(r.ok,true);
  assert.equal(r.classification,'SAME_CONTENT_REVISION');
  assert.equal(r.date_changed,true);
})();

(function testVisualPassCannotBeInjected(){
  const primitives=[{id:'W1',role:'WALL',type:'LINE',x1:0,y1:0,x2:10,y2:0}];
  const r=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    validator_id:'VALIDATION_ENGINE_V1',
    source_identity:{current_content:'source'},
    geometry:{source:{primitives},output:{primitives}},
    semantics:[],
    claims:[],
    reference:{
      reference_ids:['ARCHDAILY_PLAN_HIERARCHY'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_effect_proof:{
      TRACEABILITY_PASS:true,EFFECT_PASS:true,FIT_PASS:true,FIDELITY_PASS:true,REFERENCE_ABLATION_TEST_PASS:true
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
    provenance:{source_ids:['SRC-X'],module_ids:['REPORT_ENGINE_V2']},
    visual_metrics:{}
  });
  assert.equal(r.ok,false);
  assert.equal(r.stage,'VALIDATION');
})();

console.log('TAKY enforcement regression: PASS');
