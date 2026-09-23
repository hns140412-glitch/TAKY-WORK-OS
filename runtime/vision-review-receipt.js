'use strict';

const crypto=require('crypto');

const VALIDATOR_ID='VISION_VALIDATOR_V1';

function secret(){
  const value=process.env.TAKY_VISION_VALIDATOR_SECRET;
  if(!value || value.length<16) return null;
  return value;
}

function signReview(payload={}){
  const key=secret();
  if(!key) return Object.freeze({ok:false,reason:'TAKY_VISION_VALIDATOR_SECRET_REQUIRED'});
  if(!payload.artifact_digest) return Object.freeze({ok:false,reason:'ARTIFACT_DIGEST_REQUIRED'});
  const body=JSON.stringify({
    v:1,
    type:'TAKY_VISION_REVIEW_RECEIPT',
    validator_id:VALIDATOR_ID,
    payload:{
      artifact_digest:payload.artifact_digest,
      professional_family_pass:payload.professional_family_pass===true,
      reference_effect_visible_without_explanation:payload.reference_effect_visible_without_explanation===true,
      generic_layout_detected:payload.generic_layout_detected===true,
      decision_value_pass:payload.decision_value_pass===true
    },
    iat:Date.now()
  });
  const encoded=Buffer.from(body).toString('base64url');
  const sig=crypto.createHmac('sha256',key).update(encoded).digest('base64url');
  return Object.freeze({ok:true,receipt:encoded+'.'+sig});
}

function verifyReview(receipt,expectedDigest){
  const key=secret();
  if(!key) return Object.freeze({ok:false,reason:'TAKY_VISION_VALIDATOR_SECRET_REQUIRED'});
  if(typeof receipt!=='string' || !receipt.includes('.')) return Object.freeze({ok:false,reason:'VISION_RECEIPT_FORMAT_INVALID'});
  const [encoded,sig]=receipt.split('.');
  const expected=crypto.createHmac('sha256',key).update(encoded).digest('base64url');
  const a=Buffer.from(sig||'');
  const b=Buffer.from(expected);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return Object.freeze({ok:false,reason:'VISION_RECEIPT_SIGNATURE_INVALID'});
  let body;
  try{ body=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8')); }
  catch(e){ return Object.freeze({ok:false,reason:'VISION_RECEIPT_PAYLOAD_INVALID'}); }
  if(body.type!=='TAKY_VISION_REVIEW_RECEIPT' || body.validator_id!==VALIDATOR_ID){
    return Object.freeze({ok:false,reason:'UNTRUSTED_VISION_VALIDATOR'});
  }
  const p=body.payload||{};
  if(expectedDigest && p.artifact_digest!==expectedDigest){
    return Object.freeze({ok:false,reason:'VISION_REVIEW_DIGEST_MISMATCH'});
  }
  const pass=
    p.professional_family_pass===true &&
    p.reference_effect_visible_without_explanation===true &&
    p.generic_layout_detected===false &&
    p.decision_value_pass===true;
  if(!pass) return Object.freeze({ok:false,reason:'VISION_REVIEW_GATE_FAILED',payload:Object.freeze(p)});
  return Object.freeze({ok:true,payload:Object.freeze(p),validator_id:VALIDATOR_ID});
}

module.exports=Object.freeze({
  version:'1.0.0',
  VALIDATOR_ID,
  signReview,
  verifyReview
});
