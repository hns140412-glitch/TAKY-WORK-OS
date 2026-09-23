(function(root,factory){
  const compiler=(typeof module==='object'&&module.exports)
    ? require('./drawing-reference-compiler')
    : root.TakyDrawingReferenceCompiler;
  const api=factory(compiler);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingReferenceRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(compiler){
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

  function compileForEngine({reference_records=[]}={}){
    if(!compiler || typeof compiler.compile!=='function'){
      return Object.freeze({ok:false,decision:'HOLD',blocks:Object.freeze(['REFERENCE_COMPILER_UNAVAILABLE'])});
    }
    const compiled=compiler.compile(reference_records);
    if(!compiled.ok){
      return Object.freeze({ok:false,decision:'HOLD',blocks:compiled.blocks,effects:compiled.effects});
    }
    const engine_parameters={};
    const validation_probes=[];
    for(const effect of compiled.effects){
      Object.assign(engine_parameters,effect.engine_parameters||{});
      validation_probes.push(effect.validation_probe);
    }
    return Object.freeze({
      ok:true,
      decision:'READY',
      engine_parameters:Object.freeze(engine_parameters),
      validation_probes:Object.freeze(validation_probes),
      compiled
    });
  }

  function validateReferenceEffect({compiled,applied_parameters=[],passed_probes=[]}={}){
    if(!compiler || typeof compiler.validateApplied!=='function'){
      return Object.freeze({ok:false,reason:'REFERENCE_COMPILER_UNAVAILABLE'});
    }
    return compiler.validateApplied(compiled,{applied_parameters,passed_probes});
  }

  return Object.freeze({version:'2.0.0',UTILIZATION,classify,compileForEngine,validateReferenceEffect});
});
