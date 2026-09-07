# READY & SET — FOCUS UI CONFIRMED REFERENCE

Status: CONFIRMED VISUAL DIRECTION / IMPLEMENTATION CANDIDATE / NO PRODUCTION CHANGE
Date: 2026-09-08
Scope: Ready & Set Focus runtime screen

## 1. CONFIRMED VISUAL DIRECTION

The latest visual mockup is a DESIGN REFERENCE, not proof of implementation.

Confirmed layout direction:
- main headline: `그냥! 지금 하면 돼!`
- selected task shown directly below the headline
- analog clock is the central visual hero and is larger than the current runtime clock
- analog clock represents actual current local time and must visibly run in real time
- `Ready & Set` branding may remain inside the clock face in the previously approved compact style
- top-right music-note button is the only BGM change control in Focus
- bottom panel shows current selected task + currently playing BGM state
- remove duplicate bottom BGM-change button
- remaining time remains primary digital timer
- target time remains secondary
- start/focus/ISSUE values remain small at the bottom, with ISSUE readable for self-regulation
- `FOCUS MODE` label is removed

## 2. IOS SAFE-AREA / STATUS-BAR CONTRACT

The mockup may visually show status-bar items for presentation, but the actual PWA MUST NOT draw fake iOS status information.

Do not render application-owned:
- clock in the iOS status-bar position
- cellular bars
- Wi-Fi symbol
- battery percentage/icon
- fake notch / fake Dynamic Island

Actual implementation:
- respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`
- keep the top notch/Dynamic-Island/status-bar region free of essential app controls
- top-right BGM button must sit inside the app-safe content area, below/clear of the device status-bar exclusion zone
- essential text/actions must not be clipped by Dynamic Island/notch/home indicator
- use `100dvh` with safe-area-aware layout

Hard:
`MOCKUP STATUS BAR ≠ APP UI`
`DEVICE STATUS AREA = RESERVED`
`NO ESSENTIAL CONTROL UNDER NOTCH / DYNAMIC ISLAND`

## 3. VIEWPORT / SCROLL

Primary Focus actions must be reachable without vertical scrolling:
- current task
- BGM quick change entry
- remaining / target time
- pause
- complete
- ISSUE visibility

Settings/history/data screens may scroll when needed.

Hard:
`FOCUS PRIMARY ACTIONS ≠ SCROLL TO FIND`

## 4. BGM OWNERSHIP

Focus top-right `♪` button = BGM quick change.

Bottom panel = state display only:
- selected task
- current BGM
- playback state

`ONE FUNCTION = ONE PRIMARY CONTROL`

Full BGM order management may be opened from the top-right music control via `더보기`, with drag/reorder of favorite tiles.

## 5. IMPLEMENTATION EVIDENCE RULE

This file confirms UX direction only.

Do not claim implementation until:
`STAGING CODE → DEPLOY PREVIEW → IPHONE ACTUAL RESULT`

END — READY FOCUS UI CONFIRMED REFERENCE 2026-09-08
