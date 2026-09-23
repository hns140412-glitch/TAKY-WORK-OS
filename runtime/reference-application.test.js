'use strict';

const assert=require('assert');
const Compiler=require('./reference-compiler.js');
const Application=require('./reference-application.js');

const compiled=Compiler.compileReferenceProfile({
  reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
  context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
});
assert.equal(compiled.ok,true);

// Positive: generic baseline receives presentation-only changes.
const generic=Application.applyToPresentationProfile({
  a3:{margin_mm:4,layout:{hero_ratio:0.45,support_ratio:0.55}}
},compiled);
assert.equal(generic.ok,true);
assert(generic.applied_parameters.length>=3);
assert.equal(generic.geometry_mutation,false);
assert.equal(generic.fact_mutation,false);
assert.equal(Application.validateApplication(generic,compiled).ok,true);

// Defensive balance: an already-compliant profile is not distorted just to manufacture
// a visible reference effect, and cannot falsely claim causal application.
const compliant=Application.applyToPresentationProfile({
  a3:{margin_mm:12,layout:{hero_ratio:0.74,support_ratio:0.26}}
},compiled);
assert.equal(compliant.ok,true);
assert.equal(compliant.applied_parameters.length,0);
const compliantGate=Application.validateApplication(compliant,compiled);
assert.equal(compliantGate.ok,false);
assert.equal(compliantGate.reason,'REFERENCE_NOT_CAUSALLY_APPLIED');

// A role-dependent reference may emit a semantic-free source-style fallback request,
 // but it must not falsely count that request as already applied.
const archdaily=Compiler.compileReferenceProfile({
  reference_ids:['ARCHDAILY_PLAN_HIERARCHY'],
  context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
});
const deferred=Application.applyToPresentationProfile({
  a3:{margin_mm:12,layout:{hero_ratio:0.74,support_ratio:0.26}}
},archdaily);
assert.equal(deferred.ok,true);
assert.equal(deferred.applied_parameters.length,0);
assert.equal(deferred.deferred.length,0);
assert.equal(deferred.source_style_requests.length,1);
assert.equal(deferred.source_style_requests[0].mode,'SOURCE_STYLE_RANK');
assert.equal(deferred.source_style_requests[0].policy.semantic_inference,false);
assert.equal(Application.validateApplication(deferred,archdaily).ok,false);

console.log('reference-application: PASS');
