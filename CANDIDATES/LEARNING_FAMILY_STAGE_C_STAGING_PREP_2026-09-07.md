# LEARNING FAMILY STAGE C — STAGING PREPARATION

Status: CANDIDATE / STAGING SOURCE PREPARED / STATIC CORRECTION APPLIED / NO CENTRAL TAKY WRITE / NO PRODUCTION RELEASE
Date: 2026-09-07
Scope: Ready & Set / Hide & Seek / Snap & Pop staging workflow and first Ready integration batch
Depends on:
- `CANDIDATES/LEARNING_FAMILY_CURRENT_TRUTH_INTEGRATION_2026-09-07.md`
- `CANDIDATES/LEARNING_FAMILY_STAGE_B_MASTER_DELTA_2026-09-07.md`
- `CANDIDATES/PREVIEW_FIRST_DEPLOYMENT_GOVERNANCE_REV_00_CANDIDATE.md`

## 0. PURPOSE

Establish a low-deploy-cost staging workflow without weakening integration quality.

`INTEGRATION QUALITY ≠ DEPLOY FREQUENCY`
`DEVELOPMENT CHANGE ≠ PRODUCTION DEPLOY`
`STAGING SOURCE WRITTEN ≠ STAGING HOST VERIFIED`
`STATIC SOURCE REVIEW ≠ RUNTIME PASS`
`STAGING PASS ≠ PRODUCTION PASS`

## 1. STAGING BRANCHES

### Ready & Set
Repository: `hns140412-glitch/Ready-Set`
- staging created from Production/main commit `68870b5fbab2431c785183794317efa8642356ac`
- initial Stage C commit: `68957f71896449fe812120e7c487c6f376fdefb1`
- corrective static-review commit: `23e941f560e2cf784f6b1ceb03876b79ad0b7297`
- current staging is exactly two commits ahead of production baseline
- production/main remains at `68870b5fbab2431c785183794317efa8642356ac`

### Hide & Seek
Repository technical lineage: `hns140412-glitch/ZPD-Word`
Current product: Hide & Seek
- staging created from current main commit `95478ac00481d6e8dac5acd914426452f3b54e67`
- no project-file delta applied in Stage C

### Snap & Pop
Repository: `hns140412-glitch/Snap-Pop`
- staging created from current main commit `d5b4c04abfe09a5235892c3cda2604f6341df614`
- no project-file delta applied in Stage C

## 2. READY STAGING CHANGE SET

Production-baseline → current staging compare remains limited to four files:
- `VERSION.json`
- `index.html`
- `ready-stage-c.js` — temporary staging integration layer
- `sw.js`

No unrelated project file is changed in the cumulative Stage C diff.

### 2.1 essential; recovery

Recovered prior source/behavior:
- child-facing sound name: `essential;`
- source type: YouTube playlist
- videoId: `h2sHEe_xnmU`
- playlist: `PLKRZTF1Q1uwYFbRwQzrySyGXYJVXqcUVu`

Current staging source intends to:
- preserve local piano/nature/water/lofi/OFF
- add `essential;` as online choice
- pause local audio when essential plays
- pause essential on explicit pause/recording path
- restore/resume after safe return/user gesture when browser autoplay policy requires it
- preserve session/timer even if YouTube fails
- avoid promising lock/background YouTube continuity on iPhone

Hard distinction:
`YOUTUBE ESSENTIAL ≠ LOCAL SUBSTITUTE TRACK`
`PIANO BGM ≠ PIANO LEARNING DOMAIN`

### 2.2 runtime/version alignment

Current staging metadata:
- appVersion `0.9.3-rc2`
- MASTER `REV_07`
- cache `ready-set-v093-rev07-staging2`
- release status `STAGING_CANDIDATE_DEVICE_VALIDATION_PENDING`

Production/main remains:
- appVersion `0.9.3-rc1`
- cache `ready-set-v093-rev07`

`STAGING VERSION ≠ PRODUCTION VERSION` as intended.

### 2.3 app routing

Current connected specialist routing remains context-preserving HTTPS routing.
The Stage C batch does NOT fake or claim direct dispatch into an already-installed iOS Home Screen PWA.

Priority:
1. preserve `session_id / goal_id / task_id / lap_id / return_target`
2. reliable specialist navigation and return
3. direct installed-PWA launch only if platform-safe behavior is actually demonstrated

Status:
`HTTPS CONTEXT ROUTING = PRESERVE`
`INSTALLED PWA DIRECT LAUNCH = REVIEW_REQUIRED`

## 3. STATIC REVERSE REVIEW / CORRECTIVE COMMIT

The initial Stage C source was reviewed before Preview/device validation.
Three material issues/gaps were identified and corrected together in one second staging commit.

### Finding A — recording/BGM collision risk
Initial pointer/tap resume support could have resumed BGM while the recording surface was active.

Correction:
- resume gesture now requires the Focus surface to be active
- active `MediaRecorder` recording state blocks resume
- explicit paused sessions remain blocked

Classification:
`POTENTIAL REGRESSION DETECTED → CORRECTED IN STAGING SOURCE`
`RUNTIME RESULT = STILL UNVERIFIED`

### Finding B — active-session return surface
An active Ready session could survive in storage while a reload/specialist return left the visible app on Home.

Correction:
- active, unfinished session restores to Focus surface
- existing REV_07 bridge consumes specialist return context first
- session/task/Lap authority remains Ready-owned

Classification:
`DOWNSTREAM CONTINUITY GAP → CORRECTED IN STAGING SOURCE`
`REAL DEVICE RETURN = STILL UNVERIFIED`

### Finding C — historical essential storage key
Historical source used `essential` as internal sound key while current user-facing label is `essential;`.

Correction:
- `state.sound === essential` migrates to `essential;`
- active-session sound key migrates likewise
- migration does not reset session state

Classification:
`MIGRATION GAP → CORRECTED IN STAGING SOURCE`

### Additional robustness
- failed YouTube API load clears failed loader state so later user interaction can retry
- failed initial YouTube player creation resets the hidden host/player promise for retry
- YouTube failure remains audio-provider failure, not Ready session failure

## 4. DEPLOY COST CONTROL ACTUALLY APPLIED

This stage applied cost governance but did not let cost suppress correction.

- Production branches for all three apps remain unchanged
- Hide/Snap received no unnecessary code changes
- Ready related feature changes were batched into one initial staging commit
- static review found real risks, so one corrective staging commit was intentionally added before Preview
- no file-by-file commit loop was used
- no manual Production deployment was triggered
- no Netlify access-control policy was changed

Actual Ready staging source commits in this stage: `2`.
Potential branch-deploy count cannot be claimed because branch-deploy state is not exposed by the currently used Netlify connector surface.

`COST SAVING ≠ LEAVE KNOWN REGRESSION`

## 5. NETLIFY ACCESS / HOST STATE

Read-only Netlify project checks show Ready, Hide and Snap currently require Team SSO for non-production projects.

Stage C did NOT disable that protection because doing so changes exposure/security scope.

Current classification:
- non-production Team SSO: PRESERVE FOR NOW
- public/password staging policy: REVIEW_REQUIRED
- staging branch-host existence/result: UNVERIFIED with current connector surface
- Production current deploy state: unchanged by this Stage C source work

`GITHUB STAGING BRANCH EXISTS ≠ NETLIFY STAGING HOST VERIFIED`

## 6. STAGING PATCH LIFECYCLE

`ready-stage-c.js` is a temporary staging integration layer for validation.
It SHALL NOT become a new permanent parallel authority.

If staging validation passes:
`VALIDATE → FOLD REQUIRED LOGIC INTO NORMAL READY RUNTIME/BASE → REMOVE TEMP STAGING PATCH → RE-VALIDATE → RELEASE CANDIDATE`

`TEMPORARY VALIDATION LAYER ≠ PERMANENT PRODUCT ARCHITECTURE`

## 7. NEXT GATE

Before any Production work:
1. static/source correction state — PREPARED
2. decide/verify staging host access without silently weakening non-production security
3. iPhone staging check:
   - app boot
   - active session restores to Focus
   - REV_07 panel
   - local BGM regression
   - `essential;` visible/selectable
   - essential play/pause/resume
   - recording keeps BGM off
   - YouTube failure does not affect session/timer
4. specialist routing returns same session/task/Lap
5. only after Preview PASS, fold staging logic into normal runtime/source
6. Production requires separate release approval and verification

## 8. CURRENT RESULT

- Three-app staging branch structure: PREPARED
- Ready Stage C source: WRITTEN + STATIC CORRECTION APPLIED
- Ready current staging commit: `23e941f560e2cf784f6b1ceb03876b79ad0b7297`
- Ready Production/main: VERIFIED UNCHANGED at `68870b5fbab2431c785183794317efa8642356ac`
- Hide/Snap Production/main: UNCHANGED BY STAGE C
- Ready essential restoration: IMPLEMENTED IN STAGING SOURCE / RUNTIME NOT YET VERIFIED
- legacy essential-key migration: IMPLEMENTED IN STAGING SOURCE
- recording BGM guard: IMPLEMENTED IN STAGING SOURCE / DEVICE RESULT UNVERIFIED
- active-session Focus restoration: IMPLEMENTED IN STAGING SOURCE / DEVICE RESULT UNVERIFIED
- installed iOS PWA direct launch: REVIEW_REQUIRED
- Netlify non-production SSO: UNCHANGED
- staging-host actual result: UNVERIFIED
- Production deploy/release: NOT PERFORMED

END — LEARNING FAMILY STAGE C STAGING PREPARATION 2026-09-07
