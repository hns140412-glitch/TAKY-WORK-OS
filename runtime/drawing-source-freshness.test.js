const assert=require('assert');
const f=require('./drawing-source-freshness');
const a={source_digest:'sha256:same',modified_at:'2026-09-22'};
const b={source_digest:'sha256:same',modified_at:'2026-09-23'};
const same=f.compare(a,b);
assert.equal(same.relation,'CONTENT_IDENTICAL');
assert.equal(same.supersession,'FORBIDDEN_BY_DATE_ALONE');
assert.equal(f.maySupersede({candidate:b,current:a}).allowed,false);
const changed=f.maySupersede({
  candidate:{source_digest:'sha256:new',authority:'FACT_SOURCE',revision_evidence:'ISSUED_0923'},
  current:{source_digest:'sha256:old',authority:'FACT_SOURCE'}
});
assert.equal(changed.allowed,true);
assert.equal(f.maySupersede({
  candidate:{source_digest:'sha256:new',authority:'FACT_SOURCE'},
  current:{source_digest:'sha256:old',authority:'FACT_SOURCE'}
}).allowed,false);
console.log('drawing-source-freshness: PASS');
