'use strict';
const REQUIRED=['SOURCE_GATE','GEOMETRY_GATE','FACT_GATE','SEMANTIC_GATE','REFERENCE_EFFECT_GATE','ARCHITECTURAL_READABILITY_GATE','A3_GATE','USER_EFFECT_GATE'];
function validatePreUser(state={}){
  const findings=[];
  const gates=state.gates||{};
  for(const g of REQUIRED) if(String(gates[g]||'').toUpperCase()!=='PASS') findings.push('GATE_NOT_PASS:'+g);
  const protectedChanges=Number(state.protected_geometry_changes||0);
  if(protectedChanges!==0) findings.push('PROTECTED_GEOMETRY_CHANGED');
  if(state.invented_semantics===true) findings.push('INVENTED_SEMANTICS');
  if(state.unsupported_narrative===true) findings.push('UNSUPPORTED_NARRATIVE');
  if(state.reference_effect_detectable!==true) findings.push('REFERENCE_EFFECT_ABSENT');
  if(state.user_effect_pass!==true) findings.push('USER_EFFECT_FAIL');
  return {ok:findings.length===0,showable:findings.length===0,findings};
}
module.exports=Object.freeze({REQUIRED,validatePreUser});
