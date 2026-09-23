(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingSalesMaskGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const TRUSTED_SEMANTIC = new Set([
    'CAD_RULE_VERIFIED',
    'USER_CONFIRMED',
    'SOURCE_EXPLICIT',
    'VERIFIED_SEMANTIC'
  ]);

  function indexMasks(masks=[]){
    const map=new Map();
    for(const mask of masks||[]){
      const id=String(mask?.mask_id||'').toUpperCase();
      if(id) map.set(id,mask);
    }
    return map;
  }

  function checkSalesTextured({masks=[],user_intent={}}={}){
    const map=indexMasks(masks);
    const findings=[];

    const sourceLine=map.get('SOURCE_LINE');
    if(!sourceLine){
      findings.push({code:'SOURCE_LINE_REQUIRED',severity:'CRITICAL'});
    }

    const room=map.get('ROOM_MATERIAL');
    if(!room){
      findings.push({code:'ROOM_MATERIAL_MASK_REQUIRED',severity:'CRITICAL'});
    }else if(!TRUSTED_SEMANTIC.has(String(room.semantic_state||room.validation_state||'').toUpperCase())){
      findings.push({code:'ROOM_MATERIAL_MASK_NOT_CONFIRMED',severity:'CRITICAL'});
    }

    const annotation=map.get('ANNOTATION');
    if(annotation && !annotation.source_trace && !annotation.user_confirmed){
      findings.push({code:'ANNOTATION_TRACE_REQUIRED',severity:'HIGH'});
    }

    const furniture=map.get('FURNITURE');
    if(furniture){
      const state=String(furniture.semantic_state||furniture.validation_state||'').toUpperCase();
      const presentationOnly=furniture.presentation_only===true;
      if(!TRUSTED_SEMANTIC.has(state) && !presentationOnly){
        findings.push({code:'FURNITURE_MASK_UNVERIFIED',severity:'HIGH'});
      }
    }

    if(user_intent.allow_presentation_furniture===false && furniture?.presentation_only===true){
      findings.push({code:'PRESENTATION_FURNITURE_NOT_ALLOWED',severity:'HIGH'});
    }

    const blocking=findings.filter(x=>x.severity==='CRITICAL'||x.severity==='HIGH');
    const ready=blocking.length===0;

    return Object.freeze({
      ready,
      status:ready?'READY_FOR_SALES_TEXTURED':'SAFE_FALLBACK_REQUIRED',
      findings:Object.freeze(findings),
      fallback_profile:ready?null:'PUBLICATION',
      rule:'Do not infer room/material geometry to unlock SALES_TEXTURED.'
    });
  }

  function route({requested_profile='PUBLICATION',masks=[],user_intent={}}={}){
    const requested=String(requested_profile||'').toUpperCase();
    if(requested!=='SALES_TEXTURED' && requested!=='SALES_PLAN'){
      return Object.freeze({profile:requested,status:'REQUESTED_PROFILE_ALLOWED',gate:null});
    }
    const gate=checkSalesTextured({masks,user_intent});
    return Object.freeze({
      profile:gate.ready?requested:gate.fallback_profile,
      status:gate.ready?'REQUESTED_PROFILE_ALLOWED':'FALLBACK_APPLIED',
      requested_profile:requested,
      gate
    });
  }

  return Object.freeze({version:'1.0.0',TRUSTED_SEMANTIC:Object.freeze([...TRUSTED_SEMANTIC]),checkSalesTextured,route});
});
