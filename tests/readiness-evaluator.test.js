'use strict';

const assert=require('assert');
const R=require('../runtime/readiness-evaluator.js');

(function productionRequiresAllDurablePrerequisites(){
  let r=R.evaluateProductionReadiness({
    ci:{ok:true},
    measurement_public_key_ready:true,
    vision_public_key_ready:true,
    persistent_capability_key:true
  });
  assert.equal(r.production_ready,true);
  assert.equal(r.staging_ready,true);
  assert.deepEqual([...r.warnings],[]);

  r=R.evaluateProductionReadiness({
    ci:{ok:true},
    measurement_public_key_ready:true,
    vision_public_key_ready:true,
    persistent_capability_key:false
  });
  assert.equal(r.production_ready,false);
  assert.equal(r.staging_ready,true);
  assert(r.warnings.includes('CAPABILITY_KEY_NOT_PERSISTENT_ACROSS_PROCESS_RESTART'));

  r=R.evaluateProductionReadiness({
    ci:{ok:false},
    measurement_public_key_ready:true,
    vision_public_key_ready:true,
    persistent_capability_key:true
  });
  assert.equal(r.production_ready,false);
  assert.equal(r.staging_ready,true);
  assert(r.warnings.includes('EXACT_HEAD_CI_NOT_GREEN'));
})();

(function validationSeparatesObjectiveFromVision(){
  let r=R.evaluateValidationReadiness({
    measurement_private_key_valid:true,
    vision_private_key_valid:true,
    anthropic_api_key_present:true,
    vision_api_probe_ok:true
  });
  assert.equal(r.objective_validation_ready,true);
  assert.equal(r.vision_review_ready,true);
  assert.equal(r.user_facing_validation_ready,true);

  r=R.evaluateValidationReadiness({
    measurement_private_key_valid:true,
    vision_private_key_valid:true,
    anthropic_api_key_present:false,
    vision_api_probe_ok:false
  });
  assert.equal(r.objective_validation_ready,true);
  assert.equal(r.vision_review_ready,false);
  assert.equal(r.user_facing_validation_ready,false);
  assert(r.warnings.includes('ANTHROPIC_API_KEY_NOT_READY'));

  r=R.evaluateValidationReadiness({
    measurement_private_key_valid:false,
    vision_private_key_valid:true,
    anthropic_api_key_present:true,
    vision_api_probe_ok:true
  });
  assert.equal(r.objective_validation_ready,false);
  assert.equal(r.vision_review_ready,true);
  assert.equal(r.user_facing_validation_ready,false);
})();


(function probeFailureBlocksVision(){
  const r=R.evaluateValidationReadiness({
    measurement_private_key_valid:true,
    vision_private_key_valid:true,
    anthropic_api_key_present:true,
    vision_api_probe_ok:false
  });
  assert.equal(r.objective_validation_ready,true);
  assert.equal(r.vision_review_ready,false);
  assert.equal(r.user_facing_validation_ready,false);
  assert(r.warnings.includes('VISION_API_MODEL_PROBE_FAILED'));
})();

console.log('readiness-evaluator: PASS');
