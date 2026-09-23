'use strict';

const Verifier=require('./validator-receipt-verifier.js');

const VALIDATOR_ID='SOURCE_FIDELITY_VALIDATOR_V1';
const MIN_PARITY=0.999;

function publicKey(){
  return process.env.TAKY_MEASUREMENT_PUBLIC_KEY_PEM||null;
}

function verifySourceFidelity(receipt,expectedCandidateDigest=null,expectedSourceDigest=null){
  const verified=Verifier.verifySignedReceipt(receipt,{
    expected_type:'TAKY_SOURCE_FIDELITY_RECEIPT',
    public_key_pem:publicKey(),
    validator_id:VALIDATOR_ID
  });
  if(!verified.ok) return verified;

  const p=verified.payload;
  if(expectedCandidateDigest && p.candidate_digest!==expectedCandidateDigest){
    return Object.freeze({ok:false,reason:'SOURCE_FIDELITY_CANDIDATE_DIGEST_MISMATCH'});
  }
  if(expectedSourceDigest && p.source_sha256!==expectedSourceDigest){
    return Object.freeze({ok:false,reason:'SOURCE_FIDELITY_SOURCE_DIGEST_MISMATCH'});
  }

  const required=[
    ['controlled_geometry_match',p.controlled_geometry_match===true],
    ['source_viewbox_match',p.source_viewbox_match===true],
    ['canonical_inline_match',p.canonical_inline_match===true],
    ['inline_transform_safe',p.inline_transform_safe===true],
    ['artifact_parity_score',Number(p.artifact_parity_score)>=MIN_PARITY]
  ];
  const failed=required.filter(([,ok])=>!ok).map(([name])=>name);
  if(failed.length){
    return Object.freeze({ok:false,reason:'SOURCE_FIDELITY_GATE_FAILED',failed:Object.freeze(failed),payload:p});
  }

  return Object.freeze({ok:true,payload:p,validator_id:VALIDATOR_ID});
}

module.exports=Object.freeze({
  version:'1.0.0',
  VALIDATOR_ID,
  MIN_PARITY,
  key_mode:'VERIFY_ONLY',
  verifySourceFidelity
});
