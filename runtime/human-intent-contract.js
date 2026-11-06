'use strict';

const crypto=require('crypto');

function clean(v){ return String(v??'').trim(); }

function compileHumanIntent(input={}){
  const desired_outcome=clean(input.desired_outcome);
  const success_criteria=Array.isArray(input.success_criteria)
    ? [...new Set(input.success_criteria.map(clean).filter(Boolean))]
    : [];

  if(!desired_outcome){
    return Object.freeze({ok:false,reason:'DESIRED_OUTCOME_REQUIRED'});
  }

  const canonical={
    desired_outcome,
    success_criteria
  };
  const intent_digest=crypto.createHash('sha256')
    .update(JSON.stringify(canonical))
    .digest('hex');

  return Object.freeze({
    ok:true,
    desired_outcome,
    success_criteria:Object.freeze(success_criteria),
    intent_digest
  });
}

module.exports=Object.freeze({
  version:'1.0.0',
  compileHumanIntent
});
