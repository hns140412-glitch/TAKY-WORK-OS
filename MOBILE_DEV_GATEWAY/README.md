# TAKY Mobile Dev Gateway

## Purpose

Mobile ChatGPT is the command/approval surface. The office PC is the execution/test host. GitHub isolated work branches are the development boundary. iPhone/browser is the final device check when automated evidence cannot prove behavior.

Normal path:

`Mobile ChatGPT -> GitHub task/work branch -> office-PC Codex + local test host -> Cloudflare tunnel -> iPhone -> explicit approval -> main`

Main/production promotion is never performed by this gateway.

## Current app test mirrors

- Ready & Set: `Ready-Set / runtime-session-bridge-2026-09-10 / 4171`
- Hide & Seek: `Hide-Seek / runtime-session-bridge-2026-09-10 / 4172`
- Snap & Pop: `Snap-Pop / runtime-session-bridge-2026-09-10 / 4173`
- Gateway control page: `4170`

The existing test mirror continues to download configured isolated branches into `MOBILE_DEV_GATEWAY/runtime/apps`. It does not overwrite normal app folders.

## PC Codex queue

`codex_queue_runner.py` adds the durable mobile-to-PC execution bridge.

ChatGPT writes a bounded JSON task into `MOBILE_DEV_GATEWAY/tasks/` on this gateway branch. The PC watcher pulls the gateway branch every 30 seconds, verifies the target local app repository is clean and already on the configured isolated work branch, invokes the PC-installed Codex CLI, then commits/pushes successful changes only to that same isolated branch.

Default local workspaces:

- Ready: `D:\Git PWA\Ready-Set`
- Hide: `D:\Git PWA\Hide-Seek`
- Snap: `D:\Git PWA\Snap-Pop`

Optional environment overrides:

- `TAKY_READY_WORKSPACE`
- `TAKY_HIDE_WORKSPACE`
- `TAKY_SNAP_WORKSPACE`

The queue blocks instead of forcing through when the worktree is dirty, the branch is wrong, pull is non-fast-forward, Codex is missing, or push fails. It never switches an app repository to main.

Direct public HTTP Codex execution is disabled by configuration. The Cloudflare-exposed gateway remains a test/sync surface; code execution is driven by authenticated GitHub write access to the task queue, not by an anonymous web form.

## Start

On the office PC, with `TAKY-WORK-OS` checked out to `mobile-dev-gateway-2026-09-10` and clean:

1. Fetch/Pull latest once.
2. Run `MOBILE_DEV_GATEWAY\START_MOBILE_GATEWAY.bat`.
3. Keep the gateway and `TAKY Codex Queue` consoles open.
4. The console prints a single Mobile Control URL after Cloudflare Quick Tunnels are ready.

After this one-time update, normal mobile work does not require manually typing code on the PC. ChatGPT can queue bounded work through GitHub; the PC watcher detects it automatically.

## Stop

Run `STOP_MOBILE_GATEWAY.bat`. It writes the shared runtime stop signal. The gateway and Codex queue exit cleanly after the current bounded step. Close any remaining tunnel console if Windows leaves one open.

## Queue task contract

See `MOBILE_DEV_GATEWAY/tasks/README.md`.

The first queued Ready task added with this bridge is `2026-09-11-ready-manual-learning-record-v1`: support child/parent post-hoc homework progress facts when Ready was not used during the actual work, without inventing session time or duplicating session ownership.

## Safety boundary

- Work branch only.
- No automatic main merge.
- No production deploy/release.
- No force push.
- No secret retrieval/exposure.
- No paid image generation.
- Dirty local workspace => block.
- Wrong branch => block.
- Codex failure => no commit/push.
- Device confirmation only after static/automated checks are exhausted.
