# DRAWING ENGINE ARCHITECTURE REVISION V2

Date: 2026-09-23
Branch: surgery/enforcement-v1-2026-09-23

## TAKY FILTER
- Think Again, Keep Your Key.
- Think Again, You’re The Key.
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
- USER != DEBUGGER.
- SYSTEM PROVES. HUMAN CHOOSES.

## ROOT CORRECTION
The prior system had rules but insufficient runtime enforcement.
The revised production path is:

TASK
→ WORK OS ROUTER
→ AUTHORIZED EXECUTION GRAPH
→ AUTHORIZED ENGINE
→ LOGIC GUARDS
→ INDEPENDENT VALIDATOR
→ EXPOSURE GATE
→ HUMAN APPROVAL

## HARD INVARIANTS
1. NO AUTHORIZATION → NO PRODUCTION.
2. ENGINE CANNOT CERTIFY ITSELF.
3. NO PASS → NO SHOW.
4. L(n) CANNOT MUTATE L(<n) AUTHORITY.
5. UNKNOWN SEMANTIC → NO VERIFIED PRESENTATION TOKEN.
6. NO EVIDENCE → NO USER-FACING CLAIM.
7. NO REFERENCE COMPILE + EFFECT PROOF → NO REFERENCE CLAIM.
8. ONE-OFF PYTHON / GENERIC HTML / REPORTLAB / DIRECT IMAGE GENERATION are DIAGNOSTIC ONLY for production routing.

## EXECUTABLE MODULES
- runtime/execution-contract.js
- runtime/work-os-router.js
- runtime/independent-validator.js
- runtime/exposure-gate.js
- runtime/geometry-guard.js
- runtime/semantic-gate.js
- runtime/narrative-evidence-gate.js
- runtime/reference-compiler.js
- runtime/production-pipeline.js
- runtime/drawing-report-package.js (authorization now required)

## REQUIRED VALIDATION
SOURCE_GATE
GEOMETRY_GATE
FACT_GATE
SEMANTIC_GATE
REFERENCE_EFFECT_GATE
ARCHITECTURAL_READABILITY_GATE
A3_GATE
NARRATIVE_EVIDENCE_GATE
PROVENANCE_GATE
USER_EFFECT_GATE

## CURRENT LIMIT
This is application/runtime enforcement inside TAKY-WORK-OS. Host-level tool permission enforcement must additionally ensure that external artifact creation cannot bypass this production pipeline.
