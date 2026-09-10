# TAKY Mobile Dev Gateway

Purpose: make mobile ChatGPT the working console while the office PC acts as an unattended test host.

Flow:

`Mobile ChatGPT -> GitHub isolated work branches -> office PC mirror -> local servers -> Cloudflare Quick Tunnels -> iPhone browser -> explicit approval -> main promotion`

## Safety boundary

- This gateway NEVER writes to `main`.
- It only downloads the configured isolated branches.
- It uses a separate mirror under `MOBILE_DEV_GATEWAY/runtime/apps` and does not overwrite `D:\Git PWA` working folders.
- Main promotion remains a separate explicit approval step through ChatGPT/GitHub.
- Quick Tunnel URLs remain temporary. If the gateway/tunnel process restarts, the URLs change.

## Current app mapping

- Ready & Set: `Ready-Set / runtime-session-bridge-2026-09-10 / 4171`
- Hide & Seek: `Hide-Seek / runtime-session-bridge-2026-09-10 / 4172`
- Snap & Pop: `Snap-Pop / runtime-session-bridge-2026-09-10 / 4173`
- Gateway control page: `4170`

## One-time PC setup

1. On the office PC, switch `TAKY-WORK-OS` to branch `mobile-dev-gateway-2026-09-10` and Pull.
2. Confirm Python and `cloudflared` are installed.
3. Double-click `MOBILE_DEV_GATEWAY\START_MOBILE_GATEWAY.bat`.
4. Keep that one CMD window open. The controller starts the three app servers and four tunnel processes in the background.
5. Wait until `=== MOBILE CONTROL URL ===` appears.
6. Open that single URL on the iPhone. The page shows Ready, Hide and Snap links and `Sync latest branch` buttons.

## Normal mobile workflow

1. In mobile ChatGPT, request a change on the isolated work branch.
2. ChatGPT updates GitHub work branch only.
3. The PC gateway syncs automatically every 5 minutes, or tap `Sync all now` from the mobile gateway page for immediate pickup.
4. Test on the iPhone.
5. Request corrections in ChatGPT and repeat.
6. Only after validation, explicitly request `main에 반영해줘` (or the applicable TAKY durable reflection command). Main does not change automatically.

## Notes

- The gateway generates a Ready cross-app test link containing the current Hide/Snap tunnel URLs as `hide_target` and `snap_target` query parameters.
- Ready must support those explicit test-only URL overrides before the cross-app button can use the current Quick Tunnel addresses. Until that bridge patch is in place, the three app links still work independently.
- Closing the gateway CMD, rebooting the PC, losing internet, or entering sleep mode ends the current Quick Tunnels.
- For permanent fixed hostnames, move later to a Named Cloudflare Tunnel with a managed domain.
