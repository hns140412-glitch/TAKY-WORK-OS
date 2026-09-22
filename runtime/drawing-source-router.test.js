const assert=require('assert');
const r=require('./drawing-source-router');

let x=r.classifySource({file_name:'a.dxf',declared_authoritative:true,authority_evidence:'issued-cad'});
assert.equal(x.source_type,'DXF');
assert.equal(x.source_authority,'AUTHORITATIVE_VECTOR');
assert.equal(x.authority_scope,'GEOMETRY');
assert.equal(x.geometry_status,'DIRECT');
assert.equal(r.canClaimAuthoritativeGeometry(x),true);

x=r.classifySource({file_name:'a.dxf'});
assert.equal(x.source_authority,'DERIVED_VECTOR');
assert.equal(r.canClaimAuthoritativeGeometry(x),false);

x=r.classifySource({file_name:'a.dwg',declared_authoritative:true,authority_evidence:'native-dwg'});
assert.equal(x.adapter,'ODA_TO_DXF_THEN_EZDXF');
assert.equal(x.authority_scope,'SOURCE_FILE');
assert.equal(x.geometry_status,'CONVERSION_REQUIRED');
assert.equal(r.canClaimAuthoritativeGeometry(x),false);

x=r.classifySource({file_name:'a.pdf',pdf_has_vector:true,declared_authoritative:true,authority_evidence:'issued-drawing'});
assert.equal(x.adapter,'PYMUPDF_VECTOR');
assert.equal(x.source_authority,'DERIVED_VECTOR');
assert.equal(x.authority_scope,'ISSUED_SNAPSHOT');
assert.equal(x.geometry_status,'SNAPSHOT_VECTOR');
assert.equal(r.canClaimAuthoritativeGeometry(x),false);
assert.equal(r.canUseAsIssuedSnapshot(x),true);

x=r.classifySource({file_name:'a.pdf',pdf_has_vector:false});
assert.equal(x.source_type,'RASTER_PDF');
assert.equal(x.geometry_status,'RASTER_SNAPSHOT');

x=r.classifySource({file_name:'a.png'});
assert.equal(x.source_authority,'RASTER_REFERENCE');
assert.equal(r.canClaimAuthoritativeGeometry(x),false);

console.log('drawing-source-router: PASS');
