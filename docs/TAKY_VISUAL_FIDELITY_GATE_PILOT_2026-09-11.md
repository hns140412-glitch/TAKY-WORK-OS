# TAKY Visual Fidelity Gate Pilot — 2026-09-11

Status: PILOT / NON-CANONICAL
Scope: image-reference-led UI and illustration workflows across TAKY projects
Main/prod: untouched

## Why this exists
When a user provides a strong visual reference, a merely functional implementation is not enough. The workflow must preserve the reference's design quality, hierarchy, composition, density, spacing, typography, illustration finish, and emotional tone. A result that is technically correct but visually far below the reference is a failed result.

## Core rule
REFERENCE SHOWN ≠ LOOSE INSPIRATION.
When the user says "make it like this", treat the supplied visual as a measurable design target unless the user explicitly asks for only a loose mood reference.

## Visual acceptance contract
Before implementation, extract and freeze a Visual Contract with these fields:
- layout/composition
- information hierarchy
- spacing/density
- typography scale/weight
- border radius / card geometry
- icon/illustration treatment
- depth/shadow/material feel
- color relationships
- animation/interaction expectations if visible
- mobile/desktop behavior
- elements that must NOT drift

Do not start final UI implementation until this contract is explicit enough to compare against the result.

## Two-lane workflow
### Lane A — Visual asset fidelity
1. Reference inspection
2. Style/quality decomposition
3. Low-cost prompt/spec draft
4. Generate or edit one candidate only when generation is approved/allowed
5. Compare candidate to reference using the Visual Contract
6. Reject below-threshold candidate before UI integration
7. Refine with targeted edits, preserving accepted elements
8. Freeze approved asset

### Lane B — UI fidelity
1. Build structural wireframe first
2. Match geometry/layout before decorative polish
3. Insert approved/frozen assets only after structure is stable
4. Compare reference vs implementation at the same viewport
5. Fix largest visual deltas first
6. Run mobile/desktop/responsive checks
7. Only then mark UI visually verified

## Hard gates
### Gate V0 — Reference coverage
PASS only when the reference can be inspected clearly enough to derive the Visual Contract.
If not, mark UNVERIFIED_REFERENCE_COVERAGE and ask only for the missing evidence.

### Gate V1 — Asset quality
Do not integrate an image/illustration that obviously misses the intended finish.
Example failure: reference has professional painterly depth, generated result looks like a rough children's drawing.
Such a candidate is REJECTED, not "good enough for now".

### Gate V2 — Layout fidelity
Before polish, geometry must match the reference direction: major blocks, proportions, whitespace, density, and hierarchy.

### Gate V3 — Side-by-side verification
A reviewer must compare reference and implementation side by side at a matched viewport. Required output:
- MATCHED
- ACCEPTABLE_DELTA
- FAILED_DELTA
for each major Visual Contract field.

### Gate V4 — Regression
After later code changes, re-check that previously accepted visual regions did not regress.

## Stop conditions
Stop and fix before proceeding when any of these occurs:
- reference quality is high but generated asset quality is visibly low
- visual hierarchy differs materially
- spacing/density makes the screen feel like a different product
- typography or illustration style drifts enough to change the emotional tone
- implementation is functionally complete but reference fidelity is unverified

## No-user-as-QA rule
Do not use the user as the first visual regression detector when static screenshot/reference comparison can catch the problem. The user should approve direction at real decision gates, not repeatedly point out obvious mismatches.

## Evidence package for each visual milestone
- reference screenshot/image
- target viewport
- implementation screenshot
- Visual Contract checklist
- largest remaining deltas
- files changed
- commit SHA
- runtime verification state

## Image generation/editing policy
- Prefer reference-led editing over regenerating from scratch when an accepted composition/style already exists.
- Preserve accepted details and change one bounded element at a time.
- Do not repeatedly regenerate the whole asset after each small correction.
- Paid generation remains approval-gated.
- If exact artist/style imitation raises policy or quality issues, translate the reference into concrete visual attributes rather than relying on only a style name.

## UI implementation rule for Codex/agents
Every visual task packet must include:
1. reference location
2. Visual Contract
3. acceptance criteria
4. forbidden drift
5. viewport(s)
6. test budget
7. screenshot comparison requirement
8. completion condition = visually verified, not merely rendered

## Completion definition
A visual task is complete only when:
- functional checks pass
- reference fidelity checks pass or remaining deltas are explicitly approved
- screenshots exist for review
- no known major visual mismatch remains

This pilot is intentionally separate from canonical TAKY governance until explicitly promoted by human approval.