#!/usr/bin/env node
'use strict';
const fs=require('fs');
const crypto=require('crypto');
const finalizer=require('./drawing-finalization-orchestrator');

const sha256=text=>'sha256:'+crypto.createHash('sha256').update(text).digest('hex');

function evaluate({artifact_class='EXPERIMENT',artifact_text='',production_context={}}={}){
  const cls=String(artifact_class||'EXPERIMENT').toUpperCase();
  if(!['PREVIEW','FINAL','USER_FACING'].includes(cls)){
    return {ok:true,decision:'ALLOW_INTERNAL',showable:false,artifact_class:cls,artifact_digest:sha256(artifact_text)};
  }
  const artifactDigest=sha256(artifact_text);
  const evidence={...(production_context.validation_evidence||{}),artifact_digest:artifactDigest};
  const input={...production_context,artifact_class:cls,artifact_digest:artifactDigest,validation_evidence:evidence};
  const result=finalizer.decideUserExposure(input);
  return {...result,showable:result.ok===true&&result.decision==='SHOW',artifact_class:cls,artifact_digest:artifactDigest};
}
function main(){
  const args=process.argv.slice(2);
  const get=n=>{const i=args.indexOf('--'+n); return i>=0?args[i+1]:null;};
  const artifactPath=get('artifact');
  const contextPath=get('production-context');
  const artifactClass=get('artifact-class')||'EXPERIMENT';
  if(!artifactPath) throw new Error('ARG_REQUIRED:artifact');
  const artifactText=fs.readFileSync(artifactPath,'utf8');
  const productionContext=contextPath?JSON.parse(fs.readFileSync(contextPath,'utf8')):{};
  const result=evaluate({artifact_class:artifactClass,artifact_text:artifactText,production_context:productionContext});
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.exit(result.ok?0:4);
}
if(require.main===module) main();
module.exports=Object.freeze({evaluate,sha256});
