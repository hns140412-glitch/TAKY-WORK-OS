const assert=require('assert');
const r=require('./drawing-report-package');
const g=require('./drawing-production-gate');

const pkg={
  package_id:'P1',
  project:{title:'Report'},
  sources:[
    {source_id:'S1',role:'CURRENT_GEOMETRY_SOURCE'},
    {source_id:'S2',role:'FORMAT_REFERENCE'}
  ],
  facts:[
    {fact_id:'F1',value:4,evidence_state:'CONFIRMED',source_refs:['S1']},
    {fact_id:'F2',value:null,evidence_state:'PENDING',source_refs:['S1']}
  ],
  review_items:[{review_id:'R1'}],
  cases:[{case_id:'C1'}],
  methods:[{method_id:'M1'}],
  pages:[
    {page_id:'P01',fact_refs:['F1','F2'],review_refs:['R1'],case_refs:['C1'],method_refs:['M1'],source_visual_refs:['S1']}
  ]
};

const allPass=()=>Object.fromEntries(g.REQUIRED_GATES.map(x=>[x,'PASS']));
assert.equal(r.validate(pkg).ok,true);

const blocked=r.buildOutputPlan(pkg);
assert.equal(blocked.ok,false);
assert.equal(blocked.reason,'PRE_USER_GATE_BLOCKED');

const plan=r.buildOutputPlan(pkg,{
  artifact_class:'PREVIEW',
  engine:'DRAWING_ENGINE',
  execution_path:'AUTHORIZED_ENGINE',
  gates:allPass(),
  geometry_diff:{pass:true}
});
assert.equal(plan.ok,true);
assert.equal(plan.production_admission.show,true);
assert.equal(plan.outputs.SVG.role,'VISUAL_CANONICAL');
assert.equal(plan.outputs.XLSX.role,'DATA_EXPORT');

const bypass=r.buildOutputPlan(pkg,{
  artifact_class:'PREVIEW',
  engine:'PYTHON',
  execution_path:'AD_HOC_PYTHON_ONE_OFF',
  gates:allPass(),
  geometry_diff:{pass:true}
});
assert.equal(bypass.ok,false);
assert.equal(bypass.reason,'PRE_USER_GATE_BLOCKED');

const bad=JSON.parse(JSON.stringify(pkg));
bad.facts[1].value=123;
assert.equal(r.validate(bad).ok,false);
assert(r.validate(bad).findings.some(x=>x.code==='PENDING_FACT_MUST_NOT_HAVE_AUTHORITATIVE_VALUE'));

const patched=r.applyFactPatch(pkg,[{
  fact_id:'F2',
  value:100,
  evidence_state:'CALCULATED',
  calculation_ref:'AREA_ENGINE'
}]);
assert.equal(patched.facts[1].value,100);
assert.equal(patched.facts[1].evidence_state,'CALCULATED');

assert.throws(()=>r.applyFactPatch(pkg,[{fact_id:'F2',value:10,evidence_state:'PENDING'}]));
console.log('drawing-report-package: PASS');