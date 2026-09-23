'use strict';

const crypto=require('crypto');

function verifySignedReceipt(token,{expected_type,public_key_pem,validator_id=null}={}){
  if(!public_key_pem) return Object.freeze({ok:false,reason:'VALIDATOR_PUBLIC_KEY_REQUIRED'});
  if(typeof token!=='string' || !token.includes('.')) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_FORMAT_INVALID'});
  const parts=token.split('.');
  if(parts.length!==2) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_FORMAT_INVALID'});
  const [encoded,sigText]=parts;

  let publicKey;
  try{ publicKey=crypto.createPublicKey(public_key_pem); }
  catch(e){ return Object.freeze({ok:false,reason:'VALIDATOR_PUBLIC_KEY_INVALID'}); }

  let valid=false;
  try{
    valid=crypto.verify(null,Buffer.from(encoded),publicKey,Buffer.from(sigText,'base64url'));
  }catch(e){
    return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_SIGNATURE_INVALID'});
  }
  if(!valid) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_SIGNATURE_INVALID'});

  let body;
  try{ body=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8')); }
  catch(e){ return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_PAYLOAD_INVALID'}); }

  const now=Date.now();
  if(body.v!==1 || body.alg!=='Ed25519') return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_VERSION_INVALID'});
  if(expected_type && body.type!==expected_type){
    return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_TYPE_MISMATCH',expected_type,actual_type:body.type});
  }
  if(validator_id && body.validator_id!==validator_id){
    return Object.freeze({ok:false,reason:'UNTRUSTED_VALIDATOR_ID',expected:validator_id,actual:body.validator_id});
  }
  if(typeof body.exp!=='number' || now>body.exp) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_EXPIRED'});
  if(typeof body.iat!=='number' || body.iat>now+30000) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_IAT_INVALID'});
  if(!body.jti) return Object.freeze({ok:false,reason:'VALIDATOR_RECEIPT_JTI_REQUIRED'});

  return Object.freeze({
    ok:true,
    body:Object.freeze(body),
    payload:Object.freeze(body.payload||{}),
    validator_id:body.validator_id
  });
}

module.exports=Object.freeze({version:'1.0.0',verifySignedReceipt});
