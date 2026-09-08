# READY YOUNG CHILD · NUMBERBLOCKS-REFERENCED MATH DELTA

Status: CANDIDATE / PROJECT-LEVEL STAGING SPEC / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-08
Scope: Ready & Set / Snap & Pop / Young Child Learning

## 1. User direction

For the 6-year-old child, early mathematics and arithmetic should use the child's Numberblocks familiarity as a primary reference frame.

This means:

- do not begin with worksheet quantity or elapsed minutes as the main progression signal
- begin with number sense, quantity, composition/decomposition, patterns, comparison, and operation meaning
- use the child's demonstrated understanding and activity load to choose the next learning unit
- treat Numberblocks as a pedagogical/reference baseline, not as visual/IP material to reproduce

## 2. Core learning sequence candidate

Suggested conceptual progression:

```text
quantity recognition
-> numeral <-> quantity connection
-> one more / one less
-> number composition and decomposition
-> bonds / making a target number
-> comparison (more / less / same)
-> counting on / counting back
-> addition as combining
-> subtraction as taking away / difference
-> doubles / near doubles
-> grouping / repeated addition intuition
-> simple multiplication/division concepts when demonstrated readiness exists
```

The Learning Master should advance by demonstrated understanding rather than age-only assumptions.

## 3. Activity-first math load

For a young child, math load should be described qualitatively by activity type rather than only by number of questions.

Possible signals:

```text
visualQuantityLoad
symbolMappingLoad
workingMemoryLoad
countingLoad
mentalManipulationLoad
patternReasoningLoad
verbalExplanationLoad
fineMotorWritingLoad
errorRecoveryLoad
attentionPersistenceLoad
```

Examples:

- recognizing 5 as a quantity may be low writing load but meaningful visual/number-sense work
- making 7 as 5+2 or 4+3 may have higher mental manipulation than writing several numerals
- a short verbal explanation may be more cognitively demanding than several repetitive arithmetic items

Therefore:

- QUESTION COUNT != LEARNING LOAD
- PAGE COUNT != MATH DIFFICULTY
- MINUTES != PRIMARY PROGRESSION UNIT

## 4. Ready / Snap & Pop role split

Ready & Set for the 6-year-old remains a lightweight base camp.

Snap & Pop can provide conversational math interaction when appropriate, for example:

```text
show / describe a quantity
-> child says the number
-> ask how else it can be made
-> child explains verbally
-> system reflects the child's reasoning
-> optionally turn it into a tiny story/problem
```

Examples of interaction patterns:

- “6은 어떻게 만들 수 있을까?”
- “5가 있는데 하나 더 오면 몇이 될까?”
- “8을 두 덩어리로 나눠보면?”
- “어느 쪽이 더 많아 보여?”

The goal is not rapid drilling; it is number sense + verbalized reasoning + confidence.

## 5. Talent / worksheet connection

If the 6-year-old also receives Talent workbook homework:

```text
Talent source pages
-> identify mathematical concept(s)
-> map them to the child's current Numberblocks-referenced concept profile
-> estimate cognitive/activity load
-> form coherent learning units
-> Planner places them within the week
```

A worksheet item should not automatically drive progression if it is beyond or below the child's demonstrated conceptual readiness.

## 6. Child profile data candidate

Store a child-specific math profile, for example:

```text
memberId
mathConceptProfile
  quantitySense
  numeralMapping
  composition
  decomposition
  additionMeaning
  subtractionMeaning
  doubles
  grouping
  verbalReasoning
  confidence
lastObservedEvidence
supportMode
```

Values should be evidence-linked and revisable, not permanent labels.

## 7. UX direction for iPad-first young child

- voice-first prompts
- large manipulable visual quantities
- minimal reading requirement
- little or no manual numeric configuration by the child
- short conversational turns
- optional parent visibility of progress, not surveillance-style dashboards
- resume from the child's last concept state

## 8. IP / design boundary

Use Numberblocks as a learning-reference framework only.

Do not copy:

- branded character designs
- copyrighted episode visuals
- proprietary artwork or exact scene layouts

Create original TAKY/Ready/Snap visual language and manipulatives while preserving the pedagogical idea of concrete number composition and decomposition.

## 9. Status

ADOPT CANDIDATE for Young Child learning architecture.
Implementation HOLD until household/member identity, member-scoped homework intake, and device/profile behavior are stabilized.
