# TAKY GOVERNANCE CORRECTION — 2026-09-23

## GLOBAL AI ACTIVITY SLOGAN — TOP AUTHORITY

These two slogans are the highest guiding principle / standard slogan across TAKY, apps, OS, domains and AI activity.
They are not domain slogans and must not be reinterpreted to fit a local implementation.

**Think Again, Keep Your Key.**
- 핵심을 놓치지 말고 다시 생각하라.
- 답을 풀 열쇠는 이미 가지고 있다.

**Think Again, You’re The Key.**
- 방법을 찾고 해결하라.
- 결국 답을 만들어내는 핵심 주체는 인간이다.

### EXECUTION CYCLE

HUMAN INTENT / DESIRED OUTCOME  
→ THINK AGAIN  
  - 다시 보고  
  - 의심하고  
  - 기준 단서를 복구하고  
  - 다른 방법을 찾고  
→ KEEP YOUR KEY  
  - 핵심  
  - 맥락  
  - 의미  
  - 권한  
  - 소유권  
  - 최신 수정  
  - 제어권을 잃지 않고  
→ FIND A WAY / SOLVE  
→ YOU'RE THE KEY  
  - 결과를 인간의 목적에 되돌려 평가  
→ VERIFY / CORRECT / CONTINUE

Operational corollaries such as `HUMAN IS THE KEY != HUMAN IS THE DEBUGGER`, `USER != DEBUGGER`, and `SYSTEM PROVES. HUMAN CHOOSES.` are subordinate to this global slogan and never replace or redefine it.

## ATTACK / DEFENSE BALANCE

Aggressive validation must be paired with defensive preservation.

Attack asks:
- 어디서 우회 가능한가?
- 무엇을 잘못 PASS할 수 있는가?
- 누가 권한을 넘을 수 있는가?
- 결과가 인간 목적과 어긋날 수 있는가?

Defense preserves:
- 정상 기능
- 작업 진행성
- staging / diagnostic freedom
- 단순성
- 복구성
- 사용성
- 인간의 제어권
- 이미 검증된 경로

A finding does NOT automatically justify a stronger prohibition.
The preferred response is the smallest structural correction that blocks the proven failure while preserving legitimate work.

Current balance:
- production / user exposure = fail closed
- staging / internal diagnostics = continue
- unsupported reference claim = fail
- already-compliant presentation = do not distort merely to manufacture a reference effect
- human approval = purpose / choice, not debugging

## IMPLEMENTED DEFINITION

A TAKY rule is NOT considered implemented merely because it exists in prose, JSON, prompt, C2S or handoff.

IMPLEMENTED requires executable evidence such as:
- permission / routing enforcement
- actual specialist tool
- independent validation
- regression proof

## PRODUCTION AUTHORITY

HUMAN INTENT
→ WORK OS ROUTER
→ SIGNED PRODUCTION AUTHORIZATION
→ AUTHORIZED EXECUTION GRAPH
→ SPECIALIST ENGINE
→ INDEPENDENT VALIDATION
→ SIGNED EXPOSURE GRANT
→ ARTIFACT BROKER
→ HUMAN PURPOSE / FINAL CHOICE

No valid authorization → no production.  
No valid validation receipt → no exposure.  
No valid exposure grant → no production artifact publication.

## TRUST BOUNDARY

Production and Validation are separate MCP trust domains.

- `taky-production`
  - staging-capable drawing/report tools
  - production routing
  - finalization
  - publication broker
  - public-key verification only for validator receipts

- `taky-validation`
  - objective visual measurement
  - reference-effect measurement
  - independent visual review
  - validator private-key signing

Validator outage must not erase the work path: staging and diagnostics remain available.
User-facing production remains fail-closed.

## HUMAN INTENT BINDING

USER_EFFECT is not a generic visual score.
For user-facing finalization, the independent visual review is bound to a digest of:
- desired_outcome
- success_criteria

A review for a different human intent cannot be replayed as approval.

## REFERENCE CAUSALITY

Reference claims require:
REFERENCE
→ COMPILE_DIGEST
→ PRESENTATION-ONLY APPLICATION
→ APPLIED_PARAMETERS
→ SAME-SOURCE BASELINE / CANDIDATE
→ INDEPENDENT EFFECT RECEIPT
→ USER-VISIBLE / PROFESSIONAL REVIEW

Reference authority never becomes geometry / fact authority.
If a profile already satisfies the reference and no parameter is actually changed, the system must not distort the result merely to create a visible delta; it simply cannot claim causal reference effect for that run.

## REFERENCE APPLICABILITY / MULTI-REFERENCE CLAIMS

Reference mining knowledge is preserved even when an execution adapter does not yet exist.
Production claimability is separate from mined knowledge.

Applicability classes:

- `FULL`
  - current engine can implement the declared reference intent directly
  - current example: `DIVISARE_EDITORIAL_RESTRAINT`
  - claim scope: `EDITORIAL_LAYOUT_RESTRAINT`

- `PARTIAL`
  - only a safe subset is implemented
  - current example: `ARCHDAILY_PLAN_HIERARCHY`
  - safe claim scope: `SOURCE_LINE_HIERARCHY_ONLY`
  - current implementation uses measured source stroke-width rank only
  - it does NOT claim verified CUT / PRIMARY / SECONDARY architectural semantics

- `DEFERRED`
  - mined knowledge remains available
  - production claim is forbidden until an executable adapter + effect metric exists
  - current examples:
    - `OMA_RELATION_FIRST` — diagram component adapter not active
    - `BIG_ONE_MOVE` — diagram component adapter not active
    - `SOM_FOSTER_TECHNICAL_CLARITY` — verified presentation roles required

Multi-reference production requires:

REFERENCE SET  
→ one compile digest  
→ causal application evidence for EVERY claimed reference  
→ correct effect metric receipt for EVERY claimed reference / effect schema  
→ source-fidelity lineage where required  
→ independent visual / human-intent review

A valid effect from one reference cannot authorize another reference claim.

Defensive balance:
- DEFERRED references remain available for mining, study and staging
- they are not deleted or treated as useless
- only the unsupported production claim is blocked

## SOURCE-STYLE RANK — SAFE PARTIAL LINE-HIERARCHY ADAPTER

When verified architectural roles are unavailable, the engine may use source presentation values only:

source stroke width  
→ distinct width order  
→ semantic-free rank  
→ bounded multiplier  
→ geometry fingerprint equality  
→ monotonic rank preservation

Hard locks:
- no architectural semantic labels are created
- no geometry-bearing attribute may change
- original relative stroke-width order may not reverse
- no effect claim if no actual style change occurred
- global image delta is not substituted for a line-hierarchy-specific metric

The first percentile-frequency implementation was rejected on real Hannam 2F because a dominant 0.24 width collapsed the ranks.
The corrected implementation ranks DISTINCT source widths, preserving the source presentation order.

## HOST POLICY

Generic Python / HTML / ReportLab / direct image generation may remain available for diagnostic / staging use.
They do not receive production publication authority.

The project-level Claude host guard blocks direct writes to `artifacts/production`.
Validated staging → production publication occurs through the TAKY artifact broker.

## ARTIFACT-BOUND SOURCE FIDELITY

Production geometry PASS cannot be granted from caller-supplied `geometry.output`.

For user-facing / final publication:
- actual source bytes
- controlled source SVG
- canonical A3 SVG
- actual candidate artifact bytes

must be independently re-read and bound by a signed `SOURCE_FIDELITY_VALIDATOR_V1` receipt.

The receipt verifies:
- source PDF -> controlled SVG geometry parity
- source-slot viewBox parity
- canonical inline-source identity
- absence of wrapper transform mutation
- canonical SVG -> actual candidate artifact parity
- exact candidate digest
- exact source digest

Caller-supplied geometry remains available only as diagnostic evidence and cannot authorize production.

New invariant:

**NO ARTIFACT-BOUND SOURCE FIDELITY → NO GEOMETRY PASS.**

Defensive balance:
- staging and diagnostics do not require this receipt
- user-facing production does
- existing geometry diagnostics are preserved, but demoted from authority

## LIVE AUTHORITY / READINESS

Committed documents may contain historical checkpoint SHAs, but a document edit changes HEAD immediately.
Therefore an embedded SHA is NEVER the current authority by itself.

Live authority protocol:

`get-production-readiness`
→ current local git HEAD
→ GitHub exact-head required CI
→ production verification public-key readiness
→ persistent capability-key mode
→ production_ready / staging_ready

`get-validation-readiness`
→ objective measurement signing-key readiness
→ vision signing-key readiness
→ Anthropic API presence
→ objective / vision / user-facing validation readiness

Rules:
- historical checkpoint SHA = provenance only
- current authority = live current HEAD + exact-head CI evidence
- staging may remain available when production readiness is false
- `production_ready=true` requires:
  - exact-head CI green
  - measurement public key ready
  - vision public key ready
  - persistent configured capability private key
- ephemeral process capability keys are NOT durable production readiness
- no readiness tool may expose secret values; only booleans / public-key fingerprints / modes

The former `TAKY_SKIP_CI_ATTESTATION` production escape hatch is removed.
There is no environment-variable bypass for production exact-head CI attestation.

## REPOSITORY PROTECTION LAYER

Runtime production enforcement and repository branch protection are separate controls.

Current branch protection is not enabled on the surgery branch.
The available GitHub connector exposes branch-protection/ruleset reads but no administration write path.

Therefore:

`REPOSITORY_BRANCH_PROTECTION = ADMIN_REQUIRED / OPEN`

Compensating control:
user-facing production remains blocked unless the running exact HEAD has both required GitHub Actions green.

This OPEN must not be misreported as runtime production enforcement failure, and runtime enforcement must not be misreported as repository branch protection.

## HUMAN AUTHORITY

Human final authority is preserved.
Human approval selects purpose, direction and final adoption.
It is not a substitute for system QA and must not be used to detect deleted walls, missing cores, crop errors, semantic hallucinations or source mismatch.
