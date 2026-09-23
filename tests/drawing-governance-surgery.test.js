'use strict';
const assert=require('assert');
const ReportPackage=require('../runtime/drawing-report-package');
const Engine=require('../runtime/drawing-engine-core');
const RefCompiler=require('../runtime/drawing-reference-compiler');
const Freshness=require('../runtime/drawing-source-freshness');
const Finalizer=require('../runtime/drawing-finalization-orchestrator');

const pkg={package_id:'T',project:{title:'T'},sources:[],facts:[],review_items:[],cases:[],methods:[],pages:[]};

// 1. Direct production planning is forbidden.
const direct=ReportPackage.buildOutputPlan(pkg);
assert.strictEqual(direct.ok,false);
assert.strictEqual(direct.reason,'PRODUCTION_ROUTER_REQUIRED');

// 2. Reference must be compiled AND causally evidenced.
const compiled=RefCompiler.compile([{
  reference_name:'ArchDaily',
  mined_dna:'PLAN_LINE_HIERARCHY',
  design_tokens:{wall_weight:0.40},
  engine_parameters:{wall_lineweight:0.40},
  output_effect:'cut walls dominate projection',
  validation_probe:'PLAN_HIERARCHY_VISIBLE'
}]);
assert.strictEqual(compiled.ok,true);
assert.strictEqual(RefCompiler.validateApplied(compiled,{
  applied_parameters:{wall_lineweight:0.40},
  probe_evidence:{
    PLAN_HIERARCHY_VISIBLE:{
      status:'PASS',
      validator:'visual-metric',
      evidence_refs:['REF-EVIDENCE-1'],
      observed_effect:'cut walls visibly dominate projection'
    }
  }
}).ok,true);
assert.strictEqual(RefCompiler.validateApplied(compiled,{
  applied_parameters:['wall_lineweight'],
  passed_probes:['PLAN_HIERARCHY_VISIBLE']
}).ok,false);

// 3. Geometry protection is owned by Drawing Engine key preservation.
function keyState(objects){
  const r=Engine.normalizeKeyState({
    source_id:'SRC-HANNAM',
    source_authority:'AUTHORITATIVE_VECTOR',
    revision:'R1',
    source_digest:'sha256:source',
    objects
  });
  assert.strictEqual(r.ok,true,JSON.stringify(r));
  return r.key_state;
}
const protectedSource=keyState([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[10,0]},semantics:{role:'wall'},presentation:{}},
  {object_id:'CORE-1',object_type:'CORE',policy:'KEEP',geometry:{bbox:[2,2,4,4]},semantics:{role:'core'},presentation:{}},
  {object_id:'ENTRY-1',object_type:'ENTRY',policy:'KEEP',geometry:{bbox:[0,4,1,5]},semantics:{role:'entry'},presentation:{}}
]);
const damaged=keyState([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[8,0]},semantics:{role:'wall'},presentation:{}},
  {object_id:'CORE-1',object_type:'CORE',policy:'KEEP',geometry:{bbox:[2,2,4,4]},semantics:{role:'core'},presentation:{}},
  {object_id:'ENTRY-1',object_type:'ENTRY',policy:'KEEP',geometry:{bbox:[0,4,1,5]},semantics:{role:'entry'},presentation:{}}
]);
const preservation=Engine.validateKeyPreservation(protectedSource,damaged);
assert.strictEqual(preservation.ok,false);
assert(preservation.issues.some(x=>x.code==='GEOMETRY_DRIFT'&&x.object_id==='WALL-1'));

// 4. DATE != CONTENT CHANGE.
const same=Freshness.compare(
  {source_digest:'sha256:same',modified_at:'2026-09-22'},
  {source_digest:'sha256:same',modified_at:'2026-09-23'}
);
assert.strictEqual(same.relation,'CONTENT_IDENTICAL');
assert.strictEqual(Freshness.maySupersede({
  candidate:{source_digest:'sha256:same',modified_at:'2026-09-23'},
  current:{source_digest:'sha256:same',modified_at:'2026-09-22'}
}).allowed,false);

// 5. L8 user exposure is owned by central finalizer/authority chain.
const gate=(validator,ref)=>({status:'PASS',validator,evidence_refs:[ref]});
const validation={
  validation_bundle_id:'VB-SURGERY',
  source_digest:'sha256:source',
  artifact_digest:'sha256:artifact',
  gates:{
    SOURCE:gate('source-lock','SRC-1'),
    GEOMETRY:gate('drawing-engine-core.validateKeyPreservation','GEO-1'),
    FACT:gate('fact-validator','FACT-1'),
    SEMANTIC:gate('semantic-validator','SEM-1'),
    REFERENCE_EFFECT:gate('drawing-reference-compiler.validateApplied','REF-1'),
    ARCHITECTURAL_READABILITY:gate('readability-validator','READ-1'),
    USER_EFFECT:gate('user-effect-validator','USER-1')
  },
  defects:[]
};
const receipt={
  receipt_type:'AUTHORIZED_ENGINE_EXECUTION',
  route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
  engine_id:'DRAWING_ENGINE_V2',
  engine_version:'2.3.0',
  engine_commit_sha:'surgery',
  source_digest:'sha256:source',
  artifact_digest:'sha256:artifact',
  validation_bundle_id:'VB-SURGERY',
  operation_ids:['VECTOR_STYLE_LAYER']
};
const good={
  artifact_class:'FINAL',
  executor_type:'AUTHORIZED_DRAWING_ENGINE',
  operations:['VECTOR_STYLE_LAYER'],
  execution_receipt:receipt,
  validation_evidence:validation
};
assert.strictEqual(Finalizer.decideUserExposure(good).decision,'SHOW');

// All historical bypass/failure paths must HOLD.
assert.strictEqual(Finalizer.decideUserExposure({...good,executor_type:'PYTHON'}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,executor_type:'REPORTLAB'}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,executor_type:'GENERIC_HTML'}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,operations:['DESTRUCTIVE_RASTER_MASK']}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,operations:['GENERATIVE_GEOMETRY_REDRAW']}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,validation_evidence:{...validation,defects:['WALL_DELETED']}}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,validation_evidence:{...validation,defects:['CORE_DELETED']}}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,validation_evidence:{...validation,defects:['INVENTED_SEMANTICS']}}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,validation_evidence:{...validation,defects:['GENERIC_REPORT_LAYOUT']}}).decision,'HOLD');
assert.strictEqual(Finalizer.decideUserExposure({...good,validation_evidence:{...validation,narrative_present:true}}).decision,'HOLD');

console.log('DRAWING_GOVERNANCE_SURGERY_TESTS_PASS');
