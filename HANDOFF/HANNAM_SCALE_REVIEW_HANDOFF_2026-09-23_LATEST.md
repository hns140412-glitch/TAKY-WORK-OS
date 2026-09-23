# HANNAM SCALE REVIEW — HANDOFF — 2026-09-23 LATEST

## 0. TAKY GOVERNANCE
- Think Again, Keep Your Key.
- Think Again, You’re The Key.
- HUMAN IS THE KEY != HUMAN IS THE DEBUGGER.
- USER != DEBUGGER.

## 1. PRIMARY OBJECTIVE
Create a reference-grade A3 scale-review + case-study report for the Hannam-dong 737-21 high-end multifamily project while preserving source geometry and factual authority.

Primary route:
CURRENT SOURCE
→ REPORT_PACKAGE
→ verified narrative/decision state
→ A3_SVG_BOARD_STATE
→ HTML / PDF / PPTX / PNG

HTML is a derivative output, not the visual canonical.

## 2. CURRENT GITHUB AUTHORITY
Repo: hns140412-glitch/TAKY-WORK-OS
Branch: taky/drawing-engine-v1-2026-09-23
Verified HEAD at handoff creation: a70f8873d12dd631f311cc399d7668147f9115fd
drawing-engine-core: run #322 = PASS

Core files:
- DRAWING/HANNAM_REPORT_PACKAGE_V1.json
- DRAWING/HANNAM_PRESENTATION_PROFILE_V1.json
- DRAWING/SCALE_REVIEW_REPORT_PRIMARY_OBJECTIVE.json
- runtime/drawing-report-package.js
- runtime/drawing-narrative-decision-engine.js
- runtime/drawing-a3-board-renderer.js
- runtime/drawing-html-exporter.js
- runtime/drawing-a3-board-cli.js
- runtime/drawing-layer-orchestrator.js
- runtime/drawing-sales-mask-gate.js
- runtime/svg-presentation-compositor.js
- tools/drawing_controlled_presentation_pipeline.py

## 3. CURRENT SOURCE AUTHORITY
Google Drive / Work is the project base.

Issued current PDF:
- 2026-0923_한남동 737-21일원 고급주택(4세대) 규모검토.pdf
- Drive id: 1JTKELb5G8g7cVsRNpgO0ZHf90aLJn3o4
- 4 pages
  - page 1: B1
  - page 2: 1F
  - page 3: 2F
  - page 4: section

Highest geometry source:
- 2026-0922_한남동 737-21일원 고급주택(4세대) 규모검토_SSH.dwg
- Drive id: 1qplsHRMW-DY1hQaCziErrf3VMz5RR_ep

Current confirmed:
- 4 units
- A / B building groups
- B1 + 1F + 2F
- B1 parking = 14 spaces
- sheet scales:
  - B1 1:200
  - 1F 1:300
  - 2F 1:200
  - section 1:200
- 3-sided road relation visible in issued drawings

Still PENDING:
- legal site area
- building area
- GFA
- BCR
- FAR
- unit-level inside-face residential exclusive area
- current legal / review numeric values not directly evidenced

Never promote sample/reference values into current facts.

## 4. CRITICAL CORRECTIONS FROM THIS SESSION
### A. Do not bypass the engine
The failed pattern was:
manual Python / raster masking / one-off HTML
→ output drift / wall deletion / generic quality

This path is rejected.

Required path:
REPORT_PACKAGE
→ engine
→ A3_SVG_BOARD_STATE
→ derivative outputs

### B. No broad raster masks
Previous clean-base experiments erased walls/core/entrance.
Rejected.
No rectangle-paint cleanup for architectural geometry.

### C. Full-plan image generation is prohibited
Generative redraw changed architecture.
Rejected.

### D. Furniture-free source
User supplied furniture-free PNG/PDF source material.
Use as presentation input where appropriate, but source geometry still belongs to issued PDF/DWG.
Do not regenerate furniture-free plan by masking walls.

### E. Current 2F output is NOT quality-locked
A 2F engine package was generated, but it is only an engine-route proof.
Do not call it reference-grade final.
The next job is quality calibration against actual reference mining.

## 5. REFERENCE POLICY
Work source owns:
- geometry
- dimensions
- facts
- design relationships

Reference owns only:
- line hierarchy
- poche
- material/tone vocabulary
- typography
- whitespace
- layout
- diagram grammar
- atmosphere
- editorial hierarchy

Central reference files:
1. REFERENCE_MINING_RULES
2. REFERENCE_MINING_INDEX
3. REPRESENTATION_METHOD_INDEX
4. TREND_LEADER_MINING_2026-09-23
5. GLOBAL_OFFICE_DNA_2026-09-23

Current external DNA:
- ArchDaily: plan/section layering, human-scale legibility, editorial drawing
- Drawing Matter: omission, projected section, selective axonometric
- OMA/AMO: relation-first
- BIG: one move / constraint → move → result
- MVRDV: data → typology → human scale
- SOM/Foster/KPF: technical clarity / system integration
- Divisare/Domus: editorial restraint / quiet material-light tone
- HdM: restrained material repetition
- Snøhetta: site/landscape/architecture relation
- Gensler: client/user decision value

Do NOT use office names as literal style prompts.

## 6. AI DESIGN REPORT WRITING REFERENCE — SESSION ADDITION
User supplied:
AI 설계 보고서 작성법(1).pdf

Keep the useful protocol:
- Role
- Structure
- Structured Context
- Output Format
- storytelling around WHY / design value
- Executive Summary / Site & Context / Design Concept / Space Program / Technical / Expected Value

Reject unsupported promotional claims from the sample response.
Examples of claims that require evidence before use:
- perfect privacy
- natural ventilation/daylighting of basement
- south-facing superiority
- penthouse-type characterization
- landscape buffers not explicit in source
- any inferred program or product claim

Current narrative engine was strengthened:
- CONFIRMED / CALCULATED can support authoritative claims
- PENDING / CONFLICT cannot be promoted into authoritative narrative
- REFERENCE_ONLY remains reference
- evidence refs are mandatory

## 7. CURRENT PRESENTATION TARGET
Do NOT expand to whole report until ONE page passes.

First target:
P06 — 2F PLAN

Goal:
Make one A3 2F page visually comparable in professional quality to the reference library.

Required quality dimensions:
1. SOURCE FIDELITY
2. DRAWING HIERARCHY
3. EDITORIAL LAYOUT
4. TYPE / UNIT PRODUCT READABILITY
5. DECISION VALUE

PASS only if all five are visibly strong.

2F hard gates:
- A/B geometry unchanged
- no invented landscape
- core / entrance / windows / doors / walls / dimensions preserved
- source remains final authority
- no generic dashboard look
- reference effect must be visible without explanation

## 8. ENGINE STATE
Implemented:
- Report package validation
- Source routing
- Layer orchestration L0~L7
- Sales/publication admission gates
- exact-path selective-edit infrastructure
- narrative/decision evidence gate
- A3 SVG board renderer
- HTML derivative exporter
- A3 CLI route
- source SVG isolation / href route
- controlled vector presentation pipeline

Known weakness:
The A3 board renderer still needs visual-quality calibration.
Its current layout is structurally correct but not yet reference-grade.

## 9. DO NOT REPEAT
- Do not create another one-off HTML outside the engine.
- Do not use ReportLab/generic frame layout as final.
- Do not call source-preservation proof “enhanced”.
- Do not mask furniture with broad rectangles.
- Do not infer semantics from color/topology alone.
- Do not expand from 2F to all pages before quality gate.
- Do not ask the user to debug.
- Do not explain reference DNA without making it visible in output.

## 10. IMMEDIATE NEXT EXECUTION
1. Live refresh GitHub branch and confirm exact HEAD/CI.
2. Read the files listed in §2.
3. Read the five central reference files in §5.
4. Compile a concrete P06 design-token set:
   - canvas / margin / grid
   - hero ratio
   - line hierarchy
   - A/B muted palette
   - dimension hierarchy
   - typography
   - legend treatment
   - whitespace
   - annotation density
   - page-message / decision-note placement
5. Implement those tokens IN THE ENGINE, not in a side script.
6. Render P06 from the current issued 2F source.
7. Compare result against reference-quality gate.
8. If FAIL, fix engine/profile and rerun.
9. Only after P06 PASS, propagate to P05/P04/P07.

## 11. STATUS SUMMARY
- Source route: ACTIVE
- Engine route: ACTIVE
- Narrative evidence gate: ACTIVE
- CI at handoff checkpoint: PASS
- 2F quality lock: NOT YET
- Whole-report expansion: HOLD
- Reference-grade final: NOT YET
