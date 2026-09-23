# DRAWING ENGINE ARCHITECTURE REVISION V3

Status: ACTIVE CANDIDATE — SYSTEM SURGERY
Date: 2026-09-23
Supersedes: DRAWING_ENGINE_ARCHITECTURE_REVISION_V2.md

## Why V2 was not sufficient
V2 made production authority exclusive in principle, but an invocation could still self-assert
`execution_route=AUTHORIZED_ENGINE` and gate PASS booleans. That was an enforcement gap:
the engine path and validation evidence were described but not provenance-bound.

## Authority stack
L0 SOURCE AUTHORITY
→ L1 GEOMETRY
→ L2 SEMANTIC
→ L3 PRESENTATION
→ L4 ENTOURAGE
→ L5 ANNOTATION
→ L6 AI / ATMOSPHERE
→ L7 FINAL VALIDATION
→ L8 USER EXPOSURE GATE

NO PASS → NO SHOW.

## Production route
TASK
→ DRAWING_ROUTER
→ AUTHORIZED_ENGINE
→ SOURCE / GEOMETRY / FACT / SEMANTIC VALIDATORS
→ REFERENCE COMPILER
→ PRESENTATION LAYERS
→ EVIDENCE-BACKED PRE-USER VALIDATION
→ ENGINE EXECUTION RECEIPT
→ PRODUCTION AUTHORITY GATE
→ L8 USER EXPOSURE
→ OUTPUT

## Evidence-backed authority
Production permission is not granted by a caller saying it used the engine.

A user-facing artifact requires:
- execution receipt with engine id/version/commit and operation lineage;
- validation bundle id;
- source digest;
- artifact digest;
- gate evidence entries containing status + validator + evidence_refs;
- receipt/bundle digest agreement.

Bare `*_gate_pass=true`, `execution_route=AUTHORIZED_ENGINE`, or `engine_id` are not sufficient evidence.

## Non-destructive authority
Geometry-bearing source remains immutable during presentation enhancement.
DESTRUCTIVE_RASTER_MASK and GENERATIVE_GEOMETRY_REDRAW are prohibited production operations.
Raster/AI can exist only downstream as non-authoritative presentation layers.

## Quality dimensions
SOURCE_FIDELITY != PRESENTATION_QUALITY
CLARITY_GAIN != REFERENCE_EFFECT
CODE_PASS != PRODUCT_PASS
ENGINE_PASS != VISUAL_PASS
COMPONENT_PASS != INTEGRATED_RESULT_PASS

Minimum final dimensions:
- TECHNICAL ACCURACY
- ARCHITECTURAL PRESENTATION
- UNIT / PRODUCT PRESENTATION
- REPORT DECISION VALUE
- REFERENCE EFFECT
- USER EFFECT

## Reference compiler
REFERENCE NAME → MINED DNA → DESIGN TOKEN → ENGINE PARAMETER → OUTPUT EFFECT → BEFORE/AFTER VALIDATION.

Token presence is not effect proof. REFERENCE_EFFECT requires an observable output probe.

## Human approval
Human approval chooses among already-valid design/presentation alternatives.
It does not detect deleted walls, missing cores, bad crops, unsupported semantics/narrative, or absent reference effect.

## Boundary
Repository enforcement can block repository-governed artifact admission.
It does not by itself prove that every hosted ChatGPT/tool path automatically invokes the gate.
That live interception boundary remains explicit until separately evidenced.

HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
USER != DEBUGGER.
