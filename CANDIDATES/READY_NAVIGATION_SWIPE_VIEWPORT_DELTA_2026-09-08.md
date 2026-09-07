# READY & SET — NAVIGATION / SWIPE / VIEWPORT DELTA

Status: CANDIDATE / RECOVERY + CURRENT-RUNTIME GAP / NO PRODUCTION CHANGE
Date: 2026-09-08

## 1. RECOVERED PRIOR RULES

Recovered prior handoff states:
- mobile principle: `100dvh + safe-area`
- basic flow: `세로 스크롤 없이`

Recovered visual references also show a Ready & Set horizontal swipe family:
- `TODAY → TIMER → WEEK`
- explicit `SWIPE →` transitions between the screens
- a board labeled `Ready & Set 원형 스와이프 UI`

Source status:
- `NO VERTICAL SCROLL IN BASIC FLOW` = recovered prior operational rule
- `TODAY/TIMER/WEEK SWIPE` = recovered visual/interaction reference
- exact Planner production mapping remains to be normalized against the current REV_07 Base Camp/Planner semantics

## 2. CURRENT STAGING IMPLEMENTATION RESULT

Current Ready `staging` source uses separate views:
`HOME / MISSION / FOCUS / RECORDING / RESULT / HISTORY / CALENDAR / PROFILE / SETTINGS`

No current Planner swipe surface or swipe gesture handler was found in the inspected staging runtime.

Current CSS uses `min-height:100dvh`, but does not globally prevent vertical document overflow.
Several pages are intentionally marked with `.scroll` containers/content and actual iPhone Preview evidence shows vertical scrolling in Settings.

Classification:
- Planner / Today-Timer-Week horizontal swipe = NOT IMPLEMENTED IN CURRENT PREVIEW
- basic child flow no-vertical-scroll rule = CURRENT RUNTIME DRIFT / ADJUST REQUIRED
- long Settings/admin/data screens = may use controlled sub-navigation or contained scroll only when unavoidable; they must not force scrolling into the primary child execution flow

## 3. TARGET VIEWPORT CONTRACT

Primary child flow screens should fit within one safe viewport whenever practical:
- Home / Base Camp
- Today / Plan
- Focus Timer
- Week / Progress
- Pause quick action
- Guide quick choices
- Wrap-up one-question-at-a-time

Hard candidate:
`PRIMARY CHILD FLOW = 100dvh SAFE VIEWPORT`
`PRIMARY CHILD FLOW ≠ VERTICAL DOCUMENT SCROLL`

Do not solve overflow by shrinking text below accessible size.
Use progressive disclosure, horizontal swipe, tabs, compact Guide bubbles or separate subviews.

Secondary/utility surfaces such as history detail, parent/admin backup, long diagnostics may use contained vertical scroll if content cannot reasonably fit one viewport.

## 4. HORIZONTAL SWIPE CONTRACT

Candidate normalized navigation:
`TODAY / PLAN ↔ FOCUS / TIMER ↔ WEEK / PROGRESS`

- horizontal swipe changes adjacent primary surfaces
- button/tab navigation remains as accessible fallback
- gesture must not collide with horizontal controls/cards
- active focus session must not be paused or ended by a swipe
- swipe navigation never changes task/lap state by itself
- Planner data identity follows REV_07 semantics: schedule commitment ≠ homework template ≠ dated todo instance ≠ progress event

The exact naming and whether Home/Base Camp participates in the swipe carousel remains REVIEW_REQUIRED before project MASTER promotion.

## 5. IMPLEMENTATION GATE

Do not add this piecemeal to the current Preview.
Batch with the contextual Guide UX work:
`VIEWPORT CONTRACT + SWIPE NAV + GUIDE HABITAT + SPEECH-BUBBLE QUICK ACTIONS → STAGING BATCH → ONE PREVIEW → DEVICE VALIDATION`

END — READY NAVIGATION / SWIPE / VIEWPORT DELTA 2026-09-08
