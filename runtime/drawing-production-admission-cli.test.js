'use strict';
const assert=require('assert');
const admission=require('./drawing-production-admission-cli');

const artifact='<svg>fixture</svg>';
const artifactDigest=admission.sha256(artifact);
const sourceDigest='sha256:source-fixture';
const bundle='VAL-BUNDLE-001';
const gateNames=['SOURCE','GEOMETRY','FACT','SEMANTIC','REFERENCE_EFFECT','ARCHITECTURAL_READABILITY','USER_EFFECT'];
const gates=Object.fromEntries(gateNames.map(g=>[g,{status:'PASS',validator:'fixture-validator',evidence_refs:['fixture:'+g]}]));
const context={
  operations:['COMPOSE_PRESENTATION_LAYERS'],
  one_off:false,
  source_digest:sourceDigest,
  validation_bundle_id:bundle,
  execution_receipt:{
    receipt_type:'AUTHORIZED_ENGINE_EXECUTION',
    route:'TASK>DRAWING_ROUTER>AUTHORIZED_ENGINE',
    engine_id:'DRAWING_ENGINE_V2',
    engine_version:'fixture',
    engine_commit_sha:'deadbeef',
    source_digest:sourceDigest,
    artifact_digest:artifactDigest,
    validation_bundle_id:bundle,
    operation_ids:['OP-1']
  },
  validation_evidence:{
    validation_bundle_id:bundle,
    source_digest:sourceDigest,
    artifact_digest:artifactDigest,
    gates
  }
};
let r=admission.evaluate({artifact_class:'FINAL',artifact_text:artifact,production_context:context});
assert.equal(r.ok,true,JSON.stringify(r));
assert.equal(r.showable,true);
assert.equal(r.decision,'SHOW');

const bad=JSON.parse(JSON.stringify(context));
delete bad.validation_evidence.gates.GEOMETRY;
r=admission.evaluate({artifact_class:'FINAL',artifact_text:artifact,production_context:bad});
assert.equal(r.ok,false);
assert.equal(r.showable,false);
assert.equal(r.decision,'HOLD');

r=admission.evaluate({artifact_class:'EXPERIMENT',artifact_text:artifact,production_context:{}});
assert.equal(r.ok,true);
assert.equal(r.showable,false);
assert.equal(r.decision,'ALLOW_INTERNAL');
console.log('drawing-production-admission-cli PASS');
