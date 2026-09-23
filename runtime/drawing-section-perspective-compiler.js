(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakySectionPerspectiveCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const TRUSTED=new Set(['CAD_RULE_VERIFIED','USER_CONFIRMED','SOURCE_EXPLICIT','VERIFIED_SEMANTIC','SOURCE_DERIVED']);
  const clean=v=>String(v??'').trim();

  function byId(records=[]){
    const m=new Map();
    for(const r of records||[]){
      const id=clean(r?.mask_id).toUpperCase();
      if(id) m.set(id,r);
    }
    return m;
  }

  function stateOf(r){
    return clean(r?.semantic_state||r?.validation_state||r?.authority).toUpperCase();
  }

  function validateMasks(mask_records=[]){
    const map=byId(mask_records);
    const findings=[];
    for(const id of ['SOURCE_LINE','INTERIOR_FURNITURE','SECTION_CUT']){
      const rec=map.get(id);
      if(!rec){
        findings.push({code:id+'_REQUIRED',severity:'CRITICAL'});
        continue;
      }
      if(id!=='SOURCE_LINE' && !TRUSTED.has(stateOf(rec))){
        findings.push({code:id+'_NOT_VERIFIED',severity:'CRITICAL',state:stateOf(rec)});
      }
    }
    const depth=map.get('DEPTH_GUIDE');
    if(depth && !clean(depth.source_trace||depth.artifact_uri)){
      findings.push({code:'DEPTH_GUIDE_TRACE_REQUIRED',severity:'HIGH'});
    }
    return Object.freeze({
      ok:findings.length===0,
      findings:Object.freeze(findings),
      masks:Object.freeze([...map.keys()])
    });
  }

  function compile({mask_records=[],variant='WARM_EDITORIAL'}={}){
    const gate=validateMasks(mask_records);
    if(!gate.ok) return Object.freeze({ok:false,reason:'MASK_GATE_BLOCKED',gate});

    const v=clean(variant).toUpperCase();
    const warm=[
      'architectural section perspective diagram',
      'warm oak and restrained raw concrete',
      'soft diffused daylight',
      'soft interior ambient lighting',
      'crisp section cut',
      'warm-white editorial background',
      'realistic restrained material textures',
      'high ambient occlusion without harsh shadow',
      'architecture-first composition'
    ];
    const iso=[
      'isometric architectural cutaway diagram',
      'clean light timber and neutral material palette',
      'restrained pastel functional accents',
      'bright even daylight',
      'white editorial background',
      'human-scale entourage kept subordinate',
      'sharp graphic presentation'
    ];
    const negative=[
      'distorted geometry','crooked walls','extra pillars','slanted lines',
      'text','dimensions','labels','glossy fake 3d','cartoon',
      'overexposed','harsh shadows','messy lines','low quality'
    ];

    return Object.freeze({
      ok:true,
      schema:'TAKY_SECTION_PERSPECTIVE_RECIPE_V1',
      variant:v,
      generation:Object.freeze({
        model_family:'SDXL',
        controlnet_lineart:Object.freeze({strength:0.80,authority:'GUIDE_ONLY'}),
        controlnet_depth:Object.freeze({enabled:'OPTIONAL',authority:'GUIDE_ONLY'}),
        first_pass:Object.freeze({denoise:0.60,purpose:'BASE_COLOR_LIGHTING'}),
        second_pass:Object.freeze({denoise:0.30,purpose:'UPSCALE_MATERIAL_DETAIL'}),
        positive_prompt:Object.freeze(v==='CLEAR_ISOMETRIC'?iso:warm),
        negative_prompt:Object.freeze(negative)
      }),
      final_composite:Object.freeze({
        bottom:Object.freeze({layer:'AI_RENDER',blend:'NORMAL',opacity:1.0}),
        middle:Object.freeze({layer:'SECTION_CUT',blend:'NORMAL',opacity:1.0,fill:'#111111'}),
        top:Object.freeze({layer:'SOURCE_LINE',blend:'MULTIPLY',opacity:0.35,benchmark_band:Object.freeze([0.30,0.40])}),
        film_grain:Object.freeze({enabled:true,amount:0.0135,benchmark_band:Object.freeze([0.012,0.015])})
      }),
      invariants:Object.freeze([
        'SOURCE_GEOMETRY_UNCHANGED',
        'SECTION_CUT_VERIFIED',
        'SOURCE_LINE_FINAL_OVERLAY',
        'AI_NEVER_GEOMETRY_AUTHORITY',
        'EDGE_DIFF_PASS_REQUIRED'
      ])
    });
  }

  return Object.freeze({version:'1.0.0',validateMasks,compile});
});