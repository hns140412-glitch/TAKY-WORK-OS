(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingPromptCompiler=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clean=v=>String(v??'').trim();
  const list=v=>Array.isArray(v)?v.map(clean).filter(Boolean):[];

  function compile({task_contract={},preset={},key_summary={},project_direction=''}={}){
    const goal=clean(task_contract.goal);
    const outputs=list(task_contract.outputs);
    const complete=list(task_contract.completion_criteria);
    const keep=list(task_contract.autonomy?.must_keep);
    const may=list(task_contract.autonomy?.may_change);
    const ask=list(task_contract.autonomy?.ask_before);

    if(!goal) return {ok:false,reason:'GOAL_REQUIRED'};

    const lines=[];
    lines.push('GOAL: '+goal);
    if(project_direction) lines.push('DIRECTION: '+clean(project_direction));
    if(outputs.length) lines.push('OUTPUT: '+outputs.join('; '));
    if(keep.length) lines.push('MUST KEEP: '+keep.join('; '));
    if(may.length) lines.push('MAY CHANGE: '+may.join('; '));
    if(ask.length) lines.push('DO NOT INFER / ASK BEFORE: '+ask.join('; '));

    const presetId=clean(preset.preset_id);
    if(presetId) lines.push('PRESENTATION PRESET: '+presetId);

    const presentation=[];
    for(const key of ['linework','poche','material','furniture','shadow','annotation','white_space','context_fade','layout']){
      if(preset[key]!==undefined && preset[key]!==null){
        const value=Array.isArray(preset[key])?preset[key].join('>'):preset[key];
        presentation.push(key+'='+value);
      }
    }
    if(presentation.length) lines.push('PRESENTATION: '+presentation.join('; '));

    if(key_summary.source_authority) lines.push('SOURCE AUTHORITY: '+clean(key_summary.source_authority));
    if(key_summary.geometry_policy) lines.push('GEOMETRY POLICY: '+clean(key_summary.geometry_policy));
    if(complete.length) lines.push('COMPLETE WHEN: '+complete.join('; '));

    lines.push('If presentation conflicts with preserved source information, preserve the source.');
    return {ok:true,prompt:lines.join('\n')};
  }

  return Object.freeze({version:'1.0.0',compile});
});
