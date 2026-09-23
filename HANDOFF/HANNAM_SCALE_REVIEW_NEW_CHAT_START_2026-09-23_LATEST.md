최신 TAKY 기준으로 한남동 737-21 규모검토 + 사례조사 통합 보고서 작업을 재개해.

먼저 GitHub `hns140412-glitch/TAKY-WORK-OS`의 `taky/drawing-engine-v1-2026-09-23` 브랜치를 live refresh하고,
`HANDOFF/HANNAM_SCALE_REVIEW_HANDOFF_2026-09-23_LATEST.md`를 가장 먼저 읽어.

그 다음 아래를 순서대로 확인해:
1. `DRAWING/HANNAM_REPORT_PACKAGE_V1.json`
2. `DRAWING/HANNAM_PRESENTATION_PROFILE_V1.json`
3. `DRAWING/SCALE_REVIEW_REPORT_PRIMARY_OBJECTIVE.json`
4. `runtime/drawing-narrative-decision-engine.js`
5. `runtime/drawing-a3-board-renderer.js`
6. `runtime/drawing-layer-orchestrator.js`
7. `runtime/drawing-sales-mask-gate.js`
8. `runtime/svg-presentation-compositor.js`
9. `tools/drawing_controlled_presentation_pipeline.py`

Google Drive에서는 Work를 BASE로 하고 WORK_OS와 혼동하지 마.
현재 issued source는:
`2026-0923_한남동 737-21일원 고급주택(4세대) 규모검토.pdf`
이며 4페이지(B1 / 1F / 2F / 단면)다.

이번 재개 목표는 전체 보고서 확장이 아니다.
먼저 P06 2F 한 장의 REFERENCE-GRADE QUALITY를 닫아.

중요:
- 임시 Python/ReportLab/수작업 HTML 우회 금지
- REPORT_PACKAGE → engine → A3_SVG_BOARD_STATE → HTML/PDF 경로만 사용
- 가구 제거를 위해 broad rectangle masking 금지
- full-plan 생성형 재생산 금지
- source geometry / dimensions / core / walls / windows / doors 변경 금지
- 없는 조경/재료/프로그램 생성 금지
- PENDING/CONFLICT/REFERENCE_ONLY를 확정 사실처럼 서술 금지
- reference DNA를 설명만 하지 말고 실제 lineweight / poche / typography / whitespace / hierarchy / layout 파라미터로 컴파일
- P06이 reference-quality gate를 통과하기 전에는 P05/P04/P07로 확장하지 말 것

레퍼런스는:
REFERENCE_MINING_RULES
REFERENCE_MINING_INDEX
REPRESENTATION_METHOD_INDEX
TREND_LEADER_MINING_2026-09-23
GLOBAL_OFFICE_DNA_2026-09-23
및 사용자가 제공한 `AI 설계 보고서 작성법(1).pdf`의 유효한 구조 원칙을 사용한다.

TAKY:
Think Again, Keep Your Key.
Think Again, You’re The Key.
HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
USER != DEBUGGER.

재개 즉시 계획 설명부터 하지 말고 live state 확인 → P06 reference token compilation → engine implementation → render/quality gate 순서로 실행해.