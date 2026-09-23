(function(root,factory){
  const finalizer=(typeof module==='object'&&module.exports)
    ? require('./drawing-finalization-orchestrator')
    : root.TakyDrawingFinalizer;
  const api=factory(finalizer);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingWorkUnitRunner=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(finalizer){
  'use strict';

  function groupReady({plan,completed=[]}={}){
    const done=new Set(completed||[]);
    if(!plan) return {ok:false,reason:'PLAN_REQUIRED'};

    const ready=[];
    for(const u of (plan.shared_precompute||[])){
      if(done.has(u.work_unit_id)) continue;
      if(u.stage===0) ready.push(u);
      else {
        const prev=(plan.shared_precompute||[]).filter(x=>x.stage<u.stage);
        if(prev.every(x=>done.has(x.work_unit_id))) ready.push(u);
      }
    }

    const sharedDone=(plan.shared_precompute||[]).every(x=>done.has(x.work_unit_id));
    if(sharedDone){
      for(const u of (plan.parallel_view_work||[])){
        if(!done.has(u.work_unit_id)) ready.push(u);
      }
    }

    for(const u of (plan.finalization||[])){
      if(done.has(u.work_unit_id)) continue;
      const deps=u.depends_on||[];
      if(deps.every(x=>done.has(x))) ready.push(u);
    }

    return Object.freeze({
      ok:true,
      ready:Object.freeze(ready),
      parallel_groups:Object.freeze(
        ready.reduce((acc,u)=>{
          const k=u.stage===3?(u.view_id+':PRESENTATION'):'SERIAL';
          (acc[k]||(acc[k]=[])).push(u.work_unit_id);
          return acc;
        },{})
      )
    });
  }

  function executeUserExposure({unit,production_context={}}={}){
    if(!unit || unit.layer_id!=='L8_USER_EXPOSURE_GATE'){
      return Object.freeze({ok:false,decision:'HOLD',reason:'L8_USER_EXPOSURE_UNIT_REQUIRED'});
    }
    if(!finalizer || typeof finalizer.decideUserExposure!=='function'){
      return Object.freeze({ok:false,decision:'HOLD',reason:'FINALIZER_UNAVAILABLE'});
    }
    const result=finalizer.decideUserExposure(production_context);
    return Object.freeze({
      ok:result.ok===true,
      decision:result.decision,
      blocks:result.blocks||Object.freeze([]),
      work_unit_id:unit.work_unit_id,
      invariant:'NO_PASS_NO_SHOW'
    });
  }

  return Object.freeze({version:'2.0.0',groupReady,executeUserExposure});
});
