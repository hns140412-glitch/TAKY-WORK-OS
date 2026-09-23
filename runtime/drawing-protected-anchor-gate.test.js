const assert=require('assert');
const g=require('./drawing-protected-anchor-gate');
assert.equal(g.evaluate({before:['WALL-A','CORE-1','ENTRY-1'],after:['WALL-A','CORE-1','ENTRY-1']}).ok,true);
const r=g.evaluate({before:['WALL-A','CORE-1','ENTRY-1'],after:['WALL-A']});
assert.equal(r.ok,false);
assert.deepEqual([...r.missing].sort(),['CORE-1','ENTRY-1']);
assert.equal(r.finding,'PROTECTED_ARCHITECTURE_DELETED');
console.log('drawing-protected-anchor-gate.test PASS');