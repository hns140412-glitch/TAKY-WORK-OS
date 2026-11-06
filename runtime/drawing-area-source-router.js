(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyAreaSourceRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function route({source_type='',vector=false,scale_confirmed=false,dxf_units_known=false}={}){
    const s=String(source_type||'').trim().toUpperCase();

    if(s==='DXF'){
      return Object.freeze({
        status:dxf_units_known?'READY':'BLOCKED',
        route_id:'DXF_BLOCK_AREA',
        executable:'tools/drawing_dxf_block_area_extractor.py',
        blocker:dxf_units_known?null:'DXF_UNITS_UNKNOWN',
        authority:'DIRECT_CAD_PARSE'
      });
    }

    if(s==='DWG'){
      return Object.freeze({
        status:'CONVERSION_REQUIRED',
        route_id:'DWG_TO_DXF_AREA',
        executable:null,
        blocker:'DWG_DECODER_REQUIRED',
        next_input:'DXF',
        authority:'SOURCE_PRESERVED_PENDING_CONVERSION',
        rules:[
          'preserve original DWG',
          'convert without geometry normalization when possible',
          'compare converted DXF extents/entity counts before area extraction'
        ]
      });
    }

    if(s==='PDF' || s==='VECTOR_PDF'){
      if(!vector){
        return Object.freeze({
          status:'BLOCKED',
          route_id:'PDF_AREA',
          executable:null,
          blocker:'VECTOR_BOUNDARY_REQUIRED',
          authority:'SNAPSHOT_ONLY'
        });
      }
      if(!scale_confirmed){
        return Object.freeze({
          status:'BLOCKED',
          route_id:'SCALED_VECTOR_PDF_AREA',
          executable:'tools/drawing_scaled_pdf_area_extractor.py',
          blocker:'SCALE_CONFIRMATION_REQUIRED',
          authority:'DERIVED_VECTOR'
        });
      }
      return Object.freeze({
        status:'READY',
        route_id:'SCALED_VECTOR_PDF_AREA',
        executable:'tools/drawing_scaled_pdf_area_extractor.py',
        blocker:null,
        authority:'DERIVED_VECTOR'
      });
    }

    return Object.freeze({
      status:'UNSUPPORTED',
      route_id:'NONE',
      executable:null,
      blocker:'UNSUPPORTED_SOURCE_TYPE',
      authority:'UNKNOWN'
    });
  }

  return Object.freeze({version:'1.0.0',route});
});
