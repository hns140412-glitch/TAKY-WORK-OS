(function(root,factory){
  let gate,orch;
  if(typeof module==='object'&&module.exports){
    gate=require('./drawing-sales-mask-gate');
    orch=require('./drawing-layer-orchestrator');
    module.exports=factory(gate,orch);
  }else{
    root.TakyDrawingViewAdmission=Object.freeze(factory(root.TakyDrawingSalesMaskGate,root.TakyDrawingLayerOrchestrator));
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(gate,orch){
  'use strict';

  function maskNames(records=[]){
    return [...new Set((records||[]).map(x=>String(x?.mask_id||'').toUpperCase()).filter(Boolean))];
  }

  function admitAndPlan({view_id='VIEW',requested_profile='PUBLICATION',mask_records=[],user_intent={}}={}){
    if(!gate||!orch) return {ok:false,reason:'DEPENDENCY_REQUIRED'};
    const admission=gate.route({requested_profile,masks:mask_records,user_intent});
    const available=maskNames(mask_records);
    const plan=orch.buildSingleViewPlan({
      view_id,
      profile:admission.profile,
      available_masks:available
    });
    return Object.freeze({
      ok:plan.ok,
      requested_profile:String(requested_profile).toUpperCase(),
      effective_profile:admission.profile,
      admission_status:admission.status,
      gate:admission.gate,
      plan
    });
  }

  function admitFanout({source_key='SOURCE',views=[],default_masks=[]}={}){
    if(!gate||!orch) return {ok:false,reason:'DEPENDENCY_REQUIRED'};
    const admitted=views.map((v,index)=>{
      const records=v.mask_records||default_masks;
      const a=gate.route({
        requested_profile:v.profile,
        masks:records,
        user_intent:v.user_intent||{}
      });
      return {
        view_id:v.view_id||('VIEW-'+(index+1)),
        requested_profile:String(v.profile||'PUBLICATION').toUpperCase(),
        profile:a.profile,
        admission_status:a.status,
        gate:a.gate,
        available_masks:maskNames(records)
      };
    });

    const plan=orch.buildFanoutPlan({
      source_key,
      views:admitted.map(x=>({
        view_id:x.view_id,
        profile:x.profile,
        available_masks:x.available_masks
      }))
    });

    return Object.freeze({
      ok:plan.ok,
      source_key,
      admissions:Object.freeze(admitted),
      plan
    });
  }

  return Object.freeze({version:'1.0.0',admitAndPlan,admitFanout});
});
