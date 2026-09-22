# DRAWING ENGINE IMPLEMENTATION MATRIX — 2026-09-23

Status: BRANCH CANDIDATE / ATTACK-REVIEW TRACKER

## Slogan filter

`THINK AGAIN -> KEEP YOUR KEY -> FIND A WAY / SOLVE -> YOU'RE THE KEY -> VERIFY / CORRECT / CONTINUE`

This matrix separates ideas from executable capability.

## REUSE FROM EXISTING TAKY / WORK OS

| Capability | Current owner | State | Use |
|---|---|---|---|
| generic vision/OCR ingest mechanics | TAKY `SHARED/runtime/vision-ingest.js` | REFERENCE_IMPLEMENTED | raster/scanned drawing intake transport only; no architecture semantics |
| HTTP transport normalization | TAKY shared technical capability | REFERENCE_IMPLEMENTED | future external source/API adapters |
| CAD ↔ spreadsheet authority rule | Work OS `WORK_OS.md` | ACTIVE RULE | authoritative numeric path |
| architecture source/evidence boundary | TAKY `DOMAIN/ARCHITECTURE_WORK_OS.md` | ACTIVE DOMAIN RULE | source identity / target-reference separation |
| general regression/evidence philosophy | TAKY | ACTIVE | upper governance |

## IMPLEMENTED IN THIS BRANCH

| Capability | File | State |
|---|---|---|
| FAST / CONTROLLED / AUTHORITATIVE routing | `ROUTERS/DRAWING_ROUTER.md`, core runtime | CODED |
| KEY_STATE | `runtime/drawing-engine-core.js` | CODED |
| KEEP / CHANGE / MAY_CHANGE / UNKNOWN | core runtime | CODED |
| geometry fingerprint | core runtime | CODED; non-cryptographic regression key |
| semantic fingerprint | core runtime | CODED |
| source digest preservation hook | core runtime | CODED; digest must be supplied by source adapter |
| user-intent outcome gate | core runtime | CODED |
| source type routing | `runtime/drawing-source-router.js` | CODED |
| DXF / DWG / vector-PDF / raster route selection | source router | CODED; CAD authority vs PDF snapshot boundary enforced |
| source authority evidence requirement | source router | CODED |
| direct vs derived geometry status | source router | CODED |
| presentation preset registry | `DRAWING/PRESENTATION_PRESET_REGISTRY.json` | CODED DATA CONTRACT |
| source-line-last SVG compositor | `runtime/svg-presentation-compositor.js` | CODED |
| unsafe SVG fragment rejection | SVG compositor | CODED minimum gate |
| vector PDF adapter | `tools/drawing_pdf_vector_adapter.py` | CODED + CI synthetic fixture verified; real architectural PDFs probed locally |
| utilization-first source router | `runtime/drawing-reference-router.js` | CODED |
| task outcome contract | `runtime/drawing-task-contract.js` | CODED |
| external capability registry | `DRAWING/EXTERNAL_TOOL_CAPABILITY_REGISTRY.json` | CODED volatile reference registry |
| CI tests | `.github/workflows/drawing-engine-core.yml` | CODED |

## NEXT IMPLEMENTATION — HIGH VALUE

### P1-A DXF adapter
Candidate stack: Python + ezdxf.

Required output:
- source digest
- layer
- entity type
- coordinates
- closed/open state
- text
- hatch/fill metadata where useful
- evidence/provenance mapping

Do not infer wall semantics solely from line presence.

### P1-B Vector PDF adapter — IMPLEMENTED FOUNDATION
Stack: PyMuPDF `Page.get_drawings()`.

Implemented:
- vector-content probe
- page coordinate normalization
- path extraction
- SHA-256 source digest
- geometry-vs-presentation digest separation
- derived-vector label
- synthetic CI fixture

Real architectural PDF probe finding:
- all tested A3 drawing PDFs exposed large vector path sets;
- extracted text blocks were zero, indicating exported annotations may be outlined/vectorized rather than recoverable semantic text;
- therefore vector PDF is strong for line preservation, overlay and regression evidence, but weak as a substitute for CAD layer/semantic authority.

Still needed:
- source-page evidence links in downstream records
- optional path clustering / structural-guide derivation without claiming semantics

### P1-C Geometry comparison
Candidate stack: Shapely or equivalent deterministic geometry library.

Required:
- boundary / polyline / polygon diff
- tolerance contract
- missing/new object findings
- geometry status separate from visual styling

### P1-D Presentation layer masks
Needed for SALES_TEXTURED / publication / section:
- room/material mask
- furniture mask
- landscape mask
- annotation mask
- source-line mask

### P1-E Output usefulness checks
Outcome-specific:
- room/layout readability
- circulation readability
- furniture-scale plausibility
- material scale
- shadow obstruction
- white-space preservation
- critical dimension visibility

## P2

- raster wall/window/door semantic recovery
- room relation graph
- area / room schedule generation
- A3/PDF layout composer
- drawing ↔ spreadsheet mapping runtime
- synchronized plan/section/axon views

## HOLD

Do not build yet:
- full BIM kernel
- general DWG editor
- custom 3D renderer
- mandatory ControlNet path
- automatic AI-derived canonical geometry
- full automatic layout generator

## ATTACK REVIEW FINDINGS

1. Prompt-only geometry preservation is insufficient.
2. ControlNet is a conditioning mechanism, not a CAD accuracy guarantee.
3. Vector/raster extraction status must not be confused with source authority.
4. A regression fingerprint is not an integrity signature; authoritative pipelines should provide SHA-256 or equivalent source digest.
5. Raw SVG composition requires an untrusted-content safety boundary. Current branch adds a minimum reject gate; production use should still use a proven sanitizer/parser.
6. Pixel diff alone is unsuitable because intended material/color changes create large pixel differences.
7. Furniture/material/shadow are information layers and can reduce accuracy/readability if their scale or contrast is wrong.
8. Unknown source data must survive round-trip rather than being normalized away.
9. Validation must remain proportional; ordinary style-only tasks should not be forced through authoritative CAD extraction.
10. Final completion is based on user intent as well as technical preservation.

## Completion boundary for V1

V1 is not a renderer. It is an executable control spine that can:
- classify the request;
- classify the source path;
- preserve source/key state;
- select presentation behavior;
- compose presentation layers under source linework;
- reject key drift;
- keep user-intent completion explicit.

DXF parsing and deterministic geometry comparison remain P1 implementation. Vector-PDF extraction is now coded, but PDF semantics are not claimed equivalent to CAD.
