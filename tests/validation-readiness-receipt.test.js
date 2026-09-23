'use strict';

const assert=require('assert');
const crypto=require('crypto');
const TestSigner=require('./validator-test-helper.js');
const Receipt=require('../runtime/validation-readiness-receipt.js');

function fingerprintPublicPem(pem){
  const key=crypto.createPublicKey(pem);
  const der=key.export({type:'spki',format:'der'});
  return crypto.createHash('sha256').update(der).digest('hex').slice(0,24);
}

const visionFingerprint=fingerprintPublicPem(process.env.TAKY_VISION_PUBLIC_KEY_PEM);

(function signedReadyReceiptPasses(){
  const signed=TestSigner.signValidationReadiness({
    objective_validation_ready:true,
    vision_review_ready:true,
    user_facing_validation_ready:true,
    vision_public_fingerprint:visionFingerprint,
    vision_model:'test-vision-model'
  });
  assert.equal(signed.ok,true);

  const verified=Receipt.verifyValidationReadiness(
    signed.receipt,
    {expected_vision_public_fingerprint:visionFingerprint}
  );
  assert.equal(verified.ok,true,JSON.stringify(verified,null,2));
  assert.equal(verified.payload.user_facing_validation_ready,true);
})();

(function mismatchedVisionKeyFails(){
  const signed=TestSigner.signValidationReadiness({
    objective_validation_ready:true,
    vision_review_ready:true,
    user_facing_validation_ready:true,
    vision_public_fingerprint:visionFingerprint
  });
  const verified=Receipt.verifyValidationReadiness(
    signed.receipt,
    {expected_vision_public_fingerprint:'000000000000000000000000'}
  );
  assert.equal(verified.ok,false);
  assert.equal(verified.reason,'VISION_VALIDATION_KEY_FINGERPRINT_MISMATCH');
})();

(function signedNotReadyCannotBecomeProductionReady(){
  const signed=TestSigner.signValidationReadiness({
    objective_validation_ready:true,
    vision_review_ready:false,
    user_facing_validation_ready:false,
    vision_public_fingerprint:visionFingerprint
  });
  const verified=Receipt.verifyValidationReadiness(
    signed.receipt,
    {expected_vision_public_fingerprint:visionFingerprint}
  );
  assert.equal(verified.ok,false);
  assert.equal(verified.reason,'VALIDATION_SERVICE_NOT_USER_FACING_READY');
})();

(function missingReceiptFailsClosed(){
  const verified=Receipt.verifyValidationReadiness(null,{
    expected_vision_public_fingerprint:visionFingerprint
  });
  assert.equal(verified.ok,false);
})();

console.log('validation-readiness-receipt: PASS');
