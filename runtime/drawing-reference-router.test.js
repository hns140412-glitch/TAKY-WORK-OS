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
