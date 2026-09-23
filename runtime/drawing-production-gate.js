(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProductionGate=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const PRODUCTION_CLASSES=new Set(['PREVIEW','FINAL','USER_FACING']);
  const AUTHORIZED_ENGINES=new Set([
    'DRAWING_ENGINE',
    'A3_SVG_BOARD_ENGINE',
    'AREA_ENGINE',
    'CONTROLLED_PRESENTATION_ENGINE'
  ]);
  const REQUIRED_GATES=[
    'SOURCE_GATE',
    'GEOMETRY_GATE',
    'FACT_GATE',
    'SEMANTIC_GATE',
    'REFERENCE_EFFECT_GATE',
    'ARCHITECTURAL_READABILITY_GATE',
    'A3_GATE',
    'USER_EFFECT_GATE'
  ];

  function normalizeGateMap(gates={}){
    const out={};
    for(const id of REQUIRED_GATES){
      const v=String(gates[id]||'PENDING').toUpperCase();
      out[id]=['PASS','FAIL','PENDING','NOT_APPLICABLE'].includes(v)?v:'PENDING';
    }
    return out;
  }

  function evaluate(input={}){
    const artifactClass=String(input.artifact_class||'EXPERIMENT').toUpperCase();
    const engine=String(input.engine||'').toUpperCase();
    const executionPath=String(input.execution_path||'').toUpperCase();
    const gates=normalizeGateMap(input.gates);
    const findings=[];

    if(PRODUCTION_CLASSES.has(artifactClass)){
      if(!AUTHORIZED_ENGINES.has(engine)){
        findings.push({code:'UNAUTHORIZED_ENGINE_FOR_PRODUCTION',engine});
      }
      if(executionPath.includes('ONE_OFF')||executionPath.includes('REPORTLAB')||executionPath.includes('GENERIC_HTML')||executionPath.includes('AD_HOC_PYTHON')){
        findings.push({code:'PRODUCTION_BYPASS_PATH_FORBIDDEN',execution_path:executionPath});
      }
      for(const id of REQUIRED_GATES){
        if(gates[id]!=='PASS' && gates[id]!=='NOT_APPLICABLE'){
          findings.push({code:'PRE_USER_GATE_NOT_PASS',gate:id,state:gates[id]});
        }
      }
    }

    if(input.geometry_diff && input.geometry_diff.pass!==true){
      findings.push({code:'GEOMETRY_DIFF_FAIL'});
    }
    if(input.source_digest_before && input.source_digest_after && input.source_digest_before!==input.source_digest_after){
      findings.push({code:'SOURCE_IDENTITY_DRIFT'});
    }
    if(input.freshness_basis==='MODIFIED_TIME_ONLY'){
      findings.push({code:'DATE_NOT_CONTENT_CHANGE'});
    }
    if(Array.isArray(input.unsupported_narrative_claims) && input.unsupported_narrative_claims.length){
      findings.push({code:'UNSUPPORTED_NARRATIVE',claims:[...input.unsupported_narrative_claims]});
    }

    const show=PRODUCTION_CLASSES.has(artifactClass) ? findings.length===0 : true;
    return Object.freeze({
      ok:findings.length===0,
      show,
      artifact_class:artifactClass,
      engine,
      gates:Object.freeze(gates),
      findings:Object.freeze(findings),
      rule:'NO_PASS_NO_SHOW'
    });
  }

  function classifyOneOff({purpose='EXPERIMENT'}={}){
    const p=String(purpose).toUpperCase();
    if(['PREVIEW','FINAL','USER_FACING','PRODUCTION'].includes(p)){
      return Object.freeze({ok:false,reason:'ONE_OFF_PRODUCTION_FORBIDDEN'});
    }
    return Object.freeze({ok:true,artifact_class:'EXPERIMENT',user_exposure:'INTERNAL_ONLY'});
  }

  return Object.freeze({
    version:'2.0.0',
    REQUIRED_GATES:Object.freeze([...REQUIRED_GATES]),
    AUTHORIZED_ENGINES:Object.freeze([...AUTHORIZED_ENGINES]),
    evaluate,
    classifyOneOff
  });
});