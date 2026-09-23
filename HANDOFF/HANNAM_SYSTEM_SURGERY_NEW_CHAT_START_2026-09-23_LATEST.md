최신 TAKY 기준으로 **Hannam System Surgery / Drawing Engine Re-architecture**를 재개해.

중요: 이 작업은 한남동 보고서 제작이 아니다.
P06/2F/보고서/PDF/HTML/새 디자인 시안을 만들지 마.
SYSTEM IMPROVEMENT ONLY.

최상위 원칙:
- Think Again, Keep Your Key.
- Think Again, You’re The Key.
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
- USER != DEBUGGER.
- ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE.
- NO PASS -> NO SHOW.
- DATE != CONTENT CHANGE.

먼저 GitHub `hns140412-glitch/TAKY-WORK-OS`의
`taky/drawing-engine-v1-2026-09-23` branch를 live refresh하고 아래 순서로 읽어.

1. `DRAWING/FAILURE_LEDGER_2026-09-23.json`
2. `DRAWING/ROOT_CAUSE_MATRIX_2026-09-23.json`
3. `DRAWING/ENGINE_BYPASS_MAP_2026-09-23.json`
4. `DRAWING/GOVERNANCE_GAP_MATRIX_2026-09-23.json`
5. `DRAWING/REFERENCE_COMPILER_SPEC_V1.json`
6. `DRAWING/PRE_USER_VALIDATION_SPEC_V1.json`
7. `DRAWING/REGRESSION_TEST_MATRIX_2026-09-23.json`
8. `DRAWING/DRAWING_ENGINE_ARCHITECTURE_REVISION_V3.md`
9. `DRAWING/ARCHITECTURE_STATUS_REGISTRY_2026-09-23.json`
10. `C2S/HANNAM_SYSTEM_SURGERY_CLOSURE_2026-09-23.md`
11. `HANDOFF/HANNAM_SYSTEM_SURGERY_HANDOFF_2026-09-23_LATEST.md`

그 다음 central TAKY `hns140412-glitch/TAKY`의
`taky/hannam-system-surgery-2026-09-23` branch를 live refresh해
artifact exposure enforcement와 RESUME/RETROSPECTIVE/SURGERY mode를 확인해.

핵심 재개 지점:
- Work OS repository gate는 execution receipt + evidence-backed validation bundle을 요구해야 한다.
- bare `execution_route`, `engine_id`, `*_gate_pass=true`는 PASS 근거가 아니다.
- receipt의 validation_bundle_id/source_digest/artifact_digest와 validation bundle이 일치해야 한다.
- gate마다 validator + evidence_refs가 있어야 한다.
- one-off Python/HTML/ReportLab, destructive raster mask, generative geometry redraw는 production 금지.
- Reference는 NAME→DNA→TOKEN→PARAMETER→OUTPUT EFFECT→VALIDATION trace가 끊기면 FAIL/UNKNOWN.
- USER는 defect detector가 아니라 최종 선택자다.

남은 OPEN만 진행해.
문서만 늘리지 말고 execution path / regression test / CI 증거를 우선해.
Repository CI PASS와 hosted runtime automatic interception은 같은 주장으로 합치지 마.
Reference effect는 실제 before/after fixture가 없으면 완결로 주장하지 마.
