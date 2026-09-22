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
x=r.groupReady({plan,completed:['SRC:L0','SRC:L1','SRC:L2',...parallel]});
assert(x.ready.every(v=>v.layer_id==='L7_FINAL_OVERLAY_VALIDATION'));
assert.equal(x.ready.length,2);

console.log('drawing-work-unit-runner: PASS');
