# PIANO PRACTICE SUB-MASTER — REV_00 CANDIDATE

Status: CANDIDATE / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-07
Scope: Piano learning / practice interpretation under GUIDE / Family Learning OS
Proposed Authority: TAKY / GRAND MASTER > GUIDE FAMILY LEARNING OS > PIANO PRACTICE SUB-MASTER > functional app/runtime > skill/tool/agent

## 0. PURPOSE

This candidate establishes a dedicated subject/practice owner for piano learning so piano practice is not confused with Ready & Set BGM or absorbed into a generic timer/execution app.

`PIANO BGM ≠ PIANO LEARNING DOMAIN`

Ready & Set may schedule and orchestrate piano work. The piano practice sub-master owns piano-specific interpretation, evidence, practice-unit meaning, comparison semantics and teacher-reference use.

## 1. OWNERSHIP — HARD CANDIDATE

GUIDE / MAIN owns:
- schedule / capacity / allocation
- which piano assignment enters the week/day plan
- carry-over / rescheduling

Ready & Set owns:
- starting the practice task/session
- target time / task / Lap / return state
- cross-app/session continuity where used

Piano Practice Sub-Master owns:
- piece / score / section interpretation
- practice-unit sizing by measure/phrase/hand/technical target
- teacher-reference semantics
- performance-evidence interpretation
- comparison axes
- retry recommendation
- uncertainty/confidence boundaries

Professional teacher owns:
- authoritative teaching intent
- repertoire/performance judgment
- misconception/technique correction
- teacher-specific interpretation and instruction

Hard boundaries:
`GUIDE ≠ PROFESSIONAL TEACHER`
`AI COMPARISON ≠ TEACHER JUDGMENT`
`READY & SET ≠ PIANO PEDAGOGY OWNER`

## 2. CORE PRACTICE LOOP

Preferred flow:

`ASSIGNMENT / SCORE → TEACHER DEMONSTRATION / INSTRUCTION → REGISTER CURRENT PRACTICE TARGET → CHILD PRACTICE → CHILD RECORDING → COMPARE → SMALL ACTIONABLE RETRY → RE-RECORD IF USEFUL → GROWTH HISTORY → NEXT PRACTICE`

Practice should be section-oriented rather than judging the entire performance as one score.

Useful practice units may include:
- piece/work
- page/system
- measure range
- phrase/section
- right hand / left hand / both hands
- rhythm-only / notes-only / articulation / dynamics / pedaling / tempo target

`PHYSICAL PAGE ≠ PRACTICE UNIT`

## 3. TEACHER REFERENCE — HARD CANDIDATE

The teacher's live demonstration may be recorded and used as the child's current learning reference.

Structured entity:
`TEACHER_REFERENCE`

Minimum useful fields where available:
- `teacher_reference_id`
- `piece_id / work_title`
- `score_source_ref`
- `section_start / section_end`
- `hand_mode` = RIGHT / LEFT / BOTH / OTHER
- `target_tempo` if explicitly provided
- `teacher_note / instruction`
- `recorded_at`
- `audio_source_ref`
- `active_reference` boolean/state
- `supersedes_reference_id` when a newer teacher demonstration becomes current
- provenance / source owner

Hard rules:
`TEACHER REFERENCE ≠ ANONYMOUS AUDIO FILE`
`TEACHER REFERENCE ≠ AI-GENERATED MODEL PERFORMANCE`
`NEW REFERENCE ≠ DELETE OLD REFERENCE HISTORY`
`ACTIVE REFERENCE ≠ ONLY HISTORICAL REFERENCE`

The child should be able to listen to the teacher's reference for the exact practice section when useful.

## 4. THREE-WAY COMPARISON

Where technically valid and evidence quality is sufficient, comparison may use:

1. score/assignment target
2. current teacher reference
3. child's own previous/current performance history

Primary goal is actionable practice, not grading.

Possible evidence dimensions:
- timing / pulse stability
- approximate tempo relation
- note onset/order evidence where reliable
- note/rest duration relation
- section continuity
- articulation/dynamics/phrase cues only where evidence supports them
- current child vs teacher reference
- current child vs previous self

Hard boundaries:
`MEASURABLE DIFFERENCE ≠ ERROR`
`DIFFERENT INTERPRETATION ≠ WRONG BY DEFAULT`
`MODEL CONFIDENCE LOW → HUMAN / TEACHER REVIEW OR NEUTRAL FEEDBACK`

## 5. FEEDBACK CONTRACT

Feedback should be small, concrete and section-specific.

Preferred:
- identify one or two highest-value practice points
- state the measure/section clearly
- explain in child-appropriate language
- allow listen-back of teacher reference and child recording
- compare with previous self when useful
- recommend a short retry rather than global restart

Avoid:
- global labels such as good/bad performance
- pretending uncertain note detection is certain
- replacing the teacher's instruction
- increasing practice volume merely because more data exists

`OBSERVATION ≠ DIAGNOSIS`
`MORE DATA ≠ MORE REQUIRED PRACTICE`

## 6. RECORDING / STORAGE

Recording states remain distinct:
`RECORDED ≠ ANALYZED ≠ ACCEPTED AS REFERENCE ≠ SHARED`

Teacher-reference raw audio and child-practice raw audio should use the family privacy/storage boundary.
GitHub is not the private learning-audio store.

Raw audio permanent retention policy should remain explicit/configurable. Derived feature representations may be retained when they reduce repeated processing while preserving provenance.

## 7. COST-FIRST ANALYSIS — HARD CANDIDATE

Teacher reference:
`RECORD ONCE → ANALYZE ONCE WHERE NEEDED → CACHE DERIVED FEATURES → REUSE`

Child attempt:
`LOCAL / DETERMINISTIC FEATURES FIRST → COMPARE → UNCERTAINTY CHECK → HIGHER-COST ANALYSIS ONLY FOR MATERIAL UNCERTAIN SECTION`

Hard rules:
`UNCHANGED TEACHER REFERENCE ≠ FULL RE-ANALYZE EVERY ATTEMPT`
`REPEATED INPUT ≠ REPEATED ANALYSIS`
`EXPENSIVE MODEL ≠ BETTER FEEDBACK BY DEFAULT`
`COST SAVING ≠ QUALITY / SAFETY BYPASS`

Candidate cost metadata:
- `cost_class`
- `analysis_version`
- `feature_cache_key`
- `cache_hit / miss`
- `escalation_reason`
- `provider/model` when applicable
- actual usage/cost only when measurable

## 8. READY & SET INTEGRATION

A piano task can remain inside the Ready & Set Goal Session like any other task.

Ready & Set may pass:
`session_id / goal_id / task_id / lap_id / return_target / piano_target_id`

Piano practice specialist/runtime, if separately surfaced later, must not become session owner.

`APP_SWITCH ≠ PAUSE`
`APP_SWITCH ≠ LAP_END`
`PIANO TASK COMPLETE ≠ SESSION END`

If piano practice remains rendered inside Ready & Set rather than a separate app, the same ownership boundaries still apply.

## 9. DATA MODEL CANDIDATE

Suggested logical entities:
- `PIANO_ASSIGNMENT`
- `SCORE_SOURCE`
- `PRACTICE_TARGET`
- `TEACHER_REFERENCE`
- `PRACTICE_ATTEMPT`
- `PERFORMANCE_FEATURE_SET`
- `PRACTICE_FEEDBACK`
- `PRACTICE_PROGRESS`

Do not hard-code exact database/property names into central governance until runtime design is selected.

## 10. RELEASE / VALIDATION GATES

Do not claim piano-analysis PASS without evidence for the actual target device/environment and representative audio conditions.

Validation dimensions:
- correct section/reference association
- teacher reference provenance
- child attempt association
- no accidental cross-child/family mixing
- comparison repeatability where expected
- uncertainty handling
- cache/reuse correctness
- no duplicate expensive re-analysis
- recording/save/restore continuity
- Ready session/Lap continuity if integrated

`CODE EXISTS ≠ PIANO ANALYSIS VERIFIED`
`AUDIO RECORDED ≠ REFERENCE LINK VERIFIED`

## 11. CURRENT CLASSIFICATION

- Piano learning separate from BGM: ADOPT
- Piano as Practice Sub-Master owner: ADOPT
- Teacher demonstration as structured reference: ADOPT
- Teacher reference history/supersession: ADOPT
- Analyze-once/cache/reuse: ADOPT
- Local/deterministic first: ADOPT
- Exact DSP/model/provider: HOLD
- Exact thresholds/scoring formula: HOLD
- Separate standalone piano app: HOLD / NOT REQUIRED BY THIS CANDIDATE
- Central TAKY canonical write: NOT AUTHORIZED BY THIS CANDIDATE

END — PIANO PRACTICE SUB-MASTER REV_00 CANDIDATE
