const assert=require('assert');
const c=require('./drawing-task-contract');

let x=c.normalize(c.defaultForPurpose('SALES_PLAN'));
assert.equal(x.ok,true);
assert(x.contract.autonomy.must_keep.includes('source geometry'));
assert(x.contract.completion_criteria.includes('furniture scale plausible'));

x=c.normalize({goal:'x',outputs:['y'],completion_criteria:['z']});
assert.equal(x.ok,false);
assert(x.issues.includes('VERIFICATION_REQUIRED'));

console.log('drawing-task-contract: PASS');
