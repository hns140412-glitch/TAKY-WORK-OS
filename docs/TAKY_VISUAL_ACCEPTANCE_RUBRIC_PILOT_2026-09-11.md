# TAKY Visual Acceptance Rubric Pilot — 2026-09-11

Status: PILOT / NON-CANONICAL
Scope: reference-led image generation, UI implementation, and visual QA
Main/prod: untouched

## Purpose
Convert subjective reactions like "it feels cheap" or "this looks nothing like the reference" into an explicit acceptance gate before the user has to catch obvious mismatches.

## Required workflow
REFERENCE -> VISUAL CONTRACT -> ASSET/STRUCTURE CANDIDATE -> MATCHED-VIEWPORT CAPTURE -> DELTA REVIEW -> TARGETED FIX -> REGRESSION CHECK -> USER APPROVAL ONLY AT REAL DECISION GATE

## Visual Contract fields and weights
Score each field from 0 to 5.

1. Composition / block geometry — weight 20
2. Hierarchy / information density — weight 15
3. Spacing / rhythm / whitespace — weight 10
4. Typography scale / weight / line-height — weight 10
5. Color relationships / contrast — weight 10
6. Illustration or image finish / texture / lighting — weight 20
7. Depth / shadow / material treatment — weight 5
8. Interaction / responsive behavior visible in reference — weight 5
9. Emotional tone / perceived polish — weight 5

Weighted score = sum(field_score / 5 * weight).

## Hard-fail rules
Regardless of total score, FAIL if any occurs:
- composition score <= 2 when user requested close visual matching
- illustration/image finish score <= 2 when the reference depends on premium artwork
- typography score <= 2 when type is a dominant part of the reference
- any major element is missing, duplicated, or placed in the wrong region
- reference is painterly/professional but candidate reads as clip-art, rough sketch, childish drawing, or placeholder art
- screenshot comparison was not performed at the same viewport/aspect ratio

## Thresholds
- 90–100: MATCHED — can proceed
- 80–89: ACCEPTABLE_DELTA — proceed only if no hard-fail and deltas are minor
- 65–79: FAILED_DELTA — fix before integration/release
- <65: REJECT — do not integrate

For explicit "pixel-level" or "same as this" requests, minimum is 90 and composition must be >=4/5.

## Asset quality decomposition
Do not rely on artist/style names alone. Translate the reference into inspectable attributes such as:
- brush/stroke character
- edge softness/hardness
- texture depth
- lighting direction and contrast
- saturation/value range
- palette temperature
- detail density
- perspective / camera angle
- figure proportions
- realism vs stylization
- foreground/background separation
- material response

If a candidate fails these attributes, reject it before UI integration.

## Targeted revision rule
Once a region is accepted, freeze it conceptually. Subsequent prompts or edits should change the smallest necessary region/attribute. Do not regenerate the whole composition for a button, icon, color, or single illustration detail unless the composition itself failed.

## UI implementation order
1. Geometry first: viewport, grid, major blocks, margins, proportions.
2. Type and density: font sizes/weights/line-height, card density.
3. Color/material: background, surfaces, borders, shadows.
4. Approved visual assets.
5. Micro details and interactions.
6. Matched-view screenshot review.
7. Regression capture after later changes.

## Evidence package
Every visual milestone should preserve:
- reference image/screenshot identifier
- target viewport width/height and DPR if relevant
- implementation screenshot identifier
- score table
- hard-fail result
- top 3 deltas
- changed files
- commit SHA
- runtime verification state

## Agent completion contract
An agent/Codex task is NOT complete because HTML rendered or tests passed. It is complete only when:
- functional checks pass
- visual score meets threshold
- no hard-fail remains
- evidence package exists
- user approval is requested only if a real design choice remains

## Cost / generation gate
Image generation remains approval-gated when it incurs paid generation or other explicit cost. Static analysis, prompt drafting, reference decomposition, UI coding, screenshot capture, and visual comparison can proceed without approval when reversible and non-destructive.
