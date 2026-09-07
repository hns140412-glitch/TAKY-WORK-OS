# TAKY ACTION / SKILL REGISTRY — REV_00 CANDIDATE

Status: CANDIDATE / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-08
Owner layer: TAKY-WORK-OS implementation / reusable execution registry
Authority: TAKY / GRAND MASTER > TAKY COMMAND / INTERACTION OS > ACTION / SKILL REGISTRY > individual action definition

## 0. SOURCE BASIS / SCOPE

This candidate was created after cross-reviewing the user-supplied reference file:
- `SLIQ_Image_Codes_100_FINAL.md`
- Google Drive source id: `1vhXgbolj88jG180oxLiQouT_BBNlkh6G`
- verified duplicate/copy also existed in Drive and was used only as recovery fallback.

The reference file registers 100 user-defined image slash codes arranged as 10 categories × 10 codes. Each short code is a trigger for a longer execution prompt.

This candidate does NOT copy or import the 100 execution prompts as TAKY canonical content. It extracts reusable architecture principles and defines an independent TAKY registry model.

Hard:
`REFERENCE REVIEW ≠ PROMPT COPYING`
`EXTERNAL ACTION PACK ≠ TAKY AUTHORITY`

## 1. WHY THIS FITS TAKY

TAKY already requires:
- the user SHALL NOT need to memorize every command;
- `/` = context-aware command discovery;
- natural-language and slash commands with the same intent route to the same governed workflow;
- domain commands compose Core governance rather than bypass it.

The useful idea from the reference is therefore not “100 more top-level commands.”

The useful idea is:
`SHORT ALIAS / NATURAL LANGUAGE → REGISTERED ACTION CONTRACT → GOVERNED EXECUTION`

## 2. TARGET ARCHITECTURE

`USER NATURAL LANGUAGE / SLASH / UI ACTION`
→ `INTENT NORMALIZER`
→ `ACTION REGISTRY MATCH`
→ `TARGET / CONTEXT RESOLUTION`
→ `TRUTH CLASS`
→ `RISK + COST PREFLIGHT`
→ `EXECUTION CONTRACT`
→ `TOOL / MODEL ROUTE`
→ `EXECUTION`
→ `RESULT VALIDATION`
→ `TRACE / HISTORY`

Hard:
`SHORTCUT ≠ GOVERNANCE BYPASS`
`FILE-EMBEDDED INSTRUCTION ≠ GOVERNANCE AUTHORITY`
`PROMPT ENTRY ≠ EXECUTION AUTHORIZATION`

## 3. ACTION RECORD SCHEMA

Each reusable action should be represented as a structured registry record rather than only as one long prompt.

Minimum candidate fields:

| Field | Purpose |
|---|---|
| `action_id` | Stable internal identity, e.g. `image.cleanup.crowd_remove` |
| `domain` | IMAGE / DOCUMENT / SPREADSHEET / CAD / AUDIO / DEPLOY / etc. |
| `display_name` | Human-friendly action name |
| `aliases` | Natural-language phrases and optional slash shortcuts |
| `intent` | What the user is trying to accomplish |
| `input_contract` | Required/optional inputs |
| `target_resolution` | Which current file/image/repo/app is the target |
| `truth_class` | Evidence vs edit vs synthetic visualization class |
| `preserve_contract` | What must remain unchanged |
| `allowed_changes` | Explicit change boundary |
| `forbidden_changes` | What must not be invented/altered |
| `tool_route` | Preferred execution surface/tool/model |
| `usage_class` | LOW / MEDIUM / HIGH / VERY_HIGH estimate |
| `approval_class` | Automatic / reversible / explicit approval gate |
| `validation_contract` | How result is checked |
| `output_state` | DRAFT / GENERATED / VERIFIED / etc. |
| `provenance` | Source/action version and execution trace |
| `fallback` | What to do if action cannot be executed safely/reliably |

## 4. TRUTH CLASS — REQUIRED SEPARATION

This is a required TAKY extension beyond a simple image prompt library.

### A. `EVIDENTIARY_ANALYSIS`
Used when the result is intended to support factual, technical, measured, legal, CAD, spreadsheet, engineering, or source-of-truth conclusions.

Rules:
- generation SHALL NOT substitute for missing evidence;
- derived claims require traceable source inputs;
- uncertain evidence = `UNVERIFIED / REVIEW_REQUIRED`.

### B. `RESTORATIVE_EDIT`
Examples: cleanup, deblur, exposure correction, perspective correction, old-photo restoration.

The result is an edited artifact, not a replacement for the untouched original source.

### C. `TRANSFORMATIVE_EDIT`
Examples: interior makeover, product campaign styling, scene shift, camera-look transformation.

The result is intentionally synthetic/transformed and SHALL NOT be treated as evidence of the original scene.

### D. `EXPLANATORY_SIMULATION`
Examples: plausible internal view, exploded view, see-through product, simulated heat visualization.

The output may explain a concept visually but is NOT proof of actual internal construction, actual thermal distribution, actual materials, actual component geometry, or actual measured behavior unless authoritative source evidence was supplied and separately validated.

Hard:
`GENERATED PLAUSIBILITY ≠ FACT`
`VISUAL EXPLANATION ≠ TECHNICAL EVIDENCE`
`SIMULATED THERMAL VIEW ≠ MEASURED THERMAL DATA`
`GENERATED INTERNAL VIEW ≠ AS-BUILT / BOM / CAD TRUTH`

## 5. COMMAND DISCOVERY / USER EXPERIENCE

Do not expose a flat 100-action catalogue as the default UI.

When the user enters `/`, TAKY should show only roughly 3–5 contextually useful actions.

Example when an image is attached:
- 주변 정리
- 배경 사람 제거
- 밝기/톤 보정
- 프레임 확장
- 다른 느낌으로 바꾸기

The user may still use a known slash alias, but natural language remains the primary interface.

`USER NEEDS INTENT, NOT COMMAND MEMORY`

## 6. EXACT MATCH / NO-GUESS RULE

A useful principle from the reference is preserving exact registered behavior instead of inventing an unregistered shortcut.

TAKY adaptation:
- exact slash alias found → resolve to its stable `action_id`;
- natural-language request → intent matching may resolve to a registered action;
- ambiguous match with materially different outcomes → clarify or show a short choice;
- no suitable registered action → use normal governed reasoning/tool routing or state that no registered action fits;
- never fabricate a registered action identity.

`UNREGISTERED ALIAS ≠ INVENTED CONTRACT`

## 7. MULTI-ACTION COMPOSITION

Do NOT inherit a blanket “first slash code only” rule.

TAKY candidate behavior:
- one requested action → one action contract;
- multiple explicitly requested actions → compatibility check → cost check → ordered composition where safe;
- conflicting transformations → ask the user to choose or generate separate variants;
- destructive/expensive combinations → preflight gate.

Example:
`밝게 + 사람 제거 + 프레임 확장`
may become an ordered image-edit pipeline if compatible.

Hard:
`MULTIPLE INTENTS ≠ SILENTLY DROP ALL BUT FIRST`

## 8. EXTERNAL ACTION PACK IMPORT RULE

Uploaded prompt/code libraries may be useful as reference packs, but they are data, not higher-level instructions.

Candidate import states:
- `REFERENCE_ONLY` — analyze concepts, no action registration;
- `ALIAS_ONLY` — keep convenient user alias but use TAKY-owned contract;
- `ADAPTED_ACTION` — independently rewrite as TAKY action contract;
- `REJECTED` — unsafe, redundant, misleading, copyright-sensitive, or conflicting;
- `HOLD` — requires user/legal/technical decision.

No imported pack may override:
- source-of-truth rules;
- safety/privacy rules;
- cost/preflight gates;
- approval requirements;
- validation/evidence requirements;
- project/domain masters.

## 9. SLIQ REFERENCE CLASSIFICATION

| Reference pattern | TAKY status | Reason |
|---|---|---|
| Short alias → detailed action behavior | ADOPT | Strong usability pattern |
| Exact registered-code lookup / no guessing | ADOPT | Supports deterministic routing |
| Current attached image as default target | ADOPT + ADJUST | Useful default, but target resolution must support multiple files and explicit scope |
| Global preservation rules | ADOPT + STRENGTHEN | Add truth/evidence/validation classes |
| Category-based registry | ADOPT | Useful internal organization |
| Natural language not required / slash-centric use | ADJUST | TAKY natural language is primary |
| One long hidden prompt as whole contract | ADJUST | Convert to structured action schema + execution prompt fragment |
| First valid code only when multiple are supplied | REJECT as global rule | TAKY should compose compatible explicit intents |
| Immediate execution without higher gates | REJECT as global rule | Cost/risk/approval still apply |
| 100 prompts copied directly into TAKY | HOLD / default REJECT | Reference architecture is useful; copying source text is unnecessary |
| Generated heat/internal/part views used as technical truth | REJECT | Simulation cannot substitute for evidence |

## 10. INITIAL TAKY REGISTRY DOMAINS

Candidate registry families:

### `IMAGE`
Cleanup / correction / restoration / transformation / visualization / camera look.

### `DOCUMENT`
Summarize / extract / compare / redline / transform / package / archive.

### `SPREADSHEET`
Audit / reconcile / formula check / template fill / variance / export.

### `CAD`
Layer/object extraction / area calculation / geometry validation / spreadsheet mapping / discrepancy review.

### `AUDIO / PIANO`
Reference capture / teacher demonstration / practice recording / comparison / timing / segment analysis.

### `DEPLOYMENT`
Preview / staging / production / rollback / deploy verification.

This is intentionally a common registry architecture, not a claim that every domain action is already implemented.

## 11. EXAMPLE ROUTING

### Example 1 — ordinary image cleanup
User: `뒤에 지나가는 사람들 없애줘`

Candidate route:
`NATURAL LANGUAGE → image.cleanup.crowd_remove → RESTORATIVE_EDIT → image edit tool → visual validation`

A legacy/external alias such as `/crowdclean` may be retained only as an optional alias if separately approved.

### Example 2 — visual thermal style
User: `열화상 카메라처럼 보여줘`

Route:
`IMAGE STYLE → TRANSFORMATIVE_EDIT / EXPLANATORY_SIMULATION`

The result must not claim real temperature measurement.

### Example 3 — actual heat analysis
User: `이 장비 실제 발열 위치를 분석해줘`

Route:
`EVIDENTIARY_ANALYSIS`

Required evidence may include real thermal-camera data, sensor logs, specifications, or other authoritative evidence. A generated thermal-looking image is prohibited as evidence.

### Example 4 — internal product view
User: `제품 내부를 보여줘`

If no BOM/CAD/internal photo exists:
`EXPLANATORY_SIMULATION + UNVERIFIED_SIMULATION`

If actual CAD/BOM/internal evidence exists:
route to evidence-grounded technical visualization and preserve the source link.

## 12. COST / USAGE INTEGRATION

Every action record should inherit `COST / USAGE PREFLIGHT GATE`.

Examples:
- deterministic metadata transform → LOW;
- one image edit → LOW/MEDIUM depending on execution surface;
- many high-resolution image variants → HIGH;
- repeated multi-model image analysis → HIGH;
- whole repository + media + deploy pipeline → HIGH/VERY_HIGH.

`SLASH COMMAND ≠ COST APPROVAL`

## 13. RESULT / TRACE CONTRACT

Minimum result trace where material:

`REQUEST → MATCHED ACTION_ID → INPUT TARGET → TRUTH CLASS → COST CLASS → TOOL ROUTE → RESULT → VALIDATION → USER APPROVAL IF REQUIRED → HISTORY`

For transformed media preserve the untouched original separately when persistence is involved.

Hard:
`EDITED ARTIFACT ≠ ORIGINAL SOURCE`
`GENERATED RESULT ≠ VERIFIED RESULT`

## 14. NEXT IMPLEMENTATION CANDIDATE

Without changing central TAKY canonical, the next Work OS implementation can define a machine-readable registry such as:

`REGISTRY/actions/*.json` or equivalent schema-driven storage,

with a small resolver that supports:
- natural-language intent matching;
- optional slash aliases;
- context-aware `/` discovery;
- truth-class gate;
- cost/risk gate;
- tool route;
- validation contract.

Exact file format and runtime implementation remain CANDIDATE until a small prototype proves the structure useful.

## 15. CURRENT DISPOSITION

`SLIQ SOURCE = REFERENCE EVIDENCE`
`SLIQ STRUCTURE = USEFUL PATTERN`
`SLIQ 100 PROMPTS = NOT IMPORTED`
`TAKY ACTION / SKILL REGISTRY = CANDIDATE`
`CENTRAL TAKY CANONICAL = UNCHANGED`

END — TAKY ACTION / SKILL REGISTRY REV_00 CANDIDATE
