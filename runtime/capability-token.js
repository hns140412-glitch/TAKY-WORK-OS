'use strict';

const crypto=require('crypto');

function loadKeyPair(){
  const privatePem=process.env.TAKY_CAPABILITY_PRIVATE_KEY_PEM;
  const publicPem=process.env.TAKY_CAPABILITY_PUBLIC_KEY_PEM;

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

const KEYS=loadKeyPair();

function ttlMs(){
  const raw=Number(process.env.TAKY_CAPABILITY_TTL_MS||600000);
  if(!Number.isFinite(raw) || raw<1000) return 600000;
  return Math.min(raw,3600000);
}

function signPayload(type,payload={}){
  if(!KEYS.privateKey) return Object.freeze({ok:false,reason:'CAPABILITY_SIGNING_KEY_UNAVAILABLE'});
  const now=Date.now();
  const body=JSON.stringify({
    v:2,
    alg:'Ed25519',
    type,
    payload,
    jti:crypto.randomUUID(),
    iat:now,
    exp:now+ttlMs()
  });
  const encoded=Buffer.from(body).toString('base64url');
  const sig=crypto.sign(null,Buffer.from(encoded),KEYS.privateKey).toString('base64url');
  return Object.freeze({ok:true,token:encoded+'.'+sig});
}

function verifyToken(token,expectedType){
  if(typeof token!=='string' || !token.includes('.')){
    return Object.freeze({ok:false,reason:'TOKEN_FORMAT_INVALID'});
  }
  const parts=token.split('.');
  if(parts.length!==2) return Object.freeze({ok:false,reason:'TOKEN_FORMAT_INVALID'});
  const [encoded,sigText]=parts;

  let sig;
  try{ sig=Buffer.from(sigText,'base64url'); }
  catch(e){ return Object.freeze({ok:false,reason:'TOKEN_SIGNATURE_INVALID'}); }

  const valid=crypto.verify(null,Buffer.from(encoded),KEYS.publicKey,sig);
  if(!valid) return Object.freeze({ok:false,reason:'TOKEN_SIGNATURE_INVALID'});

  let body;
  try{ body=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8')); }
  catch(e){ return Object.freeze({ok:false,reason:'TOKEN_PAYLOAD_INVALID'}); }

  if(body.v!==2 || body.alg!=='Ed25519'){
    return Object.freeze({ok:false,reason:'TOKEN_VERSION_OR_ALGORITHM_INVALID'});
  }
  if(expectedType && body.type!==expectedType){
    return Object.freeze({ok:false,reason:'TOKEN_TYPE_MISMATCH',expectedType,actualType:body.type});
  }

  const now=Date.now();
  if(typeof body.exp!=='number' || now>body.exp){
    return Object.freeze({ok:false,reason:'TOKEN_EXPIRED'});
  }
  if(typeof body.iat!=='number' || body.iat>now+30000){
    return Object.freeze({ok:false,reason:'TOKEN_IAT_INVALID'});
  }
  if(!body.jti) return Object.freeze({ok:false,reason:'TOKEN_JTI_REQUIRED'});

  return Object.freeze({ok:true,body:Object.freeze(body),payload:Object.freeze(body.payload||{})});
}

function exportPublicKeyPem(){
  return KEYS.publicKey.export({type:'spki',format:'pem'}).toString();
}

module.exports=Object.freeze({
  version:'2.0.0',
  key_mode:KEYS.mode,
  signPayload,
  verifyToken,
  exportPublicKeyPem
});
