최신 TAKY 기준으로 Drawing Governance Surgery를 재개해.

이번 대화는 한남동 보고서 제작이 아니라 SYSTEM IMPROVEMENT ONLY다.
P06/PDF/HTML/PPTX/시안/보고서 제작으로 돌아가지 마.

현재 중앙 경로는 다음 하나뿐이다:
TASK -> DRAWING_ROUTER -> DRAWING_ENGINE_CORE -> DRAWING_REFERENCE_ROUTER/COMPILER -> DRAWING_PRE_USER_VALIDATION -> DRAWING_PRODUCTION_AUTHORITY_GATE -> DRAWING_FINALIZATION_ORCHESTRATOR -> L8_USER_EXPOSURE -> OUTPUT

새 병렬 router / validator / compiler를 만들지 마.

Live refresh:
- TAKY-WORK-OS branch: taky/drawing-governance-surgery-2026-09-23 / draft PR #7
- TAKY branch: taky/user-exposure-governance-2026-09-23 / draft PR #90

먼저 읽기:
- HANDOFF/DRAWING_GOVERNANCE_SURGERY_HANDOFF_2026-09-23_LATEST.md
- C2S/HANNAM_FAILURE_SURGERY_CLOSURE_2026-09-23.md
- DRAWING/FAILURE_LEDGER_2026-09-23_V1.json
- DRAWING/ROOT_CAUSE_MATRIX_2026-09-23_V1.json
- DRAWING/REGRESSION_TEST_MATRIX_2026-09-23_V1.json
- runtime/drawing-engine-core.js
- runtime/drawing-source-freshness.js
- runtime/drawing-reference-router.js
- runtime/drawing-reference-compiler.js
- runtime/drawing-pre-user-validation.js
- runtime/drawing-execution-receipt.js
- runtime/drawing-production-authority-gate.js
- runtime/drawing-finalization-orchestrator.js
- runtime/drawing-artifact-manifest.js
- runtime/drawing-report-package.js
- tests/drawing-governance-surgery.test.js

Hard locks:
- Think Again, Keep Your Key.
- Think Again, You’re The Key.
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
- USER != DEBUGGER.
- ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE.
- NO PASS -> NO SHOW.
- ONE_OFF_SCRIPT = EXPERIMENT / DIAGNOSTIC ONLY.
- PARALLEL LOCAL ENGINE = FORBIDDEN.
- DATE != CONTENT CHANGE.
- REFERENCE_MENTIONED != REFERENCE_APPLIED.
- SOURCE_FIDELITY != PRESENTATION_QUALITY.
- CODE_PASS != PRODUCT_PASS.
- ENGINE_PASS != VISUAL_PASS.

진행 순서:
1. exact HEAD / PR CI live refresh
2. red면 중앙 governance runtime/test만 수정
3. bypass 공격검증
4. TAKY PR #90과 Work OS 구현 cross-validation
5. C2S/Handoff 상태변경 반영
6. 전부 green이면 merge-ready 여부만 HUMAN APPROVAL에 제시

보고서 결과물을 만들지 마.
사용자에게 디버깅을 요구하지 마.
