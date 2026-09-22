const assert=require('assert');
const engine=require('./drawing-engine-core');

function ks(objects,extra={}){
  const r=engine.normalizeKeyState({
    source_id:'SRC-1',
    source_authority:'AUTHORITATIVE_VECTOR',
    revision:'R1',
    user_intent:{purpose:'sales'},
    objects,
    ...extra
  });
  assert.equal(r.ok,true,JSON.stringify(r));
  return r.key_state;
}

const base=ks([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[10,0]},semantics:{role:'wall'},presentation:{weight:2}},
  {object_id:'ROOM-1',object_type:'ROOM',policy:'CHANGE',geometry:{poly:[[0,0],[10,0],[10,8],[0,8]]},semantics:{name:'Living'},presentation:{fill:'none'}},
  {object_id:'UNK-1',object_type:'UNKNOWN',policy:'UNKNOWN',geometry:{line:[[1,1],[2,2]]},semantics:null,presentation:{stroke:'gray'}}
]);
const styled=ks([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[10,0]},semantics:{role:'wall'},presentation:{weight:5}},
  {object_id:'ROOM-1',object_type:'ROOM',policy:'CHANGE',geometry:{poly:[[0,0],[10,0],[10,8],[0,8]]},semantics:{name:'Living'},presentation:{fill:'oak'}},
  {object_id:'UNK-1',object_type:'UNKNOWN',policy:'UNKNOWN',geometry:{line:[[1,1],[2,2]]},semantics:null,presentation:{stroke:'gray'}},
  {object_id:'HUMAN-1',object_type:'ENTOURAGE',policy:'MAY_CHANGE',geometry:null,semantics:{role:'scale'},presentation:{kind:'silhouette'},presentation_only:true}
]);
assert.equal(engine.validateKeyPreservation(base,styled).ok,true);
assert.equal(engine.geometryFingerprint(base),engine.geometryFingerprint(styled));
assert.equal(engine.semanticFingerprint(base),engine.semanticFingerprint(styled));
assert.equal(engine.keyStateFingerprint(base),engine.keyStateFingerprint(styled));

const drift=ks([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[11,0]},semantics:{role:'wall'},presentation:{weight:5}},
  {object_id:'ROOM-1',object_type:'ROOM',policy:'CHANGE',geometry:{poly:[[0,0],[10,0],[10,8],[0,8]]},semantics:{name:'Living'},presentation:{fill:'oak'}},
  {object_id:'UNK-1',object_type:'UNKNOWN',policy:'UNKNOWN',geometry:{line:[[1,1],[2,2]]},semantics:null,presentation:{stroke:'gray'}}
]);
assert.equal(engine.validateKeyPreservation(base,drift).ok,false);
assert(engine.validateKeyPreservation(base,drift).issues.some(x=>x.code==='GEOMETRY_DRIFT'));

const unknownChanged=ks([
  {object_id:'WALL-1',object_type:'WALL',policy:'KEEP',geometry:{a:[0,0],b:[10,0]},semantics:{role:'wall'},presentation:{weight:2}},
  {object_id:'ROOM-1',object_type:'ROOM',policy:'CHANGE',geometry:{poly:[[0,0],[10,0],[10,8],[0,8]]},semantics:{name:'Living'},presentation:{fill:'none'}},
  {object_id:'UNK-1',object_type:'UNKNOWN',policy:'UNKNOWN',geometry:{line:[[1,1],[2,2]]},semantics:null,presentation:{stroke:'red'}}
]);
assert.equal(engine.validateKeyPreservation(base,unknownChanged).ok,false);
assert(engine.validateKeyPreservation(base,unknownChanged).issues.some(x=>x.code==='UNKNOWN_SOURCE_APPEARANCE_CHANGED'));

assert.equal(engine.routeExecution({purpose:'SALES_PLAN'}).mode,'CONTROLLED');
assert.equal(engine.routeExecution({purpose:'CAD_EXCEL',requires_numeric_authority:true}).mode,'AUTHORITATIVE');
assert.equal(engine.routeExecution({purpose:'STYLE_ONLY',source_authority:'AUTHORITATIVE_VECTOR'}).mode,'FAST');
assert.equal(engine.evaluateUserIntent({required_outcomes:['LAYOUT_READABLE','GEOMETRY_PRESERVED'],observed_outcomes:['LAYOUT_READABLE']}).ok,false);
assert.equal(engine.evaluateUserIntent({required_outcomes:['LAYOUT_READABLE'],observed_outcomes:['layout_readable']}).ok,true);

console.log('drawing-engine-core: PASS');
