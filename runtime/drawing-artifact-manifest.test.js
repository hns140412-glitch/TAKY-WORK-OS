const assert=require('assert');
const m=require('./drawing-artifact-manifest');

const good=m.buildManifest({
  source_key:'SRC',
  artifacts:[
    {layer_id:'L0_SOURCE',source_id:'S1',source_digest:'sha256:x',revision:'R1'},
    {layer_id:'L1_GEOMETRY',geometry_digest:'g1'},
    {layer_id:'L2_SEMANTIC',semantic_state:'CANDIDATE_SET'},
    {layer_id:'L3_PRESENTATION',view_id:'SALE',artifact_uri:'mem://presentation'},
    {layer_id:'L4_ENTOURAGE',view_id:'SALE',artifact_uri:'mem://entourage'},
    {layer_id:'L5_ANNOTATION',view_id:'SALE',artifact_uri:'mem://annotation'},
    {layer_id:'L6_AI_ATMOSPHERE',view_id:'SALE',artifact_uri:'mem://ai'},
    {layer_id:'L7_FINAL_OVERLAY_VALIDATION',view_id:'SALE',artifact_uri:'mem://final',validation_state:'PASS'}
  ]
});
assert.equal(good.ok,true);

const bad=m.buildManifest({source_key:'SRC',artifacts:[
  {layer_id:'L7_FINAL_OVERLAY_VALIDATION',view_id:'SALE',artifact_uri:'mem://final'}
]});
assert.equal(bad.ok,false);
assert(bad.invalid[0].missing.includes('validation_state'));

console.log('drawing-artifact-manifest: PASS');
