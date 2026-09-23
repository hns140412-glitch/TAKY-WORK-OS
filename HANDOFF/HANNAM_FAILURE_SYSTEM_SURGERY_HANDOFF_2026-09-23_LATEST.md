# HANNAM SYSTEM FAILURE SURGERY HANDOFF — 2026-09-23 LATEST

Mode: SURGERY
Do not resume Hannam report or P06 production.

## Primary branches
TAKY-WORK-OS:
taky/system-surgery-hannam-failures-2026-09-23

Central TAKY:
taky/hannam-system-governance-correction-2026-09-23

## Read first
1. DRAWING/FAILURE_LEDGER_2026-09-23.json
2. DRAWING/ROOT_CAUSE_MATRIX_2026-09-23.json
3. DRAWING/ENGINE_BYPASS_MAP_2026-09-23.json
4. DRAWING/GOVERNANCE_GAP_MATRIX_2026-09-23.json
5. DRAWING/REFERENCE_COMPILER_SPEC.json
6. DRAWING/PRE_USER_VALIDATION_SPEC.json
7. DRAWING/REGRESSION_TEST_MATRIX_2026-09-23.json
8. DRAWING/DRAWING_ENGINE_ARCHITECTURE_REVISION_2026-09-23.md
9. runtime/drawing-production-gate.js
10. runtime/drawing-reference-compiler.js
11. runtime/drawing-report-package.js
12. HANDOFF/HANDOFF_MODE_CONTRACT_2026-09-23.json
13. C2S/HANNAM_FAILURE_SYSTEM_SURGERY_CLOSURE_2026-09-23.md

## Locked corrections
- ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE
- NO PASS -> NO SHOW
- production artifact requires authorized engine route
- one-off paths are internal experiment/diagnostic only
- L8 USER EXPOSURE GATE is blocking
- DATE != CONTENT CHANGE
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER
- USER != DEBUGGER
- Reference name alone is not reference use; compiled observable effect is required

## Current verification
Local targeted regression:
- drawing-production-gate.test: PASS
- drawing-reference-compiler.test: PASS

GitHub combined status observation returned no status contexts on the surgery branch at the observed head. Do not claim CI PASS until an Actions/check run is observed.
Branch protection on the prior drawing-engine branch was disabled; required-check enforcement remains a governance gap.

## Next work only
Continue SYSTEM IMPROVEMENT:
1. wire protected-anchor diff evidence into production admission
2. add semantic verification regression fixture
3. add actual A3 visual/reference-effect fixture
4. observe/fix CI
5. cross-validate central TAKY vs implementation repo
6. only after all blockers pass, decide promotion/merge

Do not build a Hannam report page.
