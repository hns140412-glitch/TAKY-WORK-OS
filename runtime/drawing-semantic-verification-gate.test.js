const assert=require('assert');
const g=require('./drawing-semantic-verification-gate');
assert.equal(g.evaluate([{semantic:'ROAD',state:'VERIFIED',used_in_presentation:true}]).ok,true);
const r=g.evaluate([{semantic:'SOIL',state:'PROPOSAL_ONLY',used_in_presentation:true},{semantic:'GROUND',state:'UNKNOWN',used_in_presentation:false}]);
assert.equal(r.ok,false);
assert(r.findings.some(x=>x.code==='UNVERIFIED_SEMANTIC_USED'));
console.log('drawing-semantic-verification-gate.test PASS');