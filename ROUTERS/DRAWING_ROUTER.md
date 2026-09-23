# DRAWING ROUTER

Status: ACTIVE CANDIDATE / BRANCH IMPLEMENTATION

Purpose: choose the lightest drawing workflow that preserves source authority and satisfies the user's intended result.

## Route

### FAST
Use when:
- request is style-only;
- no numeric/geometry authority claim is required;
- output does not change architecture.

Typical:
- line-weight cleanup
- grayscale hierarchy
- presentation polish

### CONTROLLED
Use when:
- sales/publication/section/site/CG/A3 presentation is requested;
- material, furniture, landscape, entourage or AI layers may be introduced;
- source geometry must remain locked.

Required:
- KEY_STATE
- KEEP/CHANGE/MAY_CHANGE/UNKNOWN policy
- preservation validation
- user-intent check

### AUTHORITATIVE
Use when:
- area, dimensions, CAD-to-Excel, regulatory geometry or authoritative measurement is claimed;
- geometry is intentionally edited.

Required:
- authoritative or explicitly qualified source
- structured extraction
- deterministic calculation/check
- reverse validation

## Anti-patterns

- PRETTY != COMPLETE
- CONTROLNET != GEOMETRY GUARANTEE
- RASTER DERIVATION != AUTHORITATIVE CAD
- VALIDATION != SUBSTITUTE FOR BUILD
- UNKNOWN != PERMISSION TO GUESS

## Output purpose mapping

- TECHNICAL_CLEAN -> FAST or CONTROLLED
- PUBLICATION -> CONTROLLED
- SITE_PRESENTATION -> CONTROLLED
- SECTION_PRESENTATION -> CONTROLLED
- SALES_CLEAN -> CONTROLLED
- SALES_TEXTURED -> CONTROLLED
- CG_HANDOFF -> CONTROLLED
- A3_REPORT -> CONTROLLED
- CAD_EXCEL -> AUTHORITATIVE
- AREA_ANALYSIS -> AUTHORITATIVE
- REGULATORY_CHECK -> AUTHORITATIVE


## CAD semantic onboarding

When DXF is available, do not jump directly from layer names to SALES masks.

Required flow:

`DXF_DIRECT_PARSE -> LAYER_ENTITY_PROFILE -> RULE_CANDIDATE_MINING -> EXPLICIT_VERIFIED_PROMOTION -> UNKNOWN_FIRST_SEMANTIC_MAPPING -> MASK_MANIFEST -> SALES_ADMISSION`

Runtime / tools:
- `tools/drawing_dxf_layer_profiler.py`
- `tools/drawing_dxf_rule_candidate_miner.py`
- `tools/drawing_dxf_rule_promoter.py`
- `tools/drawing_semantic_mapper.py`
- `tools/drawing_mask_manifest.py`
- `tools/drawing_dxf_mask_pipeline.py`
- `runtime/drawing-mask-gate-bridge.js`
- `runtime/drawing-sales-mask-gate.js`
- `runtime/drawing-view-admission.js`

Rules:
- layer/block names create PROPOSAL_ONLY candidates;
- geometry shape may support a proposal but cannot verify it;
- only explicit verified evidence activates a semantic rule;
- enabled-but-unverified rules are ignored;
- unmatched entities remain UNKNOWN;
- ROOM_MATERIAL requires a verified closed room boundary;
- SALES_PLAN / SALES_TEXTURED must pass `drawing-view-admission`;
- if SALES semantic admission fails, use PUBLICATION fallback rather than guessing or asking the user to debug the pipeline.

## Source availability fallback

If no DXF/DWG source is available:
- preserve PDF as source snapshot;
- use PDF source-line / source-weight presentation routes;
- do not manufacture CAD semantics from PDF graphics;
- keep SALES_TEXTURED locked until verified semantic evidence is available.


## Production authority — HARD LOCK

Production artifact classes are PREVIEW / FINAL / USER_FACING.

Only this route may create them:

TASK -> DRAWING_ROUTER -> AUTHORIZED_ENGINE -> PRE_USER_VALIDATION -> USER_EXPOSURE_GATE -> OUTPUT

Rules:
- ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE.
- ad-hoc Python / generic HTML / ReportLab / one-off renderer may be used only as EXPERIMENT or DIAGNOSTIC.
- EXPERIMENT / DIAGNOSTIC artifacts cannot be shown as preview/final/user-facing output.
- DESTRUCTIVE_RASTER_MASK and GENERATIVE_GEOMETRY_REDRAW are forbidden production operations.
- UNVERIFIED_SEMANTIC_INFERENCE is forbidden in production.
- NO PASS -> NO SHOW.
- Human approval selects among already-valid alternatives; it does not debug geometry/fact/semantic failures.

Runtime enforcement:
- runtime/drawing-production-authority-gate.js
- runtime/drawing-reference-compiler.js
- runtime/drawing-source-equivalence.js
