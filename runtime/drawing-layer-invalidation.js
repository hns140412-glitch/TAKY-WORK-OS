(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingInvalidation=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DOWNSTREAM=Object.freeze({
    L0_SOURCE:['L1_GEOMETRY','L2_SEMANTIC','L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE','L7_FINAL_OVERLAY_VALIDATION'],
    L1_GEOMETRY:['L2_SEMANTIC','L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE','L7_FINAL_OVERLAY_VALIDATION'],
    L2_SEMANTIC:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE','L7_FINAL_OVERLAY_VALIDATION'],
    L3_PRESENTATION:['L7_FINAL_OVERLAY_VALIDATION'],
    L4_ENTOURAGE:['L7_FINAL_OVERLAY_VALIDATION'],
    L5_ANNOTATION:['L7_FINAL_OVERLAY_VALIDATION'],
    L6_AI_ATMOSPHERE:['L7_FINAL_OVERLAY_VALIDATION'],
    L7_FINAL_OVERLAY_VALIDATION:[]
  });

  function invalidate({changed_layers=[],views=[]}={}){
    const changed=[...new Set(changed_layers||[])];
    const sharedChanged=changed.some(x=>['L0_SOURCE','L1_GEOMETRY','L2_SEMANTIC'].includes(x));
    const result={shared:[],views:{}};

    if(sharedChanged){
      const all=new Set();
      for(const l of changed){
        all.add(l);
        for(const d of (DOWNSTREAM[l]||[])) all.add(d);
      }
      result.shared=[...all].filter(x=>['L0_SOURCE','L1_GEOMETRY','L2_SEMANTIC'].includes(x));
      for(const view of views){
        result.views[view]=[...all].filter(x=>!['L0_SOURCE','L1_GEOMETRY','L2_SEMANTIC'].includes(x));
      }
      return Object.freeze({reason:'SHARED_UPSTREAM_CHANGED',...result});
    }

    for(const view of views){
      const set=new Set();
      for(const l of changed){
        set.add(l);
        for(const d of (DOWNSTREAM[l]||[])) set.add(d);
      }
      result.views[view]=[...set];
    }
    return Object.freeze({reason:'VIEW_LAYER_CHANGED',...result});
  }

  return Object.freeze({version:'1.0.0',DOWNSTREAM,invalidate});
});
