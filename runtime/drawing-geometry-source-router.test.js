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
assert.equal(x.status,'CONVERSION_REQUIRED');
assert.equal(x.next_input,'DXF');

console.log('drawing-geometry-source-router: PASS');
