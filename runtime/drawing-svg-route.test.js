const assert=require('assert');
const r=require('./drawing-svg-route');

let x=r.select({source_type:'PDF',purpose:'SOURCE_SNAPSHOT'});
assert.equal(x.route_id,'PDF_FULL_SVG');
assert.equal(x.layer_id,'L0_SOURCE');
assert.equal(x.executable,'tools/drawing_pdf_full_svg_exporter.py');

x=r.select({source_type:'VECTOR_PDF',purpose:'GEOMETRY'});
assert.equal(x.route_id,'PDF_GEOMETRY_SVG');
assert.equal(x.layer_id,'L1_GEOMETRY');

x=r.select({source_type:'DXF'});
assert.equal(x.route_id,'DXF_SVG');
assert.equal(x.executable,'tools/drawing_dxf_svg_exporter.py');

x=r.select({source_type:'DWG'});
assert.equal(x.route_id,'DWG_TO_DXF_TO_SVG');
assert.equal(x.next_input,'DXF');
assert.equal(x.executable,null);

assert.equal(r.select({source_type:'PNG'}).route_id,'UNSUPPORTED');

console.log('drawing-svg-route: PASS');
