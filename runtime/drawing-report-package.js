(function(root,factory){
  let productionGate=null;
  if(typeof module==='object'&&module.exports){
    productionGate=require('./drawing-production-gate');
    module.exports=factory(productionGate);
  }else root.TakyReportPackage=Object.freeze(factory(root.TakyDrawingProductionGate));
})(typeof globalThis!=='undefined'?globalThis:this,function(productionGate){
  'use strict';

  const SOURCE_ROLES=new Set([
    'CURRENT_GEOMETRY_SOURCE','FORMAT_REFERENCE','REVIEW_STANDARD',
    'CASE_DATASET','INFO_STRUCTURE_REFERENCE','PRESENTATION_METHOD'
  ]);
  const EVIDENCE_STATES=new Set(['CONFIRMED','CALCULATED','PENDING','CONFLICT','REFERENCE_ONLY']);

  function validate(pkg={}){
    const findings=[];
    if(!pkg.package_id) findings.push({code:'PACKAGE_ID_REQUIRED'});
    if(!pkg.project?.title) findings.push({code:'PROJECT_TITLE_REQUIRED'});

    const sourceIds=new Set();
    for(const s of pkg.sources||[]){
      if(!s.source_id) findings.push({code:'SOURCE_ID_REQUIRED'});
      else if(sourceIds.has(s.source_id)) findings.push({code:'DUPLICATE_SOURCE_ID',source_id:s.source_id});
      else sourceIds.add(s.source_id);
      if(!SOURCE_ROLES.has(s.role)) findings.push({code:'INVALID_SOURCE_ROLE',source_id:s.source_id,role:s.role});
    }

    const factIds=new Set();
    for(const f of pkg.facts||[]){
      if(!f.fact_id) findings.push({code:'FACT_ID_REQUIRED'});
      else if(factIds.has(f.fact_id)) findings.push({code:'DUPLICATE_FACT_ID',fact_id:f.fact_id});
      else factIds.add(f.fact_id);
      if(!EVIDENCE_STATES.has(f.evidence_state)) findings.push({code:'INVALID_EVIDENCE_STATE',fact_id:f.fact_id});
      for(const ref of f.source_refs||[]){
        if(!sourceIds.has(ref)) findings.push({code:'FACT_SOURCE_NOT_FOUND',fact_id:f.fact_id,source_ref:ref});
      }
      if(f.evidence_state==='PENDING' && f.value!==null && f.value!==undefined){
        findings.push({code:'PENDING_FACT_MUST_NOT_HAVE_AUTHORITATIVE_VALUE',fact_id:f.fact_id});
      }
    }

    const reviewIds=new Set((pkg.review_items||[]).map(x=>x.review_id).filter(Boolean));
    const caseIds=new Set((pkg.cases||[]).map(x=>x.case_id).filter(Boolean));
    const methodIds=new Set((pkg.methods||[]).map(x=>x.method_id).filter(Boolean));

    for(const p of pkg.pages||[]){
      for(const id of p.fact_refs||[]) if(!factIds.has(id)) findings.push({code:'PAGE_FACT_NOT_FOUND',page_id:p.page_id,ref:id});
      for(const id of p.review_refs||[]) if(!reviewIds.has(id)) findings.push({code:'PAGE_REVIEW_NOT_FOUND',page_id:p.page_id,ref:id});
      for(const id of p.case_refs||[]) if(!caseIds.has(id)) findings.push({code:'PAGE_CASE_NOT_FOUND',page_id:p.page_id,ref:id});
      for(const id of p.method_refs||[]) if(!methodIds.has(id)) findings.push({code:'PAGE_METHOD_NOT_FOUND',page_id:p.page_id,ref:id});
      for(const id of p.source_visual_refs||[]) if(!sourceIds.has(id)) findings.push({code:'PAGE_SOURCE_NOT_FOUND',page_id:p.page_id,ref:id});
    }

    return Object.freeze({
      ok:findings.length===0,
      findings:Object.freeze(findings)
    });
  }

  function buildOutputPlan(pkg={},authorization={}){
    const v=validate(pkg);
    if(!v.ok) return Object.freeze({ok:false,reason:'PACKAGE_INVALID',findings:v.findings});
    if(!productionGate) return Object.freeze({ok:false,reason:'PRODUCTION_GATE_REQUIRED'});
    const admission=productionGate.evaluate({
      artifact_class:authorization.artifact_class||'PREVIEW',
      engine:authorization.engine||'',
      execution_path:authorization.execution_path||'',
      gates:authorization.gates||{},
      geometry_diff:authorization.geometry_diff,
      source_digest_before:authorization.source_digest_before,
      source_digest_after:authorization.source_digest_after,
      freshness_basis:authorization.freshness_basis,
      unsupported_narrative_claims:authorization.unsupported_narrative_claims||[]
    });
    if(!admission.show) return Object.freeze({ok:false,reason:'PRE_USER_GATE_BLOCKED',admission});

    const pages=(pkg.pages||[]).map(p=>({
      page_id:p.page_id,
      title:p.title,
      visual_state_id:'A3:'+p.page_id,
      source_visual_refs:[...(p.source_visual_refs||[])],
      method_refs:[...(p.method_refs||[])],
      fact_refs:[...(p.fact_refs||[])],
      review_refs:[...(p.review_refs||[])],
      case_refs:[...(p.case_refs||[])]
    }));

    return Object.freeze({
      ok:true,
      content_canonical:'REPORT_PACKAGE',
      visual_canonical:'A3_SVG_BOARD_STATE',
      pages:Object.freeze(pages),
      production_admission:admission,
      outputs:Object.freeze({
        PDF:{route:'A3_SVG_BOARD_STATE -> PDF',role:'PRIMARY_DELIVERABLE'},
        HTML:{route:'A3_SVG_BOARD_STATE -> HTML',role:'INTERACTIVE_VIEW'},
        PPTX:{route:'A3_SVG_BOARD_STATE -> PPTX',role:'EDITABLE_PRESENTATION'},
        PNG:{route:'A3_SVG_BOARD_STATE -> PNG',role:'RASTER_PREVIEW'},
        SVG:{route:'A3_SVG_BOARD_STATE',role:'VISUAL_CANONICAL'},
        XLSX:{route:'REPORT_PACKAGE.tables/facts/cases/review_items -> XLSX',role:'DATA_EXPORT'}
      })
    });
  }

  function applyFactPatch(pkg={},patches=[]){
    const copy=JSON.parse(JSON.stringify(pkg));
    const byId=new Map((copy.facts||[]).map(x=>[x.fact_id,x]));
    for(const patch of patches||[]){
      const target=byId.get(patch.fact_id);
      if(!target) throw new Error('FACT_NOT_FOUND:'+patch.fact_id);
      const next={...target,...patch};
      if(next.evidence_state==='PENDING' && next.value!==null && next.value!==undefined){
        throw new Error('PENDING_FACT_VALUE_FORBIDDEN:'+patch.fact_id);
      }
      Object.assign(target,next);
    }
    return copy;
  }

  return Object.freeze({
    version:'1.0.0',
    validate,
    buildOutputPlan,
    applyFactPatch
  });
});
