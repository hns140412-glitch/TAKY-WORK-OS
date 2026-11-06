'use strict';

const assert=require('assert');
const Gate=require('../runtime/ci-attestation-gate.js');

let r=Gate.evaluateWorkflowRuns([
  {name:'TAKY Enforcement Regression',status:'completed',conclusion:'success',run_number:10},
  {name:'drawing-engine-core',status:'completed',conclusion:'success',run_number:20}
]);
assert.equal(r.ok,true);

r=Gate.evaluateWorkflowRuns([
  {name:'TAKY Enforcement Regression',status:'completed',conclusion:'failure',run_number:11},
  {name:'drawing-engine-core',status:'completed',conclusion:'success',run_number:20}
]);
assert.equal(r.ok,false);
assert(r.findings.some(x=>x.workflow==='TAKY Enforcement Regression'));

r=Gate.evaluateWorkflowRuns([
  {name:'TAKY Enforcement Regression',status:'completed',conclusion:'success',run_number:9}
]);
assert.equal(r.ok,false);
assert(r.findings.some(x=>x.workflow==='drawing-engine-core'));

r=Gate.evaluateWorkflowRuns([
  {name:'TAKY Enforcement Regression',status:'completed',conclusion:'failure',run_number:9},
  {name:'TAKY Enforcement Regression',status:'completed',conclusion:'success',run_number:10},
  {name:'drawing-engine-core',status:'completed',conclusion:'success',run_number:20}
]);
assert.equal(r.ok,true);

console.log('ci-attestation-gate: PASS');
