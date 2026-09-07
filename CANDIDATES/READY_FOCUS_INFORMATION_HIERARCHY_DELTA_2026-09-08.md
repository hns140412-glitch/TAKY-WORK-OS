# READY & SET — FOCUS INFORMATION HIERARCHY DELTA

Status: CANDIDATE / UX INFORMATION HIERARCHY / NO PRODUCTION CHANGE
Date: 2026-09-08
Scope: Focus screen time visibility, child cognitive load, primary/secondary information priority

## 1. USER FEEDBACK

Actual iPhone Preview review indicates the Focus screen contains too many simultaneously visible time values.
User direction:
- elapsed/focus time should be much less cognitively salient to the child during the mission
- UI should feel more orderly and less numerically busy
- the child should not be made to constantly track elapsed time while trying to focus

## 2. PRINCIPLE

Ready & Set records time accurately, but the child-facing Focus UI does not need to expose every metric with equal prominence.

Hard candidate:
`TIME MUST BE RECORDED ACCURATELY ≠ EVERY TIME METRIC MUST BE PROMINENT`
`FOCUS SCREEN = TASK FIRST, TIME SUPPORTING`
`LIVE ELAPSED TIME = LOW SALIENCE`

## 3. PROPOSED VISUAL PRIORITY

### Primary
1. current task / current Lap identity
2. main analog clock / focus state
3. remaining time or target-relative progress
4. primary actions: pause / complete / help

### Secondary
- target time
- current BGM state
- specialist app routing when relevant

### Tertiary / low-salience
- live elapsed focus time
- accumulated pause/issue time
- exact start clock time

These tertiary values remain recorded and may be shown in:
- result/report
- history
- parent/admin detail
- optional detail reveal on Focus if explicitly opened

## 4. CHILD-FACING FOCUS TIME RULE

Recommended default:
- `남은 시간` remains the live digital metric if a live digital metric is needed
- `목표 시간` remains compact secondary reference
- `집중 시간 / 경과 시간` should not use a visually competing live counter
- `ISSUE/멈춤 누적 시간` should not compete with the task during Focus

Candidate options for elapsed time:
A. hide entirely during active Focus and reveal in result
B. show tiny muted metadata only
C. reveal on tap/expand for curiosity or parent inspection

Preferred candidate: A or B, pending Preview comparison.

## 5. SCREEN DENSITY RULE

Avoid presenting many independent time readouts at once.

Candidate:
`ONE DOMINANT LIVE TIME + ONE COMPACT REFERENCE + HISTORY METRICS DEFERRED`

The analog clock may remain large because it supports the established visual identity, but supporting digital metrics should be restrained.

## 6. GUIDE RELATION

During Focus:
- Guide uses `P0 DEEP_HIDE` or low `P1 AMBIENT_PEEK`
- help remains discoverable
- Guide does not call attention to elapsed time unless the child explicitly asks or a time-related intervention is needed

## 7. IMPLEMENTATION GATE

Do not change this alone in another Preview.
Batch with:
- primary action reachability
- Guide habitat / presence intensity
- speech-bubble quick choices
- no-scroll primary child flow
- normalized swipe navigation

`FOCUS INFO HIERARCHY + VIEWPORT + GUIDE + SWIPE → ONE STAGING UX BATCH → ONE PREVIEW`

END — READY FOCUS INFORMATION HIERARCHY DELTA 2026-09-08
