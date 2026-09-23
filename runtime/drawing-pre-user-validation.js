(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingPreUserValidation=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const HARD_FAILURES=Object.freeze([
    'SOURCE_CROP_ERROR','WALL_DELETED','CORE_DELETED','ENTRY_DELETED',
    'UNAUTHORIZED_GEOMETRY_REDRAW','WRONG_FURNITURE_BOX','WRONG_ROTATION',
    'INVENTED_SEMANTICS','UNSUPPORTED_NARRATIVE','REFERENCE_EFFECT_ABSENT',
    'GENERIC_REPORT_LAYOUT','A3_INTEGRITY_FAIL'
  ]);
  const hard=new Set(HARD_FAILURES);
  const pass=v=>v===true?'PASS':'FAIL';

  function evaluate(evidence={}){
    const defects=(evidence.defects||[]).map(x=>String(x).trim().toUpperCase()).filter(Boolean);
    const blocking=defects.filter(x=>hard.has(x));
    const gates={
      SOURCE:pass(evidence.source_gate_pass),
      GEOMETRY:pass(evidence.geometry_gate_pass),
      FACT:pass(evidence.fact_gate_pass),
      SEMANTIC:pass(evidence.semantic_gate_pass),
      REFERENCE_EFFECT:pass(evidence.reference_effect_pass),
      ARCHITECTURAL_READABILITY:pass(evidence.architectural_readability_pass),
      USER_EFFECT:pass(evidence.user_effect_pass)
    };
    if(evidence.narrative_present===true) gates.NARRATIVE_EVIDENCE=pass(evidence.narrative_evidence_pass);
    if(evidence.a3_required===true) gates.A3=pass(evidence.a3_gate_pass);

    const failedGates=Object.entries(gates).filter(([,v])=>v!=='PASS').map(([k])=>k);
    const ok=blocking.length===0 && failedGates.length===0;
    return Object.freeze({
      ok,
      decision:ok?'PASS':'FAIL',
      gates:Object.freeze(gates),
      blocking_defects:Object.freeze(blocking),
      failed_gates:Object.freeze(failedGates),
      invariant:'USER_IS_NOT_DEBUGGER'
    });
  }

  return Object.freeze({version:'1.0.0',HARD_FAILURES,evaluate});
});
