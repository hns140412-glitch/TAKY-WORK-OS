# DRAWING PRESENTATION ENGINE V1

Status: IMPLEMENTABLE CORE / BRANCH CANDIDATE  
Authority: subordinate to central TAKY and `WORK_OS.md`.

## Slogan execution loop

`THINK AGAIN -> KEEP YOUR KEY -> FIND A WAY / SOLVE -> YOU'RE THE KEY -> VERIFY / CORRECT / CONTINUE`

- THINK AGAIN: recover source, purpose and better implementation paths before generating.
- KEEP YOUR KEY: preserve source authority, geometry, semantics, confirmed decisions, revision context and unknown source data.
- FIND A WAY / SOLVE: use the lightest viable adapter/compositor instead of forcing one tool.
- YOU'RE THE KEY: judge completion against the user's intended outcome, not internal PASS alone.
- VERIFY / CORRECT / CONTINUE: reject geometry/semantic drift and continue from preserved source.

## Scope

This engine improves architectural drawing communication without silently redesigning architecture.

Supported initial purposes:
- technical clean
- publication
- site presentation
- section presentation
- sales clean
- sales textured
- CG handoff
- A3 report

## Three execution modes

### FAST
For low-risk style-only work where geometry authority is not being claimed.

### CONTROLLED
For sales/publication/site/section/CG outputs that may add color, material, furniture, entourage or AI presentation layers while preserving source geometry.

### AUTHORITATIVE
For CAD/area/Excel/regulatory/numeric work. Requires authoritative or explicitly qualified source evidence and deterministic checks.

## KEY_STATE

Minimum state:
- source_id
- source_authority
- revision
- user_intent
- objects[]

Object policy:
- KEEP
- CHANGE
- MAY_CHANGE
- UNKNOWN

Rules:
- geometry and semantics do not change in presentation work.
- presentation-only objects may be added only when explicitly marked.
- UNKNOWN survives round-trip and its appearance is preserved unless resolved.
- presentation updates never promote derived geometry to authoritative geometry.

## Source authority

Priority:
1. AUTHORITATIVE_VECTOR
2. DERIVED_VECTOR
3. RASTER_REFERENCE
4. AI_DERIVED

`DERIVED != AUTHORITATIVE`

## Multi-pass output

Preferred composition:
1. authoritative/source line pass
2. material/color pass
3. furniture/landscape/human-scale pass
4. annotation pass
5. source line overlay
6. preservation validation
7. user-intent check

AI may generate presentation attributes. It does not become geometry authority.

## Presentation principles mined from practice

- WHITE SPACE IS INFORMATION.
- MATERIAL SCALE MUST MATCH DRAWING SCALE.
- SHADOW MUST NOT REDUCE LEGIBILITY.
- VECTOR LINE AND RENDER LAYER SHOULD BE SEPARATE WHEN POSSIBLE.
- UNKNOWN SOURCE DATA MUST SURVIVE ROUND-TRIP.
- FURNITURE IS A SCALE/USE SIGNAL, NOT A DEVICE TO EXAGGERATE SPACE.

## Implementation boundary

V1 intentionally does NOT implement:
- a full BIM kernel
- a DWG editor
- a custom renderer
- automatic canonical promotion of raster-derived geometry
- mandatory heavy validation for every request

V1 core implementation lives in:
- `runtime/drawing-engine-core.js`
- `DRAWING/PRESENTATION_PRESET_REGISTRY.json`
- `ROUTERS/DRAWING_ROUTER.md`

External adapters such as DXF/vector-PDF extraction, raster semantic segmentation, SVG/source overlay and pixel/geometry diff remain explicit follow-on implementations.


## V2 enforcement correction — 2026-09-23

The V1 statement that heavy validation is not mandatory cannot be used to bypass production exposure controls. Validation remains proportional during work, but user-facing architectural production has mandatory pre-user gates.

New invariant:
- `EXPERIMENT / DIAGNOSTIC` may use one-off tools.
- `PREVIEW / FINAL / USER_FACING` must use an authorized engine route.
- L0 Source, L1 Geometry, L2 Semantic outrank all presentation/generative layers.
- L7 validation is followed by L8 USER EXPOSURE GATE.
- any applicable gate not PASS => artifact cannot be presented as production output.
- modified time alone cannot establish content freshness.
- reference mining must compile to engine parameters and observable effect.
- human approval is for design/presentation choice, never for finding pipeline defects.
