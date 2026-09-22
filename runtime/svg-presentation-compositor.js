(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakySvgPresentationCompositor=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').trim();

  function composeSvg({width=1000,height=1000,viewBox=null,background=null,presentation_layers=[],source_linework=''}={}){
    const source=clean(source_linework);
    if(!source) return {ok:false,reason:'SOURCE_LINEWORK_REQUIRED'};
    if(!Array.isArray(presentation_layers)) return {ok:false,reason:'PRESENTATION_LAYERS_NOT_ARRAY'};
    const vb=clean(viewBox)||`0 0 ${Number(width)||1000} ${Number(height)||1000}`;
    const bg=background?`<g id="background-pass">${background}</g>`:'';
    const layers=presentation_layers.map((layer,i)=>{
      const id=clean(layer?.id)||`presentation-${i+1}`;
      const content=clean(layer?.content);
      return `<g id="${id}" data-presentation-only="true">${content}</g>`;
    }).join('');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb}">${bg}<g id="presentation-pass">${layers}</g><g id="source-linework-final" data-authority="source">${source}</g></svg>`;
    return {ok:true,svg,source_overlay_last:svg.lastIndexOf('source-linework-final')>svg.lastIndexOf('presentation-pass')};
  }

  return Object.freeze({version:'1.0.0',composeSvg});
});
