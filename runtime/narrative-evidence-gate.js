'use strict';

const USER_VISIBLE_STATES=new Set(['CONFIRMED','SUPPORTED']);
const ALLOWED_STRENGTH=Object.freeze({
  CONFIRMED:new Set(['CONFIRMED','SUPPORTED','NEUTRAL']),
  SUPPORTED:new Set(['SUPPORTED','NEUTRAL'])
});

function validateClaims(claims=[]){
  const findings=[];
  for(const c of claims){
    if(!c || !c.claim_id){
      findings.push({code:'CLAIM_ID_REQUIRED'});
      continue;
    }
    if(!Array.isArray(c.evidence_refs) || !c.evidence_refs.length){
      findings.push({code:'CLAIM_EVIDENCE_REQUIRED',claim_id:c.claim_id});
      continue;
    }
    if(!USER_VISIBLE_STATES.has(c.evidence_state)){
      findings.push({code:'CLAIM_EVIDENCE_TOO_WEAK',claim_id:c.claim_id,evidence_state:c.evidence_state});
      continue;
    }
    const allowed=ALLOWED_STRENGTH[c.evidence_state];
    if(!allowed || !allowed.has(c.strength)){
      findings.push({
        code:'CLAIM_STRENGTH_EXCEEDS_EVIDENCE',
        claim_id:c.claim_id,
        evidence_state:c.evidence_state,
        strength:c.strength
      });
    }
  }
  return Object.freeze({ok:findings.length===0,findings:Object.freeze(findings)});
}

module.exports=Object.freeze({version:'1.0.0',validateClaims});
