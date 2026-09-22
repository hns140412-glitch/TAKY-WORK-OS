(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakySvgPresentationCompositor=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clean=v=>String(v??'').trim();
  const safeId=v=>{
    const s=clean(v);
    return /^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(s)?s:null;
  };

  function safeFragment(value){
    const s=clean(value);
    if(!s) return true;
    const unsafe=/<\s*(script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|javascript\s*:|https?:\/\//i;
    return !unsafe.test(s);
  }

  function normalizeLayer(layer,index){
    const layerId=clean(layer?.layer_id||'L3_PRESENTATION').toUpperCase();
    const id=safeId(layer?.id)||('layer-'+(index+1));
    const content=clean(layer?.content);
    const opacity=Number.isFinite(Number(layer?.opacity))?Math.max(0,Math.min(1,Number(layer.opacity))):1;
    const blend=clean(layer?.blend_mode||'normal').toLowerCase();
    const allowedBlend=new Set(['normal','multiply','screen','overlay','darken','lighten']);
    return {
      layer_id:layerId,
      id,
      content,
      opacity,
      blend_mode:allowedBlend.has(blend)?blend:'normal'
    };
  }

  function _shell({width,height,viewBox,body}){
    const vb=clean(viewBox)||`0 0 ${Number(width)||1000} ${Number(height)||1000}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb}">${body}</svg>`;
  }

  function composeSvg({width=1000,height=1000,viewBox=null,background=null,presentation_layers=[],source_linework=''}={}){
    return composeLayeredSvg({
      width,height,viewBox,background,
      layer_outputs:presentation_layers.map((x,i)=>({
        layer_id:'L3_PRESENTATION',
        id:x?.id||('presentation-'+(i+1)),
        content:x?.content,
        opacity:x?.opacity,
        blend_mode:x?.blend_mode
      })),
      source_linework
    });
  }

  function composeLayeredSvg({
    width=1000,
    height=1000,
    viewBox=null,
    background=null,
    layer_outputs=[],
    source_linework='',
    source_snapshot_fragment=null
  }={}){
    const source=clean(source_linework);
    if(!source) return {ok:false,reason:'SOURCE_LINEWORK_REQUIRED'};
    if(!Array.isArray(layer_outputs)) return {ok:false,reason:'LAYER_OUTPUTS_NOT_ARRAY'};

    const normalized=layer_outputs.map(normalizeLayer);
    const accepted=new Set(['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE']);
    const invalid=normalized.filter(x=>!accepted.has(x.layer_id));
    if(invalid.length) return {ok:false,reason:'INVALID_LAYER_ID',layers:invalid.map(x=>x.layer_id)};

    const fragments=[source,background,source_snapshot_fragment,...normalized.map(x=>x.content)];
    if(fragments.some(x=>!safeFragment(x))) return {ok:false,reason:'UNSAFE_SVG_FRAGMENT'};

    const order=['L3_PRESENTATION','L4_ENTOURAGE','L6_AI_ATMOSPHERE','L5_ANNOTATION'];
    const groups=[];
    if(background) groups.push(`<g id="background-pass">${background}</g>`);

    for(const layerId of order){
      const members=normalized.filter(x=>x.layer_id===layerId);
      if(!members.length) continue;
      const children=members.map(x=>
        `<g id="${x.id}" data-layer-id="${x.layer_id}" data-presentation-only="true" opacity="${x.opacity}" style="mix-blend-mode:${x.blend_mode}">${x.content}</g>`
      ).join('');
      groups.push(`<g id="${layerId.toLowerCase()}" data-work-layer="${layerId}">${children}</g>`);
    }

    if(source_snapshot_fragment){
      groups.push(`<g id="source-snapshot-support" data-authority="source-snapshot" style="mix-blend-mode:multiply">${source_snapshot_fragment}</g>`);
    }

    groups.push(`<g id="source-linework-final" data-authority="source">${source}</g>`);
    const svg=_shell({width,height,viewBox,body:groups.join('')});

    const sourceIndex=svg.lastIndexOf('source-linework-final');
    const presentationIndex=Math.max(
      svg.lastIndexOf('l3_presentation'),
      svg.lastIndexOf('l4_entourage'),
      svg.lastIndexOf('l5_annotation'),
      svg.lastIndexOf('l6_ai_atmosphere')
    );

    return Object.freeze({
      ok:true,
      svg,
      source_overlay_last:sourceIndex>presentationIndex,
      layer_order:Object.freeze(order.filter(id=>normalized.some(x=>x.layer_id===id))),
      work_layer_count:new Set(normalized.map(x=>x.layer_id)).size,
      artifact_count:normalized.length,
      l7_inputs:Object.freeze({
        has_source_line:true,
        has_source_snapshot:Boolean(source_snapshot_fragment),
        presentation_layers:Object.freeze([...new Set(normalized.map(x=>x.layer_id))])
      })
    });
  }

  return Object.freeze({
    version:'2.0.0',
    safeFragment,
    composeSvg,
    composeLayeredSvg
  });
});
