# TAKY Mobile Codex Task Queue

This directory is the durable handoff queue from mobile ChatGPT/TAKY to the office-PC Codex runner.

## Contract

Each task is a UTF-8 JSON file named with a unique task id.

Required fields:

```json
{
  "id": "2026-09-11-ready-manual-learning-record-v1",
  "action": "codex",
  "app": "ready",
  "title": "Short task title",
  "prompt": "Bounded implementation request",
  "allow_main": false,
  "allow_production": false
}
```

Allowed `app` values are `ready`, `hide`, and `snap`.

## Safety

- Queue runner only operates when the local repository is already on the configured isolated work branch.
- Dirty worktrees, wrong branches, non-fast-forward pulls, missing Codex, and failed pushes block the task instead of forcing through.
- Codex is instructed not to switch branches, deploy, release, read secrets, commit, or push.
- Gateway performs the final commit/push only to the configured isolated branch.
- `main`, production deploy/release, force push, and destructive promotion are outside this queue contract and still require explicit human approval.
- A task id is processed once per PC ledger. Re-run requires a new task id.

## Mobile workflow

1. ChatGPT writes a bounded task JSON here on `mobile-dev-gateway-2026-09-10`.
2. PC queue watcher pulls this branch and detects the new task.
3. It verifies the target app workspace and isolated branch.
4. It runs PC Codex, then commits/pushes only if Codex exits successfully and produced changes.
5. ChatGPT verifies the resulting app-branch commit and automated checks.
6. iPhone is used only for behavior that cannot be proven statically/automatically.
7. Main/production remains untouched until explicit promotion approval.
