# LEARNING PROFILE · PROGRESSIVE HINT · ERROR POLICY REFERENCE DELTA

Status: CANDIDATE / PROJECT-LEVEL SPEC / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-08
Scope: Learning/Family OS · Ready & Set · Snap & Pop · Hide & Seek · Learning Master

## 1. Source basis

This candidate is derived only from the user-provided reference screenshots shown in chat on 2026-09-08. It does not assume unseen/cropped text and does not treat the reference's numbering system as authoritative.

Visible source-derived patterns:

### Research template
- define scope such as period / region / exclusions before starting
- define variables or conditions one line at a time
- set an order for rebuttal / counterargument handling
- attach source links
- if evidence is absent, explicitly state that evidence is absent
- organize output around conclusion / evidence / risk / next action

### Study template
- establish a default level / study mode
- when the learner is wrong, provide hints rather than immediately giving the answer
- ask a check question
- explain primarily why the learner was wrong
- then summarize reason / core concept / one sentence that helps prevent repeating the same mistake

### Custom instruction template
- separate user/profile context from response rules
- conclusion-first response preference is visible
- tables only when requested is visible
- when uncertain, mark the point as needing confirmation rather than guessing
- explain unfamiliar terminology briefly
- suggest one next action at the end
- visible security guidance indicates masking or transforming identifying information instead of reproducing it directly

Any cropped or partially visible wording remains UNVERIFIED_SOURCE_COVERAGE.

## 2. Adoption decision

### ADOPT
- evidence absent -> do not invent; mark UNVERIFIED / 근거 없음 / 확인 필요 according to context
- scope before analysis
- progressive hinting before answer reveal
- error explanation focused on cause and core concept
- separate learner profile from execution/response policy
- one clear next action at a time for young learners
- privacy masking of identifying information

### ADJUST
- adult prompt-template wording -> internal Learning Master policy
- text-heavy study interactions -> age-sensitive voice / visual / conversational interaction
- fixed 'one next action' -> one visible next step at a time while internal planner may retain multiple pending actions
- generic error explanation -> learner-age and domain-specific error taxonomy

### HOLD
- the reference's numeric prompt/template ranges such as 51–59, 60–71, 76–77, 98
- direct copying of the original template wording
- any cropped security or personalization wording not fully visible in the screenshots

## 3. Member-scoped Learning Profile

Learning personalization MUST be scoped to a child `memberId`, not the household account.

Candidate contract:

```text
LearningProfile
- householdId
- memberId
- ageBand
- primaryDeviceMode
- interactionPreference
- readingStage
- englishStage
- mathReferenceFrame
- demonstratedConcepts[]
- emergingConcepts[]
- supportPreferences
- hintPolicy
- recentActivityLoadProfile
- errorPatternSummary
- confidenceState
- updatedAt
- provenance
```

Rules:
- HOUSEHOLD ACCOUNT != LEARNER PROFILE
- SIBLING PROFILE INHERITANCE = FAIL unless explicitly copied by a parent
- profile signals are evidence-based and may be UNKNOWN
- age is context, not proof of mastery
- demonstrated behavior should outweigh age-only assumptions for progression

For the previously discussed young child candidate:

```text
ageBand = YOUNG_CHILD
primaryDeviceMode = CHILD_IPAD
interactionPreference = VOICE + VISUAL + LARGE-TARGET UI
mathReferenceFrame = NUMBERBLOCKS_FAMILIARITY_REFERENCE
```

This Numberblocks reference is a pedagogical familiarity frame only, not a license to reproduce characters, artwork, audio, or branded visual assets.

## 4. Progressive Hint Policy

Default learning path candidate:

```text
PROMPT
-> CHILD RESPONSE
-> CHECK
   -> CORRECT: REINFORCE + OPTIONAL EXTENSION
   -> UNCERTAIN: CLARIFY / SMALLER CHECK
   -> INCORRECT: HINT_1
       -> CHILD RESPONSE
       -> HINT_2 if needed
       -> CONCEPT CUE if needed
       -> WORKED SUPPORT only when needed
       -> ANSWER REVEAL as late fallback, not default
-> RECAP
```

Hard policy:

```text
WRONG != IMMEDIATE ANSWER
WRONG -> HINT -> CHILD RESPONSE -> CONCEPT CHECK -> NEXT SUPPORT
```

For young children, hints should prefer:
- visual quantity or object comparison
- spoken choice between two possibilities
- gesture / pointing / grouping interaction when available
- very short verbal cues
- one question at a time

Avoid:
- multi-clause text explanations before the child responds
- repeated 'why?' questioning that may feel interrogative
- presenting several corrections at once

## 5. Error Cause Taxonomy

An incorrect answer should not be stored only as `wrong=true`.

Candidate `ErrorCause` values:

```text
CONCEPT_NOT_UNDERSTOOD
CONCEPT_PARTIAL
MEMORY_RECALL
SYMBOL_MAPPING
COUNTING_SEQUENCE
CALCULATION_SLIP
PROBLEM_INTERPRETATION
LANGUAGE_COMPREHENSION
ATTENTION_DROP
ACTIVITY_FATIGUE
FINE_MOTOR_LOAD
RUSHED_RESPONSE
TRANSFER_NOT_YET_READY
UNKNOWN
```

The system MUST allow `UNKNOWN` rather than forcing a classification.

After sufficient evidence, Learning Master may summarize:

```text
reason
coreConcept
nextUsefulCue
confidence
```

The child-facing recap should be much simpler than the internal taxonomy.

Example internal:
`reason=SYMBOL_MAPPING / coreConcept=numeral<->quantity / nextUsefulCue=show 6 as grouped objects`

Example child-facing:
`“6이 어떻게 생긴 수인지 블록으로 한 번 더 볼까?”`

## 6. Planner connection

Error analysis must not directly increase workload.

Candidate route:

```text
LEARNING EVENT
-> RESPONSE TRACE
-> ERROR / SUCCESS INTERPRETATION
-> LEARNING PROFILE UPDATE
-> ACTIVITY LOAD UPDATE
-> PLANNER CONSIDERS NEXT UNIT
```

Rules:
- ONE FAST SUCCESS != AUTOMATIC WORKLOAD INCREASE
- ONE ERROR != DIFFICULTY FAILURE
- REPEATED HIGH-LOAD SIGNALS may justify easier pairing, more review, or fewer simultaneous high-cognitive-load units
- planner decisions should combine timetable constraints, homework deadlines, learning-unit meaning, activity load, and actual learner response
- minutes remain a secondary reality/safety check, not the primary learning progression unit

## 7. Snap & Pop adaptation

For a young learner, Snap & Pop may act as a conversational learning surface while preserving its core expression role.

Candidate uses:
- early Korean: picture/word naming -> sound/syllable awareness -> short phrase -> tiny story
- early English: listen -> name -> choose/describe -> repeat -> short expression
- early math: see/describe quantity -> say number -> compose/decompose -> explain simply -> tiny story problem

The Guide should keep interaction dialogic:

```text
SHOW / ASK
-> CHILD SPEAKS
-> REFLECT
-> HINT IF NEEDED
-> ONE SMALL EXPANSION
```

Do not turn Snap & Pop into a worksheet engine.

## 8. Privacy / personalization boundary

Candidate privacy rules inspired by the visible custom-instruction reference:
- names, contacts, account identifiers, exact monetary values, or other identifying fields should be masked or abstracted when a task does not require exact reproduction
- exact personal data may be used only when the task explicitly requires it and the user has supplied/authorized it
- learner profile should store only fields needed for learning adaptation
- parent-visible analytics should prioritize support rather than surveillance

## 9. Validation

Before production implementation, validate separately:

```text
SOURCE IMPLEMENTED
!= BEHAVIOR VERIFIED
!= CHILD-USABILITY VERIFIED
!= PARENT-USABILITY VERIFIED
!= PRODUCTION RELEASED
```

Young-child validation should test:
- can the child act without reading long text?
- is one next action obvious?
- does a wrong answer trigger a useful hint rather than immediate reveal?
- are sibling profiles isolated?
- does the planner avoid converting performance into punitive workload inflation?

## 10. Current status

- Work OS candidate only
- not central TAKY canonical
- no production code change
- suitable for later cross-check against Learning App Family Master, Ready Master, Snap & Pop Master, and member-scoped homework intake candidate
