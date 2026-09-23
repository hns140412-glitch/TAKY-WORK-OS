'use strict';

const Capability=require('./capability-token.js');

function registerProductionArtifact(input={}){
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

  const record=Object.freeze({
    artifact_id,
    artifact_type,
    producer_id,
    execution_graph_id,
    source_ids:Object.freeze([...source_ids]),
    exposure_target:grant.target,
    validation_status:grant.validation_status,
    status:'REGISTERED_PRODUCTION_ARTIFACT'
  });

  return Object.freeze({ok:true,record});
}

module.exports=Object.freeze({version:'1.0.0',registerProductionArtifact});
