(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingExecutionReceipt=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const up=v=>String(v??'').trim().toUpperCase();
  const clean=v=>String(v??'').trim();
  const REQUIRED=Object.freeze([
    'receipt_type','route','engine_id','engine_version','engine_commit_sha',
    'source_digest','artifact_digest','validation_bundle_id','operation_ids'
  ]);
  const ROUTE='TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE';
  function validate(receipt={}){
    const blocks=[];
    for(const k of REQUIRED){
      const v=receipt[k];
      if(Array.isArray(v)){ if(v.length===0) blocks.push('RECEIPT_FIELD_REQUIRED:'+k); }
      else if(!clean(v)) blocks.push('RECEIPT_FIELD_REQUIRED:'+k);
    }
    if(up(receipt.receipt_type)!=='AUTHORIZED_ENGINE_EXECUTION') blocks.push('INVALID_RECEIPT_TYPE');
    if(up(receipt.route).replace(/\s+/g,'')!==ROUTE) blocks.push('INVALID_EXECUTION_ROUTE');
    if(up(receipt.engine_id)!=='DRAWING_ENGINE_V2') blocks.push('UNAUTHORIZED_ENGINE_ID');
    if((receipt.operation_ids||[]).some(x=>!clean(x))) blocks.push('INVALID_OPERATION_ID');
    return Object.freeze({
      ok:blocks.length===0,
      blocks:Object.freeze(blocks),
      normalized:Object.freeze({
        receipt_type:up(receipt.receipt_type),
        route:up(receipt.route).replace(/\s+/g,''),
        engine_id:up(receipt.engine_id),
        engine_version:clean(receipt.engine_version),
        engine_commit_sha:clean(receipt.engine_commit_sha),
        source_digest:clean(receipt.source_digest),
        artifact_digest:clean(receipt.artifact_digest),
        validation_bundle_id:clean(receipt.validation_bundle_id),
        operation_ids:Object.freeze([...(receipt.operation_ids||[]).map(clean)])
      })
    });
  }
  return Object.freeze({version:'1.0.0',REQUIRED,ROUTE,validate});
});
