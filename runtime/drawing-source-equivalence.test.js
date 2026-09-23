const assert=require('assert');
const s=require('./drawing-source-equivalence');
assert.deepEqual(s.classify({content_digest:'abc',modified_time:'2026-09-22'},{content_digest:'abc',modified_time:'2026-09-23'}),{state:'SAME_CONTENT',stale:false,reason:'CONTENT_DIGEST_EQUAL'});
assert.equal(s.classify({content_digest:'abc'},{content_digest:'def'}).state,'CONTENT_CHANGED');
assert.equal(s.classify({modified_time:'2026-09-22'},{modified_time:'2026-09-23'}).state,'UNKNOWN_CONTENT_RELATION');
console.log('drawing-source-equivalence: PASS');
