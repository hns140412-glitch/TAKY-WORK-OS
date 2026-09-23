'use strict';

const Router=require('./work-os-router.js');
const GeometryGuard=require('./geometry-guard.js');
const SemanticGate=require('./semantic-gate.js');
const NarrativeGate=require('./narrative-evidence-gate.js');
const ReferenceCompiler=require('./reference-compiler.js');
const Validator=require('./independent-validator.js');
const Exposure=require('./exposure-gate.js');
const Report=require('./drawing-report-package.js');

function runProduction(input={}){
  const route=Router.routeProductionTask(input.task||{});
  if(!route.ok) return Object.freeze({ok:false,stage:'ROUTER',detail:route});

  const geometry=GeometryGuard.validateGeometryIntegrity(input.geometry||{});
  const semantics=SemanticGate.validateSemanticAssignments(input.semantics||[]);
  const narrative=NarrativeGate.validateClaims(input.claims||[]);

  const refCompile=ReferenceCompiler.compileReferenceProfile(input.reference||{});
  const refEffect=refCompile.ok
    ? ReferenceCompiler.validateReferenceEffect(input.reference_effect_proof||{})
    : Object.freeze({ok:false,status:'NOT_COMPILED'});

  const gate_results={
    SOURCE_GATE:input.external_gates?.SOURCE_GATE,
    GEOMETRY_GATE:geometry.ok?'PASS':'FAIL',
    FACT_GATE:input.external_gates?.FACT_GATE,
    SEMANTIC_GATE:semantics.ok?'PASS':'FAIL',
    REFERENCE_EFFECT_GATE:(refCompile.ok && refEffect.ok)?'PASS':'FAIL',
    ARCHITECTURAL_READABILITY_GATE:input.external_gates?.ARCHITECTURAL_READABILITY_GATE,
    A3_GATE:input.external_gates?.A3_GATE,
    NARRATIVE_EVIDENCE_GATE:narrative.ok?'PASS':'FAIL',
    PROVENANCE_GATE:input.external_gates?.PROVENANCE_GATE,
    USER_EFFECT_GATE:input.external_gates?.USER_EFFECT_GATE
  };

  const validation=Validator.validateForExposure({
    authorization:route.authorization,
    validator_id:input.validator_id,
    gate_results
  });
  if(!validation.ok){
    return Object.freeze({
      ok:false,
      stage:'VALIDATION',
      detail:validation,
      evidence:Object.freeze({geometry,semantics,narrative,refCompile,refEffect,gate_results:Object.freeze(gate_results)})
    });
  }

  const exposure=Exposure.authorizeExposure({
    authorization:route.authorization,
    validation_receipt:validation.receipt,
    target:input.exposure_target||'USER_VISIBLE'
  });
  if(!exposure.ok) return Object.freeze({ok:false,stage:'EXPOSURE',detail:exposure});

  let output_plan=null;
  if(input.task?.task_type==='ARCH_REPORT_ASSEMBLY'){
    output_plan=Report.buildOutputPlan(input.report_package||{},route.authorization);
    if(!output_plan.ok) return Object.freeze({ok:false,stage:'OUTPUT_PLAN',detail:output_plan});
  }

  return Object.freeze({
    ok:true,
    status:'FINAL_APPROVABLE',
    authorization:route.authorization,
    validation_receipt:validation.receipt,
    exposure_grant:exposure.grant,
    output_plan,
    evidence:Object.freeze({geometry,semantics,narrative,reference:refEffect})
  });
}

module.exports=Object.freeze({version:'1.0.0',runProduction});
