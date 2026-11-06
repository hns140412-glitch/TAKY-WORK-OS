const assert=require('assert');
const exp=require('./drawing-html-exporter');
const r=exp.exportHtml({svg:'<svg viewBox="0 0 10 10"><path d="M0 0L1 1"/></svg>',title:'x'});
assert.equal(r.ok,true);
assert(r.html.includes('@page{size:A3 landscape'));
assert(r.html.includes('A3_SVG_BOARD_STATE -> HTML')===false);
console.log('drawing-html-exporter PASS');