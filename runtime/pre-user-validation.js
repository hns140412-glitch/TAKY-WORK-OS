(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyPreUserValidation=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const REQUIRED_GATES=Object.freeze([
    'SOURCE_GATE','GEOMETRY_GATE','FACT_GATE','SEMANTIC_GATE',
    'REFERENCE_EFFECT_GATE','ARCHITECTURAL_READABILITY_GATE',
    'A3_GATE','USER_EFFECT_GATE'
  ]);

  function passState(v){ return v==='PASS' || v===true; }

  function run(input={}){
    const findings=[];
    const gates=input.gates||{};
    for(const gate of REQUIRED_GATES){
      if(!passState(gates[gate])) findings.push({gate,code:'GATE_NOT_PASS',state:gates[gate]??'MISSING'});
    }

    if(input.geometry_diff!==0) findings.push({gate:'GEOMETRY_GATE',code:'GEOMETRY_DIFF_NONZERO',value:input.geometry_diff});
    for(const protectedElement of ['wall','core','entry']){
      if(input.protected_geometry?.[protectedElement]===false){
        findings.push({gate:'GEOMETRY_GATE',code:'PROTECTED_GEOMETRY_MISSING',element:protectedElement});
      }
    }

    if(input.semantic_inference_unverified===true){
      findings.push({gate:'SEMANTIC_GATE',code:'UNVERIFIED_SEMANTIC_INFERENCE'});
    }
    if((input.unsupported_narrative_claims||[]).length){
      findings.push({gate:'FACT_GATE',code:'UNSUPPORTED_NARRATIVE',claims:[...input.unsupported_narrative_claims]});
    }
    if(input.reference_compilation?.ok!==true){
      findings.push({gate:'REFERENCE_EFFECT_GATE',code:'REFERENCE_NOT_COMPILED'});
    }
    if(input.reference_effect_visible!==true){
      findings.push({gate:'REFERENCE_EFFECT_GATE',code:'REFERENCE_EFFECT_NOT_VISIBLE'});
    }
    if(input.generic_layout_detected===true){
      findings.push({gate:'USER_EFFECT_GATE',code:'GENERIC_LAYOUT_DETECTED'});
    }
    if(input.user_debug_required===true){
      findings.push({gate:'USER_EFFECT_GATE',code:'USER_AS_DEBUGGER'});
    }

    return Object.freeze({
      ok:findings.length===0,
      exposure:findings.length===0?'PASS':'BLOCKED',
      policy:'NO PASS -> NO SHOW',
      findings:Object.freeze(findings)
    });
  }

  return Object.freeze({version:'1.0.0',REQUIRED_GATES,run});
});