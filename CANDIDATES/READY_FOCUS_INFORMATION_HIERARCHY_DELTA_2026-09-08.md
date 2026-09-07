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
- HOWEVER, ISSUE / pause time should remain clearly visible enough for self-regulation because this is the time where water breaks, wandering, side-interference and slow return behavior accumulate

## 2. PRINCIPLE

Ready & Set records time accurately, but the child-facing Focus UI does not need to expose every metric with equal prominence.

Hard candidate:
`TIME MUST BE RECORDED ACCURATELY ≠ EVERY TIME METRIC MUST BE PROMINENT`
`FOCUS SCREEN = TASK FIRST, TIME SUPPORTING`
`LIVE ELAPSED FOCUS TIME = LOW SALIENCE`
`ISSUE TIME = SELF-REGULATION SIGNAL, NOT HIDDEN HISTORY`

ISSUE time is not a punishment or score deduction.
It is a neutral feedback gauge that helps the child notice how long a short pause actually became.

## 3. PROPOSED VISUAL PRIORITY

### Primary
1. current task / current Lap identity
2. main analog clock / focus state
3. remaining time or target-relative progress
4. primary actions: pause / complete / help

### Secondary
- target time
- current BGM state
- ISSUE / pause accumulated time
- specialist app routing when relevant

### Tertiary / low-salience
- live elapsed focus time
- exact start clock time

These tertiary values remain recorded and may be shown in:
- result/report
- history
- parent/admin detail
- optional detail reveal on Focus if explicitly opened

## 4. CHILD-FACING FOCUS TIME RULE

Recommended default:
- `남은 시간` remains the dominant live digital metric
- `목표 시간` remains compact secondary reference
- `집중 시간 / 경과 시간` should not use a visually competing live counter
- `ISSUE/멈춤 누적 시간` remains visible in the Focus status strip at a readable but non-dominant size

Candidate time hierarchy:
`REMAINING = LARGE`
`TARGET = SMALL REFERENCE`
`ISSUE = SMALL BUT CLEAR / ACTIONABLE FEEDBACK`
`FOCUS ELAPSED = TINY / MUTED OR RESULT-ONLY`
`START CLOCK = TINY / OPTIONAL`

The second supplied Focus reference is closer to the desired density because it keeps a compact bottom strip for `시작 시간 / 집중 시간 / ISSUE 시간` while preserving one dominant remaining-time display.

## 5. ISSUE SELF-REGULATION LOOP

During an explicit pause:
- pause timer becomes directly visible as the active time signal
- Guide may use a low-pressure line such as `잠깐 쉬는 중 · 01:20`
- if the pause continues, do not shame or nag continuously

On return:
- briefly surface `이번 멈춤` and/or `누적 ISSUE` so the child can notice the cost of the break
- then immediately restore Focus hierarchy

Example:
`이번 멈춤 02:40 · 오늘 ISSUE 04:10`
then fade back to compact `ISSUE 04:10`.

Potential later intervention rule:
- if an ISSUE interval or cumulative ISSUE becomes unusually long relative to the session, Guide may make one neutral re-entry prompt
- no punitive language, no public comparison, no score penalty by default

Hard candidate:
`ISSUE FEEDBACK = NOTICE → RETURN, NOT SHAME → PUNISH`

## 6. SCREEN DENSITY RULE

Avoid presenting many independent time readouts at equal weight.

Candidate:
`ONE DOMINANT LIVE TIME + ONE COMPACT TARGET + ONE CLEAR ISSUE SIGNAL + DE-EMPHASIZED HISTORY METRICS`

The analog clock may remain large because it supports the established visual identity, but supporting digital metrics should be restrained.

## 7. GUIDE RELATION

During Focus:
- Guide uses `P0 DEEP_HIDE` or low `P1 AMBIENT_PEEK`
- help remains discoverable
- Guide does not call attention to elapsed focus time unless the child explicitly asks
- Guide may briefly surface ISSUE time when returning from a pause because it supports self-regulation

## 8. IMPLEMENTATION GATE

Do not change this alone in another Preview.
Batch with:
- primary action reachability
- Guide habitat / presence intensity
- speech-bubble quick choices
- no-scroll primary child flow
- normalized swipe navigation

`FOCUS INFO HIERARCHY + ISSUE SELF-REGULATION + VIEWPORT + GUIDE + SWIPE → ONE STAGING UX BATCH → ONE PREVIEW`

END — READY FOCUS INFORMATION HIERARCHY DELTA 2026-09-08
