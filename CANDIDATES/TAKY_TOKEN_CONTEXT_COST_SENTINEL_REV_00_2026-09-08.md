# TAKY — TOKEN / CONTEXT / COST SENTINEL REV_00

Status: CANDIDATE / WORK OS SAFETY LAYER / NO TAKY CANONICAL CHANGE
Date: 2026-09-08

## 1. PURPOSE

Prevent accidental high-cost/high-context commands and reduce context-loss risk during long-running TAKY/Work workflows.

This is not a simple token counter.

`REQUEST → PREFLIGHT COST/CONTEXT ESTIMATE → USER GATE WHEN HIGH → EXECUTE → USAGE LEDGER → CONTEXT PRESSURE WARNING → HANDOFF/COMPACT/NEW CHAT WHEN NEEDED`

## 2. SEPARATE METRICS

Never merge these into one number:

1. `RUN COST` — expected/actual cost or usage of the current command/work run
2. `CUMULATIVE USAGE` — total tokens/cost consumed over a task/project period
3. `ACTIVE CONTEXT PRESSURE` — estimated amount of context needed for the next request
4. `SOURCE COVERAGE` — whether required source material has been preserved outside chat

Hard:
`CUMULATIVE TOKENS ≠ ACTIVE CONTEXT TOKENS`
`CHATGPT CONTEXT ≠ API CONTEXT`
`ESTIMATE ≠ EXACT USAGE`

## 3. CHATGPT MODE

In ordinary ChatGPT conversations, exact internal active-context usage is not guaranteed to be observable by TAKY.

Therefore use:
- estimated token count from accessible user/assistant/source text
- message/file/source volume
- compaction/recovery signals
- preserved Handoff/Lineage/Source Registry state

Display as `ESTIMATED`, never as exact.

A user-requested `250k` checkpoint may be retained as a HARD TRANSITION CHECKPOINT for cumulative/estimated volume, but must NOT be described as the exact ChatGPT context limit.

Recommended warning ladder when an applicable 256k-class ChatGPT context is being used:
- GREEN: normal
- AMBER: early context-pressure warning before the cliff; prepare/source-save
- RED: high pressure; recommend Handoff/compact/new conversation before further heavy work
- 250k CHECKPOINT: mandatory warning / do not silently continue a large operation

Thresholds should be model/mode-aware rather than globally hard-coded.

## 4. API / TAKY MOBILE MODE

When TAKY executes through an API that returns usage metadata, record actual reported input/output/cached/reasoning usage where available.

Use model metadata to determine:
- context window
- max output
- current pricing

Then calculate context pressure as a percentage rather than only an absolute token number.

Recommended:
- 70%: AMBER / source-save + next-step estimate
- 85%: RED / stop before new heavy retrieval or artifact generation unless user approves
- 95%: CRITICAL / Handoff or context reset required

Absolute 250k alert may coexist as a user preference, but percentage-based limits have authority for safety.

## 5. COST PREFLIGHT

Before a command likely to consume substantial Work/AI usage, show a compact preflight only when material:

`예상 사용량: LOW / MEDIUM / HIGH`
`많이 드는 부분: <retrieval / multi-file analysis / code generation / preview deploy / image generation / cross-validation>`
`권장 실행: batch / preview once / cheaper model / staged validation`

For HIGH:
- ask whether to proceed unless the user already explicitly authorized that exact heavy operation
- identify which substep dominates expected usage
- offer a lower-cost route when available

Hard:
`HIGH-COST SURPRISE = FAIL`
`PREVIEW/DEPLOY COST MUST BE BATCHED WHEN PRACTICAL`

## 6. AUTOMATIC ACTIONS

At warning thresholds:

AMBER:
- ensure source/decision deltas are saved outside chat
- update current-truth/handoff candidate
- avoid redundant re-reading

RED:
- warn user before another high-volume instruction
- produce compact continuation state
- recommend new conversation / Work continuation if needed

CRITICAL / 250k CHECKPOINT:
- explicit user-visible warning
- no silent large follow-up run
- preserve source pointers, decisions, implementation SHA/status, unresolved items
- transition using Handoff/Resume contract

## 7. USER EXPERIENCE

Do not spam token messages on every small request.
Only surface when:
- a heavy command is about to run
- a configured warning threshold is crossed
- a cost/context-saving decision is available

Suggested UI:
`Context: 72% · AMBER`
`This run: MEDIUM`
`Cost driver: 3-file forensic comparison`

Optional user preference:
`Alert me at estimated cumulative 250k tokens = ON`

## 8. CURRENT WORK APPLICATION

Ready & Set implementation remains a product-app task.
This Sentinel belongs to TAKY / Work OS governance and must not be embedded into the child-facing Ready & Set app.

For the current Ready & Set evening-use implementation:
- batch code changes
- create only one new Preview after the batch
- avoid repeated deployments for each UI adjustment
- report expected usage before materially heavy substeps

## 9. AUTHORITY

This file is a Work OS CANDIDATE only.
It does NOT modify central TAKY canonical without explicit `타키 반영` authorization.

END — TAKY TOKEN / CONTEXT / COST SENTINEL REV_00
