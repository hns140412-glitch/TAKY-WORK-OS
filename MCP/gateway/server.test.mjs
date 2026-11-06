process.env.TAKY_ENFORCEMENT_SECRET='test-only-enforcement-secret-20260923';
process.env.TAKY_MCP_SMOKE_ONLY='1';

const mod=await import('./server.mjs');
if(typeof mod.buildServer!=='function') throw new Error('BUILD_SERVER_EXPORT_REQUIRED');
const server=mod.buildServer();
if(!server) throw new Error('MCP_SERVER_BUILD_FAILED');
console.log('taky-mcp-gateway: PASS');
