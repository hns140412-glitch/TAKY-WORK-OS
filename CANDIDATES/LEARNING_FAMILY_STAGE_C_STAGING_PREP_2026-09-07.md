# LEARNING FAMILY STAGE C — STAGING PREPARATION

Status: CANDIDATE / STAGING SOURCE PREPARED / NO CENTRAL TAKY WRITE / NO PRODUCTION RELEASE
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
`STAGING PASS ≠ PRODUCTION PASS`

## 1. STAGING BRANCHES

### Ready & Set
Repository: `hns140412-glitch/Ready-Set`
- staging created from Production/main commit `68870b5fbab2431c785183794317efa8642356ac`
- Stage C staging commit: `68957f71896449fe812120e7c487c6f376fdefb1`
- commit is exactly one commit ahead of the production baseline
- main remains unchanged in this Stage C work

### Hide & Seek
Repository technical lineage: `hns140412-glitch/ZPD-Word`
Current product: Hide & Seek
- staging created from current main commit `95478ac00481d6e8dac5acd914426452f3b54e67`
- no project-file delta applied in Stage C

### Snap & Pop
Repository: `hns140412-glitch/Snap-Pop`
- staging created from current main commit `d5b4c04abfe09a5235892c3cda2604f6341df614`
- no project-file delta applied in Stage C

## 2. READY FIRST STAGING BATCH

To avoid multiple Preview builds, related Ready changes were assembled into one Git tree/commit rather than file-by-file pushes.

Changed files only:
- `VERSION.json`
- `index.html`
- `ready-stage-c.js` — new staging integration layer
- `sw.js`

Compare result:
- ahead by 1 commit
- four files changed
- no unrelated file drift detected by commit comparison

### 2.1 essential; recovery

Recovered authoritative prior behavior/source:
- child-facing sound name: `essential;`
- source type: YouTube playlist
- videoId: `h2sHEe_xnmU`
- playlist: `PLKRZTF1Q1uwYFbRwQzrySyGXYJVXqcUVu`

Stage behavior:
- preserves local piano/nature/water/lofi/OFF
- adds `essential;` as an online option
- local audio pauses when essential plays
- pause/recording route pauses essential
- session return may resume after user gesture when autoplay policy requires it
- YouTube failure does not stop or invalidate the Ready session/timer
- iPhone lock/background YouTube continuation is not promised

Hard distinction:
`YOUTUBE ESSENTIAL ≠ LOCAL SUBSTITUTE TRACK`
`PIANO BGM ≠ PIANO LEARNING DOMAIN`

### 2.2 runtime/version alignment

Staging metadata:
- appVersion `0.9.3-rc2`
- MASTER `REV_07`
- cache `ready-set-v093-rev07-staging1`
- release status `STAGING_CANDIDATE_DEVICE_VALIDATION_PENDING`

Production/main remains:
- appVersion `0.9.3-rc1`
- cache `ready-set-v093-rev07`

Therefore:
`STAGING VERSION ≠ PRODUCTION VERSION` as intended.

### 2.3 app routing

Current connected specialist routing remains context-preserving HTTPS routing.
The Stage C batch does NOT fake or claim direct dispatch into an already-installed iOS Home Screen PWA.

Priority remains:
1. preserve `session_id / goal_id / task_id / lap_id / return_target`
2. reliable specialist navigation and return
3. direct installed-PWA launch only if platform-safe behavior is actually demonstrated

Status:
`HTTPS CONTEXT ROUTING = PRESERVE`
`INSTALLED PWA DIRECT LAUNCH = REVIEW_REQUIRED`

## 3. DEPLOY COST CONTROL ACTUALLY APPLIED

This stage implemented the new governance rather than only documenting it:

- three app Production branches were not changed
- Ready related changes were batched into one staging commit
- Hide/Snap staging branches received no unnecessary code changes
- no manual Production deployment was triggered
- no Netlify access-control policy was changed

`ONE RELATED BATCH → ONE STAGING PUSH`

## 4. NETLIFY ACCESS / HOST STATE

Read-only Netlify project checks show Ready, Hide and Snap currently require Team SSO for non-production projects.

Stage C did NOT disable that protection because doing so changes exposure/security scope.

Current classification:
- non-production Team SSO: PRESERVE FOR NOW
- public/password staging policy: REVIEW_REQUIRED
- branch deploy existence/result for staging: UNVERIFIED with currently exposed connector surface
- Production current deploy state: unchanged by this Stage C source work

`GITHUB STAGING BRANCH EXISTS ≠ NETLIFY STAGING HOST VERIFIED`

## 5. STAGING PATCH LIFECYCLE

`ready-stage-c.js` is a staging integration layer for validating the recovered behavior with minimal disruption.
It is NOT intended to become a permanent parallel authority.

If staging validation passes:
`VALIDATE → FOLD REQUIRED LOGIC INTO NORMAL READY RUNTIME/BASE → REMOVE TEMP STAGING PATCH → RE-VALIDATE → RELEASE CANDIDATE`

This prevents a new fragmentation layer from being created by the fix itself.

`TEMPORARY VALIDATION LAYER ≠ PERMANENT PRODUCT ARCHITECTURE`

## 6. NEXT GATE

Before any Production work:
1. static/source review of `ready-stage-c.js`
2. staging host availability/access decision
3. iPhone staging check for:
   - app boot
   - REV_07 panel
   - local BGM regression
   - `essential;` visible/selectable
   - essential play/pause/resume behavior
   - recording BGM pause/return
   - session/timer unaffected by YouTube failure
4. specialist routing remains same session/Lap
5. only after Preview PASS, fold staging logic into ordinary runtime/source
6. Production requires separate approval/release gate

## 7. CURRENT RESULT

- Three-app staging branch structure: PREPARED
- Ready first related-change batch: WRITTEN TO STAGING
- Ready Production/main: UNCHANGED
- Hide/Snap Production/main: UNCHANGED
- Ready essential restoration: IMPLEMENTED IN STAGING SOURCE / RUNTIME NOT YET VERIFIED
- Ready REV_07 version alignment: IMPLEMENTED IN STAGING SOURCE
- installed iOS PWA direct launch: REVIEW_REQUIRED
- Netlify non-production SSO: UNCHANGED
- staging-host actual result: UNVERIFIED
- Production deploy/release: NOT PERFORMED

END — LEARNING FAMILY STAGE C STAGING PREPARATION 2026-09-07
