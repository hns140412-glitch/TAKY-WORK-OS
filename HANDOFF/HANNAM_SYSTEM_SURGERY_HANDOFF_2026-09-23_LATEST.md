# HANNAM SYSTEM SURGERY HANDOFF — LATEST

Mode: SURGERY / RE-ARCHITECTURE
Do not resume Hannam report production, P06 generation, PDF/HTML output, or new design mockups.

## Read first
1. DRAWING/FAILURE_LEDGER_2026-09-23.json
2. DRAWING/ROOT_CAUSE_MATRIX_2026-09-23.json
3. DRAWING/ENGINE_BYPASS_MAP_2026-09-23.json
4. DRAWING/GOVERNANCE_GAP_MATRIX_2026-09-23.json
5. DRAWING/REFERENCE_COMPILER_SPEC_V1.json
6. DRAWING/PRE_USER_VALIDATION_SPEC_V1.json
7. DRAWING/REGRESSION_TEST_MATRIX_2026-09-23.json
8. DRAWING/DRAWING_ENGINE_ARCHITECTURE_REVISION_V3.md
9. DRAWING/ARCHITECTURE_STATUS_REGISTRY_2026-09-23.json
10. C2S/HANNAM_SYSTEM_SURGERY_ATOMS_2026-09-23.json
11. C2S/HANNAM_SYSTEM_SURGERY_CLOSURE_2026-09-23.md
12. HANDOFF/HANNAM_SYSTEM_SURGERY_NEW_CHAT_START_2026-09-23_LATEST.md

## Hard locks
- SYSTEM IMPROVEMENT ONLY
- NO PASS -> NO SHOW
- ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE
- USER != DEBUGGER
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER
- DATE != CONTENT CHANGE
- SELF-ASSERTED PASS != VALIDATION EVIDENCE

## Current enforcement correction
Production output requires:
- authorized engine execution receipt;
- engine id/version/commit lineage;
- validation bundle id;
- source digest + artifact digest;
- gate-level status + validator + evidence_refs;
- receipt/bundle digest agreement.

Bare `execution_route=AUTHORIZED_ENGINE`, `engine_id`, or `*_gate_pass=true` is not production authorization.

## Resume taxonomy
- RESUME: continue last valid architecture.
- RETROSPECTIVE: analyze prior failure without producing project output.
- SURGERY: may supersede/deprecate known-bad architecture.

This handoff is SURGERY.

## Open boundaries
- exact-head CI must be rechecked after latest commits;
- central TAKY system-surgery branch exact-head CI/merge;
- historical visual fixture replay for real REFERENCE_EFFECT;
- hosted runtime automatic L8 invocation is not proven by repository tests;
- required branch protection remains unverified.

A handoff never forces SURGERY to preserve a known-bad structure.
