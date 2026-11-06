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
    'GENERIC_REPORT_LAYOUT','A3_INTEGRITY_FAIL','ENGINE_BYPASS',
    'DATE_ONLY_SUPERSESSION','SOURCE_FRESHNESS_UNVERIFIED'
  ]);
  const REQUIRED_BASE=Object.freeze([
    'SOURCE','GEOMETRY','FACT','SEMANTIC','REFERENCE_EFFECT',
    'ARCHITECTURAL_READABILITY','USER_EFFECT'
  ]);
  const hard=new Set(HARD_FAILURES);
  const clean=v=>String(v??'').trim();

  function validateGateEvidence(name,entry){
    const blocks=[];
    if(!entry || typeof entry!=='object') return {status:'FAIL',blocks:['GATE_EVIDENCE_REQUIRED:'+name]};
    const status=clean(entry.status).toUpperCase();
    if(status!=='PASS') blocks.push('GATE_NOT_PASS:'+name);
    if(!clean(entry.validator)) blocks.push('GATE_VALIDATOR_REQUIRED:'+name);
    if(!Array.isArray(entry.evidence_refs) || entry.evidence_refs.length===0 || entry.evidence_refs.some(x=>!clean(x))){
      blocks.push('GATE_EVIDENCE_REF_REQUIRED:'+name);
    }
    return {status:blocks.length===0?'PASS':'FAIL',blocks};
  }

  function evaluate(evidence={}){
    const defects=(evidence.defects||[]).map(x=>String(x).trim().toUpperCase()).filter(Boolean);
    const blocking=defects.filter(x=>hard.has(x));
    const required=[...REQUIRED_BASE];
    if(evidence.narrative_present===true) required.push('NARRATIVE_EVIDENCE');
    if(evidence.a3_required===true) required.push('A3');

    const gates={}, traceBlocks=[];
    for(const name of required){
      const v=validateGateEvidence(name,evidence.gates?.[name]);
      gates[name]=v.status;
      traceBlocks.push(...v.blocks);
    }
    if(!clean(evidence.validation_bundle_id)) traceBlocks.push('VALIDATION_BUNDLE_ID_REQUIRED');
    if(!clean(evidence.source_digest)) traceBlocks.push('VALIDATION_SOURCE_DIGEST_REQUIRED');
    if(!clean(evidence.artifact_digest)) traceBlocks.push('VALIDATION_ARTIFACT_DIGEST_REQUIRED');

    const failedGates=Object.entries(gates).filter(([,v])=>v!=='PASS').map(([k])=>k);
    const ok=blocking.length===0 && failedGates.length===0 && traceBlocks.length===0;
    return Object.freeze({
      ok,
      decision:ok?'PASS':'FAIL',
      gates:Object.freeze(gates),
      blocking_defects:Object.freeze(blocking),
      failed_gates:Object.freeze(failedGates),
      trace_blocks:Object.freeze(traceBlocks),
      validation_bundle_id:clean(evidence.validation_bundle_id),
      source_digest:clean(evidence.source_digest),
      artifact_digest:clean(evidence.artifact_digest),
      invariant:'USER_IS_NOT_DEBUGGER__NO_SELF_ASSERTED_PASS__DATE_NE_CONTENT_CHANGE'
    });
  }

  return Object.freeze({version:'2.1.0',HARD_FAILURES,REQUIRED_BASE,evaluate});
});