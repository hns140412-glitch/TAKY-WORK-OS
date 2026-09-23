'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const gateway=fs.readFileSync(path.join(ROOT,'MCP/gateway/server.mjs'),'utf8');
const validator=fs.readFileSync(path.join(ROOT,'MCP/validator/server.mjs'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(ROOT,'.mcp.json'),'utf8'));

const validationTools=[
  'measure-visual-artifact',
  'measure-reference-effect',
  'review-visual-artifact'
];
const productiveStagingTools=[
  'controlled-present-drawing',
  'render-a3-report-page',
  'export-a3-bundle',
  'extract-geometry-primitives'
];

for(const tool of validationTools){
  assert(!gateway.includes("'"+tool+"'"),'production gateway must not own validation tool: '+tool);
  assert(validator.includes("'"+tool+"'"),'validator MCP must own validation tool: '+tool);
}
for(const tool of productiveStagingTools){
  assert(gateway.includes("'"+tool+"'"),'staging capability must remain available: '+tool);
}

assert(config.mcpServers['taky-production']);
assert(config.mcpServers['taky-validation']);
assert.notEqual(
  config.mcpServers['taky-production'].args[0],
  config.mcpServers['taky-validation'].args[0]
);

// Defensive balance: production may verify receipts, but must not possess validator private keys.
const verifiers=[
  fs.readFileSync(path.join(ROOT,'runtime/visual-measurement-receipt.js'),'utf8'),
  fs.readFileSync(path.join(ROOT,'runtime/vision-review-receipt.js'),'utf8')
].join('\n');
for(const forbidden of ['createPrivateKey','generateKeyPairSync','TAKY_MEASUREMENT_PRIVATE_KEY_PEM','TAKY_VISION_PRIVATE_KEY_PEM']){
  assert(!verifiers.includes(forbidden),'production verifier contains private-key authority: '+forbidden);
}

// Validator outage must not erase the work path: staging tools remain in production MCP.
// User-facing finalization still requires validator receipts in schema.
assert(gateway.includes("visual_measurement_receipt"));
assert(gateway.includes("reference_effect_receipt"));
assert(gateway.includes("vision_review_receipt"));

console.log('mcp-trust-boundary: PASS');
