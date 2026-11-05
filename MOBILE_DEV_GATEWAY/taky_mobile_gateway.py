from __future__ import annotations

import io
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE = Path(__file__).resolve().parent
RUNTIME = BASE / "runtime"
APPS_DIR = RUNTIME / "apps"
LOG_DIR = RUNTIME / "logs"
JOBS_DIR = RUNTIME / "jobs"
STATE_FILE = RUNTIME / "mobile_urls.json"
STOP_FILE = RUNTIME / "STOP"
CONFIG = json.loads((BASE / "config.json").read_text(encoding="utf-8"))
OWNER = CONFIG["owner"]
SYNC_INTERVAL = int(CONFIG.get("sync_interval_seconds", 300))
GATEWAY_PORT = int(CONFIG.get("gateway_port", 4170))
APPS = CONFIG["apps"]
CODEX = CONFIG.get("codex", {})
CODEX_ENABLED = bool(CODEX.get("enabled", True))
CODEX_COMMAND = str(CODEX.get("command", "codex")).strip() or "codex"
CODEX_TIMEOUT = int(CODEX.get("timeout_seconds", 900))
CODEX_MAX_PROMPT = int(CODEX.get("max_prompt_chars", 12000))
CODEX_ALLOWED_APPS = set(CODEX.get("allowed_apps", list(APPS.keys())))

RUNTIME.mkdir(exist_ok=True)
APPS_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)
JOBS_DIR.mkdir(exist_ok=True)
STOP_FILE.unlink(missing_ok=True)

state_lock = threading.Lock()
state = {
    "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    "gateway_url": None,
    "apps": {name: {"url": None, "last_sync": None, "status": "WAITING"} for name in APPS},
    "codex": {
        "enabled": CODEX_ENABLED,
        "command": CODEX_COMMAND,
        "available": None,
        "last_check": None,
        "last_job_id": None,
        "last_job_status": None,
    },
}
processes: list[subprocess.Popen] = []


def save_state() -> None:
    with state_lock:
        STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def copy_tree_replace(src: Path, dst: Path) -> None:
    dst.mkdir(parents=True, exist_ok=True)
    incoming = {p.relative_to(src) for p in src.rglob("*") if p.is_file()}
    for old in [p for p in dst.rglob("*") if p.is_file()]:
        rel = old.relative_to(dst)
        if rel not in incoming:
            old.unlink(missing_ok=True)
    for item in src.rglob("*"):
        rel = item.relative_to(src)
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)


def sync_app(name: str) -> tuple[bool, str]:
    cfg = APPS[name]
    repo = cfg["repo"]
    branch = cfg["branch"]
    url = f"https://codeload.github.com/{OWNER}/{repo}/zip/refs/heads/{urllib.parse.quote(branch, safe='')}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TAKY-Mobile-Gateway/1.1"})
        with urllib.request.urlopen(req, timeout=45) as response:
            data = response.read()
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            temp = RUNTIME / f"_incoming_{name}"
            shutil.rmtree(temp, ignore_errors=True)
            temp.mkdir(parents=True, exist_ok=True)
            zf.extractall(temp)
            roots = [p for p in temp.iterdir() if p.is_dir()]
            if len(roots) != 1:
                raise RuntimeError("archive root not found")
            copy_tree_replace(roots[0], APPS_DIR / name)
            shutil.rmtree(temp, ignore_errors=True)
        with state_lock:
            state["apps"][name]["last_sync"] = time.strftime("%Y-%m-%d %H:%M:%S")
            state["apps"][name]["status"] = "SYNCED"
        save_state()
        return True, f"{name}: synced {repo}@{branch}"
    except Exception as exc:
        with state_lock:
            state["apps"][name]["status"] = f"SYNC ERROR: {exc}"
        save_state()
        return False, f"{name}: {exc}"


def sync_all() -> None:
    for name in APPS:
        ok, message = sync_app(name)
        print(("[PASS] " if ok else "[FAIL] ") + message, flush=True)


def start_server(name: str, port: int) -> subprocess.Popen:
    root = APPS_DIR / name
    cmd = [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(root)]
    log = open(LOG_DIR / f"{name}-server.log", "a", encoding="utf-8")
    p = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    processes.append(p)
    return p


def tunnel_reader(label: str, pipe) -> None:
    pattern = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
    log_path = LOG_DIR / f"{label}-tunnel.log"
    with open(log_path, "a", encoding="utf-8") as log:
        for raw in iter(pipe.readline, ""):
            line = raw.rstrip()
            log.write(line + "\n")
            log.flush()
            match = pattern.search(line)
            if match:
                url = match.group(0)
                with state_lock:
                    if label == "gateway":
                        state["gateway_url"] = url
                    else:
                        state["apps"][label]["url"] = url
                save_state()
                print(f"[{label.upper()} URL] {url}", flush=True)


def start_tunnel(label: str, port: int) -> subprocess.Popen:
    cloudflared = shutil.which("cloudflared")
    if not cloudflared:
        raise RuntimeError("cloudflared not found in PATH")
    cmd = [cloudflared, "tunnel", "--protocol", "http2", "--url", f"http://127.0.0.1:{port}"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace", creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    processes.append(p)
    threading.Thread(target=tunnel_reader, args=(label, p.stdout), daemon=True).start()
    return p


def codex_path() -> str | None:
    if not CODEX_ENABLED:
        return None
    explicit = shutil.which(CODEX_COMMAND)
    if explicit:
        return explicit
    candidates = [
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "OpenAI" / "codex.exe",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "Codex" / "codex.exe",
        Path(os.environ.get("APPDATA", "")) / "npm" / "codex.cmd",
    ]
    for item in candidates:
        if item and item.exists():
            return str(item)
    return None


def check_codex() -> dict:
    path = codex_path()
    result = {"available": bool(path), "path": path, "checked_at": time.strftime("%Y-%m-%d %H:%M:%S")}
    with state_lock:
        state["codex"]["available"] = result["available"]
        state["codex"]["last_check"] = result["checked_at"]
    save_state()
    return result


def job_file(job_id: str) -> Path:
    return JOBS_DIR / f"{job_id}.json"


def load_job(job_id: str) -> dict | None:
    path = job_file(job_id)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def write_job(job: dict) -> None:
    job_file(job["id"]).write_text(json.dumps(job, ensure_ascii=False, indent=2), encoding="utf-8")


def validate_job_request(payload: dict) -> tuple[str, str]:
    app = str(payload.get("app", "")).strip()
    prompt = str(payload.get("prompt", "")).strip()
    if app not in APPS or app not in CODEX_ALLOWED_APPS:
        raise ValueError("app is not allowed")
    if not prompt:
        raise ValueError("prompt is required")
    if len(prompt) > CODEX_MAX_PROMPT:
        raise ValueError("prompt is too long")
    forbidden = ["main", "production", "prod deploy", "deploy production", "release production"]
    lowered = prompt.lower()
    if any(term in lowered for term in forbidden):
        raise ValueError("main/production/release actions are blocked in mobile Codex bridge")
    return app, prompt


def run_codex_job(job_id: str, app: str, prompt: str) -> None:
    job = load_job(job_id) or {"id": job_id, "app": app, "prompt": prompt}
    try:
        path = codex_path()
        if not path:
            raise RuntimeError("Codex CLI not found on this PC")
        workspace = APPS_DIR / app
        if not workspace.exists():
            raise RuntimeError("app mirror not found; sync first")
        instruction = (
            "You are running inside TAKY Mobile Dev Gateway. "
            "Work only in the current isolated app mirror. "
            "Do not touch main/production, do not deploy, do not access secrets, and do not modify files outside this workspace. "
            "Implement the requested change, run bounded local checks when possible, and finish with a concise summary of changed files, tests, and blockers.\n\n"
            f"USER TASK:\n{prompt}"
        )
        job.update({"status": "RUNNING", "started_at": time.strftime("%Y-%m-%d %H:%M:%S")})
        write_job(job)
        cmd = [path, "exec", "--full-auto", instruction]
        proc = subprocess.run(
            cmd,
            cwd=workspace,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=CODEX_TIMEOUT,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        output = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
        log_path = LOG_DIR / f"codex-{job_id}.log"
        log_path.write_text(output, encoding="utf-8")
        job.update({
            "status": "DONE" if proc.returncode == 0 else "FAILED",
            "returncode": proc.returncode,
            "finished_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "output_tail": output[-12000:],
            "log": str(log_path.relative_to(BASE)),
        })
    except subprocess.TimeoutExpired as exc:
        partial = ((exc.stdout or "") if isinstance(exc.stdout, str) else "") + ((exc.stderr or "") if isinstance(exc.stderr, str) else "")
        job.update({"status": "TIMEOUT", "finished_at": time.strftime("%Y-%m-%d %H:%M:%S"), "output_tail": partial[-12000:]})
    except Exception as exc:
        job.update({"status": "FAILED", "finished_at": time.strftime("%Y-%m-%d %H:%M:%S"), "error": str(exc)})
    write_job(job)
    with state_lock:
        state["codex"]["last_job_id"] = job_id
        state["codex"]["last_job_status"] = job.get("status")
    save_state()


def enqueue_codex(payload: dict) -> dict:
    app, prompt = validate_job_request(payload)
    availability = check_codex()
    if not availability["available"]:
        raise RuntimeError("Codex CLI not found on this PC")
    job_id = time.strftime("%Y%m%d-%H%M%S") + "-" + uuid.uuid4().hex[:8]
    job = {
        "id": job_id,
        "app": app,
        "prompt": prompt,
        "status": "QUEUED",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    write_job(job)
    with state_lock:
        state["codex"]["last_job_id"] = job_id
        state["codex"]["last_job_status"] = "QUEUED"
    save_state()
    threading.Thread(target=run_codex_job, args=(job_id, app, prompt), daemon=True).start()
    return job


def page_html(message: str = "") -> str:
    with state_lock:
        snap = json.loads(json.dumps(state))
    ready_url = snap["apps"]["ready"]["url"]
    hide_url = snap["apps"]["hide"]["url"]
    snap_url = snap["apps"]["snap"]["url"]
    ready_test = ready_url
    if ready_url and hide_url and snap_url:
        q = urllib.parse.urlencode({"hide_target": hide_url, "snap_target": snap_url})
        ready_test = ready_url + ("&" if "?" in ready_url else "?") + q

    def card(name: str, title: str) -> str:
        item = snap["apps"][name]
        link = item["url"] or "#"
        return f'''<section><h2>{title}</h2><p>{item["status"]}</p><p>Last sync: {item["last_sync"] or "-"}</p><a class="go" href="{link}">Open app</a><a href="/sync?app={name}">Sync latest branch</a></section>'''

    codex = snap.get("codex", {})
    codex_status = "READY" if codex.get("available") else ("NOT CHECKED" if codex.get("available") is None else "NOT FOUND")
    ready_button = f'<a class="ready" href="{ready_test}">Open Ready cross-app test</a>' if ready_test else ""
    return f'''<!doctype html><html lang="ko"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAKY Mobile Dev Gateway</title><style>body{{font-family:system-ui;margin:0;background:#f5f5f3;color:#1f1f1f}}main{{max-width:760px;margin:auto;padding:22px}}h1{{font-size:24px}}.msg{{padding:10px;border-radius:12px;background:#fff8d8}}section{{background:white;padding:16px;margin:12px 0;border-radius:18px;box-shadow:0 3px 18px #0001}}a{{display:inline-block;margin:6px 8px 0 0;padding:10px 12px;border-radius:12px;background:#ececea;color:#111;text-decoration:none}}a.go,a.ready{{background:#222;color:#fff}}.top{{display:flex;gap:8px;flex-wrap:wrap}}code{{word-break:break-all}}</style><main><h1>TAKY Mobile Dev Gateway</h1><p>ChatGPT → GitHub work branch → PC test mirror → mobile browser</p>{f'<p class="msg">{message}</p>' if message else ''}<div class="top"><a href="/sync?app=all">Sync all now</a><a href="/codex/check">Check Codex</a><a href="/">Refresh status</a></div>{ready_button}<section><h2>PC Codex Bridge</h2><p>Status: <b>{codex_status}</b></p><p>Last job: <code>{codex.get("last_job_id") or "-"}</code> · {codex.get("last_job_status") or "-"}</p><p>API: POST <code>/codex/run</code> with JSON {{"app":"ready|hide|snap","prompt":"..."}} · GET <code>/codex/jobs/&lt;id&gt;</code></p><p>Safety: isolated mirror only · main/production/release blocked · no deploy.</p></section>{card('ready','Ready & Set · 4171')}{card('hide','Hide & Seek · 4172')}{card('snap','Snap & Pop · 4173')}<p>Auto sync interval: {SYNC_INTERVAL // 60} min · main is not modified by this gateway.</p></main></html>'''


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/codex/run":
            self._send_json(404, {"ok": False, "error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > CODEX_MAX_PROMPT + 2048:
                raise ValueError("invalid request size")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            job = enqueue_codex(payload)
            self._send_json(202, {"ok": True, "job": job})
        except ValueError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(503, {"ok": False, "error": str(exc)})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/sync":
            q = urllib.parse.parse_qs(parsed.query)
            target = q.get("app", ["all"])[0]
            if target == "all":
                sync_all()
                message = "All work branches synced."
            elif target in APPS:
                _, message = sync_app(target)
            else:
                message = "Unknown app."
            body = page_html(message).encode("utf-8")
        elif parsed.path == "/state.json":
            with state_lock:
                self._send_json(200, state)
            return
        elif parsed.path == "/codex/check":
            result = check_codex()
            body = page_html("Codex: " + ("READY" if result["available"] else "NOT FOUND")).encode("utf-8")
        elif parsed.path.startswith("/codex/jobs/"):
            job_id = parsed.path.rsplit("/", 1)[-1]
            if not re.fullmatch(r"[A-Za-z0-9_-]{8,80}", job_id):
                self._send_json(400, {"ok": False, "error": "invalid job id"})
                return
            job = load_job(job_id)
            if not job:
                self._send_json(404, {"ok": False, "error": "job not found"})
                return
            self._send_json(200, {"ok": True, "job": job})
            return
        else:
            body = page_html().encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass


def auto_sync_loop() -> None:
    while not STOP_FILE.exists():
        time.sleep(SYNC_INTERVAL)
        if STOP_FILE.exists():
            break
        print("[AUTO] syncing work branches...", flush=True)
        sync_all()


def cleanup(*_args) -> None:
    STOP_FILE.write_text("stop", encoding="utf-8")
    for p in reversed(processes):
        try:
            p.terminate()
        except Exception:
            pass
    raise SystemExit(0)


def main() -> None:
    signal.signal(signal.SIGINT, cleanup)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, cleanup)

    print("TAKY Mobile Dev Gateway starting...", flush=True)
    print("1) Syncing GitHub work branches", flush=True)
    sync_all()

    print("2) Starting local app servers", flush=True)
    for name, cfg in APPS.items():
        start_server(name, int(cfg["port"]))

    availability = check_codex()
    print("[PASS] Codex CLI found" if availability["available"] else "[WARN] Codex CLI not found", flush=True)

    gateway = ThreadingHTTPServer(("127.0.0.1", GATEWAY_PORT), Handler)
    threading.Thread(target=gateway.serve_forever, daemon=True).start()

    print("3) Starting Cloudflare quick tunnels", flush=True)
    for name, cfg in APPS.items():
        start_tunnel(name, int(cfg["port"]))
    start_tunnel("gateway", GATEWAY_PORT)

    threading.Thread(target=auto_sync_loop, daemon=True).start()

    print("4) Waiting for URLs. Keep this window open.", flush=True)
    while True:
        time.sleep(1)
        with state_lock:
            done = state["gateway_url"] and all(v["url"] for v in state["apps"].values())
            gateway_url = state["gateway_url"]
        if done:
            print("\n=== MOBILE CONTROL URL ===", flush=True)
            print(gateway_url, flush=True)
            print("Open this one URL on iPhone. It contains app links, sync controls, and Codex bridge status.\n", flush=True)
            break

    while True:
        time.sleep(2)
        if STOP_FILE.exists():
            cleanup()


if __name__ == "__main__":
    main()
