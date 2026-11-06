# TAKY Work OS Production Gateway MCP

This MCP server exposes only the TAKY production-control surface.

## Purpose
It does not draw or assemble reports itself. It controls whether specialist engines are allowed to create production/user-facing artifacts.

## Required environment
TAKY_ENFORCEMENT_SECRET must be set to a high-entropy secret shared only by trusted TAKY enforcement services.

## Exposed tools
- route-production-task
- validate-for-exposure
- authorize-exposure
- register-production-artifact
- compile-reference-profile
- validate-reference-effect

## Host policy
For real host-level enforcement, the host must:
1. route user-facing drawing/report artifact publication through this gateway;
2. keep generic Python/HTML/ReportLab/direct image generation diagnostic/internal only;
3. refuse publication of artifacts that lack a valid TAKY exposure grant and broker registration.

If the host still exposes an unrestricted direct publishing tool, repository-level code cannot physically prevent that host from bypassing this gateway.
