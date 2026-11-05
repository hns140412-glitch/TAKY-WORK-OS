(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProfileStyleResolver=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clone=v=>JSON.parse(JSON.stringify(v));

  function resolve({base_tokens={},profile_registry={},profile_id}={}){
    const id=String(profile_id||'').trim().toUpperCase();
    const profile=(profile_registry.profiles||[]).find(x=>String(x.profile_id||'').toUpperCase()===id);
    if(!profile) return {ok:false,reason:'UNKNOWN_PROFILE',profile_id:id};

    const roles=clone(base_tokens.roles||{});
    const overrides=profile.role_overrides||{};
    for(const [role,values] of Object.entries(overrides)){
      const key=String(role).toUpperCase();
      roles[key]={...(roles[key]||{}),...values};
    }

    return Object.freeze({
      ok:true,
      profile_id:id,
      roles:Object.freeze(roles),
      composition:Object.freeze({...profile.composition}),
      output_checks:Object.freeze([...(profile.output_checks||[])]),
      authority:'PRESENTATION_ONLY'
    });
  }

  return Object.freeze({version:'1.0.0',resolve});
});
