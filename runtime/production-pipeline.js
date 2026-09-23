'use strict';

const Router=require('./work-os-router.js');
const ExecutionContract=require('./execution-contract.js');
const SourceIdentity=require('./source-identity-validator.js');
const GeometryFingerprint=require('./geometry-fingerprint.js');
const GeometryGuard=require('./geometry-guard.js');
const FactGate=require('./fact-evidence-validator.js');
const SemanticGate=require('./semantic-gate.js');
const NarrativeGate=require('./narrative-evidence-gate.js');
const HumanIntent=require('./human-intent-contract.js');
const ReferenceCompiler=require('./reference-compiler.js');
const ReferenceApplication=require('./reference-application.js');
const VisualQuality=require('./visual-quality-validator.js');
const Measurement=require('./visual-measurement-receipt.js');
const VisionReview=require('./vision-review-receipt.js');
const Provenance=require('./provenance-validator.js');
const Validator=require('./independent-validator.js');
const Exposure=require('./exposure-gate.js');
const Report=require('./drawing-report-package.js');
const ArtifactBroker=require('./artifact-broker.js');
const path=require('path');
const fs=require('fs');

function fail(stage,detail,evidence={}){
  return Object.freeze({ok:false,stage,detail,evidence:Object.freeze(evidence)});
}

function runProduction(input={}){
  const route=Router.routeProductionTask(input.task||{});
  if(!route.ok) return fail('ROUTER',route);

  const auth=ExecutionContract.verifyProductionAuthorization(route.authorization);
  if(!auth.ok) return fail('AUTHORIZATION',auth);

  const source=SourceIdentity.classifyRevision(input.source_identity||{});

  const geometryCompare=GeometryFingerprint.compareGeometry(
    input.geometry?.source||{},
    input.geometry?.output||{}
  );

  const geometry=GeometryGuard.validateGeometryIntegrity({
    source_fingerprint:geometryCompare.source_fingerprint,
    output_fingerprint:geometryCompare.output_fingerprint,
    protected_anchors_source:input.geometry?.protected_anchors_source||[],
    protected_anchors_output:input.geometry?.protected_anchors_output||[],
    crop_source:input.geometry?.crop_source,
    crop_output:input.geometry?.crop_output,
    rotation_source:input.geometry?.rotation_source,
    rotation_output:input.geometry?.rotation_output,
    scale_source:input.geometry?.scale_source,
    scale_output:input.geometry?.scale_output,
    mask_intersections:input.geometry?.mask_intersections||[]
  });

  const facts=FactGate.validateFacts({
    sources:input.report_package?.sources||input.sources||[],
    facts:input.report_package?.facts||input.facts||[]
  });

  const semantics=SemanticGate.validateSemanticAssignments(input.semantics||[]);
  const narrative=NarrativeGate.validateClaims(input.claims||[]);
  const humanIntent=HumanIntent.compileHumanIntent(input.human_intent||{});

  const refCompile=ReferenceCompiler.compileReferenceProfile(input.reference||{});
  const refApplication=ReferenceApplication.validateApplication(
    input.reference_application||{},
    refCompile
  );

  const visualMeasurement=Measurement.verifyVisualMeasurement(
    input.visual_measurement_receipt,
    input.artifact_digest||null
  );
  const measuredMetrics=visualMeasurement.ok
    ? (visualMeasurement.payload.metrics?.metrics||{})
    : {};

  const refEffect=refCompile.ok
    ? Measurement.verifyReferenceEffect(
        input.reference_effect_receipt,
        input.artifact_digest||null,
        input.reference?.reference_ids||[],
        refCompile.compile_digest||null
      )
    : Object.freeze({ok:false,reason:'REFERENCE_NOT_COMPILED'});

  const visionReview=VisionReview.verifyReview(
    input.vision_review_receipt,
    input.artifact_digest||null,
    humanIntent.ok?humanIntent.intent_digest:null
  );

  const a3=VisualQuality.validateA3Measured(measuredMetrics);
  const readability=VisualQuality.validateArchitecturalReadabilityObjective(measuredMetrics);

  const provenance=Provenance.validateProvenance({
    authorization:route.authorization,
    source_ids:input.provenance?.source_ids||[],
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    module_ids:input.provenance?.module_ids||[]
  });

  const gate_results={
    SOURCE_GATE:source.ok && source.gate==='PASS'?'PASS':'FAIL',
    GEOMETRY_GATE:geometryCompare.ok && geometry.ok?'PASS':'FAIL',
    FACT_GATE:facts.ok?'PASS':'FAIL',
    SEMANTIC_GATE:semantics.ok?'PASS':'FAIL',
    REFERENCE_EFFECT_GATE:refCompile.ok && refApplication.ok && refEffect.ok && visionReview.ok?'PASS':'FAIL',
    ARCHITECTURAL_READABILITY_GATE:visualMeasurement.ok && readability.ok?'PASS':'FAIL',
    A3_GATE:visualMeasurement.ok && a3.ok?'PASS':'FAIL',
    NARRATIVE_EVIDENCE_GATE:narrative.ok?'PASS':'FAIL',
    PROVENANCE_GATE:provenance.ok?'PASS':'FAIL',
    USER_EFFECT_GATE:humanIntent.ok && visionReview.ok?'PASS':'FAIL'
  };

  const evidence={
    source,
    geometryCompare,
    geometry,
    facts,
    semantics,
    narrative,
    humanIntent,
    refCompile,
    refApplication,
    visualMeasurement,
    refEffect,
    visionReview,
    a3,
    readability,
    provenance,
    gate_results:Object.freeze(gate_results)
  };

  const validation=Validator.validateForExposure({
    authorization:route.authorization,
    validator_id:'VALIDATION_ENGINE_V1',
    gate_results,
    artifact_digest:input.artifact_digest||null
  });
  if(!validation.ok) return fail('VALIDATION',validation,evidence);

  const exposure=Exposure.authorizeExposure({
    authorization:route.authorization,
    validation_receipt:validation.receipt,
    target:input.exposure_target||'USER_VISIBLE'
  });
  if(!exposure.ok) return fail('EXPOSURE',exposure,evidence);

  let output_plan=null;
  if(input.task?.task_type==='ARCH_REPORT_ASSEMBLY'){
    output_plan=Report.buildOutputPlan(input.report_package||{},route.authorization);
    if(!output_plan.ok) return fail('OUTPUT_PLAN',output_plan,evidence);
  }

  return Object.freeze({
    ok:true,
    status:'FINAL_APPROVABLE',
    authorization:route.authorization,
    validation_receipt:validation.receipt,
    exposure_grant:exposure.grant,
    output_plan,
    evidence:Object.freeze(evidence)
  });
}

function finalizeStagedProduction(input={}){
  const stagingRoot=path.resolve(process.env.TAKY_STAGING_ROOT||'artifacts/staging');
  const stagingPath=path.resolve(input.staging_path||'');
  if(!input.staging_path){
    return Object.freeze({ok:false,stage:'STAGING',detail:{reason:'STAGING_PATH_REQUIRED'}});
  }
  if(!(stagingPath===stagingRoot || stagingPath.startsWith(stagingRoot+path.sep))){
    return Object.freeze({ok:false,stage:'STAGING',detail:{reason:'STAGING_PATH_OUTSIDE_ALLOWED_ROOT'}});
  }
  if(!fs.existsSync(stagingPath) || !fs.statSync(stagingPath).isFile()){
    return Object.freeze({ok:false,stage:'STAGING',detail:{reason:'STAGING_ARTIFACT_NOT_FOUND'}});
  }
  const artifact_digest=ArtifactBroker.sha256File(stagingPath);
  return runProduction({
    ...input,
    artifact_digest,
    exposure_target:input.exposure_target||'FINAL_APPROVABLE'
  });
}

module.exports=Object.freeze({
  version:'4.0.0',
  runProduction,
  finalizeStagedProduction
});
