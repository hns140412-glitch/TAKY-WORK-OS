최신 TAKY 기준으로 SYSTEM FAILURE SURGERY 상태를 재개해.

이번 재개는 한남동 보고서 제작 재개가 아니다.
먼저 현재 수술 상태를 복원하고, 사용자의 현재 목적에 맞는 남은 OPEN만 진행해.

최상위 GLOBAL AI ACTIVITY SLOGAN은 자의적으로 재해석하지 마.

Think Again, Keep Your Key.
- 핵심을 놓치지 말고 다시 생각하라.
- 답을 풀 열쇠는 이미 가지고 있다.

Think Again, You’re The Key.
- 방법을 찾고 해결하라.
- 결국 답을 만들어내는 핵심 주체는 인간이다.

실행 사이클:
HUMAN INTENT / DESIRED OUTCOME
→ THINK AGAIN
→ KEEP YOUR KEY
→ FIND A WAY / SOLVE
→ YOU’RE THE KEY
→ VERIFY / CORRECT / CONTINUE

KEEP YOUR KEY:
핵심 / 맥락 / 의미 / 권한 / 소유권 / 최신 수정 / 제어권.

공격적 검증은 반드시 방어적 보존과 균형을 유지해.
정상 기능, staging/diagnostic continuity, 단순성, 복구성, 사용성, 인간 제어권을 보존하면서 실제로 증명된 실패만 최소 구조수정으로 막아.
USER != DEBUGGER.
SYSTEM PROVES. HUMAN CHOOSES.

Repo:
hns140412-glitch/TAKY-WORK-OS

Branch:
surgery/enforcement-v1-2026-09-23

LIVE AUTHORITY 복원 순서:
1. taky-validation.get-validation-readiness 실행
2. validation_readiness_receipt 확보
3. taky-production.get-production-readiness에 receipt 전달
4. current_git_head 확인
5. exact-head CI 확인:
   - TAKY Enforcement Regression
   - drawing-engine-core
6. staging_ready / production_gateway_ready / overall_user_facing_ready / production_ready 분리
7. 문서 속 고정 SHA는 provenance로만 사용

먼저 읽을 것:
1. GOVERNANCE/TAKY_GOVERNANCE_CORRECTION_2026-09-23.md
2. C2S/HANNAM_SYSTEM_FAILURE_SURGERY_C2S_CLOSURE_2026-09-23.md
3. HANDOFF/HANNAM_SYSTEM_FAILURE_SURGERY_HANDOFF_2026-09-24_LATEST.md
4. .mcp.json
5. MCP/gateway/server.mjs
6. MCP/validator/server.mjs
7. runtime/production-pipeline.js
8. runtime/reference-compiler.js
9. runtime/reference-application.js
10. tests/enforcement-regression.test.js
11. tests/vision-api-health.test.js

현재 구현 핵심:
- production / validation MCP trust-domain 분리
- staging continuity + user-facing fail-closed
- exact-head CI attestation
- signed authorization / validation / exposure
- artifact digest / replay / TOCTOU protection
- artifact-bound source fidelity
- DXF / vector-PDF geometry extraction
- source-vector-preserving A3 output
- A3 bundle export
- human-intent-bound user-effect review
- reference causal application + effect receipt
- multi-reference per-reference coverage
- reference applicability FULL / PARTIAL / DEFERRED
- Vision API configured-model health probe

실제 한남동 source staging pilot:
- issued PDF SHA-256:
  d81740e1aec0e9e80a50cc1fdc23c41b227f52377e0139dbf5a620b6fab10278
- 4-page vector ingest PASS
- primitive counts:
  7880 / 46288 / 49294 / 8917
- semantic inference false
- artifact-bound source fidelity PASS
- tamper rejection PASS

Reference applicability:
- DIVISARE_EDITORIAL_RESTRAINT = FULL
- ARCHDAILY_PLAN_HIERARCHY = PARTIAL / SOURCE_LINE_HIERARCHY_ONLY
- OMA_RELATION_FIRST = PARTIAL / DECLARED_PRIMARY_RELATION_FOCUS_ONLY
- BIG_ONE_MOVE = PARTIAL / DECLARED_BASE_MOVE_RESULT_EMPHASIS_ONLY
- SOM_FOSTER_TECHNICAL_CLARITY = DEFERRED / staging adapter + metric implemented, verified-role authority not admitted

ArchDaily partial implementation:
source stroke width
→ distinct source-width order
→ semantic-free SOURCE STYLE RANK
→ bounded hierarchy enhancement
→ geometry fingerprint equality
→ monotonic order preservation
→ TAKY_LINE_HIERARCHY_DELTA_V1

주의:
- SOURCE STYLE RANK는 미세 위계 보강 수단이지 full ArchDaily semantic hierarchy가 아니다.
- global image delta만으로 line hierarchy 효과를 판정하지 마.
- reference 하나의 PASS가 다른 reference claim을 승인하게 하지 마.
- DEFERRED reference는 지식/연구/staging에는 유지하되 production claim에는 쓰지 마.

Declared diagram-role adapter rule:
- OMA/BIG은 canonical SVG의 명시적 `data-taky-role-source="DECLARED"` 역할만 사용
- source geometry에서 diagram/architectural semantics를 추론하지 않음
- geometry-bearing SVG attribute 변경 금지
- application/effect proof는 final canonical SVG digest에 bind
- 이미 compliant한 diagram을 effect 생성 목적으로 왜곡하지 않음

SOM/Foster current state:
- staging adapter = `VERIFIED_PRESENTATION_ROLE_CLARITY`
- effect metric = `TAKY_TECHNICAL_SYSTEM_READABILITY_DELTA_V1`
- STRUCTURE / PROGRAM / ENVELOPE만 허용
- `data-taky-role-source="VERIFIED"` + matching role-proof SHA-256 required
- geometry mutation / semantic inference 금지
- repeated application idempotent
- production_claimable = false
- 남은 OPEN = independent verified-role authority admission + production trust wiring

DWG current state:
- GNU LibreDWG `dwgread` strict bridge code = IMPLEMENTED
- original DWG SHA-256 preserved
- risky decoder diagnostics = fail closed
- derived DXF re-parse required
- authority = `DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE`
- production_claimable = false
- live runtime decoder presence + real source-equivalence pilot = OPEN

Readiness:
- API key 존재만으로 Vision READY 처리하지 마.
- configured Vision model live health probe까지 PASS해야 user-facing Vision readiness=true.
- readiness FAIL이어도 staging/diagnostic은 계속 가능.
- 사용자를 key/CI/model/validator 디버거로 만들지 마.

현재 known OPEN:
- live validator/gateway secrets provisioning
- live user-facing real-project production pilot
- DWG live-runtime `dwgread` provisioning + real source-equivalence validation (bridge implemented; `DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE`, production claim forbidden)
- SOM/Foster independent verified-role authority admission + production trust wiring (staging adapter/metric implemented)
- repository branch protection = ADMIN_REQUIRED / OPEN

재개 직후 closed surgery를 반복 검토하지 말고,
LIVE AUTHORITY 확인
→ CURRENT POINTER
→ exact-head CI
→ readiness
→ 남은 OPEN
순서로 진행해.

한남동 보고서 제작으로 자동 복귀하지 마.
현재 사용자의 명시 목적이 바뀌었을 때만 production/report 작업으로 전환해.
