# READY HOMEWORK INTAKE · MEMBER-SCOPED DELTA

Status: CANDIDATE / PROJECT-LEVEL STAGING SPEC / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-08
Scope: Ready & Set / Learning-Family OS

## 1. Core correction

Homework truth is not distributed by the parent.

- PARENT = CAPTURE / FACT INPUT / CONFIRM / GRADING SUPPORT
- CHILD = FACT INPUT WHERE APPROPRIATE / VIEW / SELECT TODAY / EXECUTE
- LEARNING MASTER = INTERPRET / CONCEPT & ACTIVITY-LOAD ANALYSIS
- PLANNER = ALLOCATE / RESCHEDULE

Hard corrections:

- PARENT INPUT != PARENT DISTRIBUTION
- PHYSICAL PAGE != LEARNING UNIT
- MINUTES != PRIMARY SPLIT UNIT
- ESTIMATED TIME = SECONDARY SAFETY / REALITY CHECK
- HOMEWORK MUST BE MEMBER-SCOPED
- HOUSEHOLD ACCOUNT != CHILD MEMBER PROFILE

## 2. Household / member scoping

Assignments differ by child, so every homework package and derived task must include member ownership.

Minimum contract:

```text
householdId
memberId
memberRole = CHILD
sourceRole = PARENT | CHILD | TEACHER | SYSTEM
sourceType
capturedAt / confirmedAt
provenance
```

Rules:

- Parent phone may select which child is being managed before capture/input.
- Child iPad may be pinned to one child profile by default.
- Siblings must never share homework, Planner state, learning history, analysis results, grading state, or carry-over merely because they share one household account.
- Cross-member copy requires an explicit user action; automatic inheritance is FAIL.
- Current `?role=parent` / default CHILD query routing is staging-only and is not the final identity model.

Target direction:

```text
HOUSEHOLD ACCOUNT
  -> PARENT DEVICE MODE
      -> choose child member -> capture / confirm / grade
  -> CHILD DEVICE MODE (iPad-first for young child)
      -> pinned member profile -> Ready / Snap & Pop / learning execution
```

## 3. Talent homework = one weekly package, six book units

Talent homework is always a one-week assignment package received together for six books.

```text
TALENT_WEEKLY_PACKAGE
  -> BOOK_UNIT x 6
      -> cover/reference
      -> current homework range/source pages
      -> answer/explanation sheet reference
  -> Learning Master analysis
  -> Learning Units
  -> Activity Load Profile
  -> Planner daily allocation within the current weekly boundary
```

Six subjects:

- 연산
- 한자
- 국어
- 사회
- 수학
- 생각하는 피자

Parent intake principle:

- Enter each book separately.
- Each book may include cover, homework-range photos/pages, and answer/explanation sheet.
- Parent captures and confirms source facts only.
- Parent does not set the daily allocation.
- Parent should not be required to manually classify difficulty or estimated minutes as the primary decision inputs.

Weekly boundary:

- The package is one week's homework.
- The next teacher visit is the cycle boundary, not a normal Planner allocation slot.
- `NEXT_TUE` as a routine allocation slot is superseded candidate behavior.
- Unfinished work becomes explicit carry-over/reschedule state; it must not disappear.

## 4. Talent analysis = qualitative activity-load first

The six books must not be split by page count or minutes alone.

Learning Master should interpret each assigned range using learning-action characteristics such as:

```text
newConceptLoad
readingLoad
memoryRecallLoad
calculationRepetitionLoad
reasoningLoad
writingLoad
errorCorrectionLoad
sustainedAttentionLoad
parentSupportNeed
contextSwitchCost
```

Examples are descriptive, not fixed numeric difficulty labels:

- 연산: repetition / accuracy / fatigue accumulation
- 한자: memory / recall / repetition
- 국어: reading comprehension / writing / language production
- 사회: reading + concept connection
- 수학: concept / application / correction
- 생각하는 피자: reasoning / exploration / sustained thinking

Planner priority:

```text
conceptually coherent learning units
-> complementary daily activity-load mix
-> timetable / deadline constraints
-> estimated time as feasibility check
```

High cognitive-load units such as Math and Thinking Pizza should not be automatically stacked simply because a time slot is available.

## 5. English workbook lifecycle

The workbook itself and the weekly/next-academy homework range are separate entities.

### Workbook registration

- Parent may photograph/register the workbook once.
- Keep a reusable workbook reference.

### After Monday academy

After the academy session, the assigned range must be confirmed.

- Child or parent may enter `from page -> to page`.
- Both child and parent must be able to see the same assignment fact.
- Save who entered/updated it: `CHILD_INPUT` or `PARENT_INPUT`.
- If inputs conflict, mark `CONFIRMATION_REQUIRED`; do not silently overwrite truth.
- Learning Master interprets the confirmed range.
- Planner allocates learning units until the next English academy boundary.

State example:

```text
ACADEMY_ENDED
-> HOMEWORK_CONFIRMATION_PENDING
-> RANGE_CAPTURED / RANGE_ENTERED
-> CONFIRMED
-> LEARNING_MASTER_ANALYZED
-> PLANNER_ALLOCATED
-> IN_PROGRESS
-> READY_FOR_SUBMISSION
-> SUBMITTED / CONFIRMED
```

## 6. English weekday print homework

English is not workbook-only.

An `ENGLISH_HOMEWORK_PACKAGE` may contain:

```text
workbookRange
weekdayPrints[]
vocabulary
listening
recording
writing
teacherInstructions
nextAcademyBoundary
```

Weekday prints remain separate learning units because one print sheet may carry a different cognitive/activity load from several workbook pages.

The user may add/capture print homework as it is received; missing/new print items may be added without rewriting the entire workbook package.

## 7. Shared capture behavior

Recommended intake UX:

```text
capture
-> temporary local save
-> continue capture
-> finish capture
-> batch OCR / classification
-> review only uncertain recognition
-> commit source facts
```

Talent:

- six book units
- cover / current assignment / answer-reference per book

English:

- workbook: one-time reference capture where possible
- weekly range: child or parent confirmation after academy
- weekday prints: add as separate items

OCR/camera automation must not fabricate pages, subjects, deadlines, or teacher instructions. Uncertain extraction stays `UNVERIFIED` / `CONFIRMATION_REQUIRED`.

## 8. Young child / iPad direction

Idea direction: ADOPT CANDIDATE, implementation HOLD until identity/sync foundation is stable.

- Young child is expected to use iPad rather than a personal phone.
- Child iPad should be able to stay pinned to the child's member profile.
- Parent phone handles capture/confirmation/grading for that member.
- Parent-only areas need an adult gate; do not rely on a visible role toggle as security.
- 6-year-old Ready surface may be lighter than older-child Ready and may route more directly to Snap & Pop and Talent.

Snap & Pop young-child extension idea:

- voice-first interaction
- picture -> speak -> hear -> repeat -> short expression/story
- Korean decoding / vocabulary familiarization support
- basic English listening/speaking familiarization
- difficult words may later bridge to Hide & Seek through explicit learning history, not automatic cross-member mixing

This is an extension candidate; it must not silently redefine the existing Snap & Pop master role before a dedicated master review.

## 9. Current runtime conflicts to correct later

The following currently implemented/staged behaviors are not the target model and should be treated as correction targets, not truth:

- Parent Talent UI asking for manual minutes as a primary field.
- Stage E2 fixed minute/capacity-first weekly allocation.
- Routine `NEXT_TUE` allocation slot for Talent.
- Generic parent homework form exposing manual difficulty/estimated-minute controls as if the parent owns those judgments.
- Homework records without guaranteed child `memberId` ownership.

Do not delete or rewrite these runtime paths until the replacement is implemented and regression-checked.

## 10. Implementation order

1. Establish household/member identity contract and member-scoped storage.
2. Add Parent child-selector / Child pinned-member behavior.
3. Build member-scoped Homework Intake store separate from Planner output.
4. Talent: six-book weekly capture model.
5. English: workbook reference + post-academy range confirmation + weekday print items.
6. Connect Learning Master analysis adapter.
7. Replace fixed minute-first Talent allocation with learning-unit/activity-load allocation.
8. Connect Planner output to Ready today selection.
9. Add parent grading/correction loop.
10. Only after preview/device verification, consider production release.

## 11. Verification gates

- CHILD A homework never appears under CHILD B without explicit bridge/copy.
- Parent can choose the target child before entering homework.
- Child iPad can remain pinned to one member.
- Talent package always contains six independent book inputs under one weekly package.
- No routine Talent distribution by parent.
- No routine Talent allocation into the next cycle boundary.
- English workbook range can be entered/updated by either child or parent with provenance.
- Weekday English print homework can coexist with workbook range.
- Learning Master owns difficulty/activity-load interpretation.
- Planner owns daily allocation.
- Unknown values remain unverified; no invented deadlines/pages/difficulty.

## 12. Runtime status at time of this delta

- F3: DEVICE FAIL based on user device result (no visible difference from prior UI).
- F4 source/preview CI: previously PASS.
- F4 actual-device role difference: PENDING.
- Production: unchanged.
- This document does not modify central TAKY canonical rules and does not release runtime changes.
