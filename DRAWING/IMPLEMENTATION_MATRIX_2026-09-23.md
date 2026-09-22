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
| source snapshot Multiply compositor | `tools/drawing_multiply_compositor.py` | CODED + real fixture benchmarked |
| PDF source snapshot rasterizer | `tools/drawing_pdf_raster_overlay.py` | CODED |
| PDF source-line SVG exporter | `tools/drawing_pdf_svg_exporter.py` | CODED + real fixture benchmarked |
| raster edge preservation diff | `tools/drawing_edge_diff.py` | CODED |
| compact result-first prompt compiler | `runtime/drawing-prompt-compiler.js` | CODED |
| output evaluation contract | `DRAWING/OUTPUT_EVALUATION_CONTRACT.json` | CODED DATA CONTRACT |
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


## Real fixture preservation finding

Three real A3 drawing classes (plan / basement / section) were benchmarked without publishing private file IDs or source hashes.

- vector PDF path extraction is strong for clean line guides and deterministic fingerprints;
- vector reconstruction alone does not reproduce the complete rendered drawing appearance;
- full source snapshot Multiply composition preserved rendered edges substantially better in the tested fixtures;
- therefore Work OS now treats VECTOR_OVERLAY and SOURCE_SNAPSHOT_MULTIPLY as complementary paths, not competitors;
- CAD/source authority remains separate from both presentation overlays.

## Prompt / evaluation implementation finding

The mining pass also reduced the runtime prompt burden:
- workflow mechanics and tuning values stay in recipes/runtime;
- prompts carry goal, output, preserve/change boundary, preset and completion criteria;
- final output review uses source-fidelity hard gates first, then legibility/hierarchy/material scale/color/layout and purpose-specific human usefulness.


## Current exact-head verification

The expanded CI now covers:
- source/key-state core
- source routing
- utilization/reference routing
- task outcome contract
- compact prompt compiler
- SVG source-line compositor
- vector-PDF adapter
- DXF adapter
- deterministic geometry diff
- PDF-to-SVG exporter
- raster edge diff
- PDF snapshot raster overlay
- Multiply source-snapshot compositor
- all drawing JSON registries/contracts

A previous workflow parse failure during path-list expansion was a CI YAML construction error, not a runtime test failure. The workflow was rewritten cleanly before the next exact-head run.


## A3 absolute output engine

Implemented:
- fixed ISO A3 portrait / landscape specification;
- landscape default = 420 mm x 297 mm;
- HTML absolute-mm page shell + print CSS;
- PDF A3 media-box validation;
- PNG A3 300-DPI exact pixel validation;
- PPTX A3 slide-size validation;
- XLSX A3 page setup / explicit print-area / one-page-fit validation;
- one canonical A3 SVG -> HTML / PDF / PNG / PPTX / XLSX bundle export;
- bundle-wide PASS gate;
- automatic re-export from the preserved canonical A3 SVG when a format fails;
- max two output re-export attempts, then BLOCKED rather than silent scaling.

Current default A3 landscape targets:
- PDF: 1190.551 x 841.890 pt
- PPTX: 15120000 x 10692000 EMU
- PNG at 300 DPI: 4961 x 3508 px
- HTML: 420 mm x 297 mm
- XLSX: A3 landscape / fit 1 x 1 / explicit print area

Important boundary:
A3 format repair never mutates SOURCE / GEOMETRY / SEMANTIC state. It regenerates only export views from the preserved board state.

## Layer-parallel execution

Implemented:
- L0 SOURCE / L1 GEOMETRY / L2 SEMANTIC computed once;
- L3 PRESENTATION / L4 ENTOURAGE / L5 ANNOTATION / L6 AI-ATMOSPHERE can run in parallel;
- L7 finalizes source overlay, fidelity checks, quality review and A3 bundle;
- multiple views can fan out from one KEY_STATE without repeating source interpretation;
- a presentation-only failure reruns only the affected downstream layer.


## Layered parallel execution — IMPLEMENTED

Execution topology:

`L0 SOURCE -> L1 GEOMETRY -> L2 SEMANTIC -> [L3 PRESENTATION || L4 ENTOURAGE || L5 ANNOTATION || L6 AI/ATMOSPHERE] -> L7 FINAL OVERLAY / VALIDATION`

Implemented runtime:
- `runtime/drawing-layer-orchestrator.js` — shared L0-L2 + view-specific parallel fan-out.
- `runtime/drawing-work-unit-runner.js` — emits only currently ready work units.
- `runtime/drawing-layer-invalidation.js` — selective downstream invalidation.
- `runtime/drawing-artifact-manifest.js` — per-layer lineage / required evidence.
- `DRAWING/LAYER_EXECUTION_CONTRACT.json`
- `DRAWING/LAYER_ARTIFACT_CONTRACT.json`

Change-impact rules:
- L0 source change -> recompute every downstream layer and every view.
- L1 geometry change -> invalidate L2-L7 across every view.
- L2 semantic/rule change -> invalidate L3-L7 across every view.
- L3 presentation change -> rerun only L3 + that view's L7.
- L4 entourage change -> rerun only L4 + that view's L7.
- L5 annotation change -> rerun only L5 + that view's L7; AI atmosphere remains reusable unless annotation was an AI input.
- L6 AI/atmosphere change -> rerun only L6 + that view's L7.

Efficiency target:
One KEY_STATE / source extraction can produce SALES / PUBLICATION / SECTION / A3 views without repeating source interpretation.

## SVG conversion — CODED

Executable routes:
- PDF full rendered-page SVG -> `tools/drawing_pdf_full_svg_exporter.py`
- PDF clean vector/source-line SVG -> `tools/drawing_pdf_svg_exporter.py`
- DXF rendered SVG -> `tools/drawing_dxf_svg_exporter.py`
- runtime route selector -> `runtime/drawing-svg-route.js`
- DWG remains conversion-required: DWG decoder -> DXF -> TAKY adapters.

Authority boundary:
- full PDF SVG = issued snapshot representation;
- PDF geometry SVG = source-derived;
- DXF SVG = CAD-derived view;
- original CAD/PDF remains preserved authority/evidence.

The official PyMuPDF and ezdxf APIs support these routes; implementation does not depend on CloudConvert for PDF or DXF.


## DXF semantic onboarding — CODED

Implemented:
- evidence-only DXF layer/entity profiler;
- name/entity-composition candidate miner with PROPOSAL_ONLY output;
- explicit verified rule promoter;
- verified-rule-only semantic mapper;
- verified presentation-mask manifest;
- strict DXF-to-mask pipeline;
- mask-to-sales-gate bridge;
- view admission wrapper with automatic PUBLICATION fallback.

Safety gates:
- unverified active rules are ignored;
- ambiguous proposals require explicit semantic override during approval;
- closed room geometry is required for ROOM_MATERIAL;
- UNKNOWN remains UNKNOWN;
- no candidate mining step can directly unlock SALES_TEXTURED.

Google Drive probe on 2026-09-23:
- three discovered folders named `CAD` were inspected;
- each contained only `.keep` at inspection time;
- therefore no project DWG/DXF was available for real CAD-layer benchmarking in those folders;
- this does not claim that no CAD exists elsewhere in Drive.

Synthetic end-to-end fixture is used only to verify runtime mechanics, not office layer semantics.


## Area Engine — BLOCK-AWARE / SCALE-AWARE

Implemented:
- block-aware DXF area-candidate extraction;
- nested INSERT virtual expansion without write-back EXPLODE;
- translation / rotation / scale / mirror-aware area calculation;
- DXF unit-to-metric conversion for known INSUNITS;
- explicit-scale vector PDF area candidates;
- verified role assignment ledger;
- project rule-profile aggregation into design-overview values;
- area source router for DXF / DWG / vector PDF.

TAKY boundaries:
- geometry candidate != legal/architectural area role;
- block/layer name never assigns a legal area automatically;
- residential inside-face area requires verified `INTERIOR_FACE_BOUNDARY`;
- centerline auto-offset is forbidden without verified wall build-up;
- PDF area is derived evidence and requires confirmed drawing scale;
- DWG remains source-preserved + conversion-required until a decoder produces DXF;
- UNKNOWN stays UNKNOWN rather than being estimated.

Synthetic CI verifies:
- nested blocks;
- rotated block;
- mirrored block;
- scaled block;
- metric area conversion;
- scaled PDF area conversion;
- verified assignment and coverage/FAR-style ratio formulas.

Actual Work DWG probe:
- source exists in `Work`;
- header = AC1032 (AutoCAD 2018/2019/2020 family);
- current local runtime has no ODAFileConverter / LibreDWG decoder;
- therefore no direct area claim was made from the DWG.
