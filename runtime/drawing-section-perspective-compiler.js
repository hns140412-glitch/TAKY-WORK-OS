(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakySectionPerspectiveCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const TRUSTED=new Set([
    'CAD_RULE_VERIFIED','USER_CONFIRMED','SOURCE_EXPLICIT',
    'VERIFIED_SEMANTIC','SOURCE_DERIVED'
  ]);
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

  function validateInput(input_meta={}){
    const findings=[];
    const width=Number(input_meta.width_px||0);
    const height=Number(input_meta.height_px||0);
    const longEdge=Math.max(width,height);

    if(longEdge<2048){
      findings.push({
        code:'INPUT_LONG_EDGE_BELOW_2048',
        severity:'CRITICAL',
        width_px:width,
        height_px:height
      });
    }
    if(input_meta.dimensions_off!==true){
      findings.push({code:'CONTROL_INPUT_DIMENSIONS_MUST_BE_OFF',severity:'CRITICAL'});
    }
    if(input_meta.text_off!==true){
      findings.push({code:'CONTROL_INPUT_TEXT_MUST_BE_OFF',severity:'CRITICAL'});
    }
    if(input_meta.furniture_hatch_off!==true){
      findings.push({code:'CONTROL_INPUT_FURNITURE_HATCH_MUST_BE_OFF',severity:'CRITICAL'});
    }
    if(input_meta.structure_line_only!==true){
      findings.push({code:'CONTROL_INPUT_STRUCTURE_LINE_ONLY_REQUIRED',severity:'CRITICAL'});
    }

    return Object.freeze({
      ok:findings.length===0,
      findings:Object.freeze(findings),
      long_edge_px:longEdge
    });
  }

  function compile({
    mask_records=[],
    input_meta={},
    variant='WARM_EDITORIAL',
    controlnet_model='LINEART'
  }={}){
    const maskGate=validateMasks(mask_records);
    if(!maskGate.ok) return Object.freeze({ok:false,reason:'MASK_GATE_BLOCKED',gate:maskGate});

    const inputGate=validateInput(input_meta);
    if(!inputGate.ok) return Object.freeze({ok:false,reason:'INPUT_PREFLIGHT_BLOCKED',gate:inputGate});

    const v=clean(variant).toUpperCase();
    const model=clean(controlnet_model).toUpperCase();
    if(!['LINEART','CANNY'].includes(model)){
      return Object.freeze({ok:false,reason:'CONTROLNET_MODEL_NOT_ALLOWED',controlnet_model:model});
    }

    const warm=[
      'Architectural section perspective diagram',
      'ArchDaily presentation style',
      'raw board-formed concrete walls',
      'warm oak wood floor',
      'soft interior ambient lighting glowing from inside',
      'detailed Scandinavian furniture entourage',
      'crisp section cut',
      'clean white background',
      'soft diffused daylight',
      'high ambient occlusion',
      'realistic material textures',
      '8k',
      'archviz'
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
      schema:'TAKY_SECTION_PERSPECTIVE_RECIPE_V2',
      variant:v,
      input_preflight:inputGate,
      mask_gate:maskGate,
      generation:Object.freeze({
        model_family:'SDXL',
        controlnet_primary:Object.freeze({
          model,
          weight_seed:0.79,
          weight_band:Object.freeze([0.78,0.80]),
          ending_control_step:0.80,
          authority:'GUIDE_ONLY'
        }),
        controlnet_depth:Object.freeze({
          enabled:'OPTIONAL',
          authority:'GUIDE_ONLY',
          role:'DEPTH_ONLY'
        }),
        first_pass:Object.freeze({
          denoise_seed:0.625,
          denoise_band:Object.freeze([0.60,0.65]),
          purpose:'BASE_COLOR_LIGHTING'
        }),
        second_pass:Object.freeze({
          denoise_seed:0.30,
          denoise_band:Object.freeze([0.28,0.32]),
          purpose:'UPSCALE_MATERIAL_DETAIL'
        }),
        positive_prompt:Object.freeze(v==='CLEAR_ISOMETRIC'?iso:warm),
        negative_prompt:Object.freeze(negative)
      }),
      final_composite:Object.freeze({
        bottom:Object.freeze({layer:'AI_RENDER',blend:'NORMAL',opacity:1.0}),
        middle:Object.freeze({layer:'SECTION_CUT',blend:'NORMAL',opacity:1.0,fill:'#111111'}),
        top:Object.freeze({
          layer:'SOURCE_LINE',blend:'MULTIPLY',opacity:0.35,
          benchmark_band:Object.freeze([0.30,0.40])
        }),
        film_grain:Object.freeze({
          enabled:true,amount:0.0135,
          benchmark_band:Object.freeze([0.012,0.015])
        })
      }),
      invariants:Object.freeze([
        'SOURCE_GEOMETRY_UNCHANGED',
        'SECTION_CUT_VERIFIED',
        'SOURCE_LINE_FINAL_OVERLAY',
        'AI_NEVER_GEOMETRY_AUTHORITY',
        'EDGE_DIFF_PASS_REQUIRED',
        'NEGATIVE_PROMPT_NOT_A_GEOMETRY_GUARANTEE'
      ])
    });
  }

  return Object.freeze({version:'2.0.0',validateMasks,validateInput,compile});
});