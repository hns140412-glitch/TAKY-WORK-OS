from __future__ import annotations

import json
import os
import subprocess
import threading
import time
from pathlib import Path

from tool_resolver import resolve_codex, resolve_git

BASE = Path(__file__).resolve().parent
REPO_ROOT = BASE.parent
RUNTIME = BASE / "runtime"
TASKS_DIR = BASE / "tasks"
LEDGER = RUNTIME / "codex_queue_ledger.json"
LOG_DIR = RUNTIME / "logs"
STOP_FILE = RUNTIME / "STOP"
CONFIG = json.loads((BASE / "config.json").read_text(encoding="utf-8"))
CODEX = CONFIG.get("codex", {})
INTERVAL = int(CODEX.get("queue_poll_seconds", 30))
TIMEOUT = int(CODEX.get("timeout_seconds", 900))
CODEX_COMMAND = str(CODEX.get("command", "codex"))

DEFAULT_WORKSPACES = {
    "ready": r"D:\Git PWA\Ready-Set",
    "hide": r"D:\Git PWA\Hide-Seek",
    "snap": r"D:\Git PWA\Snap-Pop",
}
ENV_WORKSPACE_KEYS = {
    "ready": "TAKY_READY_WORKSPACE",
    "hide": "TAKY_HIDE_WORKSPACE",
    "snap": "TAKY_SNAP_WORKSPACE",
}

RUNTIME.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)
TASKS_DIR.mkdir(exist_ok=True)

TERMINAL_STATUSES = {
    "DONE_PUSHED",
    "DONE_NO_CHANGES",
    "INVALID_TASK",
}
RETRYABLE_STATUSES = {
    "BLOCKED_CODEX_NOT_FOUND",
    "BLOCKED_GIT_NOT_FOUND",
    "BLOCKED_DIRTY_WORKTREE",
    "BLOCKED_WRONG_BRANCH",
    "BLOCKED_NON_FF",
    "COMMITTED_NOT_PUSHED",
    "TIMEOUT",
    "FAILED",
}


def _git_exe() -> str | None:
    return resolve_git()


def _run(args: list[str], cwd: Path, timeout: int = 120) -> subprocess.CompletedProcess:
    command = list(args)
    if command and command[0] == "git":
        git = _git_exe()
        if not git:
            return subprocess.CompletedProcess(command, 127, "", "Git executable not found")
        command[0] = git
    return subprocess.run(
        command,
        cwd=cwd,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )


def _ledger() -> dict:
    if not LEDGER.exists():
        return {"processed": {}}
    try:
        return json.loads(LEDGER.read_text(encoding="utf-8"))
    except Exception:
        return {"processed": {}}


def _save_ledger(data: dict) -> None:
    LEDGER.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _workspace(app: str) -> Path:
    override = os.environ.get(ENV_WORKSPACE_KEYS[app], "").strip()
    return Path(override or DEFAULT_WORKSPACES[app])


def _safe_pull_queue() -> None:
    git = _git_exe()
    if not git:
        print("[CODEX QUEUE] Git not found; self-pull skipped", flush=True)
        return
    status = _run(["git", "status", "--porcelain"], REPO_ROOT)
    if status.returncode != 0 or status.stdout.strip():
        return
    _run(["git", "pull", "--ff-only"], REPO_ROOT, timeout=90)


def _load_task(path: Path) -> dict:
    task = json.loads(path.read_text(encoding="utf-8"))
    required = ["id", "app", "prompt"]
    if any(not str(task.get(k, "")).strip() for k in required):
        raise ValueError("task requires id, app, prompt")
    if task["app"] not in CONFIG["apps"]:
        raise ValueError("unknown app")
    if task.get("action", "codex") != "codex":
        raise ValueError("unsupported action")
    if task.get("allow_main") is True or task.get("allow_production") is True:
        raise ValueError("main/production permission is forbidden")
    return task


def _blocked_git(task: dict, expected_branch: str) -> dict:
    return {
        "task_id": task["id"],
        "app": task["app"],
        "expected_branch": expected_branch,
        "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "BLOCKED_GIT_NOT_FOUND",
        "error": "Git executable not found. Install Git or use GitHub Desktop bundled Git / TAKY_GIT_EXE.",
    }


def _process(path: Path, task: dict) -> dict:
    app = task["app"]
    cfg = CONFIG["apps"][app]
    expected_branch = cfg["branch"]
    workspace = _workspace(app)
    result = {
        "task_id": task["id"],
        "app": app,
        "expected_branch": expected_branch,
        "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "FAILED",
    }

    if not _git_exe():
        return _blocked_git(task, expected_branch)
    if not workspace.exists() or not (workspace / ".git").exists():
        result["error"] = f"workspace missing or not a git repo: {workspace}"
        return result

    dirty = _run(["git", "status", "--porcelain"], workspace)
    if dirty.returncode != 0:
        result["error"] = dirty.stderr.strip() or "git status failed"
        return result
    if dirty.stdout.strip():
        result["status"] = "BLOCKED_DIRTY_WORKTREE"
        result["error"] = "local workspace has uncommitted changes"
        return result

    branch = _run(["git", "branch", "--show-current"], workspace)
    current_branch = branch.stdout.strip()
    if branch.returncode != 0 or current_branch != expected_branch:
        result["status"] = "BLOCKED_WRONG_BRANCH"
        result["error"] = f"expected {expected_branch}, found {current_branch or '?'}"
        return result

    fetch = _run(["git", "fetch", "origin", expected_branch], workspace, timeout=120)
    if fetch.returncode != 0:
        result["error"] = "git fetch failed: " + fetch.stderr[-2000:]
        return result
    pull = _run(["git", "pull", "--ff-only", "origin", expected_branch], workspace, timeout=120)
    if pull.returncode != 0:
        result["status"] = "BLOCKED_NON_FF"
        result["error"] = "git pull --ff-only failed: " + pull.stderr[-2000:]
        return result

    codex = resolve_codex(CODEX_COMMAND)
    if not codex:
        result["status"] = "BLOCKED_CODEX_NOT_FOUND"
        result["error"] = "Codex CLI not found"
        return result

    prompt = str(task["prompt"]).strip()
    instruction = (
        "TAKY isolated work-branch task. Work only inside the current repository and current branch. "
        "Do not switch branches. Do not touch main or production. Do not deploy or release. "
        "Do not read or expose secrets. Keep the change within the user's requested scope. "
        "Run bounded relevant tests/static checks. Do not commit or push; the gateway performs that step after verification. "
        "Finish with a concise summary of root cause, changed files, checks, and remaining blocker if any.\n\n"
        f"TASK ID: {task['id']}\nUSER TASK:\n{prompt}"
    )
    started_head = _run(["git", "rev-parse", "HEAD"], workspace).stdout.strip()

    try:
        proc = subprocess.run(
            [codex, "exec", "--full-auto", instruction],
            cwd=workspace,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=TIMEOUT,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    except subprocess.TimeoutExpired as exc:
        result["status"] = "TIMEOUT"
        result["error"] = "Codex timed out"
        result["output_tail"] = (((exc.stdout or "") if isinstance(exc.stdout, str) else "") + ((exc.stderr or "") if isinstance(exc.stderr, str) else ""))[-8000:]
        return result

    output = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
    (LOG_DIR / f"queue-{task['id']}.log").write_text(output, encoding="utf-8")
    result["codex_returncode"] = proc.returncode
    result["output_tail"] = output[-8000:]
    if proc.returncode != 0:
        result["error"] = "Codex returned non-zero"
        return result

    branch_after = _run(["git", "branch", "--show-current"], workspace).stdout.strip()
    if branch_after != expected_branch:
        result["status"] = "BLOCKED_BRANCH_CHANGED"
        result["error"] = f"branch changed to {branch_after}"
        return result

    status = _run(["git", "status", "--porcelain"], workspace)
    if status.returncode != 0:
        result["error"] = "git status after Codex failed"
        return result
    if not status.stdout.strip():
        result["status"] = "DONE_NO_CHANGES"
        result["head"] = started_head
        result["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        return result

    add = _run(["git", "add", "-A"], workspace)
    if add.returncode != 0:
        result["error"] = "git add failed: " + add.stderr[-2000:]
        return result

    commit_message = f"TAKY-CODEX {task['id']}: {str(task.get('title') or prompt).splitlines()[0][:72]}"
    commit = _run(["git", "commit", "-m", commit_message], workspace, timeout=120)
    if commit.returncode != 0:
        result["error"] = "git commit failed: " + commit.stderr[-3000:]
        return result

    new_head = _run(["git", "rev-parse", "HEAD"], workspace).stdout.strip()
    push = _run(["git", "push", "origin", f"HEAD:{expected_branch}"], workspace, timeout=180)
    if push.returncode != 0:
        result["status"] = "COMMITTED_NOT_PUSHED"
        result["head"] = new_head
        result["error"] = "git push failed: " + push.stderr[-3000:]
        return result

    result.update({
        "status": "DONE_PUSHED",
        "head_before": started_head,
        "head": new_head,
        "finished_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    })
    return result


def poll_once() -> None:
    _safe_pull_queue()
    ledger = _ledger()
    processed = ledger.setdefault("processed", {})
    for path in sorted(TASKS_DIR.glob("*.json")):
        try:
            task = _load_task(path)
            task_id = str(task["id"])
            prior = processed.get(task_id)
            if isinstance(prior, dict) and prior.get("status") in TERMINAL_STATUSES:
                continue
            result = _process(path, task)
        except Exception as exc:
            task_id = path.stem
            result = {
                "task_id": task_id,
                "status": "INVALID_TASK",
                "error": str(exc),
                "finished_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        processed[task_id] = result
        _save_ledger(ledger)
        print(f"[CODEX QUEUE] {task_id}: {result.get('status')}", flush=True)


def loop() -> None:
    git = _git_exe()
    codex = resolve_codex(CODEX_COMMAND)
    print(f"[CODEX QUEUE] polling every {INTERVAL}s", flush=True)
    print(f"[CODEX QUEUE] git: {git or 'NOT FOUND'}", flush=True)
    print(f"[CODEX QUEUE] codex: {codex or 'NOT FOUND'}", flush=True)
    while not STOP_FILE.exists():
        try:
            poll_once()
        except Exception as exc:
            print(f"[CODEX QUEUE WARN] {exc}", flush=True)
        for _ in range(max(1, INTERVAL)):
            if STOP_FILE.exists():
                return
            time.sleep(1)


def start_daemon() -> threading.Thread:
    thread = threading.Thread(target=loop, name="taky-codex-queue", daemon=True)
    thread.start()
    return thread


if __name__ == "__main__":
    loop()
