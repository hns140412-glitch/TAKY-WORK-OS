최신 TAKY 기준으로 Drawing System Surgery를 재개해.

목적은 한남동 보고서 제작이 아니라 TAKY + Drawing Engine + Work OS의 구조 개선이다.
한남동 P06/보고서 제작은 계속 금지한다.

GitHub live refresh:
- hns140412-glitch/TAKY-WORK-OS
  branch: taky/drawing-engine-v4-governed-production-2026-09-23
- hns140412-glitch/TAKY
  branch: taky/drawing-system-governance-surgery-2026-09-23

Read first:
1. DRAWING/SYSTEM_SURGERY_2026-09-23/FAILURE_LEDGER.json
2. ROOT_CAUSE_MATRIX.json
3. ENGINE_BYPASS_MAP.json
4. GOVERNANCE_GAP_MATRIX.json
5. REFERENCE_COMPILER_SPEC.json
6. PRE_USER_VALIDATION_SPEC.json
7. REGRESSION_TEST_MATRIX.json
8. DRAWING_ENGINE_ARCHITECTURE_REVISION.md
9. C2S/DRAWING_SYSTEM_SURGERY_C2S_CLOSURE_2026-09-23.md
10. HANDOFF/DRAWING_SYSTEM_SURGERY_HANDOFF_2026-09-23_LATEST.md

Next:
- inventory every actual output producer/exporter
- route all USER_PREVIEW/FINAL creation through drawing-production-router
- implement real geometry fingerprint/diff
- wire semantic/narrative/reference-effect gates
- add exact-head CI
- mark bypass/one-off production paths DEPRECATED or EXPERIMENTAL
- attack-test bypass possibilities
- only after all P0 regressions pass may system surgery close

Success condition:
the user should not again need to discover deleted walls/core, missing reference effect, engine bypass, invented semantics/narrative, or basic visual defects.
