# C2S CLOSURE — HANNAM SYSTEM FAILURE SURGERY — 2026-09-23

## PURPOSE

Convert repeated Hannam drawing/report failures into executable TAKY + Drawing Engine + Work OS corrections.
This closure is about system surgery, not Hannam report production.

## ROOT CAUSES CLOSED / STRUCTURALLY CORRECTED

- declarative governance without executable enforcement
- authority collapse between source / geometry / semantic / presentation / AI
- open production routing and one-off producer bypass
- engine self-certification risk
- validation not controlling user exposure
- reference mining not causally connected to output
- semantic / narrative evidence leakage
- timestamp confused with content change
- handoff propagating flawed execution patterns
- user acting as debugger

## GLOBAL SLOGAN CORRECTION

The top-level execution cycle is locked to:

HUMAN INTENT / DESIRED OUTCOME  
→ THINK AGAIN  
→ KEEP YOUR KEY  
→ FIND A WAY / SOLVE  
→ YOU'RE THE KEY  
→ VERIFY / CORRECT / CONTINUE

KEEP YOUR KEY includes:
핵심 / 맥락 / 의미 / 권한 / 소유권 / 최신 수정 / 제어권.

Attack validation must be balanced by defensive preservation.
A stricter block is not automatically the correct answer.

## IMPLEMENTED — CAPABILITY

- vector PDF controlled presentation
- A3 canonical SVG/HTML rendering
- A3 bundle export to HTML / PDF / PNG / PPTX / XLSX
- DXF / vector-PDF geometry primitive extraction
- source geometry fingerprinting
- automated artifact visual measurement
- reference-effect measurement
- independent visual review interface

## IMPLEMENTED — ENFORCEMENT

- signed production authorization
- closed Work OS routing
- authorized execution graphs
- staging-only generic / diagnostic paths
- independent validation receipts
- signed exposure grants
- artifact SHA-256 binding
- exposure-grant replay rejection
- TOCTOU mutation rejection
- production artifact broker
- Claude host guard for protected production path
- exact-head CI attestation requirement
- caller-injected PASS removal

## IMPLEMENTED — VALIDATION

- source identity / DATE != CONTENT CHANGE
- geometry / anchors / crop / rotation / scale
- destructive-mask intersection protection
- fact evidence
- semantic UNKNOWN-first styling gate
- narrative evidence-strength gate
- A3 physical-output validation
- architectural readability objective metrics
- provenance
- user effect / decision value
- human-intent digest binding

## IMPLEMENTED — REFERENCE CAUSALITY

REFERENCE
→ deterministic COMPILE_DIGEST
→ presentation-only application
→ applied parameter trace
→ same-source baseline/candidate ablation
→ independent effect receipt
→ independent visible/professional review

Defensive rule:
already-compliant presentation is not distorted to manufacture effect.
References requiring verified presentation roles remain DEFERRED instead of inventing semantics.

## ATTACK REVIEW FINDINGS AND DEFENSIVE RESPONSES

1. WeakSet token could not cross MCP process boundary.
   - attack: cross-process authorization bypass / unusable token
   - defense: signed serializable capability tokens

2. Caller could inject PASS strings.
   - attack: self-declared validation
   - defense: executable computed validators

3. Production process owned validation signing.
   - attack: authority collapse
   - defense: separate `taky-production` and `taky-validation` MCPs
   - continuity preserved: staging tools remain available when validator is unavailable

4. A3 renderer embedded source SVG as an image.
   - attack: final PDF could silently lose authoritative source geometry
   - defense: source vectors are inlined into canonical A3 SVG

5. Ivory paper background was counted as ink.
   - attack: false visual-density failure
   - defense: background-relative metric extraction; threshold not weakened

6. 1-pixel raster rounding caused A3 false failure.
   - attack: brittle validation
   - defense: physical A3 contract retained with explicit ±1 px raster rounding tolerance

7. Reference effect was measured without causal application proof.
   - attack: arbitrary visual difference could be labeled reference effect
   - defense: compile digest + applied parameters + same-source ablation

8. Aggressive reference threshold encouraged over-stylization.
   - attack: gaming the metric
   - defense: stronger synthetic baseline only for regression; production defaults unchanged; compliant profiles are not distorted

9. User-effect review was not bound to original human purpose.
   - attack: technically good but purpose-wrong output could pass
   - defense: human-intent digest bound to independent visual review

10. Shared renderer contained Hannam-specific footer text.
   - attack: cross-project contamination
   - defense: project-specific footer moved into project presentation profile

## REAL-SOURCE DRY PILOT — 2026-09-23

Purpose:
validate the repaired system against the actual Hannam issued source without resuming report production.

Source authority:
- Work / `2026-0923_한남동 737-21일원 고급주택(4세대) 규모검토.dwg`
- Work / `2026-0923_한남동 737-21일원 고급주택(4세대) 규모검토.pdf`
- PNG extracts remain support-only

Issued PDF dry-pilot facts:
- SHA-256: `d81740e1aec0e9e80a50cc1fdc23c41b227f52377e0139dbf5a620b6fab10278`
- pages: 4
- page rect: 1191 x 842 on all pages
- rotation: 0 on all pages
- semantic inference: false
- authority classification: DERIVED_VECTOR

Primitive counts:
- page 0: 7,880
- page 1: 46,288
- page 2: 49,294
- page 3: 8,917

Real-source load check:
- ~49k primitive fingerprint: ~0.42 s
- same-geometry compare: ~0.85 s
- one-primitive mutation compare: ~1.0 s
- mutation correctly rejected
- observed process RSS peak during repeated benchmark: ~220 MB

Conclusion:
the geometry fingerprint path is heavy but currently viable for this real source.
No performance-based weakening was justified.

Attack finding:
the production pipeline still allowed caller-supplied `geometry.output` to participate in GEOMETRY_GATE.
A caller could submit source primitives as output evidence even if the actual candidate artifact were damaged.

Correction:
- added independent `drawing_source_fidelity_validator.py`
- added signed `SOURCE_FIDELITY_VALIDATOR_V1` receipt
- source PDF -> controlled SVG -> canonical inline source -> candidate artifact is re-read from actual files
- candidate/source digests are bound into the receipt
- source-slot crop/viewBox mutation is rejected
- canonical inline-source mutation is rejected
- final artifact mutation is rejected
- production GEOMETRY_GATE now trusts artifact-bound source fidelity
- caller geometry compare remains diagnostic only

Negative regression fixtures:
- controlled source geometry mutation -> FAIL
- source-slot crop/viewBox mutation -> FAIL
- final candidate artifact mutation -> FAIL

No Hannam report/design/PDF/HTML/mockup was generated as part of the real-source dry pilot.
At the time of that real-source pilot, DWG remained unparsed because no trusted decoder path was connected.

## REAL-SOURCE REFERENCE APPLICATION PILOT

Actual Hannam 2F source was used in staging only.

Source-style rank findings:
- geometry fingerprint before/after: identical
- semantic inference: false
- styled elements: 32,739
- distinct source widths: 0.01 / 0.1167 / 0.24 / 0.54 / 1.02

Initial percentile-frequency implementation FAILED defensively:
- LIGHT: 793
- SECONDARY: 0
- PRIMARY: 0
- HEAVY: 31,946
- cause: dominant 0.24 source width collapsed q25/q50/q75

Correction:
rank by DISTINCT SOURCE WIDTH ORDER, not by element-frequency percentile.

Corrected real-source distribution:
- LIGHT: 793
- SECONDARY: 28,636
- PRIMARY: 3,176
- HEAVY: 134

Line-hierarchy-specific measurement:
- schema: `TAKY_LINE_HIERARCHY_DELTA_V1`
- objective effect detected: true
- source dynamic range: 102.0
- candidate dynamic range: 137.58139534883722
- dynamic-range gain: 1.3488372093023258
- minimum adjacent separation gain: 1.0943396226415094
- monotonic source order preserved: true

Global whole-page visual delta remained small.
Therefore source-style rank is classified as a micro hierarchy support mechanism and does not independently prove professional-family reference effect.
Independent Vision review remains mandatory for user-facing production.

Reference applicability after real-source attack review:
- DIVISARE_EDITORIAL_RESTRAINT = FULL / EDITORIAL_LAYOUT_RESTRAINT
- ARCHDAILY_PLAN_HIERARCHY = PARTIAL / SOURCE_LINE_HIERARCHY_ONLY
- OMA_RELATION_FIRST = DEFERRED
- BIG_ONE_MOVE = DEFERRED
- SOM_FOSTER_TECHNICAL_CLARITY = DEFERRED

Multi-reference correction:
- one reference effect can no longer authorize an entire reference set
- every claimed reference requires causal application coverage
- every effect schema requires its own signed receipt
- missing receipt for one reference -> FAIL
- reference with no implemented effect metric -> production claim FAIL
- staging/mining knowledge remains available

## CURRENT VERIFIED STATE

Branch:
`surgery/enforcement-v1-2026-09-23`

Verified code HEAD before this closure update:
`fe4650f517272e0e01f5419a3c1b74a1320807cd`

GitHub Actions on that HEAD:
- TAKY Enforcement Regression #332 — SUCCESS
- drawing-engine-core #788 — SUCCESS

The exact closure-document commit created after this point must be revalidated because both workflows run on every push.

## LIVE AUTHORITY / READINESS CORRECTION

Problem found:
embedding `LAST VERIFIED HEAD` in a handoff/document is structurally stale as soon as that document itself is committed.

Correction:
- added production MCP tool `get-production-readiness`
- added validator MCP tool `get-validation-readiness`
- removed `TAKY_SKIP_CI_ATTESTATION` production bypass
- added pure `runtime/readiness-evaluator.js`
- added readiness regression to enforcement CI

Production readiness semantics:
- exact-head CI green
- measurement public key ready
- vision public key ready
- persistent capability key configured

If those are not all true:
- `production_ready=false`
- `staging_ready=true`

Validation readiness separates:
- objective measurement readiness
- independent vision review readiness
- full user-facing validation readiness

No private key or API secret values are exposed.

Latest pre-document-update checkpoint:
`d2bdf78f2efdfabe82c25613e20639092cd9546a`
- TAKY Enforcement Regression #352 — SUCCESS
- drawing-engine-core #808 — SUCCESS

This checkpoint is historical after the current document commit.
Future resume MUST query live readiness/current HEAD instead of treating this SHA as current authority.

Repository branch protection:
- surgery branch currently not protected
- connector has no administration write capability
- runtime exact-head CI gate remains the production compensating control
- status: `REPOSITORY_BRANCH_PROTECTION = ADMIN_REQUIRED / OPEN`

## SIGNED READINESS INTEGRATION

A further attack review found that Production Gateway readiness alone could not prove that the separate Validator process had valid private keys and live Vision API access.

Correction:
- added `TAKY_VALIDATION_READINESS_RECEIPT`
- validator signs short-lived readiness using the measurement validation key
- production verifies that receipt using the measurement public key
- production also compares the attested Vision public-key fingerprint with its own configured Vision public key
- a signed NOT-ready receipt remains NOT ready
- missing receipt cannot produce overall user-facing readiness
- staging remains available

Readiness regression now proves:
- durable production readiness requires exact-head CI + public keys + persistent capability key
- objective validation and Vision readiness remain separable
- mismatched Vision key fingerprint fails
- NOT-ready validator receipt fails
- missing readiness receipt fails closed for overall user-facing readiness
- no secret values are embedded in shared MCP config

Latest code validation before this document update:
- Enforcement #372 — SUCCESS
- Drawing Core #828 — SUCCESS

Do not use those run numbers as future authority after this commit.
Live authority is always the result of current HEAD + readiness/exact-head CI.

## DEFERRED REFERENCE OPEN REDUCTION — 2026-09-24

New executable staging/production proof plumbing was added for two previously deferred diagram references without widening their semantic authority.

- `OMA_RELATION_FIRST`
  - status: PARTIAL / production-claimable only within `DECLARED_PRIMARY_RELATION_FOCUS_ONLY`
  - adapter: declared-role canonical SVG opacity focus
  - semantic inference: false
  - geometry mutation: false
  - effect metric: `TAKY_RELATION_FOCUS_DELTA_V1`
- `BIG_ONE_MOVE`
  - status: PARTIAL / production-claimable only within `DECLARED_BASE_MOVE_RESULT_EMPHASIS_ONLY`
  - adapter: declared BASE_CONDITION / MOVE / RESULT emphasis
  - semantic inference: false
  - geometry mutation: false
  - effect metric: `TAKY_ONE_MOVE_EMPHASIS_DELTA_V1`

Both application proof and objective effect proof are bound to the final canonical SVG digest. Production cross-checks that digest against the artifact-bound source-fidelity receipt.

Negative behavior preserved:
- undeclared diagram roles do not pass
- missing/ambiguous primary relation does not pass
- geometry mutation does not pass
- already-compliant SVG does not manufacture causal effect

`SOM_FOSTER_TECHNICAL_CLARITY` remains DEFERRED because STRUCTURE / PROGRAM / ENVELOPE are architectural semantic roles and require verified presentation-role authority.

## SOM/FOSTER TECHNICAL-CLARITY OPEN REDUCTION — 2026-09-24

The missing executable styling path and missing dedicated metric have now been separated from the unresolved semantic-authority problem.

Implemented:
- staging-only adapter: `tools/drawing_technical_clarity_adapter.py`
- adapter mode: `VERIFIED_PRESENTATION_ROLE_CLARITY`
- accepted roles: STRUCTURE / PROGRAM / ENVELOPE only
- `data-taky-role-source="VERIFIED"` required
- matching `data-taky-role-proof-sha256` required
- presentation-only opacity / stroke-width changes
- original source stroke width retained for idempotent re-application
- geometry-bearing attributes unchanged
- semantic inference false
- adapter output `production_claimable=false`
- dedicated metric: `TAKY_TECHNICAL_SYSTEM_READABILITY_DELTA_V1`
- negative tests cover unverified roles, proof mismatch, repeated application and geometry mutation

Authority preserved:
- compiler applicability remains DEFERRED
- executable adapter existence does not create STRUCTURE / PROGRAM / ENVELOPE authority
- production claim remains blocked until independent verified-role authority is admitted and wired into production trust

Pre-document-update code checkpoint, provenance only:
- HEAD: `c7d30745bf575f30d08f9eeb1abb2fb3072f6a3a`
- TAKY Enforcement Regression #405 / #406 — SUCCESS
- drawing-engine-core #861 / #862 — SUCCESS

Future resume must still query live HEAD + exact-head CI.

## DWG OPEN REDUCTION — 2026-09-24

A strict GNU LibreDWG `dwgread` bridge now exists.

Implemented:
- runtime decoder identity probe
- original DWG digest preservation
- strict failure on risky LibreDWG diagnostics
- derived DXF parse validation through ezdxf
- derived geometry primitive extraction
- authority lock: `DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE`
- `production_claimable=false`

Not yet proven:
- live production/validator runtime has `dwgread` provisioned
- actual project DWG conversion has passed source-equivalence validation
- converted DWG geometry has been admitted as production authority

Therefore the old OPEN “no trusted DWG decoder path” is reduced, not falsely closed.

## OPEN — REAL-WORLD / OPERATIONAL

- live validator secrets must be provisioned outside the repo:
  - TAKY_MEASUREMENT_PRIVATE_KEY_PEM
  - TAKY_VISION_PRIVATE_KEY_PEM
  - corresponding production public keys
  - ANTHROPIC_API_KEY for live independent visual review
- user-facing real-project production pilot has not been run; read-only/staging real-source pilots have passed
- strict GNU LibreDWG `dwgread` bridge is IMPLEMENTED for staging, but live runtime decoder presence + real DWG→DXF source-equivalence validation remain OPEN; authority stays `DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE` and `production_claimable=false`
- SOM/Foster staging adapter + dedicated metric are IMPLEMENTED; remaining OPEN is independent verified STRUCTURE / PROGRAM / ENVELOPE role authority admission and production trust wiring
- CI synthetic Vision receipt proves trust plumbing, not a live Anthropic API quality judgment

## STATUS

ARCHITECTURE_SURGERY = IMPLEMENTED  
RUNTIME_ENFORCEMENT = IMPLEMENTED  
MCP_PRODUCTION_VALIDATION_SEPARATION = IMPLEMENTED  
REFERENCE_CAUSALITY = IMPLEMENTED  
HUMAN_INTENT_BINDING = IMPLEMENTED  
SYNTHETIC_SOURCE_TO_PRODUCTION_E2E = PASS  
REAL_SOURCE_READ_ONLY_STAGING_PILOT = PASS\nLIVE_USER_FACING_REAL_PROJECT_PRODUCTION_PILOT = NOT_RUN  
REPORT_PRODUCTION = NOT_RESUMED
