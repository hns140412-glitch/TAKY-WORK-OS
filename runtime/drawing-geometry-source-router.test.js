const assert=require('assert');
const r=require('./drawing-geometry-source-router');

let x=r.route({source_type:'DXF'});
assert.equal(x.status,'READY');
assert.equal(x.authority,'AUTHORITATIVE_VECTOR');

x=r.route({source_type:'PDF',vector:true});
assert.equal(x.status,'READY');
assert.equal(x.authority,'DERIVED_VECTOR');

x=r.route({source_type:'PDF',vector:false});
assert.equal(x.status,'BLOCKED');

x=r.route({source_type:'DWG'});
assert.equal(x.status,'CONDITIONAL_READY');
assert.equal(x.decoder,'GNU_LIBREDWG_DWGREAD');
assert.equal(x.blocker_if_unavailable,'LIBREDWG_DWGREAD_RUNTIME_REQUIRED');
assert.equal(x.authority,'DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE');
assert.equal(x.production_claimable,false);
assert.equal(x.semantic_inference,false);

console.log('drawing-geometry-source-router: PASS');
