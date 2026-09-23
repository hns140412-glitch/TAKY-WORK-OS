# DRAWING ENGINE ARCHITECTURE REVISION — V4 GOVERNED PRODUCTION

Status: ACTIVE CANDIDATE / SYSTEM SURGERY
Date: 2026-09-23

## Core correction
The previous architecture had strong declarations but weak enforcement. V4 makes the artifact-producing path itself governed.

```
TASK
  -> PRODUCTION_ROUTER
  -> AUTHORIZED_ENGINE
  -> L0 SOURCE AUTHORITY
  -> L1 GEOMETRY
  -> L2 SEMANTIC
  -> L3 PRESENTATION
  -> L4 ENTOURAGE
  -> L5 ANNOTATION
  -> L6 AI / ATMOSPHERE
  -> L7 FINAL VALIDATION
  -> L8 USER EXPOSURE GATE
  -> OUTPUT
```

### Hard locks
- `ENGINE_AVAILABLE + BYPASS_USED = GOVERNANCE_FAILURE`
- Unregistered one-off scripts may create only EXPERIMENT/DIAGNOSTIC artifacts.
- `USER_PREVIEW` and `FINAL` require a production authorization receipt.
- Lower-authority layers cannot mutate higher-authority layers.
- `NO PASS -> NO SHOW`.
- Source fidelity is necessary, never sufficient, for product quality.
- Human approval is a decision gate, not a defect-discovery stage.

## Layer authority
L0 source owns source identity and content revision.
L1 geometry owns protected architectural geometry.
L2 semantic owns only verified labels/relations.
L3 presentation owns lineweight/poche/color/grid/typography/whitespace.
L4 entourage may add/remove non-authoritative entourage only.
L5 annotation may add evidence-backed labels/captions.
L6 AI may alter atmosphere only under immutable geometry overlay.
L7 runs all required gates.
L8 blocks user-facing exposure unless L7 returned PASS.

## Output classes
- EXPERIMENT: may use local/one-off tools; never user-facing as product result.
- DIAGNOSTIC: may expose internal debug data; not a product result.
- INTERNAL_PREVIEW: authorized engine only.
- USER_PREVIEW: authorized engine + full pre-user gate suite.
- FINAL: authorized engine + full pre-user gate suite + applicable human approval.

## Handoff modes
- RESUME: continue a healthy verified route.
- RETROSPECTIVE: analyze failures without changing production state.
- SURGERY: architecture/routing/governance repair; production work is frozen until closure.

Repeated structural failures, engine bypass, or USER_AS_DEBUGGER recurrence invalidate RESUME and require SURGERY.
