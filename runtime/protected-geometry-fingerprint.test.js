const assert=require('assert');
const f=require('./protected-geometry-fingerprint');
const source={
  wall:[{id:'W1',x1:0,y1:0,x2:10,y2:0}],
  core:[{id:'C1',bbox:[2,2,4,4]}],
  entry:[{id:'E1',bbox:[0,4,1,5]}]
};
const same=JSON.parse(JSON.stringify(source));
assert.equal(f.compare(source,same).ok,true);
const damaged=JSON.parse(JSON.stringify(source));
damaged.wall=[];
const r=f.compare(source,damaged);
assert.equal(r.ok,false);
assert(r.findings.some(x=>x.element==='wall'));
console.log('protected-geometry-fingerprint: PASS');
