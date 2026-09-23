(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingHtmlExporter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function exportHtml({svg,title='TAKY A3 Drawing'}={}){
    if(!svg||!String(svg).includes('<svg')) return {ok:false,reason:'A3_SVG_REQUIRED'};
    const safeTitle=String(title).replace(/[<>&]/g,'');
    const html='<!doctype html><html><head><meta charset="utf-8">'+
      '<meta name="viewport" content="width=device-width,initial-scale=1">'+
      '<title>'+safeTitle+'</title><style>'+
      'html,body{margin:0;background:#d8d4cc}body{display:flex;justify-content:center}'+
      '.sheet{width:420mm;height:297mm;background:white}svg{display:block;width:100%;height:100%}'+
      '@page{size:A3 landscape;margin:0}@media print{html,body{background:white}.sheet{margin:0}}'+
      '</style></head><body><main class="sheet">'+svg+'</main></body></html>';
    return Object.freeze({ok:true,html,route:'A3_SVG_BOARD_STATE -> HTML'});
  }
  return Object.freeze({version:'1.0.0',exportHtml});
});