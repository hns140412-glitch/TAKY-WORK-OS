'use strict';

process.env.TAKY_ENFORCEMENT_SECRET='test-only-enforcement-secret-20260923';
process.env.TAKY_VISION_VALIDATOR_SECRET='test-only-vision-validator-secret-20260923';

const assert=require('assert');
const Router=require('../runtime/work-os-router.js');
const Contract=require('../runtime/execution-contract.js');
const Validator=require('../runtime/independent-validator.js');
const Exposure=require('../runtime/exposure-gate.js');
const Report=require('../runtime/drawing-report-package.js');
const ReferenceCompiler=require('../runtime/reference-compiler.js');
const ReferenceApplication=require('../runtime/reference-application.js');
const HumanIntent=require('../runtime/human-intent-contract.js');
const GeometryGuard=require('../runtime/geometry-guard.js');
const SemanticGate=require('../runtime/semantic-gate.js');
const NarrativeGate=require('../runtime/narrative-evidence-gate.js');
const Pipeline=require('../runtime/production-pipeline.js');
const ArtifactBroker=require('../runtime/artifact-broker.js');
const Capability=require('../runtime/capability-token.js');
const Measurement=require('../runtime/visual-measurement-receipt.js');
const VisionReview=require('../runtime/vision-review-receipt.js');
const TestSigner=require('./validator-test-helper.js');
const fs=require('fs');
const os=require('os');
const path=require('path');

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
    APPLICATION_TRACE_PASS:true,
    EFFECT_PASS:true,
    FIT_PASS:true,
    FIDELITY_PASS:true,
    REFERENCE_ABLATION_TEST_PASS:false
  });
  assert.equal(weak.ok,false);
  assert.equal(weak.status,'CANDIDATE');

  const strong=ReferenceCompiler.validateReferenceEffect({
    APPLICATION_TRACE_PASS:true,
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
  const primitives=[
    {id:'W1',role:'WALL',type:'LINE',x1:0,y1:0,x2:10,y2:0},
    {id:'C1',role:'CORE',type:'RECT',x:2,y:2,w:2,h:3},
    {id:'E1',role:'ENTRY',type:'OPENING',x:5,y:0,w:1}
  ];
  const pkg={
    package_id:'TEST',
    project:{title:'Test project'},
    sources:[{source_id:'SRC-1',role:'CURRENT_GEOMETRY_SOURCE'}],
    facts:[],review_items:[],cases:[],methods:[],pages:[]
  };
  const artifactDigest='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const sourceDigest='1111111111111111111111111111111111111111111111111111111111111111';

  const humanIntent=HumanIntent.compileHumanIntent({
    desired_outcome:'Preserve authoritative drawing geometry while producing a clear A3 report for human decision.',
    success_criteria:[
      'source geometry remains unchanged',
      'presentation hierarchy is visibly improved',
      'unsupported claims are excluded'
    ]
  });
  assert.equal(humanIntent.ok,true);

  const compiledReference=ReferenceCompiler.compileReferenceProfile({
    reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
    context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
  });
  assert.equal(compiledReference.ok,true);
  const appliedReference=ReferenceApplication.applyToPresentationProfile({
    a3:{margin_mm:8,layout:{hero_ratio:0.60,support_ratio:0.40}}
  },compiledReference);
  assert.equal(appliedReference.ok,true);
  assert(appliedReference.applied_parameters.length>0);

  const visual=TestSigner.signVisualMeasurement({
    artifact_digest:artifactDigest,
    metrics:{
      schema:'TAKY_OBJECTIVE_VISUAL_METRICS_V1',
      measurement_scope:'OBJECTIVE_ONLY',
      professional_quality_claim:false,
      metrics:{
        width_mm:420,
        height_mm:297,
        landscape:true,
        text_bbox_outside_page:false,
        ink_ratio:0.18,
        contrast_std_norm:0.22,
        edge_density:0.06
      }
    }
  });
  assert.equal(visual.ok,true);

  const ref=TestSigner.signReferenceEffect({
    baseline_digest:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    candidate_digest:artifactDigest,
    reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
    reference_compile_digest:compiledReference.compile_digest,
    comparison:{
      schema:'TAKY_OBJECTIVE_REFERENCE_DELTA_V1',
      measurement_scope:'OBJECTIVE_ONLY',
      objective_effect_detected:true,
      clarity_only_suspected:false,
      combined_effect_score:0.08,
      professional_family_claim:false
    }
  });
  assert.equal(ref.ok,true);

  const vision=TestSigner.signVisionReview({
    artifact_digest:artifactDigest,
    intent_digest:humanIntent.intent_digest,
    professional_family_pass:true,
    reference_effect_visible_without_explanation:true,
    generic_layout_detected:false,
    decision_value_pass:true
  });
  assert.equal(vision.ok,true);

  const sourceFidelity=TestSigner.signSourceFidelity({
    evidence:{
      schema:'TAKY_SOURCE_FIDELITY_EVIDENCE_V1',
      ok:true,
      semantic_inference:false,
      source_sha256:sourceDigest,
      source_page_index:0,
      source_geometry_fingerprint:'fixture-geometry',
      controlled_geometry_fingerprint:'fixture-geometry',
      controlled_geometry_match:true,
      controlled_svg_sha256:'3333333333333333333333333333333333333333333333333333333333333333',
      canonical_svg_sha256:'2222222222222222222222222222222222222222222222222222222222222222',
      candidate_sha256:artifactDigest,
      source_viewbox_match:true,
      canonical_inline_match:true,
      inline_transform_safe:true,
      artifact_parity:{type:'PDF',ok:true,score:1.0}
    }
  });
  assert.equal(sourceFidelity.ok,true);

  const r=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    artifact_digest:artifactDigest,
    source_identity:{
      current_hash:sourceDigest,
      previous_hash:sourceDigest,
      current_modified_at:'2026-09-23T10:00:00+09:00',
      previous_modified_at:'2026-09-23T09:00:00+09:00'
    },
    source_fidelity_receipt:sourceFidelity.receipt,
    geometry:{
      source:{primitives},output:{primitives},
      protected_anchors_source:['WALL','CORE','ENTRY'],
      protected_anchors_output:['WALL','CORE','ENTRY'],
      crop_source:[0,0,100,100],crop_output:[0,0,100,100],
      rotation_source:0,rotation_output:0,
      scale_source:'1:200',scale_output:'1:200',
      mask_intersections:[]
    },
    semantics:[{region_id:'ROAD-1',state:'VERIFIED',presentation_token:'ROAD'}],
    claims:[{claim_id:'C1',evidence_refs:['SRC-1'],evidence_state:'SUPPORTED',strength:'SUPPORTED',text:'도면상 독립성이 강화된 구성으로 읽힌다'}],
    human_intent:{
      desired_outcome:humanIntent.desired_outcome,
      success_criteria:[...humanIntent.success_criteria]
    },
    reference:{
      reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_application:appliedReference,
    visual_measurement_receipt:visual.receipt,
    reference_effect_receipt:ref.receipt,
    vision_review_receipt:vision.receipt,
    provenance:{source_ids:['SRC-1'],module_ids:['REPORT_ENGINE_V2','VALIDATION_ENGINE_V1']},
    report_package:pkg,
    exposure_target:'FINAL_APPROVABLE'
  });
  assert.equal(r.ok,true);
  assert.equal(r.status,'FINAL_APPROVABLE');
})();;;


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
  const [payloadPart,signaturePart]=signed.token.split('.');
  const tamperedPayload=(payloadPart[0]==='A'?'B':'A')+payloadPart.slice(1);
  const tampered=tamperedPayload+'.'+signaturePart;
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
      APPLICATION_TRACE_PASS:true,EFFECT_PASS:true,FIT_PASS:true,FIDELITY_PASS:true,REFERENCE_ABLATION_TEST_PASS:true
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


(function testArtifactBrokerPublishesOnlyFromStaging(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'taky-artifact-'));
  const staging=path.join(tmp,'staging');
  const production=path.join(tmp,'production');
  fs.mkdirSync(staging,{recursive:true});
  fs.writeFileSync(path.join(staging,'candidate.pdf'),'validated-bytes');

  process.env.TAKY_STAGING_ROOT=staging;
  process.env.TAKY_PRODUCTION_ROOT=production;

  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const digest=ArtifactBroker.sha256File(path.join(staging,'candidate.pdf'));
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates,
    artifact_digest:digest
  });
  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });
  const auth=Contract.verifyProductionAuthorization(routed.authorization);

  const pub=ArtifactBroker.publishProductionArtifact({
    artifact_id:'PUB-1',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    source_ids:['SRC-1'],
    staging_path:path.join(staging,'candidate.pdf'),
    file_name:'final.pdf',
    exposure_grant:e.grant
  });
  assert.equal(pub.ok,true);
  assert.equal(fs.existsSync(path.join(production,'final.pdf')),true);

  const outside=path.join(tmp,'outside.pdf');
  fs.writeFileSync(outside,'bad');

  const v2=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates,
    artifact_digest:ArtifactBroker.sha256File(outside)
  });
  const e2=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v2.receipt,
    target:'USER_VISIBLE'
  });

  const denied=ArtifactBroker.publishProductionArtifact({
    artifact_id:'PUB-2',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    staging_path:outside,
    file_name:'bad.pdf',
    exposure_grant:e2.grant
  });
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'STAGING_PATH_OUTSIDE_ALLOWED_ROOT');

  fs.rmSync(tmp,{recursive:true,force:true});
})();


(function testUntrustedValidatorRejected(){
  const routed=Router.routeProductionTask({
    task_type:'ARCH_REPORT_ASSEMBLY',
    requested_output:'USER_FACING'
  });
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'FAKE_VALIDATOR',
    gate_results:gates
  });
  assert.equal(v.ok,false);
  assert.equal(v.reason,'UNTRUSTED_VALIDATOR');
})();

(function testDigestlessGrantCannotPublish(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'taky-digestless-'));
  const staging=path.join(tmp,'staging');
  const production=path.join(tmp,'production');
  fs.mkdirSync(staging,{recursive:true});
  const candidate=path.join(staging,'candidate.pdf');
  fs.writeFileSync(candidate,'bytes');

  process.env.TAKY_STAGING_ROOT=staging;
  process.env.TAKY_PRODUCTION_ROOT=production;

  const routed=Router.routeProductionTask({task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'});
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates
  });
  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });
  const auth=Contract.verifyProductionAuthorization(routed.authorization);
  const pub=ArtifactBroker.publishProductionArtifact({
    artifact_id:'DIGESTLESS',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    staging_path:candidate,
    file_name:'final.pdf',
    exposure_grant:e.grant
  });
  assert.equal(pub.ok,false);
  assert.equal(pub.reason,'ARTIFACT_DIGEST_BOUND_VALIDATION_REQUIRED');
  fs.rmSync(tmp,{recursive:true,force:true});
})();

(function testArtifactMutationAfterValidationRejected(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'taky-toctou-'));
  const staging=path.join(tmp,'staging');
  const production=path.join(tmp,'production');
  fs.mkdirSync(staging,{recursive:true});
  const candidate=path.join(staging,'candidate.pdf');
  fs.writeFileSync(candidate,'validated-version');

  process.env.TAKY_STAGING_ROOT=staging;
  process.env.TAKY_PRODUCTION_ROOT=production;

  const routed=Router.routeProductionTask({task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'});
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const digest=ArtifactBroker.sha256File(candidate);
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates,
    artifact_digest:digest
  });
  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });

  fs.writeFileSync(candidate,'changed-after-validation');

  const auth=Contract.verifyProductionAuthorization(routed.authorization);
  const pub=ArtifactBroker.publishProductionArtifact({
    artifact_id:'TOCTOU',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    staging_path:candidate,
    file_name:'final.pdf',
    exposure_grant:e.grant
  });
  assert.equal(pub.ok,false);
  assert.equal(pub.reason,'ARTIFACT_CHANGED_AFTER_VALIDATION');
  fs.rmSync(tmp,{recursive:true,force:true});
})();


(function testRawVisualSelfReportIgnored(){
  const primitives=[{id:'W1',role:'WALL',type:'LINE',x1:0,y1:0,x2:10,y2:0}];
  const r=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    artifact_digest:'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    source_identity:{current_content:'source'},
    geometry:{source:{primitives},output:{primitives}},
    semantics:[],claims:[],
    reference:{
      reference_ids:['ARCHDAILY_PLAN_HIERARCHY'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_effect_proof:{
      APPLICATION_TRACE_PASS:true,EFFECT_PASS:true,FIT_PASS:true,FIDELITY_PASS:true,REFERENCE_ABLATION_TEST_PASS:true
    },
    visual_metrics:{
      a3:{width_mm:420,height_mm:297},
      readability:{hierarchy_score:1},
      user_effect:{reference_effect_visible_without_explanation:true,decision_value_score:1,generic_layout_detected:false}
    },
    provenance:{source_ids:['SRC-X'],module_ids:['REPORT_ENGINE_V2']},
    report_package:minimalPackage()
  });
  assert.equal(r.ok,false);
  assert.equal(r.stage,'VALIDATION');
  assert.equal(r.evidence.visualMeasurement.ok,false);
})();

(function testVisionReceiptBoundToArtifactDigest(){
  const intent=HumanIntent.compileHumanIntent({desired_outcome:'Fixture decision support'});
  const signed=TestSigner.signVisionReview({
    artifact_digest:'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    intent_digest:intent.intent_digest,
    professional_family_pass:true,
    reference_effect_visible_without_explanation:true,
    generic_layout_detected:false,
    decision_value_pass:true
  });
  const v=VisionReview.verifyReview(
    signed.receipt,
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    intent.intent_digest
  );
  assert.equal(v.ok,false);
  assert.equal(v.reason,'VISION_REVIEW_DIGEST_MISMATCH');
})();


(function testExposureGrantReplayRejected(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'taky-replay-'));
  const staging=path.join(tmp,'staging');
  const production=path.join(tmp,'production');
  fs.mkdirSync(staging,{recursive:true});
  const candidate=path.join(staging,'candidate.pdf');
  fs.writeFileSync(candidate,'same-validated-bytes');

  process.env.TAKY_STAGING_ROOT=staging;
  process.env.TAKY_PRODUCTION_ROOT=production;

  const routed=Router.routeProductionTask({task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'});
  const gates=Object.fromEntries(Validator.MANDATORY_GATES.map(g=>[g,'PASS']));
  const digest=ArtifactBroker.sha256File(candidate);
  const v=Validator.validateForExposure({
    authorization:routed.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results:gates,
    artifact_digest:digest
  });
  const e=Exposure.authorizeExposure({
    authorization:routed.authorization,
    validation_receipt:v.receipt,
    target:'USER_VISIBLE'
  });
  const auth=Contract.verifyProductionAuthorization(routed.authorization);
  const input={
    artifact_id:'REPLAY',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    staging_path:candidate,
    file_name:'first.pdf',
    exposure_grant:e.grant
  };

  const first=ArtifactBroker.publishProductionArtifact(input);
  assert.equal(first.ok,true);

  const second=ArtifactBroker.publishProductionArtifact({...input,file_name:'second.pdf'});
  assert.equal(second.ok,false);
  assert.equal(second.reason,'EXPOSURE_GRANT_REPLAYED');

  fs.rmSync(tmp,{recursive:true,force:true});
})();


(function testVisionReceiptIntentMismatch(){
  const intentA=HumanIntent.compileHumanIntent({desired_outcome:'Option A decision support'});
  const intentB=HumanIntent.compileHumanIntent({desired_outcome:'Option B decision support'});
  const digest='ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const signed=TestSigner.signVisionReview({
    artifact_digest:digest,
    intent_digest:intentA.intent_digest,
    professional_family_pass:true,
    reference_effect_visible_without_explanation:true,
    generic_layout_detected:false,
    decision_value_pass:true
  });
  const v=VisionReview.verifyReview(signed.receipt,digest,intentB.intent_digest);
  assert.equal(v.ok,false);
  assert.equal(v.reason,'VISION_REVIEW_INTENT_MISMATCH');
})();


(function testSelfReportedGeometryCannotReplaceArtifactFidelity(){
  const primitives=[{id:'W1',role:'GEOMETRY',type:'LINE',x1:0,y1:0,x2:1,y2:1}];
  const result=Pipeline.runProduction({
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    artifact_digest:'9999999999999999999999999999999999999999999999999999999999999999',
    source_identity:{current_hash:'8888888888888888888888888888888888888888888888888888888888888888'},
    geometry:{source:{primitives},output:{primitives}},
    semantics:[],
    claims:[],
    human_intent:{desired_outcome:'Fixture'},
    reference:{
      reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_application:{},
    provenance:{source_ids:['SRC'],module_ids:['REPORT_ENGINE_V2']},
    report_package:minimalPackage()
  });
  assert.equal(result.ok,false);
  assert.equal(result.stage,'VALIDATION');
  assert.equal(result.evidence.sourceFidelity.ok,false);
})();

console.log('TAKY enforcement regression: PASS');
