'use strict';

const crypto=require('crypto');

function round(n,precision){
  if(typeof n!=='number' || !Number.isFinite(n)) return n;
  const p=Math.pow(10,precision);
  return Math.round(n*p)/p;
}

function normalize(value,precision=4){
  if(Array.isArray(value)) return value.map(v=>normalize(v,precision));
  if(value && typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort()){
      if(['style','color','lineweight','texture','font','presentation'].includes(key)) continue;
      out[key]=normalize(value[key],precision);
    }
    return out;
  }
  return typeof value==='number'?round(value,precision):value;
}

function fingerprintGeometry(input={}){
  const primitives=input.primitives;
  if(!Array.isArray(primitives)) return Object.freeze({ok:false,reason:'GEOMETRY_PRIMITIVES_REQUIRED'});

  const normalized=primitives
    .map(p=>normalize(p,input.precision??4))
    .sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const payload=JSON.stringify(normalized);
  const fingerprint=crypto.createHash('sha256').update(payload).digest('hex');

  const roles={};
  for(const p of primitives){
    const role=p?.role||'UNCLASSIFIED';
    roles[role]=(roles[role]||0)+1;
  }

  return Object.freeze({
    ok:true,
    fingerprint,
    primitive_count:primitives.length,
    role_counts:Object.freeze(roles)
  });
}

function compareGeometry(source={},output={}){
  const a=fingerprintGeometry(source);
  const b=fingerprintGeometry(output);
  if(!a.ok || !b.ok) return Object.freeze({ok:false,reason:'FINGERPRINT_INPUT_INVALID',source:a,output:b});

  const roleMismatch=JSON.stringify(a.role_counts)!==JSON.stringify(b.role_counts);
  return Object.freeze({
    ok:a.fingerprint===b.fingerprint && !roleMismatch,
    source_fingerprint:a.fingerprint,
    output_fingerprint:b.fingerprint,
    primitive_count_equal:a.primitive_count===b.primitive_count,
    role_counts_equal:!roleMismatch,
    gate:(a.fingerprint===b.fingerprint && !roleMismatch)?'PASS':'FAIL'
  });
}

module.exports=Object.freeze({version:'1.0.0',normalize,fingerprintGeometry,compareGeometry});
