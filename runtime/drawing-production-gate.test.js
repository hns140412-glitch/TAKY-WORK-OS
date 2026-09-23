const assert=require('assert');
const gate=require('./drawing-production-gate');

function allPass(){
  return Object.fromEntries(gate.REQUIRED_GATES.map(x=>[x,{state:'PASS',validator_id:gate.EXPECTED_VALIDATORS[x],evidence_ref:'TEST:'+x}]));
}

{
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:allPass(),geometry_diff:{pass:true}});
  assert.equal(r.ok,true); assert.equal(r.show,true);
}
{
  const r=gate.evaluate({artifact_class:'USER_FACING',engine:'PYTHON',execution_path:'AD_HOC_PYTHON_ONE_OFF',gates:allPass(),geometry_diff:{pass:true}});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='UNAUTHORIZED_ENGINE_FOR_PRODUCTION'));
  assert(r.findings.some(x=>x.code==='PRODUCTION_BYPASS_PATH_FORBIDDEN'));
}
{
  const g=allPass(); g.GEOMETRY_GATE={state:'FAIL',validator_id:gate.EXPECTED_VALIDATORS.GEOMETRY_GATE,evidence_ref:'TEST:GEOMETRY_FAIL'};
  const r=gate.evaluate({artifact_class:'PREVIEW',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:g,geometry_diff:{pass:false}});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='GEOMETRY_DIFF_FAIL'));
}
{
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:allPass(),geometry_diff:{pass:true},freshness_basis:'MODIFIED_TIME_ONLY'});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='DATE_NOT_CONTENT_CHANGE'));
}
{
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:allPass(),geometry_diff:{pass:true},unsupported_narrative_claims:['완벽한 프라이버시']});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='UNSUPPORTED_NARRATIVE'));
}
{
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:allPass(),geometry_diff:{pass:true},protected_anchor_check:{ok:false,missing:['CORE-1']}});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='PROTECTED_ARCHITECTURE_DELETED'));
}
{
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:allPass(),geometry_diff:{pass:true},semantic_check:{ok:false,findings:[{code:'UNVERIFIED_SEMANTIC_USED'}]}});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='SEMANTIC_VERIFICATION_FAIL'));
}
{
  const raw=Object.fromEntries(gate.REQUIRED_GATES.map(x=>[x,'PASS']));
  const r=gate.evaluate({artifact_class:'FINAL',engine:'DRAWING_ENGINE',execution_path:'AUTHORIZED_ENGINE',gates:raw,geometry_diff:{pass:true}});
  assert.equal(r.show,false);
  assert(r.findings.some(x=>x.code==='UNATTESTED_GATE_STATUS'));
}
assert.equal(gate.classifyOneOff({purpose:'FINAL'}).ok,false);
assert.equal(gate.classifyOneOff({purpose:'DIAGNOSTIC'}).ok,true);
console.log('drawing-production-gate.test PASS');