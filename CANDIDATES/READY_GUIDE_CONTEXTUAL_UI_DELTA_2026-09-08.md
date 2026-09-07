# READY & SET — GUIDE CONTEXTUAL UI DELTA

Status: CANDIDATE / UX DELTA / NO PRODUCTION CHANGE
Date: 2026-09-08
Scope: Guide appearance, speech-bubble actions, popup/bottom-sheet reduction, settings information architecture

## 0. USER FEEDBACK / TRIGGER

Actual iPhone Preview review showed that one action often opens another selection surface, making the flow feel step-heavy.
User requested that the previously discussed Guide appearance pattern and speech-bubble choices be restored to the interaction model.

## 1. PRESERVE — PRIOR GUIDE PATTERN

Ready & Set Guide is a companion, not the protagonist.
Preferred Ready-specific appearance pattern:

`PEEK → TALK → GUIDE → HIDE`

- PEEK: Guide appears partially from the screen edge (head/ear/eyes/hand/shoulder etc.), not as a large blocking character.
- TALK: tap or contextual need opens a small speech bubble.
- GUIDE: only when more explanation is needed, expand to a larger explanation surface.
- HIDE: after selection/resolution, Guide retreats and the child stays in the current task/session.

Hard:
- USER = protagonist
- GUIDE = companion
- Guide must not permanently occupy the main content area.
- Onboarding must stay short, offer `나중에 하기`, and must not block starting today's task.

## 2. ADOPT — SPEECH BUBBLE FIRST

For common, low-complexity choices, prefer in-context Guide speech bubbles over full bottom sheets or sequential modal stacks.

`CONTEXT → PEEK → BUBBLE → 2~3 PRIMARY CHOICES → CONTINUE`

Use `더보기` only when necessary.
Use `나중에` where deferral is safe.

A full Bottom Sheet / Modal is reserved for:
- multi-select with many options
- complex data entry
- permission/security confirmation
- destructive action
- content that cannot fit safely in a compact bubble

Hard candidate:
`SIMPLE CHOICE ≠ FULL SHEET REQUIRED`
`ONE ACTION SHOULD NOT CREATE UNNECESSARY SECOND/THIRD CHOICE LAYERS`

## 3. READY FLOW EXAMPLES

### Focus BGM
Current: `음악 → full sound sheet → sound → 선택 완료`
Candidate:
- tap `음악`
- Guide peeks from side
- bubble: `오늘은 뭐 들을까?`
- quick choices: current favorite / `essential;` / `OFF`
- `더보기` opens full sound list only if needed
- selecting a sound immediately applies and closes the bubble

### Pause
Current pause reason sheet is functional but visually heavy for a short interruption.
Candidate first layer:
- Guide peeks: `잠깐 멈출까?`
- bubble quick choices based on common use: `화장실` / `물·간식` / `도움 필요`
- `다른 이유` opens the full reason sheet
- `바로 다시 시작` remains one tap

### Wrap-up / unresolved task
Instead of showing every task with five state buttons at once:
- Guide asks one unresolved task at a time
- bubble: `재능·수학은 어떻게 됐어?`
- choices: `다 했어` / `조금 남았어` / `다음에` / `도움 필요`
- then move only to the next unresolved task
- do not re-ask already known states

### Recording
Preserve previously defined short Guide intro before entering the recording event.
The Guide should explain the transition with a short bubble/voice line, then yield the turn to the child.

## 4. SETTINGS INFORMATION ARCHITECTURE

### Guide settings
Guide settings should contain only Guide-related controls:
- Guide character/type
- Guide name / name recommendation
- Guide voice
- optional personality presentation controls already governed by the Guide Master

### Focus Sound
Focus Sound is NOT Guide configuration.
It is a Ready session/environment preference.

Ownership:
`FOCUS SOUND = READY SESSION/ENVIRONMENT`

Access:
- primary: Focus screen `음악`
- secondary/default preference: general app settings under `집중 환경` or equivalent
- not visually nested as if it belongs to the Guide

The sound selection is genuinely linked to Ready runtime session state: selected sound is stored as the current/default sound and copied into the active session; pause/resume logic controls the active BGM.

### Data export/reset
`기록 JSON 내보내기` is useful as a recovery/backup/diagnostic utility, but it is NOT a Guide setting and should not sit in the child-facing Guide flow.

Candidate placement:
- `설정 → 데이터/백업` or parent/admin/system area
- visually collapsed/secondary
- destructive `모든 로컬 데이터 초기화` must remain separated and guarded

Status:
`DATA EXPORT FUNCTION = PRESERVE`
`DATA EXPORT UNDER GUIDE-ASSOCIATED FLOW = ADJUST`

## 5. DEVICE EVIDENCE 2026-09-08

Observed on actual iPhone Ready Preview:
- Preview boot works after Netlify Team SSO.
- `essential;` appears in both Focus sound chooser and Settings.
- `essential;` actual audio playback works.
- explicit `잠깐 멈춤` pauses the music.
- after returning to Focus, UI reports `essential; · 재생 중`.
- staging version text is visible: `APP VERSION 0.9.3-rc2 · MASTER REV_07 ... STAGING`.

## 6. CLASSIFICATION

- Guide PEEK/TALK/GUIDE/HIDE pattern: PRESERVE / RESTORE
- Guide speech-bubble quick actions: ADOPT
- full modal/sheet for simple choices: ADJUST / REDUCE
- one unresolved task at a time during wrap-up: ADOPT
- Focus Sound runtime integration: PRESERVE
- Focus Sound located under Guide-associated settings flow: ADJUST
- JSON export function: PRESERVE
- JSON export child-facing prominence: ADJUST
- destructive reset: PRESERVE FUNCTION / ADD GUARD

## 7. IMPLEMENTATION RULE

Do not patch this piecemeal into Production.

`UX DELTA → SOURCE/MASTER REVIEW → BATCH IMPLEMENT ON STAGING → ONE PREVIEW → DEVICE VALIDATE → PROMOTE`

END — READY GUIDE CONTEXTUAL UI DELTA 2026-09-08
