'use strict';

const crypto=require('crypto');

const VALIDATOR_ID='VISION_VALIDATOR_V1';

function loadKeys(){
  const privatePem=process.env.TAKY_VISION_PRIVATE_KEY_PEM;
  const publicPem=process.env.TAKY_VISION_PUBLIC_KEY_PEM;
  if(privatePem){
    const privateKey=crypto.createPrivateKey(privatePem);
    const publicKey=publicPem?crypto.createPublicKey(publicPem):crypto.createPublicKey(privateKey);
    return {privateKey,publicKey,mode:'CONFIGURED_PRIVATE'};
  }
  if(publicPem){
    return {privateKey:null,publicKey:crypto.createPublicKey(publicPem),mode:'VERIFY_ONLY'};
  }
  const generated=crypto.generateKeyPairSync('ed25519');
  return {privateKey:generated.privateKey,publicKey:generated.publicKey,mode:'EPHEMERAL_PROCESS'};
}

const KEYS=loadKeys();

function signReview(payload={}){
  if(!KEYS.privateKey) return Object.freeze({ok:false,reason:'VISION_SIGNING_KEY_UNAVAILABLE'});
  if(!payload.artifact_digest) return Object.freeze({ok:false,reason:'ARTIFACT_DIGEST_REQUIRED'});
  const now=Date.now();
  const body=JSON.stringify({
    v:2,
    alg:'Ed25519',
    type:'TAKY_VISION_REVIEW_RECEIPT',
    validator_id:VALIDATOR_ID,
    jti:crypto.randomUUID(),
    payload:{
      artifact_digest:payload.artifact_digest,
      professional_family_pass:payload.professional_family_pass===true,
      reference_effect_visible_without_explanation:payload.reference_effect_visible_without_explanation===true,
      generic_layout_detected:payload.generic_layout_detected===true,
      decision_value_pass:payload.decision_value_pass===true
    },
    iat:now,
    exp:now+600000
  });
  const encoded=Buffer.from(body).toString('base64url');
  const sig=crypto.sign(null,Buffer.from(encoded),KEYS.privateKey).toString('base64url');
  return Object.freeze({ok:true,receipt:encoded+'.'+sig});
}

function verifyReview(receipt,expectedDigest){
  if(typeof receipt!=='string' || !receipt.includes('.')) return Object.freeze({ok:false,reason:'VISION_RECEIPT_FORMAT_INVALID'});
  const parts=receipt.split('.');
  if(parts.length!==2) return Object.freeze({ok:false,reason:'VISION_RECEIPT_FORMAT_INVALID'});
  const [encoded,sigText]=parts;
  const valid=crypto.verify(null,Buffer.from(encoded),KEYS.publicKey,Buffer.from(sigText,'base64url'));
  if(!valid) return Object.freeze({ok:false,reason:'VISION_RECEIPT_SIGNATURE_INVALID'});

  let body;
  try{ body=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8')); }
  catch(e){ return Object.freeze({ok:false,reason:'VISION_RECEIPT_PAYLOAD_INVALID'}); }

  if(body.v!==2 || body.alg!=='Ed25519' || body.type!=='TAKY_VISION_REVIEW_RECEIPT' || body.validator_id!==VALIDATOR_ID){
    return Object.freeze({ok:false,reason:'UNTRUSTED_VISION_VALIDATOR'});
  }
  const now=Date.now();
  if(typeof body.exp!=='number' || now>body.exp) return Object.freeze({ok:false,reason:'VISION_RECEIPT_EXPIRED'});
  if(typeof body.iat!=='number' || body.iat>now+30000) return Object.freeze({ok:false,reason:'VISION_RECEIPT_IAT_INVALID'});

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

function exportPublicKeyPem(){
  return KEYS.publicKey.export({type:'spki',format:'pem'}).toString();
}

module.exports=Object.freeze({
  version:'2.0.0',
  VALIDATOR_ID,
  key_mode:KEYS.mode,
  signReview,
  verifyReview,
  exportPublicKeyPem
});
