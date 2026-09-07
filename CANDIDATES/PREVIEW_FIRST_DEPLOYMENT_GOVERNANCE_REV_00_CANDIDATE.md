# PREVIEW-FIRST DEPLOYMENT GOVERNANCE — REV_00 CANDIDATE

Status: CANDIDATE / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-07
Scope: PWA/web development deployment cost, staging, preview, production, release verification

## 0. PURPOSE

Production shall not be the normal iteration loop while a product is still being built.
Deployment usage/credits are a governed resource and must be considered before execution.

`DEVELOPMENT CHANGE ≠ DEPLOY REQUIRED`
`MASTER / DOC CHANGE ≠ RUNTIME DEPLOY REQUIRED`
`PREVIEW DEPLOY ≠ FREE DEPLOY`
`PRODUCTION DEPLOY = RELEASE GATE`

## 1. DEFAULT DEVELOPMENT FLOW

Preferred lifecycle:

`LOCAL / SOURCE EDIT → LOCAL VALIDATION → BATCH RELATED CHANGES → STAGING / PREVIEW → REPRESENTATIVE DEVICE REVIEW → CORRECTION BATCH → PREVIEW PASS → HUMAN APPROVAL → PRODUCTION → RELEASE VERIFY`

Do not intentionally reduce validation coverage merely to save deploy usage.
Instead reduce redundant deployments by batching changes and separating documentation-only commits from runtime releases.

`COST SAVING ≠ VALIDATION BYPASS`

## 2. DEPLOYMENT TRIGGER GATE

Before deploying, classify the change:

- DOC / MASTER ONLY
- SOURCE / LOGIC CHANGE NOT REQUIRING HOSTED RUNTIME
- UI / CLIENT RUNTIME
- SERVICE WORKER / CACHE / MANIFEST
- SERVERLESS / BACKEND / ENVIRONMENT
- RELEASE-SENSITIVE IDENTITY / ICON / INSTALL

Default actions:
- DOC / MASTER ONLY → no runtime deploy required by default
- source change with reliable local validation → defer deploy until related batch is ready
- hosted-runtime behavior → staging/preview first
- service-worker/manifest/PWA install behavior → stable staging origin preferred, then final Production verification
- production deploy → explicit release gate

## 3. STABLE STAGING FOR PWA

For PWA install/cache/service-worker/app-link tests, a stable staging branch/origin is preferred over creating a different disposable URL for every small change.

Reason:
- Home Screen installation is origin-sensitive
- service worker/cache behavior needs continuity
- cross-app routing needs a predictable return origin
- repeated changing preview origins can create misleading install behavior

Suggested branch pattern:
- `main` = Production source
- `staging` = stable pre-release integration branch
- optional short-lived feature branches = source review / merge preparation

Exact host configuration remains repository/provider-specific.

## 4. BATCHING RULE

A set of related small corrections should be accumulated and locally validated before staging deploy when safe.

Batch examples:
- copy + state-label corrections
- one feature's HTML/CSS/JS changes
- related cross-app handoff fixes
- service-worker cache list + version change

Do not batch unrelated risky changes solely to reduce credits when that would make rollback or diagnosis unsafe.

`BATCH FOR EFFICIENCY ≠ MIX UNRELATED RISK`

## 5. PREFLIGHT

Before MEDIUM/HIGH deployment work, disclose when material:
- number of sites/apps likely to deploy
- staging vs production
- whether multiple iterations are expected
- what can be validated locally first
- whether the user can choose Preview-only for this stage

HIGH / VERY_HIGH deployment plans require explicit user confirmation under the Cost / Usage Preflight Gate.

## 6. PRODUCTION GATE

Production deploy should require:
- intended change set identified
- local/static validation complete where applicable
- staging/preview evidence for runtime-sensitive changes when fit-for-purpose
- unresolved known regressions explicitly classified
- human approval when release materially changes user-facing behavior
- deployment result verified separately from source commit

`SOURCE COMMITTED ≠ DEPLOYED`
`DEPLOY READY ≠ RELEASE VERIFIED`

## 7. RELEASE VERIFY

After Production, validate only the representative release-critical path needed for the change, not an automatic full regression of every feature unless risk requires it.

For learning-family PWA changes, representative checks may include:
- launch
- current version/cache state
- active-session safety
- app-switch context preservation
- installed Home Screen behavior when relevant
- BGM/audio restoration when relevant

## 8. THREE-APP FAMILY APPLICATION

Ready & Set / Hide & Seek / Snap & Pop should not all be Production-deployed merely because one app's documentation changed.

Cross-app runtime change flow:
`LOCAL CONTRACT CHECK → MODIFY AFFECTED APPS → LOCAL/STATIC CHECK → STAGING BATCH → CROSS-APP TEST → APPROVE → AFFECTED PRODUCTION APPS ONLY`

If only Ready & Set changes, do not redeploy Hide/Snap without a real dependency reason.

## 9. DEPLOYMENT TRACE

Record when available:
- work item/change batch
- repo/app
- branch/ref
- deploy surface
- staging/production class
- deploy identifier
- commit ref
- result
- release verification result
- deploy count for the work item

Exact provider credit accounting remains external/runtime-owned.

## 10. CURRENT CLASSIFICATION

- Preview/Staging-first: ADOPT
- Stable staging origin for PWA: ADOPT where supported
- Production as release gate: ADOPT
- Documentation-only no-deploy default: ADOPT
- Related-change batching: ADOPT
- No validation reduction for cost: HARD CANDIDATE
- Exact deploy-credit thresholds: HOLD
- Exact Netlify branch configuration: IMPLEMENTATION-OWNED / HOLD until applied
- Central TAKY write: NOT AUTHORIZED BY THIS CANDIDATE

END — PREVIEW-FIRST DEPLOYMENT GOVERNANCE REV_00 CANDIDATE
