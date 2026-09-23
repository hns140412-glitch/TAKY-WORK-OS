'use strict';

const crypto=require('crypto');

function ensureKeyPair(privateEnv,publicEnv){
  if(process.env[privateEnv] && process.env[publicEnv]) return;
  const pair=crypto.generateKeyPairSync('ed25519');
  process.env[privateEnv]=pair.privateKey.export({type:'pkcs8',format:'pem'}).toString();
  process.env[publicEnv]=pair.publicKey.export({type:'spki',format:'pem'}).toString();
}

ensureKeyPair('TAKY_MEASUREMENT_PRIVATE_KEY_PEM','TAKY_MEASUREMENT_PUBLIC_KEY_PEM');
ensureKeyPair('TAKY_VISION_PRIVATE_KEY_PEM','TAKY_VISION_PUBLIC_KEY_PEM');

const Signer=require('../MCP/validator/receipt-signer.cjs');

module.exports=Object.freeze({
  signVisualMeasurement(input){
    return {ok:true,receipt:Signer.signVisualMeasurement(input)};
  },
  signReferenceEffect(input){
    return {ok:true,receipt:Signer.signReferenceEffect(input)};
  },
  signVisionReview(input){
    return {ok:true,receipt:Signer.signVisionReview(input)};
  }
});
