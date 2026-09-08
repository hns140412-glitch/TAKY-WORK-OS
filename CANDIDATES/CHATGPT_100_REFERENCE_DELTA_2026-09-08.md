# CHATGPT 100 REFERENCE DELTA — 2026-09-08

Status: CANDIDATE / REFERENCE-EXTRACTED DELTA / NOT CENTRAL TAKY CANONICAL
Scope: TAKY-WORK-OS / Learning-Family / Ready & Set / file-analysis workflows
Source basis: user-attached screenshots summarizing 100 ChatGPT usage ideas grouped into prompt/dialog design, file/image/app linkage, research/learning, and advanced/security functions.

## 0. SOURCE RULE

The screenshots are treated as REFERENCE ONLY.

- Do not import the 100 items verbatim as TAKY rules.
- Do not treat social-post product claims as authoritative/current feature documentation.
- Extract reusable workflow principles only.
- Product-specific feature names, availability, UI paths, limits, and security claims remain UNVERIFIED unless independently checked when needed.

Hard:

`REFERENCE IDEA != PRODUCT AUTHORITY`
`PROMPT TIP != GOVERNANCE RULE`
`EXTERNAL TEMPLATE != TAKY CANONICAL`

## 1. COMPARISON RESULT

A large portion of the reference is already covered by existing TAKY / Work OS candidates:

- natural language -> governed action routing
- explicit goal/context/output/constraints
- source/evidence first
- uncertainty labeling
- self-check / cross-validation
- project/domain isolation
- cost/usage preflight
- approval gates
- preview before production
- file comparison / structured extraction
- learning by question, feedback, error review
- conversation/file recovery

Therefore the useful result is not 100 new commands. The useful result is a smaller set of DELTAS that strengthen existing architecture.

## 2. ADOPT — REQUEST CONTRACT

Useful patterns from the prompt/dialog group are consolidated into one reusable request contract.

Candidate fields:

```text
GOAL
CONTEXT
AUDIENCE
SCOPE
CONSTRAINTS
OUTPUT_FORMAT
JUDGMENT_CRITERIA
SOURCE_POLICY
UNCERTAINTY_POLICY
APPROVAL_CLASS
COST_CLASS
TRACE_REQUIREMENT
```

This consolidates useful ideas such as:

- goal first
- context before execution
- audience/reader level
- output format fixed before generation when material
- explicit prohibitions/constraints
- good/bad examples when style ambiguity is high
- important conditions placed before long supporting material
- split large work into stages
- declare judgment criteria before comparative decisions
- self-check after drafting
- evidence/source requirement
- reusable templates for repeated work

Hard candidate:

`REQUEST TEXT != EXECUTION CONTRACT`

## 3. ADJUST — CLARIFYING QUESTIONS

The screenshot recommendation to ask several questions before beginning is useful only when adapted.

TAKY candidate:

- ask only for materially blocking unknowns;
- prefer tool/source resolution before asking the user to repeat information;
- at most roughly 1–3 concise questions when genuine ambiguity remains;
- do not force a fixed number of questions;
- do not delay a safe reversible step merely to satisfy a prompt template.

Hard:

`FIXED QUESTION COUNT = REJECT`
`BLOCKING UNKNOWN -> CLARIFY`
`RESOLVABLE FROM SOURCE -> READ SOURCE FIRST`

## 4. ADJUST — “THINK STEP BY STEP”

Do not make hidden chain-of-thought a workflow dependency.

Use instead:

```text
PLAN
-> CHECKPOINTS
-> EXECUTION
-> VALIDATION
-> RESULT / NEXT ACTION
```

Expose concise rationale, criteria, evidence, assumptions, and validation results where useful.

Hard:

`HIDDEN REASONING != USER-AUDITABLE TRACE`

## 5. ADOPT — FILE / IMAGE ANALYSIS CONTRACT

The file/image group contains several useful patterns for current Work OS and Ready capture flows.

Candidate analysis contract:

```text
TARGET
-> SCOPE / REGION / PAGE
-> STRUCTURED EXTRACTION
-> SOURCE LOCATION
-> UNCERTAINTY LABEL
-> DIFFERENCE / ANOMALY
-> CONCLUSION
-> ACTION
```

Adopted behaviors:

- for long documents, locate structure/sections before deep extraction when useful;
- multi-file comparison should show differences, not merely summarize each file separately;
- screenshot/image analysis should define the requested region when scope matters;
- screenshot -> table reconstruction should preserve visible structure and mark uncertain cells;
- before/after comparison should identify changed facts and changed presentation separately;
- spreadsheet/CSV analysis should check missing values, duplicates, outliers, repeated patterns, and formula/data consistency where applicable;
- data cleaning must follow declared rules rather than silently changing source truth;
- charts should be analyzed through the user's actual decision question, not generic description only.

Hard:

`UNCERTAIN EXTRACTION -> CONFIRMATION_REQUIRED`
`RECONSTRUCTED TABLE != ORIGINAL SOURCE`
`CLEANED DATA != RAW DATA`

## 6. APPLY TO READY HOMEWORK CAPTURE

This reference strengthens the existing Ready Homework Intake candidate.

Direct candidate application:

```text
CAPTURE
-> identify memberId first
-> identify book/workbook/print target
-> define capture role: COVER / HOMEWORK_RANGE / ANSWER_REFERENCE / PRINT / INSTRUCTION
-> extract visible facts
-> mark uncertain facts
-> compare against previous registered reference when available
-> ask parent/child to confirm only uncertain or conflicting facts
-> commit source facts
-> Learning Master interprets
-> Planner allocates
```

Additional rules:

- previous reference vs current capture comparison should be explicit when it can reduce repeated input;
- page/range changes should be stored as facts, not inferred from prior week;
- answer/reference pages remain separate from child-facing task material;
- visual/OCR uncertainty must not be converted into guessed pages, dates, subjects, or teacher instructions.

## 7. ADOPT — RESEARCH OUTPUT CONTRACT

The research group contributes a useful compact decision-output pattern.

Candidate research flow:

```text
QUESTION
-> KEY TERMS / SCOPE
-> SOURCE COLLECTION
-> CLAIM + EVIDENCE
-> COUNTEREVIDENCE / ALTERNATIVE
-> RISKS / UNKNOWN
-> DECISION / NEXT ACTION
```

For material decisions, a compact decision memo may use:

```text
CONCLUSION
EVIDENCE
RISKS / MISSING
OPTIONS
NEXT ACTION
```

This fits existing TAKY truth/validation rules and should not replace source citations or uncertainty states.

## 8. ADOPT — LEARNING LOOP

The learning section contains meaningful additions for Learning-Family, especially the 6-year-old iPad/Snap & Pop direction.

Candidate learning loop:

```text
OBSERVE CURRENT LEVEL
-> ASK / PROMPT
-> CHILD RESPONDS
-> GIVE HINT OR REFLECTION
-> CHECK UNDERSTANDING
-> EXPLAIN WHY WHEN WRONG
-> RECORD EVIDENCE-LINKED DIFFICULTY
-> ADAPT NEXT TASK
-> SHORT RETRIEVAL / QUIZ LATER
```

Adopted behaviors:

- Socratic/question-led help rather than immediately giving the answer;
- level-adaptive explanation based on demonstrated evidence, not age label alone;
- one concept/checkpoint at a time for young learners;
- wrong-answer handling should focus on WHY the answer failed, not merely mark wrong;
- maintain a lightweight misconception/error note tied to evidence;
- identify a small number of current weak points rather than a permanent “weak child” label;
- use spaced retrieval/flashcard-like reappearance only when it supports the concept;
- roadmap/progression should be concept-based and revisable;
- voice interaction is especially suitable for young-child Korean/English/math use.

Hard:

`WRONG ANSWER != FAILURE LABEL`
`AGE != FIXED LEVEL`
`ONE RESPONSE != PERMANENT PROFILE`

## 9. APPLY TO 6-YEAR-OLD SNAP & POP / NUMBER-SENSE MATH

Combine the learning-loop delta with the existing Numberblocks-referenced math candidate.

Example interaction:

```text
visual quantity / simple story
-> “몇 개로 보여?”
-> child answers by voice/touch
-> “다른 방법으로 만들 수 있을까?”
-> hint only if needed
-> child explains
-> system reflects reasoning
-> one short understanding check
-> save concept evidence
```

For Korean / English familiarization:

```text
picture / sound / situation
-> child says or chooses
-> system reflects correct sound/word
-> one small expansion
-> repeat/retrieve later if useful
```

Do not turn young-child use into long text lessons, fixed quizzes, or worksheet-count optimization.

## 10. ADOPT — TWO-PASS / CROSS-VALIDATION ROUTING

The reference suggestion to use separate draft/check passes aligns with TAKY orchestration.

Candidate pattern:

```text
DRAFT / PRIMARY ANALYSIS
-> INDEPENDENT CHECK OR RULE-BASED VALIDATION
-> CONFLICT RESOLUTION
-> FINAL
```

But:

- do not automatically use two expensive models;
- use deterministic checks where possible;
- escalate to a second model/agent only when the risk/value justifies the cost;
- inherit COST / USAGE PREFLIGHT GATE.

Hard:

`SECOND MODEL != DEFAULT`
`CROSS-VALIDATION != DUPLICATE COST BY DEFAULT`

## 11. ADJUST — MEMORY / PROJECT CONTEXT

The reference includes memory/customization ideas. TAKY adaptation:

- memory may improve convenience but is never Source of Truth;
- project-specific context should be scoped and isolated;
- stable project rules belong in project/master/source artifacts, not only conversational memory;
- current truth must be recoverable from authoritative sources;
- stale memory must not override newer source evidence.

Hard:

`MEMORY != SOURCE OF TRUTH`
`PROJECT CONTEXT != CROSS-PROJECT INHERITANCE`

## 12. ADJUST / HOLD — PRODUCT FEATURES, GPTS, PLUGINS, WORK

Potentially useful operational ideas:

- connected apps can reduce copying;
- scheduled/event-triggered workflows can be useful;
- reusable skills/actions can reduce repeated prompting;
- project-specific assistants may package repeated workflows.

But these are routing/options, not governance authority.

Classification:

- connected app use: ADOPT WHEN CONNECTED + NEEDED
- scheduled/event automation: ADOPT WHEN USER REQUESTS / APPROVES
- reusable skills/actions: ADOPT through Action Registry
- custom GPT / store discovery: HOLD as optional implementation surface
- long-running Work/agent execution: ADJUST — inherit cost preflight and approval
- exact screenshots' claims about availability/permissions/security: UNVERIFIED PRODUCT CLAIMS

## 13. SECURITY / PRIVACY DELTA

Useful high-level principles from the final group:

- least privilege for connected services;
- separate read from write permissions where possible;
- explicit approval before consequential writes;
- protect parent-only areas from child mode;
- do not treat a visible role toggle as authentication;
- sensitive/source files should remain scoped to the correct project/member/domain;
- temporary/ephemeral work may be useful when persistence is not desired, but persistence behavior must be explicit.

## 14. REJECT AS GLOBAL RULES

Do not canonize fixed-count prompt folklore such as:

- always ask exactly 3 questions;
- always define exactly 10 terms;
- always provide 3 alternatives;
- always use one output format;
- always use a second model;
- always browse/search;
- always create a GPT/skill/plugin;
- always run Work/agent mode.

TAKY uses fit-for-purpose routing.

`FIXED RECIPE != FIT-FOR-PURPOSE`

## 15. DISPOSITION

### PRESERVE / ALREADY PRESENT
- evidence/source-first
- uncertainty states
- validation/cross-check
- cost/preflight
- project isolation
- approval gates
- file recovery/search
- governed action registry

### ADOPT
- unified REQUEST CONTRACT
- JUDGMENT_CRITERIA before material comparison/decision
- file/image structured extraction + uncertainty contract
- before/after source comparison
- compact DECISION MEMO output
- adaptive Socratic learning loop
- misconception/why-wrong evidence notes
- concept-based learning roadmap
- low-cost first two-pass validation

### ADJUST
- fixed clarification counts
- “think step by step” as hidden reasoning dependency
- memory as persistent authority
- model/GPT/plugin/Work as default routes
- fixed output/count templates

### HOLD
- product-feature-specific implementation not yet needed
- custom GPT/store packaging
- broad automated agent workflows without a concrete use case

### REJECT
- social-post feature claims as canonical truth
- automatic high-cost escalation
- automatic cross-project/member inheritance
- prompt-template rules that conflict with current source/master truth

## 16. CURRENT APPLICATION STATUS

Applied at Work OS candidate level only.

Related candidates:

- `ACTION_SKILL_REGISTRY_REV_00_CANDIDATE.md`
- `COST_USAGE_PREFLIGHT_GATE_REV_00_CANDIDATE.md`
- `READY_HOMEWORK_INTAKE_MEMBER_SCOPED_DELTA_2026-09-08.md`
- `READY_YOUNG_CHILD_NUMBERBLOCKS_MATH_DELTA_2026-09-08.md`

No central TAKY canonical modification.
No Ready production modification.
No deployment triggered.

END — CHATGPT 100 REFERENCE DELTA
