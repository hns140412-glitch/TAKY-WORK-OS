# C2S CLOSURE — HANNAM SYSTEM FAILURE SURGERY — 2026-09-23

## PURPOSE
Convert repeated Hannam drawing/report failures into executable TAKY + Drawing Engine + Work OS corrections.

## ROOT CAUSES
- governance existed as declarations without sufficient runtime enforcement
- geometry/semantic/presentation/AI authority boundaries were porous
- production routing was open
- engine could effectively self-certify
- validation did not control exposure
- reference mining was not compiled/effect-proven
- one-off Python/HTML/ReportLab could become user-facing
- DATE was confused with CONTENT CHANGE
- semantic/narrative inference could outrun evidence
- handoff could propagate flawed architecture
- user acted as debugger

## IMPLEMENTED — RUNTIME
- signed production authorization
- closed Work OS routing
- authorized execution graphs
- independent validation receipts
- signed exposure grants
- production artifact broker
- buildOutputPlan authorization requirement
- geometry fingerprint and protected-anchor guard
- destructive-mask intersection rejection
- semantic styling gate
- narrative evidence-strength gate
- fact evidence validator
- source content identity / freshness classifier
- reference compiler + traceability/effect/fit/fidelity/ablation proof
- A3/readability/user-effect validator
- provenance validator
- production pipeline with computed mandatory gates

## IMPLEMENTED — MCP
- MCP/HOST_TOOL_PERMISSION_POLICY_V1.json
- MCP/gateway/package.json
- MCP/gateway/server.mjs
- MCP/gateway/README.md
- MCP v2 production-control tools:
  - route-production-task
  - validate-for-exposure
  - authorize-exposure
  - register-production-artifact
  - compile-reference-profile
  - validate-reference-effect

## CORRECTIONS FOUND DURING ATTACK REVIEW
1. WeakSet capability token could not cross MCP process boundary.
   → SUPERSEDED by signed serializable tokens.
2. Caller could inject PASS strings into external_gates.
   → REMOVED; mandatory gates are computed by executable validators.
3. Date change alone could be treated as freshness/content change.
   → source-identity validator now classifies by content identity.

## VALIDATION STATE
Earlier in-process enforcement regression passed before the cross-process token refactor.
After signed-token and computed-gate refactor, exact runtime regression must be rerun.
GitHub Actions workflow exists, but no connector-observed run is available yet.
Therefore do NOT claim final CI PASS for the new exact HEAD.

## OPEN — P0
- exact-head runtime/CI execution after latest refactor
- host exclusivity: actual host must remove/deny direct production publishing paths outside TAKY MCP gateway
- actual CAD/PDF adapter must emit normalized geometry primitives into geometry-fingerprint
- visual metrics currently require measured inputs; automated artifact measurement adapter remains to be built

## STATUS
ARCHITECTURE_SURGERY = IMPLEMENTED_V2
RUNTIME_ENFORCEMENT_CODE = IMPLEMENTED
MCP_GATEWAY = IMPLEMENTED
LATEST_EXACT_RUNTIME_REGRESSION = NOT_YET
HOST_EXCLUSIVITY = NOT_YET
REPORT_PRODUCTION = SUSPENDED
