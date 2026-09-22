(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingMaskGateBridge=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function toGateMasks({manifest={},source_line=null}={}){
    const out=[];
    if(source_line){
      out.push({
        mask_id:'SOURCE_LINE',
        validation_state:String(source_line.validation_state||'SOURCE_DERIVED').toUpperCase(),
        source_trace:source_line.source_trace||source_line.artifact_uri||true
      });
    }

    for(const summary of (manifest.mask_summaries||[])){
      out.push({
        mask_id:String(summary.mask_id||'').toUpperCase(),
        validation_state:String(summary.validation_state||'UNVERIFIED').toUpperCase(),
        semantic_state:String(summary.validation_state||'UNVERIFIED').toUpperCase(),
        source_trace:summary.source_trace||null,
        record_count:summary.record_count||0,
        presentation_only:summary.presentation_only===true
      });
    }
    return Object.freeze(out);
  }

  return Object.freeze({version:'1.0.0',toGateMasks});
});
