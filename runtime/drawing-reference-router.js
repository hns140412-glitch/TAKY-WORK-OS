(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const UTILIZATION=Object.freeze([
    'DIRECT_RUNTIME_DATA',
    'ENGINE_REFERENCE_DATA',
    'EVALUATION_FIXTURE',
    'RECIPE_DIAGNOSTIC_PATTERN',
    'VOLATILE_REFERENCE',
    'ARCHIVE_ONLY'
  ]);

  function clean(v){ return String(v??'').trim(); }

  function classify(record={}){
    const sourceClass=clean(record.source_class).toUpperCase();
    const dataType=clean(record.data_type).toUpperCase();
    const validation=clean(record.validation_state).toUpperCase();
    const freshness=clean(record.freshness_class).toUpperCase();
    const rights=clean(record.rights_or_consent).toUpperCase();

    const blocks=[];
    if(!clean(record.source_pointer)) blocks.push('SOURCE_POINTER_REQUIRED');
    if(!clean(record.engine_owner)) blocks.push('ENGINE_OWNER_REQUIRED');
    if(!clean(record.allowed_use)) blocks.push('ALLOWED_USE_REQUIRED');
    if(!clean(record.forbidden_use)) blocks.push('FORBIDDEN_USE_REQUIRED');
    if(!validation) blocks.push('VALIDATION_STATE_REQUIRED');

    let utilization='ENGINE_REFERENCE_DATA';
    if(sourceClass==='RAW/PRESERVED' && validation==='VERIFIED' && dataType==='DETERMINISTIC_RUNTIME_DATA'){
      utilization='DIRECT_RUNTIME_DATA';
    } else if(freshness==='VOLATILE' || dataType==='CAPABILITY_CLAIM'){
      utilization='VOLATILE_REFERENCE';
    } else if(dataType==='EVALUATION_CASE' || dataType==='REGRESSION_CASE'){
      utilization='EVALUATION_FIXTURE';
    } else if(['RECIPE','WORKFLOW','FAILURE_SIGNATURE','PROMPT_PATTERN'].includes(dataType)){
      utilization='RECIPE_DIAGNOSTIC_PATTERN';
    } else if(validation==='REJECTED' || dataType==='DUPLICATE_NO_UNIQUE_VALUE'){
      utilization='ARCHIVE_ONLY';
    }

    const runtimeReady =
      utilization==='DIRECT_RUNTIME_DATA' &&
      blocks.length===0 &&
      !['UNKNOWN','UNVERIFIED','RESTRICTED'].includes(rights);

    return Object.freeze({
      utilization,
      runtime_ready:runtimeReady,
      blocks:Object.freeze(blocks)
    });
  }

  return Object.freeze({version:'1.0.0',UTILIZATION,classify});
});
