const assert=require('assert');
const r=require('./drawing-area-source-router');

let x=r.route({source_type:'DXF',dxf_units_known:true});
assert.equal(x.status,'READY');
assert.equal(x.route_id,'DXF_BLOCK_AREA');

x=r.route({source_type:'DXF',dxf_units_known:false});
assert.equal(x.status,'BLOCKED');
assert.equal(x.blocker,'DXF_UNITS_UNKNOWN');

x=r.route({source_type:'DWG'});
assert.equal(x.status,'CONVERSION_REQUIRED');
assert.equal(x.next_input,'DXF');

x=r.route({source_type:'PDF',vector:true,scale_confirmed:false});
assert.equal(x.status,'BLOCKED');
assert.equal(x.blocker,'SCALE_CONFIRMATION_REQUIRED');

x=r.route({source_type:'PDF',vector:true,scale_confirmed:true});
assert.equal(x.status,'READY');

x=r.route({source_type:'PDF',vector:false,scale_confirmed:true});
assert.equal(x.status,'BLOCKED');
assert.equal(x.blocker,'VECTOR_BOUNDARY_REQUIRED');

console.log('drawing-area-source-router: PASS');
