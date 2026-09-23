'use strict';

function evaluateProductionReadiness(input={}){
  const ci=input.ci||{ok:false};
  const measurementPublicKeyReady=input.measurement_public_key_ready===true;
  const visionPublicKeyReady=input.vision_public_key_ready===true;
  const persistentCapabilityKey=input.persistent_capability_key===true;

  const warnings=[];
  if(!ci.ok) warnings.push('EXACT_HEAD_CI_NOT_GREEN');
  if(!measurementPublicKeyReady) warnings.push('MEASUREMENT_PUBLIC_KEY_NOT_READY');
  if(!visionPublicKeyReady) warnings.push('VISION_PUBLIC_KEY_NOT_READY');
  if(!persistentCapabilityKey) warnings.push('CAPABILITY_KEY_NOT_PERSISTENT_ACROSS_PROCESS_RESTART');

  return Object.freeze({
    production_ready:Boolean(
      ci.ok &&
      measurementPublicKeyReady &&
      visionPublicKeyReady &&
      persistentCapabilityKey
    ),
    staging_ready:true,
    warnings:Object.freeze(warnings)
  });
}

function evaluateValidationReadiness(input={}){
  const measurementPrivateKeyValid=input.measurement_private_key_valid===true;
  const visionPrivateKeyValid=input.vision_private_key_valid===true;
  const anthropicApiKeyPresent=input.anthropic_api_key_present===true;
  const visionApiProbeOk=input.vision_api_probe_ok===true;

  const warnings=[];
  if(!measurementPrivateKeyValid) warnings.push('MEASUREMENT_PRIVATE_KEY_NOT_READY');
  if(!visionPrivateKeyValid) warnings.push('VISION_PRIVATE_KEY_NOT_READY');
  if(!anthropicApiKeyPresent) warnings.push('ANTHROPIC_API_KEY_NOT_READY');
  if(anthropicApiKeyPresent && !visionApiProbeOk) warnings.push('VISION_API_MODEL_PROBE_FAILED');

  return Object.freeze({
    objective_validation_ready:measurementPrivateKeyValid,
    vision_review_ready:Boolean(
      visionPrivateKeyValid &&
      anthropicApiKeyPresent &&
      visionApiProbeOk
    ),
    user_facing_validation_ready:Boolean(
      measurementPrivateKeyValid &&
      visionPrivateKeyValid &&
      anthropicApiKeyPresent &&
      visionApiProbeOk
    ),
    warnings:Object.freeze(warnings)
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  evaluateProductionReadiness,
  evaluateValidationReadiness
});
