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

  function classifySource({file_name='',mime_type='',pdf_has_vector=null,declared_authoritative=false}={}){
    const e=ext(file_name);
    const m=clean(mime_type).toLowerCase();
    let source_type='UNKNOWN';
    let adapter='MANUAL_REVIEW';
    let default_authority='RASTER_REFERENCE';
    let notes=[];

    if(e==='dxf' || m==='application/dxf' || m==='image/vnd.dxf'){
      source_type='DXF';
      adapter='EZDXF';
      default_authority=declared_authoritative?'AUTHORITATIVE_VECTOR':'DERIVED_VECTOR';
    } else if(e==='dwg' || m==='application/acad' || m==='application/x-acad' || m==='application/autocad_dwg'){
      source_type='DWG';
      adapter='ODA_TO_DXF_THEN_EZDXF';
      default_authority=declared_authoritative?'AUTHORITATIVE_VECTOR':'DERIVED_VECTOR';
      notes.push('DWG requires conversion adapter; conversion must preserve provenance.');
    } else if(e==='pdf' || m==='application/pdf'){
      if(pdf_has_vector===true){
        source_type='VECTOR_PDF';
        adapter='PYMUPDF_VECTOR';
        default_authority=declared_authoritative?'AUTHORITATIVE_VECTOR':'DERIVED_VECTOR';
      } else if(pdf_has_vector===false){
        source_type='RASTER_PDF';
        adapter='PDF_RASTER_TO_VISION';
        default_authority='RASTER_REFERENCE';
      } else {
        source_type='PDF_UNRESOLVED';
        adapter='PDF_VECTOR_PROBE';
        default_authority='RASTER_REFERENCE';
        notes.push('Probe vector content before choosing extraction path.');
      }
    } else if(['png','jpg','jpeg','webp','heic','heif'].includes(e) || /^image\//.test(m)){
      source_type='RASTER_IMAGE';
      adapter='VISION_DERIVED';
      default_authority='RASTER_REFERENCE';
    }

    return Object.freeze({source_type,adapter,source_authority:default_authority,notes:Object.freeze(notes)});
  }

  function canClaimAuthoritativeGeometry(route){
    return route?.source_authority==='AUTHORITATIVE_VECTOR';
  }

  return Object.freeze({version:'1.0.0',classifySource,canClaimAuthoritativeGeometry});
});
