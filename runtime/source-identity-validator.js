'use strict';

const crypto=require('crypto');

function hashContent(content){
  if(content===undefined || content===null) return null;
  const buffer=Buffer.isBuffer(content)?content:Buffer.from(String(content));
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function classifyRevision(input={}){
  const currentHash=input.current_hash || hashContent(input.current_content);
  const previousHash=input.previous_hash || hashContent(input.previous_content);

  if(!currentHash) return Object.freeze({ok:false,reason:'CURRENT_CONTENT_IDENTITY_REQUIRED'});

  if(previousHash && currentHash===previousHash){
    return Object.freeze({
      ok:true,
      gate:'PASS',
      classification:'SAME_CONTENT_REVISION',
      content_changed:false,
      date_changed:input.current_modified_at!==input.previous_modified_at,
      rule:'DATE_CHANGE_DOES_NOT_IMPLY_CONTENT_CHANGE',
      current_hash:currentHash
    });
  }

  return Object.freeze({
    ok:true,
    gate:'PASS',
    classification:previousHash?'CONTENT_CHANGED':'INITIAL_CONTENT_IDENTITY',
    content_changed:!!previousHash,
    current_hash:currentHash,
    previous_hash:previousHash||null
  });
}

module.exports=Object.freeze({version:'1.0.0',hashContent,classifyRevision});
