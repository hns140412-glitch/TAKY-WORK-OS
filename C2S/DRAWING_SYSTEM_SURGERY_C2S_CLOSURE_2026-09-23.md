# C2S — DRAWING SYSTEM SURGERY CLOSURE 2026-09-23

Status: PARTIAL_CLOSURE / REPOSITORY EXECUTION PATH WIRED / HOST INTERCEPTION OPEN

## Core finding
The primary failure was not absence of rules. V3 already contained evidence-backed execution receipts, digests, reference compilation, pre-user validation and a production authority gate.

The structural failure was that actual artifact writers/exporters could still sit outside that critical path.

ENGINE EXISTS != ENGINE IS MANDATORY EXECUTION PATH

## Compiled atoms
- DECISION: user-facing drawing/report artifacts must use an authorized production route.
- GOVERNANCE: ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE.
- GOVERNANCE: NO PASS -> NO SHOW.
- REQUIREMENT: L0 SOURCE through L8 USER EXPOSURE are distinct authority layers.
- REQUIREMENT: source fidelity and presentation quality are independent gates.
- REQUIREMENT: reference mining must compile into tokens/engine parameters/effect validation.
- REQUIREMENT: user approval is for design/expression choices, not defect discovery.
- CORRECTION: DATE != CONTENT CHANGE; freshness uses content identity/revision relation.
- CORRECTION: semantic styling cannot precede semantic verification.
- CORRECTION: narrative claims require claim-level evidence.
- STRATEGY: Handoff modes split into RESUME / RETROSPECTIVE / SURGERY.
- CORRECTION: weaker duplicate V4 router/validator/compiler created during surgery were deleted because V3 canonical modules were stronger; dual authority is forbidden.

## Existing strong V3 authority retained
- runtime/drawing-execution-receipt.js
- runtime/drawing-production-authority-gate.js
- runtime/drawing-pre-user-validation.js
- runtime/drawing-finalization-orchestrator.js
- runtime/drawing-reference-compiler.js
- runtime/drawing-source-equivalence.js
- runtime/drawing-engine-core.js

## New execution-path changes
- runtime/drawing-production-admission-cli.js added as the canonical bridge from artifact writer to V3 finalization/admission.
- runtime/drawing-a3-board-cli.js now blocks PREVIEW/FINAL/USER_FACING writes before file creation unless admission returns SHOW.
- tools/drawing_a3_bundle_exporter.py now blocks multi-format production fanout before files are created unless admission passes.
- tools/drawing_a3_output_builder.py is INTERNAL/EXPERIMENT primitive only; production artifact classes hard-fail.
- runtime/drawing-report-package.js is plan-only by default and cannot self-authorize; production authorization routes through drawing-finalization-orchestrator.
- Central TAKY Work OS router now handles DRAWING_PRODUCTION and HANDOFF_MODE; repeated structural failure / engine bypass / user-as-debugger forbids simple RESUME and requires SURGERY.

## Regression evidence added
- runtime/drawing-production-admission-cli.test.js
- runtime/drawing-a3-board-cli.test.js: FINAL without admission => no output files.
- tools/drawing_a3_bundle_exporter.test.py: FINAL without admission => BLOCKED_PRODUCTION_ADMISSION and no output directory.
- tools/drawing_a3_output.test.py: low-level builder FINAL calls => RuntimeError and no files.
- Central TAKY: ENFORCEMENT/work_os_productive_router_drawing.test.py.

## Critical unresolved boundary
Repository enforcement cannot prove that every ChatGPT/tool-host path will invoke repository admission before directly creating/showing a file or image outside the repository.

Therefore:
- any artifact lacking the governed execution receipt + validation bundle is NON_PRODUCTION / UNAUTHORIZED, even if a file exists;
- the surgery is not FULLY CLOSED until host-level interception is proven or all user-facing production is operationally constrained to governed exporters.

## Remaining P0
1. CI green on latest V4 exact head.
2. CI green on central TAKY governance surgery branch.
3. Inventory any remaining direct disk writers and classify INTERNAL_PRIMITIVE / GOVERNED_EXPORTER / DEPRECATED.
4. Attack-test misclassification routes (EXPERIMENT generated then externally shown as final).
5. Verify real source geometry/semantic/narrative adapters on representative fixtures; do not use Hannam report production as the test artifact.

C2S_COMPILE_CLOSED: YES
REFLECTION_COMPLETE: YES
DOWNSTREAM_EXECUTION_COMPLETE: NO
SYSTEM_SURGERY_FULLY_CLOSED: NO
