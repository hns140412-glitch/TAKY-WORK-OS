'use strict';

const ALLOWED_STATES=new Set(['VERIFIED','SUPPORTED','AMBIGUOUS','UNKNOWN','CONFLICT']);
const STYLABLE_STATES=new Set(['VERIFIED','SUPPORTED']);

function validateSemanticAssignments(assignments=[]){
  const findings=[];
  for(const a of assignments){
    if(!a || !a.region_id){
      findings.push({code:'REGION_ID_REQUIRED'});
      continue;
    }
    if(!ALLOWED_STATES.has(a.state)){
      findings.push({code:'INVALID_SEMANTIC_STATE',region_id:a.region_id,state:a.state});
      continue;
    }
    if(a.presentation_token && !STYLABLE_STATES.has(a.state)){
      findings.push({
        code:'UNVERIFIED_SEMANTIC_STYLING_FORBIDDEN',
        region_id:a.region_id,
        state:a.state,
        presentation_token:a.presentation_token
      });
    }
  }
  return Object.freeze({ok:findings.length===0,findings:Object.freeze(findings)});
}

module.exports=Object.freeze({
  version:'1.0.0',
  ALLOWED_STATES,
  STYLABLE_STATES,
  validateSemanticAssignments
});
