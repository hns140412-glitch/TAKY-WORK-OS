const assert=require('assert');
const c=require('./drawing-prompt-compiler');

const r=c.compile({
  task_contract:{
    goal:'Make the approved plan easier for a buyer to understand without changing the design.',
    outputs:['presentation plan'],
    completion_criteria:['layout readable','geometry preserved'],
    autonomy:{
      must_keep:['source geometry','confirmed design decisions'],
      may_change:['presentation attributes'],
      ask_before:['architectural geometry change']
    }
  },
  preset:{preset_id:'SALES_TEXTURED',linework:'source_overlay_final',material:'scaled_texture',furniture:'real_scale',shadow:'low'},
  key_summary:{source_authority:'DERIVED_VECTOR',geometry_policy:'LOCKED'}
});
assert.equal(r.ok,true);
assert(r.prompt.includes('MUST KEEP: source geometry'));
assert(r.prompt.includes('PRESENTATION PRESET: SALES_TEXTURED'));
assert(!r.prompt.includes('ControlNet'));
assert(!r.prompt.includes('KSampler'));
assert(!r.prompt.includes('0.78'));
console.log('drawing-prompt-compiler: PASS');
