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
const gates={SOURCE:'PASS',GEOMETRY:'PASS',FACT:'PASS',SEMANTIC:'PASS',REFERENCE_EFFECT:'PASS',ARCHITECTURAL_READABILITY:'PASS',USER_EFFECT:'PASS'};
assert.equal(r.executeUserExposure({
  unit:saleL8,
  production_context:{artifact_class:'FINAL',execution_route:'AUTHORIZED_ENGINE',engine_id:'DRAWING_ENGINE_V2',operations:['VECTOR_STYLE_LAYER'],gates}
}).decision,'SHOW');

assert.equal(r.executeUserExposure({
  unit:saleL8,
  production_context:{artifact_class:'FINAL',execution_route:'ONE_OFF_SCRIPT',one_off:true,operations:['ONE_OFF_RENDERER'],gates}
}).decision,'HOLD');

console.log('drawing-work-unit-runner: PASS');
