# HANNAM SYSTEM FAILURE SURGERY HANDOFF — 2026-09-24 LATEST

## MODE

SYSTEM IMPROVEMENT / SURGERY CONTINUITY.

Do NOT automatically resume Hannam report production.
Do NOT treat report output as the next default action.
Resume by restoring live authority first, then execute only remaining OPEN items relevant to the user's current goal.

## GLOBAL AI ACTIVITY SLOGAN — TOP AUTHORITY

**Think Again, Keep Your Key.**
- 핵심을 놓치지 말고 다시 생각하라.
- 답을 풀 열쇠는 이미 가지고 있다.

**Think Again, You’re The Key.**
- 방법을 찾고 해결하라.
- 결국 답을 만들어내는 핵심 주체는 인간이다.

Execution cycle:

HUMAN INTENT / DESIRED OUTCOME  
→ THINK AGAIN  
→ KEEP YOUR KEY  
→ FIND A WAY / SOLVE  
→ YOU'RE THE KEY  
→ VERIFY / CORRECT / CONTINUE

KEEP YOUR KEY means preserving:
핵심 / 맥락 / 의미 / 권한 / 소유권 / 최신 수정 / 제어권.

Do not reinterpret the slogan as only enforcement, only validation, only aggression, or only safety.

Aggressive validation must be paired with defensive preservation:
- preserve legitimate functionality
- preserve staging / diagnostic continuity
- preserve recoverability and simplicity
- preserve human control
- block only proven failure paths with the smallest structural correction

## REPO / BRANCH

Repo:
`hns140412-glitch/TAKY-WORK-OS`

Branch:
`surgery/enforcement-v1-2026-09-23`

## LIVE AUTHORITY — ALWAYS DO THIS FIRST

Do NOT use a fixed SHA embedded in a document as current authority.

Resume order:

1. call `taky-validation.get-validation-readiness`
2. obtain `validation_readiness_receipt`
3. pass it to `taky-production.get-production-readiness`
4. read `current_git_head`
5. verify exact-head required CI:
   - TAKY Enforcement Regression
   - drawing-engine-core
6. separate:
   - `staging_ready`
   - `production_gateway_ready`
   - `overall_user_facing_ready`
   - `production_ready`
7. only then continue

Fixed SHAs in handoff/C2S are provenance only.

Latest resume-preparation checkpoint BEFORE this handoff commit:
`28115f41697e7b4d30e66f65b945c3164b10231d`

Evidence on that checkpoint:
- TAKY Enforcement Regression #388 — SUCCESS
- drawing-engine-core #844 — SUCCESS

After this handoff commit, re-check the new exact HEAD.

## READ FIRST

1. `GOVERNANCE/TAKY_GOVERNANCE_CORRECTION_2026-09-23.md`
2. `C2S/HANNAM_SYSTEM_FAILURE_SURGERY_C2S_CLOSURE_2026-09-23.md`
3. this handoff
4. `.mcp.json`
5. `MCP/gateway/server.mjs`
6. `MCP/validator/server.mjs`
7. `runtime/production-pipeline.js`
8. `runtime/reference-compiler.js`
9. `runtime/reference-application.js`
10. `runtime/drawing-production-e2e.test.js`
11. `tests/enforcement-regression.test.js`
12. `tests/mcp-trust-boundary.test.js`
13. `tests/vision-api-health.test.js`

## CURRENT IMPLEMENTED CORE

### Enforcement
- signed production authorization
- closed Work OS production routing
- authorized execution graph
- production / validation MCP trust-domain separation
- signed validator receipts
- signed exposure grants
- artifact digest binding
- replay rejection
- TOCTOU mutation rejection
- exact-head CI attestation
- artifact broker publication
- caller-injected PASS removal
- production environment bypass removed

### Staging continuity
- staging / diagnostics remain usable when user-facing production is not ready
- validator failure does not erase the work path
- USER != DEBUGGER

### Artifact-bound source fidelity
User-facing GEOMETRY_GATE does NOT trust caller-supplied `geometry.output`.

Required lineage:
source PDF
→ controlled SVG
→ canonical A3 inline source
→ actual candidate artifact bytes
→ independent SOURCE_FIDELITY_VALIDATOR_V1 receipt

Invariant:
`NO_ARTIFACT_BOUND_SOURCE_FIDELITY -> NO_GEOMETRY_PASS`

### Human-intent binding
Independent visual review is bound to:
- desired_outcome
- success_criteria

A PASS for one human intent cannot be replayed for another.

## REAL-SOURCE HANNAM PILOT — COMPLETED IN STAGING ONLY

Authority source:
`Work / 2026-0923_한남동 737-21일원 고급주택(4세대) 규모검토.pdf`

SHA-256:
`d81740e1aec0e9e80a50cc1fdc23c41b227f52377e0139dbf5a620b6fab10278`

Pages:
4

Primitive counts:
- P0: 7,880
- P1: 46,288
- P2: 49,294
- P3: 8,917

Results:
- vector ingest PASS
- semantic inference false
- ~50k primitive fingerprint/compare viable
- single primitive mutation rejected
- 4/4 source-fidelity staging checks PASS
- tampered candidate rejected

No user-facing Hannam report artifact was produced in this surgery track.

DWG remains conversion-required until a trusted direct DWG decoder exists.

## REFERENCE MINING — CURRENT EXECUTION STATUS

Reference mining is useful ONLY when compiled into executable behavior + effect proof.

### FULL
`DIVISARE_EDITORIAL_RESTRAINT`
- claim scope: EDITORIAL_LAYOUT_RESTRAINT
- executable layout / whitespace parameters
- objective effect metric available

### PARTIAL
`ARCHDAILY_PLAN_HIERARCHY`
- safe claim scope: SOURCE_LINE_HIERARCHY_ONLY
- source stroke width → distinct-width order → semantic-free rank → bounded multiplier
- geometry preserved
- semantic inference false
- line hierarchy metric:
  `TAKY_LINE_HIERARCHY_DELTA_V1`

Real Hannam 2F staging evidence:
- styled elements: 32,739
- source widths: 0.01 / 0.1167 / 0.24 / 0.54 / 1.02
- corrected rank distribution:
  - LIGHT 793
  - SECONDARY 28,636
  - PRIMARY 3,176
  - HEAVY 134
- dynamic-range gain ≈ 1.3488
- minimum adjacent separation gain ≈ 1.0943
- global visual effect remains subtle

Therefore:
SOURCE STYLE RANK is a safe micro-hierarchy mechanism.
It is NOT standalone proof of full professional-family reference effect.

### PARTIAL — DECLARED DIAGRAM ROLE ONLY
`OMA_RELATION_FIRST`
- safe claim scope: `DECLARED_PRIMARY_RELATION_FOCUS_ONLY`
- canonical SVG roles must carry `data-taky-role-source="DECLARED"`
- exactly one declared primary relation is required per target diagram
- effect metric: `TAKY_RELATION_FOCUS_DELTA_V1`
- semantic inference false / geometry mutation false

`BIG_ONE_MOVE`
- safe claim scope: `DECLARED_BASE_MOVE_RESULT_EMPHASIS_ONLY`
- declared BASE_CONDITION / MOVE / RESULT roles are required
- effect metric: `TAKY_ONE_MOVE_EMPHASIS_DELTA_V1`
- semantic inference false / geometry mutation false

For both:
- application proof is bound to final canonical SVG digest
- objective effect receipt is bound to the same canonical SVG lineage
- already-compliant diagrams are not distorted to manufacture effect

### DEFERRED
- `SOM_FOSTER_TECHNICAL_CLARITY`
  - verified STRUCTURE / PROGRAM / ENVELOPE presentation roles required

DEFERRED means:
- mined knowledge is preserved
- study / staging remains allowed
- user-facing production claim is not allowed yet

## MULTI-REFERENCE RULE

One reference cannot inherit PASS from another.

For every claimed reference:
- causal application evidence required
- correct effect metric receipt required
- reference compile digest required
- artifact digest binding required
- source-fidelity lineage where applicable

Example:
ArchDaily + Divisare requires:
- ArchDaily source-style application + line-hierarchy effect receipt
- Divisare layout application + objective layout effect receipt

Missing one = FAIL for the claimed set.

## READINESS HANDSHAKE

### Validation side
`taky-validation.get-validation-readiness`

Must distinguish:
- objective measurement signing readiness
- Vision signing readiness
- Vision API key presence
- configured Vision model health
- user-facing validation readiness

### Vision model-health requirement

API-key presence alone is NOT enough.

Validation readiness now performs a live health probe against the configured Vision model.
If the model is unavailable / invalid / inaccessible:
- user-facing Vision readiness = false
- user-facing production readiness = false
- staging remains available
- do not ask the user to debug it

Enforcement CI includes Vision API model-health regression.

### Production side
`taky-production.get-production-readiness(validation_readiness_receipt)`

Production-ready requires:
- exact-head CI green
- durable capability key mode
- required production public keys
- valid signed validation-readiness receipt
- matching validator Vision public-key fingerprint
- validator user-facing readiness true

The readiness receipt does NOT replace artifact-specific:
- source-fidelity receipt
- visual measurement receipt
- reference-effect receipt(s)
- Vision review receipt

## REPOSITORY PROTECTION

`REPOSITORY_BRANCH_PROTECTION = ADMIN_REQUIRED / OPEN`

Current GitHub connector does not expose a write path for branch-protection/ruleset administration.

Do not misreport this as runtime production enforcement failure.

Compensating runtime control:
user-facing production refuses a non-green exact HEAD.

## CLOSED — DO NOT REOPEN WITHOUT NEW EVIDENCE

- direct one-off production renderer bypass
- engine self-certification path
- caller-injected PASS
- production-owned validator private-key signing
- source SVG loss in final PDF
- project-specific Hannam metadata leaking from shared renderer
- timestamp-as-content authority
- unsupported semantic styling
- narrative overclaim path
- caller-supplied geometry as production authority
- single-reference receipt authorizing a multi-reference claim
- fixed handoff SHA treated as live authority

## OPEN NEXT — ONLY IF CURRENT GOAL REQUIRES IT

1. provision real validator / gateway secrets outside the repo
2. live user-facing real-project production pilot — NOT RUN
3. trusted direct DWG decoding — NOT CONNECTED
4. implement SOM/Foster verified-role adapter + effect metric if/when verified architectural presentation-role authority is available
5. repository branch protection — ADMIN REQUIRED
6. run actual live Vision review only when readiness says configured model is healthy

## HUMAN ROLE

Human chooses:
- purpose
- expression direction
- reference direction
- emphasis
- final adoption

Human must not be asked to detect:
- deleted walls
- missing core
- crop / rotation error
- source mismatch
- semantic hallucination
- fake reference application
- CI / key / validator wiring failures

SYSTEM PROVES. HUMAN CHOOSES.
