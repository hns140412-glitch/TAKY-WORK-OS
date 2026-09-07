# COST / USAGE PREFLIGHT GATE — REV_00 CANDIDATE

Status: CANDIDATE / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-07
Scope: Chat / Work / Codex-like long-running work / external metered AI / bulk retrieval / deployment
Purpose: Prevent accidental high-usage execution by estimating likely usage before costly work begins and asking the user whether to proceed.

## 1. CORE PRINCIPLE

`USER REQUEST ≠ HIGH-USAGE EXECUTION AUTHORIZATION`

`WORK AVAILABLE ≠ WORK REQUIRED`

`AI-CAPABLE ≠ AI-REQUIRED`

A request that can be satisfied reliably through a lower-usage route SHALL NOT be escalated to a materially higher-usage execution route without a fit-for-purpose reason.

When a request is likely to consume a material amount of usage, credits, model allowance, deployment credits, external API spend, or long-running agent capacity, TAKY SHALL disclose the likely usage drivers before starting the expensive portion and ask whether to proceed.

## 2. PREFLIGHT FLOW

`REQUEST → ROUTE ESTIMATE → USAGE DRIVER BREAKDOWN → LOW / MEDIUM / HIGH / VERY_HIGH → CHEAPER ALTERNATIVE → USER DECISION → EXECUTION → USAGE TRACE`

The estimate is directional unless actual metering is available. Do not invent exact token, credit, monetary, or quota numbers when they cannot be measured.

## 3. USAGE DRIVERS

Evaluate the parts of the request that materially increase usage:

1. EXECUTION SURFACE
- ordinary Chat response
- Work / long-running agent execution
- Codex / repository-wide implementation
- external metered AI/API
- Preview / Production deployment

2. CONTEXT BREADTH
- current conversation only
- multiple prior conversations / large handoff recovery
- whole repository / multiple repositories
- many large files / long documents / attachment sets

3. REASONING / MODEL LOAD
- deterministic / rule-based operation
- lightweight model task
- high-reasoning model or repeated cross-validation
- multi-agent / repeated independent analysis

4. TOOL / ACTION VOLUME
- number of repository reads/writes
- number of external calls
- repeated search / retrieval
- repeated validation passes
- long-running browser / computer work where applicable

5. MEDIA / AI PROCESSING
- OCR / Vision images
- audio transcription / analysis
- music/performance analysis
- image generation
- repeated full-media re-analysis

6. DEPLOYMENT
- no deploy
- one staging/preview deploy
- repeated preview deploys
- Production deploy
- multiple app/site deploys

## 4. USAGE CLASS

### LOW
Examples:
- normal Chat answer
- small deterministic calculation
- single-file read or focused lookup
- local/state-only logic

Action: proceed without interruption.

### MEDIUM
Examples:
- several files or repository paths
- limited OCR/vision/audio calls
- one Preview/Staging deploy
- moderate cross-checking

Action: concise usage notice when useful; normally proceed unless another approval gate applies.

### HIGH
Examples:
- Work / long-running agent execution
- large conversation/source recovery
- repository-wide or multi-repository analysis
- many media AI calls
- repeated model cross-validation
- repeated preview deploys
- broad implementation + test + deploy in one command

Action: mandatory preflight disclosure and explicit user confirmation before the high-usage portion begins.

### VERY_HIGH
Examples:
- whole-history recovery + multiple repos + code changes + testing + deployment in one request
- many long audio/image/video inputs with repeated AI analysis
- multi-agent / high-reasoning work across large sources
- repeated Production deployment or bulk external metered processing

Action: stop before expensive execution, propose a staged/lower-usage plan, and require explicit user approval.

## 5. REQUIRED PREFLIGHT MESSAGE

When HIGH / VERY_HIGH is predicted, show only the information needed for a decision:

- `예상 사용량: HIGH / VERY HIGH`
- `많이 드는 부분:` specific drivers
- `실행 방식:` Chat / Work / repository implementation / external AI / deploy
- `저비용 대안:` specific lower-usage route
- `진행 여부:` ask user to choose

Example:

> 예상 사용량: 높음
> 많이 드는 부분: 전체 대화 복구 + 3개 저장소 전체 검토 + Work 장시간 실행
> 저비용 대안: 최신 MASTER와 관련 파일만 먼저 대조한 뒤 누락 구간만 확대
> 이대로 전체 실행할까요, 저비용 방식으로 나눠서 진행할까요?

## 6. WRONG-COMMAND BRAKE

Broad commands that may unintentionally trigger high usage SHALL be decomposed before execution.

Examples:
- `전체 다 검토해`
- `처음부터 전부 다시 읽고 구현해`
- `모든 저장소 다 비교해서 고쳐`
- `Work로 다 해줘`

Before high-usage execution:
1. identify the expensive interpretation,
2. identify the minimum useful scope,
3. expose the difference,
4. ask which route the user wants.

`AMBIGUOUS BROAD COMMAND ≠ MAXIMUM-SCOPE EXECUTION`

## 7. DEPLOYMENT COST GATE

Development work SHALL prefer:

`LOCAL → BATCH CHANGES → STAGING / PREVIEW → REAL-DEVICE REVIEW → HUMAN APPROVAL → PRODUCTION`

Hard candidates:
- `DEVELOPMENT CHANGE ≠ DEPLOY REQUIRED`
- `MASTER / DOC CHANGE ≠ RUNTIME DEPLOY REQUIRED`
- `PREVIEW DEPLOY ≠ FREE DEPLOY`
- `PRODUCTION DEPLOY = RELEASE GATE`

Repeated small changes should be batched before Preview/Staging when safe.
Production deploy SHALL NOT be used as the normal iteration loop.

## 8. AI / MEDIA COST GATE

Prefer:

`LOCAL / DETERMINISTIC → CACHE / REUSE → BATCH → LOW-COST MODEL → HIGHER-COST ESCALATION ONLY WHEN NEEDED`

Hard candidates:
- `REPEATED INPUT ≠ REPEATED ANALYSIS`
- `EXPENSIVE MODEL ≠ BETTER DECISION BY DEFAULT`
- `COST SAVING ≠ QUALITY / SAFETY BYPASS`

For OCR/audio/piano/vision workflows:
- analyze reusable references once where valid,
- cache results with provenance,
- re-analyze only changed/uncertain evidence where safe,
- use higher-cost analysis only when lower-cost evidence is insufficient.

## 9. TRACE

When actual metering is available, record as applicable:
- feature/work item
- execution surface
- provider/model/tool
- reason for escalation
- source volume / media count / deployment count
- cache hit / miss
- actual usage / credits / cost if available
- fallback used

Do not fabricate values when the platform does not expose them.

## 10. USER CONTROL

The user may choose:
- full/high-usage route,
- cheaper/staged route,
- reduced source scope,
- no deployment yet,
- Preview only,
- defer expensive AI analysis.

A prior approval for one high-usage action SHALL NOT automatically authorize materially different future high-usage work.

## 11. CURRENT CLASSIFICATION

Candidate classification for later TAKY review:
- Cost-aware Fit-for-Purpose principle: PRESERVE / strengthen
- High-usage preflight disclosure: ADOPT
- Explicit approval for HIGH / VERY_HIGH usage: ADOPT
- Wrong-command brake: ADOPT
- Deployment batching / Preview-first: ADOPT
- Analyze-once / cache / reuse: ADOPT
- Exact monetary or quota thresholds: HOLD until measurable/configurable
- Central TAKY canonical write: NOT AUTHORIZED BY THIS CANDIDATE

END — COST / USAGE PREFLIGHT GATE REV_00 CANDIDATE
