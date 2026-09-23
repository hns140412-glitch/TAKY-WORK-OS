(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyGeometrySourceRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function route({source_type='',vector=false}={}){
    const s=String(source_type||'').trim().toUpperCase();
    if(s==='DXF'){
      return Object.freeze({
        status:'READY',
        route_id:'DXF_GEOMETRY_PRIMITIVES',
        executable:'tools/drawing_geometry_primitive_adapter.py',
        args:['--type','DXF'],
        authority:'AUTHORITATIVE_VECTOR',
        semantic_inference:false
      });
    }
    if(s==='PDF'||s==='VECTOR_PDF'){
      if(!vector) return Object.freeze({
        status:'BLOCKED',
        route_id:'PDF_GEOMETRY_PRIMITIVES',
        blocker:'VECTOR_GEOMETRY_REQUIRED',
        authority:'RASTER_REFERENCE'
      });
      return Object.freeze({
        status:'READY',
        route_id:'PDF_GEOMETRY_PRIMITIVES',
        executable:'tools/drawing_geometry_primitive_adapter.py',
        args:['--type','PDF'],
        authority:'DERIVED_VECTOR',
        semantic_inference:false
      });
    }
    if(s==='DWG'){
      return Object.freeze({
        status:'CONVERSION_REQUIRED',
        route_id:'DWG_TO_DXF_GEOMETRY',
        blocker:'DWG_DECODER_REQUIRED',
        next_input:'DXF',
        authority:'SOURCE_PRESERVED_PENDING_CONVERSION',
        semantic_inference:false
      });
    }
    return Object.freeze({status:'UNSUPPORTED',route_id:'NONE',blocker:'UNSUPPORTED_SOURCE_TYPE'});
  }

  return Object.freeze({version:'1.0.0',route});
});
