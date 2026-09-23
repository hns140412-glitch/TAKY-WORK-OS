const assert=require('assert');
const engine=require('./drawing-narrative-decision-engine');

const pkg={
  sources:[{source_id:'S'}],
  facts:[{fact_id:'F'}],
  review_items:[],
  cases:[],
  pages:[{
    page_id:'P06',
    narrative:{
      message:{text:'A/B 관계를 동일 스케일에서 비교한다.',evidence_refs:['S']},
      why_it_matters:{text:'2층 구성의 차이를 빠르게 판단한다.',evidence_refs:['S']},
      decision_points:[{text:'A/B 평면 조직 비교',evidence_refs:['S','F']}]
    }
  }]
};
const ok=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(ok.ok,true);
assert.equal(ok.status,'EVIDENCE_GROUNDED');

pkg.pages[0].narrative.message.evidence_refs=[];
const bad=engine.compilePage({package_data:pkg,page_id:'P06'});
assert.equal(bad.ok,false);
assert.equal(bad.reason,'NARRATIVE_EVIDENCE_INVALID');
console.log('drawing-narrative-decision-engine PASS');