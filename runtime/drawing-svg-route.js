(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSvgRoute=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function select({source_type='',purpose=''}={}){
    const s=String(source_type).trim().toUpperCase();
    const p=String(purpose).trim().toUpperCase();

    if(s==='PDF' || s==='VECTOR_PDF'){
      if(['SOURCE_SNAPSHOT','REVIEW','VISUAL_PRESERVATION'].includes(p)){
        return Object.freeze({
          route_id:'PDF_FULL_SVG',
          layer_id:'L0_SOURCE',
          authority:'ISSUED_SNAPSHOT',
          executable:'tools/drawing_pdf_full_svg_exporter.py'
        });
      }
      return Object.freeze({
        route_id:'PDF_GEOMETRY_SVG',
        layer_id:'L1_GEOMETRY',
        authority:'SOURCE_DERIVED',
        executable:'tools/drawing_pdf_svg_exporter.py'
      });
    }

    if(s==='DXF'){
      return Object.freeze({
        route_id:'DXF_SVG',
        layer_id:'L1_GEOMETRY',
        authority:'CAD_DERIVED_VIEW',
        executable:'tools/drawing_dxf_svg_exporter.py'
      });
    }

    if(s==='DWG'){
      return Object.freeze({
        route_id:'DWG_TO_DXF_TO_SVG',
        layer_id:'L0_SOURCE',
        authority:'CONVERSION_REQUIRED',
        executable:null,
        next_input:'DXF'
      });
    }

    return Object.freeze({
      route_id:'UNSUPPORTED',
      layer_id:null,
      authority:'UNKNOWN',
      executable:null
    });
  }

  return Object.freeze({version:'1.0.0',select});
});
