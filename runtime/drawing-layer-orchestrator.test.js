const assert=require('assert');
const o=require('./drawing-layer-orchestrator');

let p=o.buildSingleViewPlan({
  view_id:'SALES',
  profile:'SALES_TEXTURED',
  available_masks:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION','LANDSCAPE']
});
assert.equal(p.ok,true);
assert.equal(p.stages[3].mode,'PARALLEL');
assert(p.stages[3].layers.includes('L3_PRESENTATION'));
assert(p.stages[3].layers.includes('L6_AI_ATMOSPHERE'));

let blocked=o.buildSingleViewPlan({
  view_id:'SALES',
  profile:'SALES_PLAN',
  available_masks:['SOURCE_LINE','ANNOTATION']
});
assert.equal(blocked.ok,false);
assert(blocked.missing_masks.includes('ROOM_MATERIAL'));
assert(blocked.missing_masks.includes('FURNITURE'));

const fan=o.buildFanoutPlan({
  source_key:'SRC-A',
  views:[
    {view_id:'SALE',profile:'SALES_TEXTURED',available_masks:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION']},
    {view_id:'PUB',profile:'PUBLICATION',available_masks:['SOURCE_LINE']}
  ]
});
assert.equal(fan.ok,true);
assert.equal(fan.shared_precompute.length,3);
assert.equal(fan.shared_precompute[0].work_unit_id,'SRC-A:L0');
assert(fan.parallel_view_work.some(x=>x.view_id==='SALE'&&x.layer_id==='L6_AI_ATMOSPHERE'));
assert(fan.parallel_view_work.some(x=>x.view_id==='PUB'&&x.layer_id==='L3_PRESENTATION'));
assert.equal(fan.finalization.length,4);
assert.equal(fan.finalization.filter(x=>x.layer_id==='L7_FINAL_OVERLAY_VALIDATION').length,2);
assert.equal(fan.finalization.filter(x=>x.layer_id==='L8_USER_EXPOSURE_GATE').length,2);
assert(fan.finalization.filter(x=>x.layer_id==='L8_USER_EXPOSURE_GATE').every(x=>x.depends_on.length===1&&x.depends_on[0].endsWith(':L7')));

const all=[
  ...fan.shared_precompute.map(x=>x.work_unit_id),
  ...fan.parallel_view_work.map(x=>x.work_unit_id),
  ...fan.finalization.map(x=>x.work_unit_id)
];
assert.equal(o.validateExecution({plan:fan,completed_work_units:all}).ok,true);
assert.equal(o.validateExecution({plan:fan,completed_work_units:all.slice(0,-1)}).ok,false);

console.log('drawing-layer-orchestrator: PASS');
