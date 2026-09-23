const assert=require('assert');
const renderer=require('./drawing-a3-board-renderer');

const pkg={
  package_id:'T',
  project:{title:'한남동 테스트'},
  sources:[{source_id:'S',role:'CURRENT_GEOMETRY_SOURCE'}],
  facts:[],
  review_items:[],
  cases:[],
  methods:[],
  pages:[{page_id:'P06',title:'2F Plan',source_visual_refs:['S'],method_refs:[],fact_refs:[],review_refs:[],case_refs:[]}]
};
const profile={
  a3:{width_mm:420,height_mm:297,margin_mm:12,layout:{hero_ratio:.74,support_ratio:.26}},
  pages:{P06:{title:'2F Plan',hero:'2F_SOURCE_DRAWING',methods:['M-017','M-025','EDITORIAL_RESTRAINT']}}
};
const source='<svg viewBox="0 0 100 50"><g id="locked"><path d="M0 0 L100 50" stroke="black" fill="none"/></g></svg>';
const out=renderer.renderPage({
  package_data:pkg,
  page_id:'P06',
  presentation_profile:profile,
  source_svg:source,
  source_viewbox:'0 0 100 50'
});
assert.equal(out.ok,true);
assert.equal(out.source_geometry_locked,true);
assert.equal(out.source_overlay_last,true);
assert(out.svg.includes('source-linework-final'));
assert(out.svg.includes('DESIGN DEVELOPMENT'));
assert(out.svg.includes('YKH ASSOCIATES · HANNAM-DONG 737-21'));
assert(!out.svg.includes('A3 SVG BOARD STATE'));
assert(out.svg.includes('data-source-geometry="locked"'));
assert(!out.svg.includes('<img'));
console.log('drawing-a3-board-renderer PASS');