'use strict';

const crypto=require('crypto');

function secret(){
  const value=process.env.TAKY_ENFORCEMENT_SECRET;
  if(!value || value.length<16) return null;
  return value;
}

function b64url(input){
  return Buffer.from(input).toString('base64url');
}

function signPayload(type,payload={}){
  const key=secret();
  if(!key) return Object.freeze({ok:false,reason:'TAKY_ENFORCEMENT_SECRET_REQUIRED'});
  const body=JSON.stringify({
    v:1,
    type,
    payload,
    iat:Date.now()
  });
  const encoded=b64url(body);
  const sig=crypto.createHmac('sha256',key).update(encoded).digest('base64url');
  return Object.freeze({ok:true,token:encoded+'.'+sig});
}

function verifyToken(token,expectedType){
  const key=secret();
  if(!key) return Object.freeze({ok:false,reason:'TAKY_ENFORCEMENT_SECRET_REQUIRED'});
  if(typeof token!=='string' || !token.includes('.')){
    return Object.freeze({ok:false,reason:'TOKEN_FORMAT_INVALID'});
  }
  const [encoded,sig]=token.split('.');
  const expected=crypto.createHmac('sha256',key).update(encoded).digest('base64url');
  const a=Buffer.from(sig||'');
  const b=Buffer.from(expected);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)){
    return Object.freeze({ok:false,reason:'TOKEN_SIGNATURE_INVALID'});
  }
  let body;
  try{
    body=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8'));
  }catch(e){
    return Object.freeze({ok:false,reason:'TOKEN_PAYLOAD_INVALID'});
  }
  if(expectedType && body.type!==expectedType){
    return Object.freeze({ok:false,reason:'TOKEN_TYPE_MISMATCH',expectedType,actualType:body.type});
  }
  return Object.freeze({ok:true,body:Object.freeze(body),payload:Object.freeze(body.payload||{})});
}

module.exports=Object.freeze({version:'1.0.0',signPayload,verifyToken});
