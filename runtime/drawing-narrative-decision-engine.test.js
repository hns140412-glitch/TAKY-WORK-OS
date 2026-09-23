const assert=require('assert');
const engine=require('./drawing-narrative-decision-engine');

function basePkg(){
  return {
    sources:[{source_id:'S'}],
    facts:[
      {fact_id:'F_OK',evidence_state:'CONFIRMED'},
      {fact_id:'F_PENDING',evidence_state:'PENDING'},
      {fact_id:'F_REF',evidence_state:'REFERENCE_ONLY'}
    ],
    review_items:[{review_id:'R_PENDING',state:'PENDING'}],
    cases:[{case_id:'C_REF'}],
    pages:[{
      page_id:'P06',
      narrative:{
        message:{text:'A/B 관계를 동일 스케일에서 비교한다.',evidence_refs:['S'],claim_type:'OBSERVATION'},
        why_it_matters:{text:'2층 구성의 차이를 빠르게 판단한다.',evidence_refs:['S'],claim_type:'INTERPRETATION'},
        decision_points:[{text:'A/B 평면 조직 비교',evidence_refs:['S','F_OK'],claim_type:'DECISION'}]
      }
    }]
  };
}

let pkg=basePkg();
let ok=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(ok.ok,true);
assert.equal(ok.status,'EVIDENCE_GROUNDED');

pkg=basePkg();
pkg.pages[0].narrative.message.evidence_refs=[];
let bad=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(bad.ok,false);
assert.equal(bad.reason,'NARRATIVE_EVIDENCE_INVALID');

pkg=basePkg();
pkg.pages[0].narrative.decision_points=[
  {text:'미확정 값을 확정 사실처럼 사용',evidence_refs:['F_PENDING'],claim_type:'DECISION'}
];
bad=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(bad.ok,false);
assert(bad.findings.some(x=>x.code==='AUTHORITATIVE_CLAIM_PENDING_EVIDENCE'));

pkg=basePkg();
pkg.pages[0].narrative.message={
  text:'사례는 참고 비교군으로만 읽는다.',
  evidence_refs:['C_REF'],
  claim_type:'REFERENCE'
};
ok=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(ok.ok,true);

console.log('drawing-narrative-decision-engine PASS');