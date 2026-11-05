(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSourceRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();

  function ext(name){
    const n=clean(name).toLowerCase();
    const i=n.lastIndexOf('.');
    return i>=0?n.slice(i+1):'';
  }

  function classifySource({
    file_name='',
    mime_type='',
    pdf_has_vector=null,
    declared_authoritative=false,
    authority_evidence=null
  }={}){
    const e=ext(file_name);
    const m=clean(mime_type).toLowerCase();
    const authorityConfirmed=declared_authoritative && Boolean(clean(authority_evidence));

    let source_type='UNKNOWN';
    let adapter='MANUAL_REVIEW';
    let source_authority='RASTER_REFERENCE';
    let authority_scope='REFERENCE';
    let geometry_status='DERIVED';
    const notes=[];

    if(e==='dxf' || m==='application/dxf' || m==='image/vnd.dxf'){
      source_type='DXF';
      adapter='EZDXF';
      geometry_status='DIRECT';
      if(authorityConfirmed){
        source_authority='AUTHORITATIVE_VECTOR';
        authority_scope='GEOMETRY';
      }else{
        source_authority='DERIVED_VECTOR';
        authority_scope='REFERENCE';
      }
    } else if(e==='dwg' || m==='application/acad' || m==='application/x-acad' || m==='application/autocad_dwg'){
      source_type='DWG';
      adapter='ODA_TO_DXF_THEN_EZDXF';
      geometry_status='CONVERSION_REQUIRED';
      source_authority=authorityConfirmed?'AUTHORITATIVE_VECTOR':'DERIVED_VECTOR';
      authority_scope=authorityConfirmed?'SOURCE_FILE':'REFERENCE';
      notes.push('DWG may be the authoritative source file, but extracted geometry remains unavailable until conversion provenance and geometry parity are verified.');
    } else if(e==='pdf' || m==='application/pdf'){
      if(pdf_has_vector===true){
        source_type='VECTOR_PDF';
        adapter='PYMUPDF_VECTOR';
        geometry_status='SNAPSHOT_VECTOR';
        source_authority='DERIVED_VECTOR';
        authority_scope=authorityConfirmed?'ISSUED_SNAPSHOT':'REFERENCE';
        notes.push('Vector PDF is a drawing snapshot, not CAD geometry authority. Use for preservation, overlay, visual regression and derived vector evidence.');
      } else if(pdf_has_vector===false){
        source_type='RASTER_PDF';
        adapter='PDF_RASTER_TO_VISION';
        geometry_status='RASTER_SNAPSHOT';
        source_authority='RASTER_REFERENCE';
        authority_scope=authorityConfirmed?'ISSUED_SNAPSHOT':'REFERENCE';
      } else {
        source_type='PDF_UNRESOLVED';
        adapter='PDF_VECTOR_PROBE';
        geometry_status='UNRESOLVED';
        source_authority='RASTER_REFERENCE';
        authority_scope=authorityConfirmed?'ISSUED_SNAPSHOT':'REFERENCE';
        notes.push('Probe vector content before choosing extraction path.');
      }
    } else if(['png','jpg','jpeg','webp','heic','heif'].includes(e) || /^image\//.test(m)){
      source_type='RASTER_IMAGE';
      adapter='VISION_DERIVED';
      geometry_status='RASTER_REFERENCE';
      source_authority='RASTER_REFERENCE';
      authority_scope='REFERENCE';
    }

    if(declared_authoritative && !authorityConfirmed){
      notes.push('Authoritative status was requested but no authority evidence was supplied.');
    }

    return Object.freeze({
      source_type,
      adapter,
      source_authority,
      authority_scope,
      geometry_status,
      notes:Object.freeze(notes)
    });
  }

  function canClaimAuthoritativeGeometry(route){
    return route?.source_authority==='AUTHORITATIVE_VECTOR' &&
      route?.authority_scope==='GEOMETRY' &&
      route?.geometry_status==='DIRECT';
  }

  function canUseAsIssuedSnapshot(route){
    return route?.authority_scope==='ISSUED_SNAPSHOT';
  }

  return Object.freeze({
    version:'1.2.0',
    classifySource,
    canClaimAuthoritativeGeometry,
    canUseAsIssuedSnapshot
  });
});
