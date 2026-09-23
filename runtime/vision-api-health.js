'use strict';

async function probeAnthropicModel(input={}){
  const apiKey=String(input.api_key||'').trim();
  const model=String(input.model||'').trim();
  const fetchImpl=input.fetch_impl||globalThis.fetch;
  const timeoutMs=Number(input.timeout_ms||3000);

  if(!apiKey) return Object.freeze({ok:false,reason:'ANTHROPIC_API_KEY_REQUIRED'});
  if(!model) return Object.freeze({ok:false,reason:'VISION_MODEL_REQUIRED'});
  if(typeof fetchImpl!=='function') return Object.freeze({ok:false,reason:'FETCH_UNAVAILABLE'});

  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),Math.max(500,Math.min(timeoutMs,10000))):null;

  try{
    const response=await fetchImpl(
      'https://api.anthropic.com/v1/models/'+encodeURIComponent(model),
      {
        method:'GET',
        headers:{
          'x-api-key':apiKey,
          'anthropic-version':'2023-06-01',
          'accept':'application/json'
        },
        ...(controller?{signal:controller.signal}:{})
      }
    );

    if(!response?.ok){
      return Object.freeze({
        ok:false,
        reason:'VISION_MODEL_PROBE_HTTP_'+String(response?.status||'UNKNOWN'),
        http_status:response?.status||null,
        requested_model:model
      });
    }

    let data;
    try{ data=await response.json(); }
    catch(e){ return Object.freeze({ok:false,reason:'VISION_MODEL_PROBE_JSON_INVALID',requested_model:model}); }

    if(!data?.id){
      return Object.freeze({ok:false,reason:'VISION_MODEL_ID_MISSING',requested_model:model});
    }

    return Object.freeze({
      ok:true,
      requested_model:model,
      resolved_model_id:String(data.id),
      display_name:data.display_name?String(data.display_name):null
    });
  }catch(error){
    const aborted=error?.name==='AbortError';
    return Object.freeze({
      ok:false,
      reason:aborted?'VISION_MODEL_PROBE_TIMEOUT':'VISION_MODEL_PROBE_NETWORK_FAILED',
      requested_model:model
    });
  }finally{
    if(timer) clearTimeout(timer);
  }
}

module.exports=Object.freeze({
  version:'1.0.0',
  probeAnthropicModel
});
