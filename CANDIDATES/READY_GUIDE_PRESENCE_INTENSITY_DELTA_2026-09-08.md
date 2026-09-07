# READY & SET — GUIDE PRESENCE INTENSITY DELTA

Status: CANDIDATE / UX BEHAVIOR DELTA / NO PRODUCTION CHANGE
Date: 2026-09-08
Depends on: `READY_GUIDE_CONTEXTUAL_UI_DELTA_2026-09-08.md`

## 1. USER DIRECTION

The Guide should not have the same visibility in every Ready & Set state.

- During Focus, the Guide should hide more and reduce visual/motion interruption.
- During ordinary/Base Camp/setup states, the Guide should keep a light ambient presence so the child can discover and request help.
- Hidden must not mean unavailable.

## 2. PRESENCE LEVELS

`P0 DEEP_HIDE`
- almost completely behind a safe UI anchor
- only a tiny ear/eye/hand/edge cue may remain
- no autonomous movement
- still tappable through a small stable help affordance

`P1 AMBIENT_PEEK`
- small partial character visible behind clock/card/panel/edge
- occasional low-frequency peek
- no blocking bubble unless context or child requests it

`P2 TALK_READY`
- clearer peek + small speech bubble
- used for setup, choice, pause, return, unresolved state

`P3 ACTIVE_GUIDE`
- slide-in/full support only when a real explanation/help escalation is needed

## 3. CONTEXT ROUTING

### Focus mode
Default: `P0 DEEP_HIDE` or low `P1 AMBIENT_PEEK`.

- Guide may hide behind the clock or focus panel.
- movement frequency is near-zero while the child is actively concentrating.
- no random celebration/peek motion during uninterrupted focus.
- a stable small visual cue remains discoverable for help.

Hard candidate:
`FOCUS = LOW PRESENCE / HIGH AVAILABILITY`

### Home / Base Camp / Today / Plan
Default: `P1 AMBIENT_PEEK`.

- Guide has a little more visible presence.
- safe-habitat position can vary semi-randomly.
- child can tap the visible fragment/anchor to ask for help or open quick dialogue.

### Setup / Pause / Return / Wrap-up
Default: `P2 TALK_READY` when interaction is needed.

- Guide asks only the necessary short question.
- after resolution, returns to P1 or P0 depending on context.

### Blocked / Help request
Escalate from `P1/P0 → P2 → P3` only as needed.

### Completion
Brief `P2/CELEBRATE`, then return to P1 or hide.

## 4. HELP DISCOVERABILITY

The child must always be able to summon the Guide without opening Settings.

Candidate interaction:
- tap the visible ear/hand/face fragment, or a consistent small Guide anchor
- optional long-press/voice path later
- the anchor position may change between screens, but the interaction meaning must remain consistent

Hard candidate:
`GUIDE HIDDEN ≠ HELP HIDDEN`
`GUIDE PRESENCE CAN MOVE; HELP ACCESS MUST REMAIN DISCOVERABLE`

Do not use an always-floating large help button that destroys the habitat/Peekaboo illusion.

## 5. RANDOMNESS

Random habitat selection is reduced as focus intensity increases.

Suggested weighting:
- Focus: mostly same anchor / minimal random changes
- Home/Base Camp: moderate safe-anchor variation
- Pause/Return: moderate playful variation
- Completion: highest allowed variation, still brief

`FOCUS INTENSITY ↑ → GUIDE MOTION/RANDOMNESS ↓`
`NEED FOR SUPPORT ↑ → GUIDE CLARITY/PRESENCE ↑`

## 6. IMPLEMENTATION

Integrate with the shared Guide appearance state machine, not one-off animations.

`GUIDE_CONTEXT = HOME | PLAN | FOCUS | PAUSE | RETURN | WRAP | BLOCKED | COMPLETE`
`PRESENCE = P0 | P1 | P2 | P3`
`ANCHOR = SAFE UI HABITAT`

Next staging batch should combine this with:
- Peekaboo/UI-habitat Guide
- speech-bubble quick choices
- Ready primary-flow no-scroll restoration
- normalized horizontal swipe/navigation

END — READY GUIDE PRESENCE INTENSITY DELTA 2026-09-08
