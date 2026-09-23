const assert=require('assert');
const c=require('./drawing-reference-compiler');
const x=c.compile([
 {reference:'ArchDaily',dna:'PLAN_LINE_HIERARCHY'},
 {reference:'Divisare',dna:'EDITORIAL_RESTRAINT'},
 {reference:'OMA',dna:'RELATION_FIRST'}
]);
assert.equal(x.ok,true);
assert.equal(x.design_tokens.wall_lineweight,0.40);
assert.equal(x.design_tokens.decorative_duplication,false);
let e=c.validateEffect({compiled:x,observed_effects:Object.fromEntries(Object.keys(x.design_tokens).map(k=>[k,true]))});
assert.equal(e.ok,true);
e=c.validateEffect({compiled:x,observed_effects:{wall_lineweight:true}});
assert.equal(e.ok,false);
const bad=c.compile([{reference:'Unknown',dna:'VAGUE_STYLE'}]);
assert.equal(bad.ok,false);
console.log('drawing-reference-compiler.test PASS');