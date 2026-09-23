process.env.TAKY_VALIDATOR_SMOKE_ONLY='1';
const mod=await import('./server.mjs');
if(typeof mod.buildServer!=='function') throw new Error('BUILD_SERVER_EXPORT_REQUIRED');
const server=mod.buildServer();
if(!server) throw new Error('VALIDATOR_MCP_SERVER_BUILD_FAILED');
console.log('taky-independent-validator: PASS');
