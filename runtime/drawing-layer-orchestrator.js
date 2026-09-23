(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingLayerOrchestrator=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const LAYERS=Object.freeze({
    L0_SOURCE:{
      layer_id:'L0_SOURCE',
      role:'immutable source / authority',
      depends_on:[],
      mutation:'FORBIDDEN',
      parallel:false
    },
    L1_GEOMETRY:{
      layer_id:'L1_GEOMETRY',
      role:'source-derived geometry',
      depends_on:['L0_SOURCE'],
      mutation:'FORBIDDEN_IN_PRESENTATION_TASK',
      parallel:false
    },
    L2_SEMANTIC:{
      layer_id:'L2_SEMANTIC',
      role:'verified semantic candidates / UNKNOWN',
      depends_on:['L1_GEOMETRY'],
      mutation:'RULE_BOUND_ONLY',
      parallel:false
    },
    L3_PRESENTATION:{
      layer_id:'L3_PRESENTATION',
      role:'poche / color / material / texture / shadow',
      depends_on:['L2_SEMANTIC'],
      mutation:'PRESENTATION_ONLY',
      parallel:true
    },
    L4_ENTOURAGE:{
      layer_id:'L4_ENTOURAGE',
      role:'furniture / people / planting / vehicles',
      depends_on:['L2_SEMANTIC'],
      mutation:'PRESENTATION_ONLY',
      parallel:true
    },
    L5_ANNOTATION:{
      layer_id:'L5_ANNOTATION',
      role:'room names / dimensions / levels / notes',
      depends_on:['L2_SEMANTIC'],
      mutation:'TRACEABLE_CONTENT_ONLY',
      parallel:true
    },
    L6_AI_ATMOSPHERE:{
      layer_id:'L6_AI_ATMOSPHERE',
      role:'light / atmosphere / micro-texture',
      depends_on:['L2_SEMANTIC'],
      mutation:'PRESENTATION_ONLY',
      parallel:true
    },
    L7_FINAL_OVERLAY_VALIDATION:{
      layer_id:'L7_FINAL_OVERLAY_VALIDATION',
      role:'composite / source overlay / regression / user-intent validation',
      depends_on:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE'],
      mutation:'NO_GEOMETRY_MUTATION',
      parallel:false
    },
    L8_USER_EXPOSURE_GATE:{
      layer_id:'L8_USER_EXPOSURE_GATE',
      role:'production authority / no-pass-no-show admission',
      depends_on:['L7_FINAL_OVERLAY_VALIDATION'],
      mutation:'NO_ARTIFACT_MUTATION',
      parallel:false
    }
  });

  const PROFILE_LAYERS=Object.freeze({
    SALES_PLAN:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE'],
    SALES_CLEAN:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION'],
    SALES_TEXTURED:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE'],
    SECTION_PRESENTATION:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION','L6_AI_ATMOSPHERE'],
    PUBLICATION:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION'],
    SITE_PRESENTATION:['L3_PRESENTATION','L4_ENTOURAGE','L5_ANNOTATION'],
    TECHNICAL_CLEAN:['L3_PRESENTATION','L5_ANNOTATION'],
    A3_REPORT:['L3_PRESENTATION','L5_ANNOTATION'],
    CG_HANDOFF:['L3_PRESENTATION','L5_ANNOTATION','L6_AI_ATMOSPHERE'],
    SECTION_PERSPECTIVE:['L3_PRESENTATION','L4_ENTOURAGE','L6_AI_ATMOSPHERE'],
    ISOMETRIC_CUTAWAY:['L3_PRESENTATION','L4_ENTOURAGE','L6_AI_ATMOSPHERE']
  });

  const PROFILE_MASKS=Object.freeze({
    SALES_PLAN:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION'],
    SALES_CLEAN:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION'],
    SALES_TEXTURED:['SOURCE_LINE','ROOM_MATERIAL','FURNITURE','ANNOTATION'],
    SECTION_PRESENTATION:['SOURCE_LINE','ANNOTATION'],
    PUBLICATION:['SOURCE_LINE'],
    SITE_PRESENTATION:['SOURCE_LINE'],
    TECHNICAL_CLEAN:['SOURCE_LINE'],
    A3_REPORT:['SOURCE_LINE'],
    CG_HANDOFF:['SOURCE_LINE'],
    SECTION_PERSPECTIVE:['SOURCE_LINE','INTERIOR_FURNITURE','SECTION_CUT'],
    ISOMETRIC_CUTAWAY:['SOURCE_LINE','INTERIOR_FURNITURE','SECTION_CUT']
  });

  const clean=v=>String(v??'').trim().toUpperCase();

  function unique(values){
    return [...new Set(values)];
  }

  function buildSingleViewPlan({view_id='VIEW-1',profile='PUBLICATION',available_masks=[]}={}){
    const p=clean(profile);
    const selected=PROFILE_LAYERS[p];
    if(!selected) return {ok:false,reason:'UNKNOWN_PROFILE',profile:p};

    const masks=new Set((available_masks||[]).map(clean));
    const requiredMasks=PROFILE_MASKS[p]||[];
    const missingMasks=requiredMasks.filter(x=>!masks.has(x));

    const workUnits=[
      {work_unit_id:view_id+':L0',view_id,layer_id:'L0_SOURCE',stage:0,parallel_group:null},
      {work_unit_id:view_id+':L1',view_id,layer_id:'L1_GEOMETRY',stage:1,parallel_group:null},
      {work_unit_id:view_id+':L2',view_id,layer_id:'L2_SEMANTIC',stage:2,parallel_group:null},
      ...selected.map(layer_id=>({
        work_unit_id:view_id+':'+layer_id,
        view_id,
        layer_id,
        stage:3,
        parallel_group:view_id+':PRESENTATION'
      })),
      {work_unit_id:view_id+':L7',view_id,layer_id:'L7_FINAL_OVERLAY_VALIDATION',stage:4,parallel_group:null},
      {work_unit_id:view_id+':L8',view_id,layer_id:'L8_USER_EXPOSURE_GATE',stage:5,parallel_group:null,depends_on:[view_id+':L7']}
    ];

    return Object.freeze({
      ok:missingMasks.length===0,
      status:missingMasks.length?'BLOCKED_MISSING_MASKS':'READY',
      view_id,
      profile:p,
      required_masks:Object.freeze([...requiredMasks]),
      missing_masks:Object.freeze(missingMasks),
      work_units:Object.freeze(workUnits),
      stages:Object.freeze([
        Object.freeze({stage:0,mode:'SERIAL',layers:Object.freeze(['L0_SOURCE'])}),
        Object.freeze({stage:1,mode:'SERIAL',layers:Object.freeze(['L1_GEOMETRY'])}),
        Object.freeze({stage:2,mode:'SERIAL',layers:Object.freeze(['L2_SEMANTIC'])}),
        Object.freeze({stage:3,mode:'PARALLEL',layers:Object.freeze([...selected])}),
        Object.freeze({stage:4,mode:'SERIAL',layers:Object.freeze(['L7_FINAL_OVERLAY_VALIDATION'])}),
        Object.freeze({stage:5,mode:'SERIAL',layers:Object.freeze(['L8_USER_EXPOSURE_GATE'])})
      ])
    });
  }

  function buildFanoutPlan({source_key='SOURCE',views=[],available_masks=[]}={}){
    if(!Array.isArray(views)||views.length===0) return {ok:false,reason:'VIEWS_REQUIRED'};

    const viewPlans=views.map((view,index)=>buildSingleViewPlan({
      view_id:view.view_id||('VIEW-'+(index+1)),
      profile:view.profile,
      available_masks:view.available_masks||available_masks
    }));

    const bad=viewPlans.filter(x=>!x.ok);
    const shared=[
      {work_unit_id:source_key+':L0',scope:'SHARED',layer_id:'L0_SOURCE',stage:0},
      {work_unit_id:source_key+':L1',scope:'SHARED',layer_id:'L1_GEOMETRY',stage:1},
      {work_unit_id:source_key+':L2',scope:'SHARED',layer_id:'L2_SEMANTIC',stage:2}
    ];

    const parallel=[];
    for(const plan of viewPlans){
      if(!plan.work_units) continue;
      for(const unit of plan.work_units.filter(x=>x.stage===3)){
        parallel.push({...unit,stage:3});
      }
    }

    const finalize=[];
    for(const plan of viewPlans){
      const l7=plan.view_id+':L7';
      finalize.push({
        work_unit_id:l7,
        view_id:plan.view_id,
        layer_id:'L7_FINAL_OVERLAY_VALIDATION',
        stage:4,
        depends_on:parallel.filter(x=>x.view_id===plan.view_id).map(x=>x.work_unit_id)
      });
      finalize.push({
        work_unit_id:plan.view_id+':L8',
        view_id:plan.view_id,
        layer_id:'L8_USER_EXPOSURE_GATE',
        stage:5,
        depends_on:[l7]
      });
    }

    return Object.freeze({
      ok:bad.length===0,
      status:bad.length?'BLOCKED_VIEW_INPUTS':'READY',
      source_key,
      shared_precompute:Object.freeze(shared),
      parallel_view_work:Object.freeze(parallel),
      finalization:Object.freeze(finalize),
      view_plans:Object.freeze(viewPlans),
      efficiency:Object.freeze({
        shared_layers_computed_once:['L0_SOURCE','L1_GEOMETRY','L2_SEMANTIC'],
        view_specific_parallel_layers:unique(parallel.map(x=>x.layer_id)),
        rule:'Do not recompute source/geometry/semantic state for each presentation view.'
      })
    });
  }

  function validateExecution({plan,completed_work_units=[]}={}){
    if(!plan) return {ok:false,reason:'PLAN_REQUIRED'};
    const done=new Set(completed_work_units||[]);
    const required=[];

    if(plan.shared_precompute){
      required.push(...plan.shared_precompute.map(x=>x.work_unit_id));
      required.push(...plan.parallel_view_work.map(x=>x.work_unit_id));
      required.push(...plan.finalization.map(x=>x.work_unit_id));
    }else if(plan.work_units){
      required.push(...plan.work_units.map(x=>x.work_unit_id));
    }

    const missing=required.filter(x=>!done.has(x));
    return Object.freeze({
      ok:missing.length===0,
      required_count:required.length,
      completed_count:required.length-missing.length,
      missing:Object.freeze(missing)
    });
  }

  return Object.freeze({
    version:'2.0.0',
    LAYERS,
    PROFILE_LAYERS,
    PROFILE_MASKS,
    buildSingleViewPlan,
    buildFanoutPlan,
    validateExecution
  });
});
