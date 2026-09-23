'use strict';

const fs=require('fs');
const path=require('path');
const Capability=require('./capability-token.js');

function inside(root,candidate){
  const r=path.resolve(root);
  const c=path.resolve(candidate);
  return c===r || c.startsWith(r+path.sep);
}

function verifyScope(input={}){
  const {
    artifact_id,
    artifact_type,
    producer_id,
    execution_graph_id,
    source_ids=[],
    exposure_grant
  }=input;

  if(!artifact_id || !artifact_type) return Object.freeze({ok:false,reason:'ARTIFACT_ID_AND_TYPE_REQUIRED'});

  const verified=Capability.verifyToken(exposure_grant,'TAKY_EXPOSURE_GRANT');
  if(!verified.ok) return Object.freeze({ok:false,reason:'VALID_EXPOSURE_GRANT_REQUIRED',detail:verified});

  const grant=verified.payload;
  if(grant.producer_id!==producer_id || grant.execution_graph_id!==execution_graph_id){
    return Object.freeze({ok:false,reason:'ARTIFACT_PROVENANCE_SCOPE_MISMATCH'});
  }

  return Object.freeze({
    ok:true,
    grant,
    record:Object.freeze({
      artifact_id,
      artifact_type,
      producer_id,
      execution_graph_id,
      source_ids:Object.freeze([...source_ids]),
      exposure_target:grant.target,
      validation_status:grant.validation_status,
      status:'REGISTERED_PRODUCTION_ARTIFACT'
    })
  });
}

function registerProductionArtifact(input={}){
  const checked=verifyScope(input);
  if(!checked.ok) return checked;
  return Object.freeze({ok:true,record:checked.record});
}

function publishProductionArtifact(input={}){
  const checked=verifyScope(input);
  if(!checked.ok) return checked;

  const stagingRoot=path.resolve(process.env.TAKY_STAGING_ROOT||'artifacts/staging');
  const productionRoot=path.resolve(process.env.TAKY_PRODUCTION_ROOT||'artifacts/production');
  const sourcePath=path.resolve(input.staging_path||'');
  const fileName=String(input.file_name||'').trim();

  if(!input.staging_path || !fileName) return Object.freeze({ok:false,reason:'STAGING_PATH_AND_FILE_NAME_REQUIRED'});
  if(!inside(stagingRoot,sourcePath)) return Object.freeze({ok:false,reason:'STAGING_PATH_OUTSIDE_ALLOWED_ROOT'});
  if(!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) return Object.freeze({ok:false,reason:'STAGING_ARTIFACT_NOT_FOUND'});

  const safeName=path.basename(fileName);
  if(safeName!==fileName) return Object.freeze({ok:false,reason:'FILE_NAME_PATH_TRAVERSAL_FORBIDDEN'});
  const destination=path.resolve(productionRoot,safeName);
  if(!inside(productionRoot,destination)) return Object.freeze({ok:false,reason:'PRODUCTION_PATH_ESCAPE_FORBIDDEN'});

  fs.mkdirSync(productionRoot,{recursive:true});
  fs.copyFileSync(sourcePath,destination);

  return Object.freeze({
    ok:true,
    record:Object.freeze({
      ...checked.record,
      status:'PUBLISHED_PRODUCTION_ARTIFACT',
      staging_path:sourcePath,
      production_path:destination
    })
  });
}

module.exports=Object.freeze({
  version:'2.0.0',
  registerProductionArtifact,
  publishProductionArtifact
});
