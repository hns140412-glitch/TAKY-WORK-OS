const assert=require('assert');
const i=require('./drawing-layer-invalidation');

let r=i.invalidate({changed_layers:['L5_ANNOTATION'],views:['SALE','PUB']});
assert.deepEqual(r.shared,[]);
assert.deepEqual(r.views.SALE,['L5_ANNOTATION','L7_FINAL_OVERLAY_VALIDATION']);
assert(!r.views.SALE.includes('L6_AI_ATMOSPHERE'));

r=i.invalidate({changed_layers:['L2_SEMANTIC'],views:['SALE','PUB']});
assert(r.shared.includes('L2_SEMANTIC'));
assert(r.views.SALE.includes('L3_PRESENTATION'));
assert(r.views.SALE.includes('L6_AI_ATMOSPHERE'));
assert(r.views.PUB.includes('L7_FINAL_OVERLAY_VALIDATION'));

r=i.invalidate({changed_layers:['L0_SOURCE'],views:['A']});
assert(r.shared.includes('L0_SOURCE'));
assert(r.shared.includes('L1_GEOMETRY'));
assert(r.shared.includes('L2_SEMANTIC'));

console.log('drawing-layer-invalidation: PASS');
