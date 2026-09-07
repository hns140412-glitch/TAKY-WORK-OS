# LEARNING FAMILY CURRENT TRUTH INTEGRATION — 2026-09-07

Status: CANDIDATE / INTEGRATION LEDGER / NOT CENTRAL TAKY CANONICAL
Scope: Ready & Set / Hide & Seek / Snap & Pop / Piano Practice / Assignment Capture / BGM / App Routing / Cost-Usage / Deployment
Purpose: Consolidate fragmented but materially confirmed rules into one recoverable current-truth layer so future conversations do not require the user to restate decisions.

## 0. AUTHORITY / USAGE

This file is a recovery and integration candidate under TAKY-WORK-OS.
It does NOT replace TAKY / GRAND MASTER or project masters.
Central TAKY canonical write requires explicit later authorization.

Use this file as a fast resume index together with the referenced current masters and actual runtime state.

Hard distinction:
`RAW CONVERSATION / HANDOFF / SCREENSHOT = RECOVERY EVIDENCE`
`CURRENT TRUTH INTEGRATION = CONSOLIDATED CANDIDATE`
`PROJECT MASTER = ACTIVE PROJECT AUTHORITY`
`TAKY CANONICAL = CENTRAL AUTHORITY`

## 1. VERIFIED SOURCE INVENTORY

### Central / shared
- `TAKY/MASTER/MASTER_LOGIC.md` — cost-aware Fit-for-Purpose already states `AI-CAPABLE ≠ AI-REQUIRED` and routes by risk / cost / latency / accuracy.
- `TAKY/OS/GUIDE_FAMILY_LEARNING_OS.md` — shared family learning, Assignment Intake, Local-first, practice evidence, teacher boundary.
- `TAKY/MASTER/LEARNING_APP_FAMILY_MASTER_REV_01.md` — shared three-app session contract.
- `TAKY-WORK-OS/CANDIDATES/COST_USAGE_PREFLIGHT_GATE_REV_00_CANDIDATE.md` — candidate high-usage preflight contract.

### Ready & Set
- `Ready_Set_Ui_Master_Logic_REV_07.md` — current project master baseline.
- Current runtime main commit observed: `68870b5fbab2431c785183794317efa8642356ac`.
- REV_07 runtime bridge lineage includes commit `070621b33be3c3b2ce935522122657adc430d37e`.
- Current `app.js` still reports `APP 0.9.2 / MASTER REV_06 / schema 5` in its base runtime and currently exposes only local BGM entries.
- Prior recoverable normal Ready & Set PWA source `index(8).html` contains `essential;` YouTube mode with `videoId=h2sHEe_xnmU` and playlist `PLKRZTF1Q1uwYFbRwQzrySyGXYJVXqcUVu`.
- Prior Ready & Set Handoff explicitly says YouTube-address BGM must not be silently removed or replaced by local-only audio.

### Hide & Seek
- `Hide_Seek_UI_MASTER_LOGIC_REV_04.md` — current product baseline.
- Historical ZPD Word child-facing identity / police-detective-arrest world = SUPERSEDED.

### Snap & Pop
- `Snap_Pop_UI_MASTER_LOGIC_REV_12.md` — current product baseline.
- Current official tagline = `아이디어를 Snap! 이야기로 Pop!`

### Latest user corrections recovered in current conversation
- Piano means piano learning/practice domain, not Ready & Set piano BGM.
- Piano practice must support recording the teacher's demonstration as a learning reference.
- Teacher demonstration should become the child's practice baseline/reference.
- Ready & Set app buttons currently open Hide & Seek / Snap & Pop by URL; user wants installed Home Screen PWA to open if possible.
- Ready & Set `essential;` BGM YouTube source must be preserved/restored.
- Cost/usage should be disclosed before high-usage commands; show which parts are expensive and ask whether to proceed.
- Development should use Preview/Staging-first and minimize Production deploy frequency.
- Proper integration quality must not be sacrificed merely to reduce usage.

## 2. LEARNING FAMILY CURRENT TRUTH

### 2.1 Product family roles — PRESERVE

`Ready & Set = BASE CAMP / GOAL + SESSION ORCHESTRATOR`
`Hide & Seek = VOCABULARY DISCOVERY / RETRIEVAL SPECIALIST`
`Snap & Pop = THOUGHT / EXPRESSION / WRITING / SPEAKING SPECIALIST`

Concise family relationship:
`Ready & Set orchestrates → Hide & Seek finds/remembers → Snap & Pop expresses/expands`

Shared learning history remains unified; specialist apps do not become competing long-term authorities.

### 2.2 Shared session contract — PRESERVE / HARD

`ONE SESSION`
`ONE TARGET TIME`
`MULTIPLE TASKS`
`ONE ACTIVE TASK`
`ONE ACTIVE LAP`
`ONE SESSION STATE OWNER = Ready & Set`

`TASK_CHANGE = LAP_END + NEXT_LAP_START`
`APP_SWITCH ≠ PAUSE`
`APP_SWITCH ≠ LAP_END`
`APP_SWITCH ≠ SESSION_END`

Specialist app handoff must preserve at minimum:
`session_id / goal_id / task_id / lap_id / return_target`

Session end and task completion stay separate.
Minimum task states:
`COMPLETED / PARTIAL / DEFERRED / BLOCKED / WAITING_FOR_PARENT`

Voice wrap-up:
`KNOWN STATE SUMMARY → ASK ONLY MISSING / AMBIGUOUS ITEMS → CHILD RESPONSE → STRUCTURE TASK STATE → SESSION END`

### 2.3 Assignment / rapid capture ownership — PRESERVE / CLARIFY

UX entry owner for homework execution/capture inside the learning flow:
`Ready & Set`

Shared capture engine owner:
`GUIDE / MAIN Assignment Intake shared capability`

Vocabulary interpretation owner:
`Hide & Seek` when the captured material is vocabulary-specific.

Hard distinction:
`UX ENTRY OWNER ≠ SHARED ENGINE OWNER ≠ SUBJECT INTERPRETATION OWNER`

Canonical rapid capture:
`SHUTTER → IMMEDIATE LOCAL TEMP SAVE → NEXT SHOT → BATCH ANALYSIS → QUALITY GATE → TARGETED RETAKE → REVIEW-BEFORE-COMMIT`

`ANALYZE ≠ CAPTURE COMPLETE`
`ONE BAD PHOTO ≠ FULL BATCH RESTART`
`OCR DRAFT ≠ CONFIRMED ASSIGNMENT / WORD SET`

### 2.4 Ready & Set BGM — PRESERVE + RUNTIME GAP

Current intended choices include:
- 집중 피아노
- 물 / 자연 계열
- 숲 / 자연 계열
- Lo-fi
- `essential;`
- OFF

Important distinction:
`PIANO BGM ≠ PIANO LEARNING DOMAIN`

`essential;` is a YouTube-backed choice, not a local replacement track.
Recovered reference:
- videoId: `h2sHEe_xnmU`
- playlist: `PLKRZTF1Q1uwYFbRwQzrySyGXYJVXqcUVu`

Current Ready & Set base `app.js` does not contain `essential;` in `SOUND_MAP`.
Classification: `MISSING / RUNTIME REGRESSION`.

Recording/voice behavior must preserve prior sound state:
`RECORDING START → BGM OFF/DUCK → RECORDING END → RETURN TO SAME FOCUS SESSION → PREVIOUS BGM RESTORED`

Do not promise uninterrupted YouTube playback while iPhone is locked/backgrounded.

### 2.5 App routing / installed PWA behavior — ADJUST / REVIEW_REQUIRED

Current Ready REV_07 bridge routes by ordinary HTTPS navigation (`location.assign`) to Netlify URLs while carrying shared session/lap identifiers.
This preserves connected-session context but does NOT prove that tapping the button opens the already-installed Home Screen PWA instance.

Current state:
- URL routing: IMPLEMENTED
- session/lap parameter handoff: IMPLEMENTED IN CODE / REAL-DEVICE RECHECK REQUIRED
- direct installed-PWA invocation from another web app: REVIEW_REQUIRED / PLATFORM-CONSTRAINED

Hard distinction:
`HTTPS NAVIGATION ≠ INSTALLED PWA DIRECT LAUNCH`

Do not degrade session continuity merely to chase direct installed-app launch behavior.
If a platform-safe direct launch mechanism is not reliable, preserve normal URL routing and optimize install/open UX without false claims.

### 2.6 Piano learning / practice domain — ADOPT / CURRENT USER CORRECTION

Piano learning is a separate subject/practice domain under GUIDE / Family Learning OS.
Ready & Set may plan/orchestrate piano tasks, but it does not own piano pedagogical interpretation.

Core learning flow candidate:
`ASSIGNMENT / SCORE → TEACHER DEMONSTRATION → PRACTICE SECTION → CHILD PERFORMANCE → COMPARE → TARGETED RETRY → GROWTH HISTORY → NEXT PRACTICE`

#### Teacher Reference — ADOPT / HARD CANDIDATE

A teacher's live demonstration may be recorded and registered as the child's current learning reference.
It must not be stored as an unstructured anonymous audio file only.

Recommended semantic entity:
`TEACHER_REFERENCE`

Minimum useful links/fields where available:
- teacher_reference_id
- piece/work
- score/source reference
- measure / section range
- right hand / left hand / both
- target tempo if provided
- teacher instruction / note
- recorded_at
- source audio reference
- active/current reference flag
- superseded-by relation when a newer teacher demonstration replaces the active reference

Hard boundaries:
`TEACHER REFERENCE ≠ AI-GENERATED MODEL PERFORMANCE`
`GUIDE ≠ PROFESSIONAL TEACHER`
`NEW TEACHER REFERENCE ≠ DELETE OLD HISTORY`

Comparison axes may include where technically valid:
- timing / pulse / tempo stability
- note onset / duration patterns
- phrase/section shape
- rests / articulation / dynamics where evidence supports it
- child current vs teacher reference
- child current vs child's own prior performance

Feedback should identify a small actionable section rather than globally judge the child's performance.

#### Piano cost-first analysis

`TEACHER REFERENCE → ANALYZE ONCE → CACHE FEATURE REPRESENTATION`
`CHILD PERFORMANCE → LOCAL / DETERMINISTIC FIRST → UNCERTAIN SECTION ESCALATION ONLY`

Do not resend and fully re-analyze the unchanged teacher reference for every practice attempt.

### 2.7 Cost / Usage governance — ADOPT

Proper integration quality remains mandatory, but expensive execution must be disclosed before the expensive portion starts.

Hard candidate:
`USER REQUEST ≠ HIGH-USAGE EXECUTION AUTHORIZATION`

High-usage preflight should show:
- expected class: LOW / MEDIUM / HIGH / VERY_HIGH
- which parts are expected to consume usage
- execution surface: Chat / Work / repository implementation / media AI / deploy
- cheaper/staged alternative
- explicit proceed choice for HIGH / VERY_HIGH

Wrong-command brake:
`AMBIGUOUS BROAD COMMAND ≠ MAXIMUM-SCOPE EXECUTION`

Cost optimization priority:
`LOCAL / DETERMINISTIC → CACHE / REUSE → BATCH → LOW-COST ROUTE → HIGHER-COST ESCALATION ONLY WHEN NEEDED`

`REPEATED INPUT ≠ REPEATED ANALYSIS`
`COST SAVING ≠ QUALITY / SAFETY BYPASS`

### 2.8 Deployment governance — ADOPT / HARD CANDIDATE

Development iteration should not use Production as the default feedback loop.

Preferred:
`LOCAL → BATCH CHANGES → STAGING / PREVIEW → REAL-DEVICE REVIEW → HUMAN APPROVAL → PRODUCTION → RELEASE VERIFY`

Hard candidates:
`DEVELOPMENT CHANGE ≠ DEPLOY REQUIRED`
`MASTER / DOC CHANGE ≠ RUNTIME DEPLOY REQUIRED`
`PREVIEW DEPLOY ≠ FREE DEPLOY`
`PRODUCTION DEPLOY = RELEASE GATE`

For PWAs, a stable staging branch/origin is preferred when install/cache/service-worker behavior needs repeated iPhone testing.
Preview frequency should still be batched; Preview is not treated as zero-cost.

## 3. DECISION / COVERAGE MATRIX

| Item | Status | Current reflection | Gap / next owner |
|---|---|---|---|
| 3-app family roles | PRESERVE | Family Master + project masters | runtime real-device validation continues |
| One session / one target / multi-task / lap | PRESERVE | Family Master + Ready REV_07 | full E2E device validation required |
| App switch does not pause/end lap | PRESERVE | Family Master + Ready bridge + specialist contracts | real-device return validation required |
| Ready = session single writer | PRESERVE | Ready REV_07 | runtime base still mixed REV_06/bridge architecture |
| Session end != task complete | PRESERVE | Ready REV_07 | actual wrap-up device validation required |
| Assignment capture UX starts from Ready flow | ADJUST | Ready REV_07 shared intake reference | shared engine remains GUIDE/MAIN-owned |
| Shared rapid capture | PRESERVE | GUIDE Family Learning OS | implementation provider/threshold HOLD |
| Hide product = Hide & Seek | PRESERVE | Hide REV_04 | central GUIDE stale child-facing/internal lineage language cleanup needed |
| Police/detective/arrest world | SUPERSEDED | Hide REV_04 | prevent reintroduction from central stale text/runtime fallbacks |
| Snap official tagline | PRESERVE | Snap REV_12 | prevent old phrase resurfacing |
| Snap = expression incl. English writing/speaking | PRESERVE | Snap REV_12 | device E2E required |
| `essential;` YouTube BGM | PRESERVE / RESTORE | prior source + Handoff | missing from current Ready base runtime |
| PWA direct installed-app open | REVIEW_REQUIRED | current route is ordinary HTTPS navigation | platform-safe behavior research/test required |
| Piano learning separate from piano BGM | ADOPT | current user correction + learning OS practice ownership | create/locate piano subject/practice owner |
| Teacher demonstration recording as baseline | ADOPT | current user correction | not yet in canonical piano subject master/runtime |
| Teacher reference analyze-once/cache | ADOPT | cost-first candidate | implementation design required |
| High-usage preflight | ADOPT | Work OS candidate created | central promotion later only with authorization |
| Preview/Staging-first development | ADOPT | candidate | repository/deploy workflow not yet standardized |
| Production deploy batching | ADOPT | candidate | Netlify/GitHub branch workflow implementation required |
| Exact monthly budget number | HOLD | intentionally not hard-coded | configurable/runtime metering later |
| Existing Central GUIDE `CODE RED / RETRACE` residual | WRONG_REFLECTION / MIGRATION_REQUIRED | conflicts with current Hide world | central TAKY cleanup only when authorized |

## 4. CURRENT IMPLEMENTATION TRUTH

### Ready & Set
- Project MASTER REV_07 exists and contains session/lap/orchestrator contracts.
- Base `app.js` still begins with `app 0.9.2 / master REV_06 / schema 5`.
- REV_07 session bridge was added through later commits.
- Specialist launch code uses current Netlify URLs and `location.assign`.
- Base BGM `SOUND_MAP` currently contains local piano/nature/water/lofi/OFF only.
- `essential;` restoration remains NOT IMPLEMENTED in current base runtime.

Classification:
`MASTER PASS / PARTIAL RUNTIME REFLECTION / INTEGRATION VALIDATION REQUIRED`

### Hide & Seek
- Current project master REV_04 is aligned to Hide & Seek / treasure-seek / hidden-word world.
- Historical ZPD/police world must remain migration-only or superseded.

### Snap & Pop
- Current project master REV_12 uses current tagline and connected-session contract.
- Runtime bridge exists in project lineage; real iPhone return behavior remains a Release gate.

### Piano
- Family Learning OS recognizes piano/practice as performance-evidence-driven.
- Teacher Reference requirement is a newly recovered explicit user correction.
- Dedicated current piano subject/practice owner and implementation are not yet established in this integration step.

## 5. FRAGMENTATION / DRIFT FINDINGS

1. `CURRENT MASTER ≠ CURRENT BASE RUNTIME VERSION`
   Ready REV_07 exists while base app metadata remains REV_06.

2. `RECOVERED FEATURE ≠ CURRENT IMPLEMENTATION`
   essential; YouTube BGM is recovered from prior source but missing in current Ready base runtime.

3. `PROJECT CORRECTION ≠ CENTRAL CLEANUP`
   Hide & Seek project master is corrected, but central GUIDE lineage still contains stale `CODE RED / RETRACE` wording.

4. `URL ROUTING ≠ INSTALLED PWA OPEN`
   current specialist buttons perform standard HTTPS navigation.

5. `PRACTICE EVIDENCE ≠ TEACHER REFERENCE CONTRACT`
   piano practice evidence exists conceptually, but teacher demonstration as a structured baseline is not yet represented in a current owner master.

6. `ARCHIVE EXISTS ≠ RESUME WITHOUT RECONSTRUCTION`
   future resume must load this Current Truth Integration and then verify referenced owner masters/runtime instead of asking the user to restate the same rules.

## 6. REQUIRED RESUME ORDER FOR THIS FAMILY

When the user says Ready & Set / Hide & Seek / Snap & Pop / piano / learning family continuation:

1. Load latest TAKY + applicable GUIDE Family Learning OS.
2. Load current `LEARNING_APP_FAMILY_MASTER`.
3. Load this Current Truth Integration candidate if still active/not superseded.
4. Load the relevant project master(s).
5. Load current runtime/version only for the apps being modified.
6. Recover only unresolved source evidence needed for the active gap.
7. Do NOT ask the user to restate items already traceably present unless conflicting/new information appears.

`USER KEYWORD = RECOVERY SEED, NOT RECOVERY SCOPE`
`KNOWN CURRENT TRUTH ≠ ASK USER AGAIN`

## 7. COST-AWARE NEXT IMPLEMENTATION PLAN

### Stage A — Integration / no deployment
- establish this Current Truth Integration
- confirm gaps/status
- no Production deploy

### Stage B — project-master deltas / no runtime deploy
- add piano Teacher Reference owner contract in appropriate project/domain layer
- add Ready `essential;` restoration requirement explicitly if missing from project master
- add deployment Preview/Staging candidate to applicable deployment owner
- central TAKY changes remain deferred until explicit authorization

### Stage C — batched runtime implementation
Batch together where safe:
- Ready `essential;` restoration
- Ready runtime metadata alignment
- specialist routing UX improvements that preserve session ids/lap
- any safe PWA install/open affordance after platform validation

### Stage D — one Staging/Preview deploy per affected app group
- verify cache/service worker
- verify specialist handoff/return
- verify BGM selection/restoration
- verify no Production change yet

### Stage E — real iPhone validation
- Ready session start
- launch Hide and return with same session/task/lap
- launch Snap and return with same session/task/lap
- essential; selection and focus-session restore
- PWA install/open behavior observation

### Stage F — user approval → Production
Only after Preview/real-device evidence is sufficient.

## 8. CENTRAL PROMOTION CANDIDATES FOR LATER `타키 반영`

Potential central/shared promotion items:
- High-usage Cost / Usage Preflight Gate
- Wrong-command brake
- Analyze-once / cache / reuse
- Preview/Staging-first deployment governance
- Current Truth / Lineage resume rule to prevent repeated user restatement
- Central GUIDE Hide & Seek stale-lineage cleanup

Project/domain-owned items that should NOT be flattened into GRAND MASTER:
- exact Ready BGM choices and YouTube playlist
- exact Hide child-facing world language
- exact Snap tagline
- Piano Teacher Reference schema/details
- app-specific launch URLs

## 9. VALIDATION STATUS

Source/master integration: PASS_WITH_KNOWN_GAPS
Current runtime complete reflection: NOT PASS
Real-device three-app E2E: UNVERIFIED after latest integration changes
Piano Teacher Reference runtime: NOT IMPLEMENTED
Essential BGM current runtime: MISSING / RESTORE REQUIRED
Installed-PWA direct launch: REVIEW_REQUIRED
Preview/Staging branch workflow: NOT YET IMPLEMENTED
Central TAKY canonical promotion: NOT AUTHORIZED / NOT PERFORMED

END — LEARNING FAMILY CURRENT TRUTH INTEGRATION 2026-09-07
