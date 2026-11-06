const assert=require('assert');
const o=require('./drawing-layer-orchestrator');
const r=require('./drawing-work-unit-runner');

const plan=o.buildFanoutPlan({
  source_key:'SRC',
  views:[
    {view_id:'SALE',profile:'SALES_TEXTURED',available_masks:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION']},
    {view_id:'PUB',profile:'PUBLICATION',available_masks:['SOURCE_LINE']}
  ]
});
assert.equal(plan.ok,true);

let x=r.groupReady({plan,completed:[]});
assert.deepEqual(x.ready.map(v=>v.layer_id),['L0_SOURCE']);

x=r.groupReady({plan,completed:['SRC:L0']});
assert.deepEqual(x.ready.map(v=>v.layer_id),['L1_GEOMETRY']);

x=r.groupReady({plan,completed:['SRC:L0','SRC:L1','SRC:L2']});
assert(x.ready.every(v=>v.stage===3));
assert(x.parallel_groups['SALE:PRESENTATION'].length>=3);
assert(x.parallel_groups['PUB:PRESENTATION'].length>=2);

const parallel=plan.parallel_view_work.map(v=>v.work_unit_id);
const baseDone=['SRC:L0','SRC:L1','SRC:L2',...parallel];
x=r.groupReady({plan,completed:baseDone});
assert(x.ready.every(v=>v.layer_id==='L7_FINAL_OVERLAY_VALIDATION'));
assert.equal(x.ready.length,2);

const l7=plan.finalization.filter(v=>v.layer_id==='L7_FINAL_OVERLAY_VALIDATION').map(v=>v.work_unit_id);
x=r.groupReady({plan,completed:[...baseDone,...l7]});
assert(x.ready.every(v=>v.layer_id==='L8_USER_EXPOSURE_GATE'));
assert.equal(x.ready.length,2);

const saleL8=plan.finalization.find(v=>v.work_unit_id==='SALE:L8');
const gate=(validator,ref)=>({status:'PASS',validator,evidence_refs:[ref]});
const validation={
  validation_bundle_id:'VB-001',source_digest:'sha256:source',artifact_digest:'sha256:artifact',
  gates:{
    SOURCE:gate('source-lock','SRC-1'),GEOMETRY:gate('geometry-diff','GEO-1'),
    FACT:gate('fact-validator','FACT-1'),SEMANTIC:gate('semantic-validator','SEM-1'),
    REFERENCE_EFFECT:gate('reference-effect','REF-1'),
    ARCHITECTURAL_READABILITY:gate('readability-validator','READ-1'),
    USER_EFFECT:gate('user-effect-validator','USER-1')
  },defects:[]
};
const receipt={
  receipt_type:'AUTHORIZED_ENGINE_EXECUTION',route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
  engine_id:'DRAWING_ENGINE_V2',engine_version:'2.3.0',engine_commit_sha:'abc123',
  source_digest:'sha256:source',artifact_digest:'sha256:artifact',validation_bundle_id:'VB-001',
  operation_ids:['VECTOR_STYLE_LAYER']
};

assert.equal(r.executeUserExposure({
  unit:saleL8,
  production_context:{artifact_class:'FINAL',executor_type:'AUTHORIZED_DRAWING_ENGINE',operations:['VECTOR_STYLE_LAYER'],execution_receipt:receipt,validation_evidence:validation}
}).decision,'SHOW');

assert.equal(r.executeUserExposure({
  unit:saleL8,
  production_context:{artifact_class:'FINAL',executor_type:'AUTHORIZED_DRAWING_ENGINE',one_off:true,operations:['ONE_OFF_RENDERER'],execution_receipt:receipt,validation_evidence:validation}
}).decision,'HOLD');

console.log('drawing-work-unit-runner: PASS');
