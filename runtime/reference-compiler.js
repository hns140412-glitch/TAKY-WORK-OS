'use strict';
function compileReference(input={}){
  const required=['reference_id','dna_id','token_id','engine_parameter','expected_effect','validation_metric'];
  const missing=required.filter(k=>input[k]===undefined||input[k]===null||input[k]==='');
  if(missing.length) return {ok:false,findings:missing.map(k=>'MISSING:'+k)};
  if(input.mutates_geometry===true) return {ok:false,findings:['REFERENCE_TOKEN_GEOMETRY_MUTATION_FORBIDDEN']};
  return {
    ok:true,
    receipt:{
      contract:'REFERENCE_COMPILER_RECEIPT_V1',
      reference_id:input.reference_id,
      dna_id:input.dna_id,
      token_id:input.token_id,
      engine_parameter:input.engine_parameter,
      expected_effect:input.expected_effect,
      validation_metric:input.validation_metric
    }
  };
}
function validateEffect(receipt,measurement={}){
  if(!receipt) return {ok:false,findings:['REFERENCE_RECEIPT_REQUIRED']};
  if(measurement.detectable!==true) return {ok:false,findings:['REFERENCE_EFFECT_NOT_DETECTABLE']};
  if(measurement.geometry_diff && measurement.geometry_diff!==0) return {ok:false,findings:['REFERENCE_EFFECT_CHANGED_GEOMETRY']};
  return {ok:true};
}
module.exports=Object.freeze({compileReference,validateEffect});
