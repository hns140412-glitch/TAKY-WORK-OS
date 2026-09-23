'use strict';

const REQUIRED_WORKFLOWS=Object.freeze([
  'TAKY Enforcement Regression',
  'drawing-engine-core'
]);

function evaluateWorkflowRuns(runs=[]){
  const byName=new Map();
  for(const run of runs||[]){
    const name=String(run?.name||'');
    if(!REQUIRED_WORKFLOWS.includes(name)) continue;
    const current=byName.get(name);
    const runNumber=Number(run?.run_number||0);
    const currentNumber=Number(current?.run_number||0);
    if(!current || runNumber>=currentNumber) byName.set(name,run);
  }

  const findings=[];
  for(const name of REQUIRED_WORKFLOWS){
    const run=byName.get(name);
    if(!run){
      findings.push(Object.freeze({workflow:name,reason:'REQUIRED_WORKFLOW_RUN_MISSING'}));
      continue;
    }
    if(run.status!=='completed' || run.conclusion!=='success'){
      findings.push(Object.freeze({
        workflow:name,
        reason:'REQUIRED_WORKFLOW_NOT_GREEN',
        status:run.status||null,
        conclusion:run.conclusion||null,
        run_number:run.run_number||null
      }));
    }
  }

  return Object.freeze({
    ok:findings.length===0,
    required_workflows:REQUIRED_WORKFLOWS,
    findings:Object.freeze(findings)
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  REQUIRED_WORKFLOWS,
  evaluateWorkflowRuns
});
