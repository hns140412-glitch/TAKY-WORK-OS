'use strict';

const assert=require('assert');
const Health=require('../runtime/vision-api-health.js');

(async()=>{
  let r=await Health.probeAnthropicModel({
    api_key:'test-key',
    model:'model-alias',
    fetch_impl:async(url,options)=>({
      ok:true,
      status:200,
      async json(){
        return {id:'resolved-model-id',display_name:'Resolved Model'};
      }
    })
  });
  assert.equal(r.ok,true);
  assert.equal(r.requested_model,'model-alias');
  assert.equal(r.resolved_model_id,'resolved-model-id');

  r=await Health.probeAnthropicModel({
    api_key:'bad-key',
    model:'model-alias',
    fetch_impl:async()=>({
      ok:false,
      status:401,
      async json(){ return {}; }
    })
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'VISION_MODEL_PROBE_HTTP_401');

  r=await Health.probeAnthropicModel({
    api_key:'test-key',
    model:'missing-model',
    fetch_impl:async()=>({
      ok:false,
      status:404,
      async json(){ return {}; }
    })
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'VISION_MODEL_PROBE_HTTP_404');

  r=await Health.probeAnthropicModel({
    api_key:'',
    model:'model-alias',
    fetch_impl:async()=>{ throw new Error('must not call'); }
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,'ANTHROPIC_API_KEY_REQUIRED');

  console.log('vision-api-health: PASS');
})().catch(error=>{
  console.error(error);
  process.exit(1);
});
