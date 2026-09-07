# READY & SET — GUIDE CONTEXTUAL UI DELTA

Status: CANDIDATE / UX DELTA / NO PRODUCTION CHANGE
Date: 2026-09-08
Scope: Guide appearance, speech-bubble actions, popup/bottom-sheet reduction, settings information architecture

## 0. USER FEEDBACK / TRIGGER

Actual iPhone Preview review showed that one action often opens another selection surface, making the flow feel step-heavy.
User requested that the previously discussed Guide appearance pattern and speech-bubble choices be restored to the interaction model.
User additionally clarified the intended visual family as including a `Peekaboo / 빼꼼` style and a prior concept in which the Guide randomly hides behind existing UI objects such as the clock, cards, panels or screen edges and peeks out from them.

Source status for the exact random-occlusion rule:
- prior concept recovered from user correction / current conversation
- not yet located as an explicit sentence in the currently recovered formal Ready MASTER
- therefore treat as `RECOVERED IDEA / ADOPT CANDIDATE`, not as already-proven historical HARD LOCK

## 1. PRESERVE — PRIOR GUIDE PATTERN

Ready & Set Guide is a companion, not the protagonist.
Preferred Ready-specific appearance pattern:

`PEEK → TALK → GUIDE → HIDE`

- PEEK: Guide appears partially from the screen edge or from behind an existing UI object, not as a large blocking character.
- TALK: tap or contextual need opens a small speech bubble.
- GUIDE: only when more explanation is needed, expand to a larger explanation surface.
- HIDE: after selection/resolution, Guide retreats behind the same or another safe UI anchor and the child stays in the current task/session.

Hard:
- USER = protagonist
- GUIDE = companion
- Guide must not permanently occupy the main content area.
- Onboarding must stay short, offer `나중에 하기`, and must not block starting today's task.

## 2. GUIDE APPEARANCE STYLE TAXONOMY

The Guide should not have one fixed entrance animation for every situation. Use a small controlled family of appearances selected by context.

### A. Peekaboo / Edge Peek — PRIMARY
Korean working description: `빼꼼 등장`.

- character is mostly outside the viewport or hidden behind a UI object
- only part of the face/head/ear/hand/shoulder becomes visible
- ideal for low-interruption hints, quick choices, encouragement and noticing
- may retreat automatically after the child responds

This is the default Ready & Set Guide appearance.

### B. UI-Occlusion Peek / Habitat Hide — RECOVERED IDEA
Korean working description: `UI 뒤에 숨어있기 / UI에 사는 길잡이`.

The Guide can use existing screen objects as a visual hiding place, so it feels like the character lives inside the Ready & Set interface rather than being pasted on top of it.

Candidate hiding anchors:
- behind the large Focus clock
- behind the mission/goal card
- behind the bottom focus panel
- behind a card edge or section boundary
- behind the left/right screen edge
- behind a corner or safe-area-adjacent decorative layer

Typical states:
- only ears/eyes/head top visible behind the clock
- one hand holding the edge of a card
- face peeking from behind a panel
- character briefly moving from one safe hiding anchor to another
- speech bubble appears while the body remains mostly occluded

### C. Controlled Random Habitat Selection
The hiding place may vary semi-randomly so the Guide feels alive, but randomness must be constrained by UI safety.

`AVAILABLE_SAFE_ANCHORS → FILTER BY CURRENT SCREEN/STATE → AVOID LAST N ANCHORS → WEIGHTED RANDOM PICK → PEEK → TALK → HIDE`

Randomness rules:
- never cover the timer numerals, current task, primary CTA, REC control, pause/end controls or important status text
- do not appear under the user's finger target immediately before a tap
- do not jump continuously between anchors
- avoid repeating the same anchor too often
- use context weights rather than pure random
- during intense Focus, reduce movement/frequency
- during pause, return, completion or light setup, playful randomness may increase
- respect Reduced Motion / accessibility preference when available

Hard candidate:
`RANDOM ≠ UNCONTROLLED`
`GUIDE HABITAT MAY VARY; LEARNING CONTROL POSITIONS MUST NOT`
`GUIDE CAN HIDE BEHIND UI; GUIDE MUST NOT HIDE IMPORTANT UI`

### D. Corner Peek
- a smaller variation of Peekaboo from a lower/upper corner
- useful when the side edge is occupied by task/timer controls
- should not cover core timer, task-state or action buttons

### E. Bubble-first Peek
- speech bubble appears with only a very small character fragment/avatar anchor
- used when the message/choice matters more than showing the character
- best for very quick binary/ternary choices

### F. Slide-in Companion
- Guide moves slightly farther into the screen than Peekaboo, but does not take over the page
- used when the child needs a little more explanation or emotional support
- should still preserve the current task context behind it

### G. Full Guide / Expanded Help — EXCEPTION
- larger Guide surface or expanded explanation panel
- only when a short bubble cannot safely explain the issue
- examples: permission explanation, multi-step recovery, parent/help escalation
- closes back to the same task/session context

### H. Celebration Pop / Return Peek
- brief playful appearance after completion or successful recovery
- may use a different safe hiding anchor than before to create a small surprise
- should acknowledge the child, then quickly yield the screen back to the result or next action
- must not become a blocking reward sequence

### Context routing

`LOW INTERRUPTION → UI-OCCLUSION PEEK / EDGE PEEK / BUBBLE-FIRST`
`SHORT EXPLANATION → SLIDE-IN COMPANION`
`COMPLEX HELP → FULL GUIDE`
`SUCCESS / RETURN → CELEBRATION POP OR RETURN PEEK`

Hard candidate:
`GUIDE APPEARANCE INTENSITY SHOULD MATCH CONTEXT INTENSITY`
`GUIDE MUST NOT BLOCK CORE LEARNING CONTROLS`
`PEEKABOO = DEFAULT, FULL GUIDE = EXCEPTION`

## 3. ADOPT — SPEECH BUBBLE FIRST

For common, low-complexity choices, prefer in-context Guide speech bubbles over full bottom sheets or sequential modal stacks.

`CONTEXT → SAFE HIDING ANCHOR → PEEK → BUBBLE → 2~3 PRIMARY CHOICES → CONTINUE → HIDE`

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

## 4. READY FLOW EXAMPLES

### Focus BGM
Current: `음악 → full sound sheet → sound → 선택 완료`
Candidate:
- tap `음악`
- Guide peeks from behind the clock edge / focus panel / screen edge depending on a safe weighted-random anchor
- bubble: `오늘은 뭐 들을까?`
- quick choices: current favorite / `essential;` / `OFF`
- `더보기` opens full sound list only if needed
- selecting a sound immediately applies and the Guide retreats

### Pause
Current pause reason sheet is functional but visually heavy for a short interruption.
Candidate first layer:
- Guide peeks from behind a nearby card/panel: `잠깐 멈출까?`
- bubble quick choices based on common use: `화장실` / `물·간식` / `도움 필요`
- `다른 이유` opens the full reason sheet
- `바로 다시 시작` remains one tap

### Wrap-up / unresolved task
Instead of showing every task with five state buttons at once:
- Guide asks one unresolved task at a time
- may peek from behind the result/wrap-up card rather than occupy the entire surface
- bubble: `재능·수학은 어떻게 됐어?`
- choices: `다 했어` / `조금 남았어` / `다음에` / `도움 필요`
- then move only to the next unresolved task
- do not re-ask already known states

### Recording
Preserve previously defined short Guide intro before entering the recording event.
The Guide should explain the transition with a short Peek/Bubble or voice line, then yield the turn to the child.

### Help / Blocked state
- first use Bubble-first Peek: `어디서 막혔어?`
- quick choice if possible
- only escalate to Slide-in Companion / Full Guide when the answer requires explanation or parent help

## 5. SETTINGS INFORMATION ARCHITECTURE

### Guide settings
Guide settings should contain only Guide-related controls:
- Guide character/type
- Guide name / name recommendation
- Guide voice
- optional personality presentation controls already governed by the Guide Master

Possible controlled Guide appearance preference later, if user-facing control is needed:
- `자동` (context/random habitat engine)
- `조용히` (lower appearance frequency)
- `자주` (slightly more playful frequency)

Do not expose technical anchor selection to the child.

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

## 6. DEVICE EVIDENCE 2026-09-08

Observed on actual iPhone Ready Preview:
- Preview boot works after Netlify Team SSO.
- `essential;` appears in both Focus sound chooser and Settings.
- `essential;` actual audio playback works.
- explicit `잠깐 멈춤` pauses the music.
- after returning to Focus, UI reports `essential; · 재생 중`.
- staging version text is visible: `APP VERSION 0.9.3-rc2 · MASTER REV_07 ... STAGING`.

## 7. CLASSIFICATION

- Guide `PEEK → TALK → GUIDE → HIDE` pattern: PRESERVE / RESTORE
- Peekaboo / Edge Peek as default Guide appearance: ADOPT / HARD-CANDIDATE
- random/semi-random hiding behind clock/cards/panels/UI: RECOVERED IDEA / ADOPT CANDIDATE
- safe-anchor weighted randomness: ADOPT
- uncontrolled random movement or blocking important UI: REJECT
- Corner Peek / Bubble-first Peek / Slide-in Companion / Full Guide context variants: ADOPT
- Full Guide for every interaction: REJECT
- Guide speech-bubble quick actions: ADOPT
- full modal/sheet for simple choices: ADJUST / REDUCE
- one unresolved task at a time during wrap-up: ADOPT
- Focus Sound runtime integration: PRESERVE
- Focus Sound located under Guide-associated settings flow: ADJUST
- JSON export function: PRESERVE
- JSON export child-facing prominence: ADJUST
- destructive reset: PRESERVE FUNCTION / ADD GUARD

## 8. IMPLEMENTATION RULE

Do not patch this piecemeal into Production.

`UX DELTA → SOURCE/MASTER REVIEW → BATCH IMPLEMENT ON STAGING → ONE PREVIEW → DEVICE VALIDATE → PROMOTE`

The appearance-style family should be implemented as one reusable Guide appearance component/state machine rather than separate ad-hoc animations per screen.

Recommended internal model:

`GUIDE_STATE = HIDDEN | PEEK | BUBBLE | SLIDE_IN | FULL | CELEBRATE`

`GUIDE_ANCHOR = CLOCK_BACK | CARD_EDGE | PANEL_BACK | SCREEN_LEFT | SCREEN_RIGHT | CORNER | CONTEXTUAL_SAFE_ANCHOR`

`ANCHOR PICK = STATE FILTER + OCCLUSION SAFETY + RECENCY AVOIDANCE + CONTEXT WEIGHT + RANDOMNESS`

END — READY GUIDE CONTEXTUAL UI DELTA 2026-09-08
