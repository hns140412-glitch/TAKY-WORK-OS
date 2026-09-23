# DRAWING ENGINE — DRIVE / NOTION / GEMINI UTILIZATION MINING 2026-09-23

Status: DERIVED REVIEW / IMPLEMENTATION INPUT  
Rule: SOURCE != CANON. A useful source can become recipe data, fixture data, diagnostics or implementation guidance without becoming geometry truth.

## TAKY slogan filter

`THINK AGAIN -> KEEP YOUR KEY -> FIND A WAY / SOLVE -> YOU'RE THE KEY -> VERIFY / CORRECT / CONTINUE`

## 1. High-value mined patterns

### Result-first task contract
Recovered workflow guidance converges on a compact contract:
- goal
- context
- output
- completion criteria
- autonomy / do-not-change boundary
- verification

Implementation:
- `runtime/drawing-task-contract.js`

Reason:
Long prompt packs should not carry information that the runtime can store as structured task state.

### Utilization-first source mining
Recovered Notion review logic explicitly separates:
- direct runtime data
- engine reference data
- evaluation fixture
- recipe / diagnostic pattern
- volatile reference
- archive only

Implementation:
- `runtime/drawing-reference-router.js`

Every reference should keep:
source pointer, owner, use, evidence/truth grade, freshness, rights, allowed/forbidden use, validation state.

### Preserve / change contract
Visual reference material is useful for:
- preserve/change contracts
- composition grammar
- style recipes
- output evaluation

It is not automatically architecture truth.

Existing implementation:
- KEY_STATE
- KEEP / CHANGE / MAY_CHANGE / UNKNOWN
- source digest / regression keys

## 2. Architecture-specific authority correction

Recovered architecture MASTER logic states:
- CAD = Geometry Authority
- spreadsheet = classification / calculation / rule authority
- AI must not fill unknown values
- source history and revision identity remain traceable

Implementation correction:
- DXF with verified source evidence may enter direct geometry-authority path.
- native DWG may be an authoritative source file, but converted geometry requires conversion parity before geometry authority is claimed.
- PDF, including vector PDF, is treated as an issued/reference snapshot for drawing preservation and evidence, not automatic CAD geometry authority.
- raster / AI derived geometry never self-promotes.

## 3. Gemini rendering summary — adopted vs corrected

### Adopt
- structure-conditioned generation instead of prompt-only rendering
- derived clean guide for generation while retaining the full source separately
- multi-pass generation
- final source/vector overlay
- negative prompt only as auxiliary guardrail
- post-process texture/grain as optional presentation treatment

### Correct / benchmark
Gemini seed values:
- ControlNet strength 0.78
- end 0.80
- base denoise 0.65
- second denoise 0.32
- 1.5x upscale

These are not canonical constants.

Current implementation stores them as experiment seeds and benchmark bands.

Important correction:
- 0.32 is plausible for an image-space upscaled second pass.
- latent upscaling often requires materially higher denoise and has greater composition-mutation risk.
- therefore image-space and latent-space second passes are separate recipe variants.

## 4. Real PDF fixture finding

Four real architectural A3 PDFs were probed outside the repository.

Observed class:
- single-page A3
- vector drawing commands present
- very high path/item counts
- text-block extraction returned zero in the tested files

Meaning:
- PDF vector extraction is useful for source-line overlay, vector fingerprinting and presentation-vs-geometry diff.
- PDF should not be assumed to preserve CAD semantic layers, object identity, or editable dimension text.
- a pre-cleaned CAD export can be a better generative guide, but the untouched full source must remain the key.

No private file identifiers or project-specific hashes are stored in this public repository.

## 5. External implementation routes

Registered as volatile capability references:
- ComfyUI — controlled/self-hosted recipe; geometry verification required.
- mnml.ai — architecture-specific plan/render workflow; useful benchmark/external presentation route; precise dimensions/text remain source-controlled.
- Veras — strong candidate when a real 3D model exists; lower geometry override for fidelity.
- PromeAI — useful for concept-stage client communication; vendor itself distinguishes this from measured geometry.
- D5 — model-first high-fidelity render path when an authoritative 3D model exists.
- LookX — keep experimental until geometry preservation is benchmarked.

Implementation:
- `DRAWING/EXTERNAL_TOOL_CAPABILITY_REGISTRY.json`

## 6. Output-first route recommendation

### Pure 2D publication / sales plan
Preferred:
source vector -> mask/style passes -> source line overlay -> readability + regression validation

Avoid:
AI redraw of authoritative linework.

### Perspective / archviz when no real 3D model exists
Preferred:
source/guide -> structure controls -> controlled generation -> local refinement -> image-space upscale/detail -> source/reference verification

Status:
presentation only.

### Archviz when a reliable 3D model exists
Preferred:
model-first renderer or model-connected AI (D5 / Veras class) -> material/light refinement -> presentation postprocess

Reason:
the model itself carries geometry more reliably than drawing-to-image inference.

### Buyer-facing 3D from only a 2D plan
Allowed:
concept visualization route.

Required label:
NOT_MEASURED_3D / PRESENTATION_ONLY.

## 7. Prompt strategy

Do not encode the entire workflow into one oversized prompt.

Prompt should mainly contain:
- target result
- project-specific material / atmosphere information
- what must not change when not already in KEY_STATE

Runtime state should carry:
- source authority
- preserve/change policy
- output preset
- completion criteria
- verification plan
- reference provenance

## 8. Next implementation

P1 next:
1. DXF adapter with provenance/layer/entity extraction
2. deterministic geometry-diff contract
3. source vector -> SVG line-pass exporter
4. mask contract for room/material/landscape/annotation
5. sales-plan fixture benchmark
6. section fixture benchmark

Do not begin full BIM reconstruction or automatic 2D->measured-3D generation.


## 9. Gemini Multiply-overlay idea — real fixture validation

The user-provided Gemini summary recommended a Photoshop-style CAD line Multiply overlay.

Real fixture benchmark result:
- vector-path reconstruction alone preserved only a subset of the rendered PDF appearance;
- a full source snapshot composited with Multiply preserved source-render edges with very low raw edge mismatch in the tested plan / basement / section fixtures.

Implementation decision:
- keep VECTOR/SVG overlay for clean geometry/style control;
- add SOURCE_SNAPSHOT_MULTIPLY as the complete-appearance preservation fallback;
- do not convert either overlay into CAD semantic authority;
- for SALES outputs, use clean layer/mask routes when possible so technical clutter is not reintroduced indiscriminately.

This is an example of `Think Again`: the Gemini recommendation was not copied as a Photoshop manual step; it was converted into a deterministic, testable compositor route.
