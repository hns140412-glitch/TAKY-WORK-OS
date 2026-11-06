'use strict';

const ExecutionContract=require('./execution-contract.js');

function validateProvenance(input={}){
  const {
    authorization,
    source_ids=[],
    producer_id,
    execution_graph_id,
    module_ids=[]
  }=input;

  const auth=ExecutionContract.verifyProductionAuthorization(authorization,{
    producer_id,
    execution_graph_id
  });
  if(!auth.ok) return Object.freeze({ok:false,gate:'FAIL',reason:'AUTHORIZATION_PROVENANCE_INVALID',detail:auth});
  if(!Array.isArray(source_ids) || !source_ids.length) return Object.freeze({ok:false,gate:'FAIL',reason:'SOURCE_IDS_REQUIRED'});
  if(!Array.isArray(module_ids) || !module_ids.length) return Object.freeze({ok:false,gate:'FAIL',reason:'MODULE_IDS_REQUIRED'});

  return Object.freeze({ok:true,gate:'PASS'});
}

module.exports=Object.freeze({version:'1.0.0',validateProvenance});
