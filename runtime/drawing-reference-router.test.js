const assert=require('assert');
const r=require('./drawing-reference-router');

let x=r.classify({
  source_pointer:'drive://source-1',
  source_class:'REFERENCE_ONLY',
  engine_owner:'WORK-OS/DRAWING',
  data_type:'WORKFLOW',
  validation_state:'REVIEWED',
  freshness_class:'STATIC',
  rights_or_consent:'REFERENCE_OK',
  allowed_use:'evaluation and recipe tuning',
  forbidden_use:'canonical geometry'
});
assert.equal(x.utilization,'RECIPE_DIAGNOSTIC_PATTERN');
assert.equal(x.runtime_ready,false);

x=r.classify({
  source_pointer:'repo://fixture',
  source_class:'RAW/PRESERVED',
  engine_owner:'WORK-OS/DRAWING',
  data_type:'DETERMINISTIC_RUNTIME_DATA',
  validation_state:'VERIFIED',
  freshness_class:'STATIC',
  rights_or_consent:'OWNED',
  allowed_use:'runtime',
  forbidden_use:'none'
});
assert.equal(x.utilization,'DIRECT_RUNTIME_DATA');
assert.equal(x.runtime_ready,true);

x=r.classify({
  source_pointer:'web://tool',
  source_class:'REFERENCE_ONLY',
  engine_owner:'WORK-OS/DRAWING',
  data_type:'CAPABILITY_CLAIM',
  validation_state:'REVIEWED',
  freshness_class:'VOLATILE',
  rights_or_consent:'REFERENCE_OK',
  allowed_use:'discovery',
  forbidden_use:'hard-coded capability truth'
});
assert.equal(x.utilization,'VOLATILE_REFERENCE');

console.log('drawing-reference-router: PASS');


const compiled=r.compileForEngine({
  reference_records:[{
    reference_name:'ArchDaily',
    mined_dna:'PLAN_LINE_HIERARCHY',
    design_tokens:{wall_weight:0.40},
    engine_parameters:{wall_lineweight:0.40},
    output_effect:'cut walls dominate projection',
    validation_probe:'PLAN_HIERARCHY_VISIBLE'
  }]
});
assert.equal(compiled.ok,true);
assert.equal(compiled.engine_parameters.wall_lineweight,0.40);
assert.deepEqual(compiled.validation_probes,['PLAN_HIERARCHY_VISIBLE']);
assert.equal(r.validateReferenceEffect({
  compiled:compiled.compiled,
  applied_parameters:['wall_lineweight'],
  passed_probes:['PLAN_HIERARCHY_VISIBLE']
}).ok,true);
assert.equal(r.validateReferenceEffect({
  compiled:compiled.compiled,
  applied_parameters:[],
  passed_probes:[]
}).ok,false);
