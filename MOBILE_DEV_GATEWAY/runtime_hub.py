from __future__ import annotations
import io,json,re,shutil,signal,socket,subprocess,sys,threading,time,urllib.parse,urllib.request,zipfile
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

BASE=Path(__file__).resolve().parent
RUNTIME=BASE/"runtime"; APPS_DIR=RUNTIME/"apps"; LOG_DIR=RUNTIME/"logs"; STATE_FILE=RUNTIME/"mobile_urls.json"; STOP_FILE=RUNTIME/"STOP"
CONFIG=json.loads((BASE/"config.json").read_text(encoding="utf-8"))
OWNER=CONFIG["owner"]; SYNC_INTERVAL=int(CONFIG.get("sync_interval_seconds",300)); GATEWAY_PORT=int(CONFIG.get("gateway_port",4170)); APPS=CONFIG["apps"]
RUNTIME.mkdir(exist_ok=True); APPS_DIR.mkdir(parents=True,exist_ok=True); LOG_DIR.mkdir(exist_ok=True); STOP_FILE.unlink(missing_ok=True)
state_lock=threading.Lock()
state={"runtime":"TAKY Runtime Hub","started_at":time.strftime("%Y-%m-%d %H:%M:%S"),"gateway_url":None,
       "apps":{n:{"title":c.get("title",n),"mode":c.get("mode","mirror"),"port":int(c["port"]),"url":None,"last_sync":None,"status":"WAITING","health":None} for n,c in APPS.items()}}
processes=[]; owned_servers={}

def save_state():
    with state_lock: STATE_FILE.write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding="utf-8")

def port_open(port,timeout=.8):
    try:
        with socket.create_connection(("127.0.0.1",int(port)),timeout=timeout): return True
    except OSError: return False

def http_healthy(port):
    try:
        req=urllib.request.Request(f"http://127.0.0.1:{int(port)}/",headers={"User-Agent":"TAKY-Runtime-Hub/1.0"})
        with urllib.request.urlopen(req,timeout=4) as r: return 200 <= r.status < 500
    except Exception: return port_open(port)

def copy_tree_replace(src,dst):
    dst.mkdir(parents=True,exist_ok=True)
    incoming={p.relative_to(src) for p in src.rglob("*") if p.is_file()}
    for old in [p for p in dst.rglob("*") if p.is_file()]:
        if old.relative_to(dst) not in incoming: old.unlink(missing_ok=True)
    for item in src.rglob("*"):
        rel=item.relative_to(src); target=dst/rel
        if item.is_dir(): target.mkdir(parents=True,exist_ok=True)
        else: target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(item,target)

def sync_app(name):
    cfg=APPS[name]; mode=cfg.get("mode","mirror")
    if mode!="mirror":
        healthy=http_healthy(int(cfg["port"]))
        with state_lock:
            state["apps"][name]["health"]=healthy; state["apps"][name]["status"]="LIVE" if healthy else "OFFLINE"
        save_state(); return healthy,f"{name}: {'live' if healthy else 'offline'} local runtime"
    repo=cfg["repo"]; branch=cfg["branch"]
    url=f"https://codeload.github.com/{OWNER}/{repo}/zip/refs/heads/{urllib.parse.quote(branch,safe='')}"
    try:
        req=urllib.request.Request(url,headers={"User-Agent":"TAKY-Runtime-Hub/1.0"})
        with urllib.request.urlopen(req,timeout=45) as r: data=r.read()
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            temp=RUNTIME/f"_incoming_{name}"; shutil.rmtree(temp,ignore_errors=True); temp.mkdir(parents=True,exist_ok=True); zf.extractall(temp)
            roots=[p for p in temp.iterdir() if p.is_dir()]
            if len(roots)!=1: raise RuntimeError("archive root not found")
            copy_tree_replace(roots[0],APPS_DIR/name); shutil.rmtree(temp,ignore_errors=True)
        with state_lock:
            state["apps"][name]["last_sync"]=time.strftime("%Y-%m-%d %H:%M:%S"); state["apps"][name]["status"]="SYNCED"
        save_state(); return True,f"{name}: synced {repo}@{branch}"
    except Exception as exc:
        with state_lock: state["apps"][name]["status"]=f"SYNC ERROR: {exc}"
        save_state(); return False,f"{name}: {exc}"

def sync_all():
    for name in APPS:
        ok,msg=sync_app(name); print(("[PASS] " if ok else "[FAIL] ")+msg,flush=True)

def start_static_server(name,port,root):
    log=open(LOG_DIR/f"{name}-server.log","a",encoding="utf-8")
    p=subprocess.Popen([sys.executable,"-m","http.server",str(port),"--bind","127.0.0.1","--directory",str(root)],
        stdout=log,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
    processes.append(p); owned_servers[name]=p; return p

def ensure_server(name):
    cfg=APPS[name]; port=int(cfg["port"]); mode=cfg.get("mode","mirror")
    if http_healthy(port):
        with state_lock:
            state["apps"][name]["health"]=True
            if mode!="mirror": state["apps"][name]["status"]="LIVE"
        save_state(); return True,"already live"
    root=APPS_DIR/name if mode=="mirror" else Path(cfg.get("root",""))
    if mode not in ("mirror","local_static"): return False,f"unsupported mode: {mode}"
    if not root.exists():
        with state_lock: state["apps"][name]["health"]=False; state["apps"][name]["status"]="ROOT MISSING"
        save_state(); return False,f"root missing: {root}"
    try:
        start_static_server(name,port,root)
        until=time.time()+8
        while time.time()<until:
            if http_healthy(port):
                with state_lock: state["apps"][name]["health"]=True; state["apps"][name]["status"]="LIVE" if mode!="mirror" else state["apps"][name]["status"]
                save_state(); return True,"started"
            time.sleep(.4)
    except Exception as exc: return False,str(exc)
    with state_lock: state["apps"][name]["health"]=False; state["apps"][name]["status"]="SERVER START FAILED"
    save_state(); return False,"server failed health check"

def tunnel_reader(label,pipe):
    pat=re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
    with open(LOG_DIR/f"{label}-tunnel.log","a",encoding="utf-8") as log:
        for raw in iter(pipe.readline,""):
            line=raw.rstrip(); log.write(line+"\n"); log.flush(); m=pat.search(line)
            if m:
                url=m.group(0)
                with state_lock:
                    if label=="gateway": state["gateway_url"]=url
                    else: state["apps"][label]["url"]=url
                save_state(); print(f"[{label.upper()} URL] {url}",flush=True)

def start_tunnel(label,port):
    cf=shutil.which("cloudflared")
    if not cf: raise RuntimeError("cloudflared not found in PATH")
    p=subprocess.Popen([cf,"tunnel","--protocol","http2","--url",f"http://127.0.0.1:{port}"],
        stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding="utf-8",errors="replace",creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
    processes.append(p); threading.Thread(target=tunnel_reader,args=(label,p.stdout),daemon=True).start(); return p

def app_cards(snap):
    rows=[]
    for name,cfg in APPS.items():
        item=snap["apps"][name]; link=item.get("url") or "#"; mode=cfg.get("mode","mirror")
        sync_action=f'<a href="/sync?app={name}">Sync</a>' if mode=="mirror" else ""
        health="PASS" if item.get("health") else ("WAITING" if item.get("health") is None else "FAIL")
        rows.append(f'<section><div class="row"><div><h2>{item["title"]}</h2><p class="meta">{name} · {item["port"]} · {mode}</p></div><b class="status">{item["status"]}</b></div><p>Health: {health} · Last sync: {item.get("last_sync") or "-"}</p><a class="go" href="{link}">Open</a>{sync_action}</section>')
    return "".join(rows)

def page_html(message=""):
    with state_lock: snap=json.loads(json.dumps(state))
    ready=snap["apps"].get("ready",{}).get("url"); hide=snap["apps"].get("hide",{}).get("url"); sp=snap["apps"].get("snap",{}).get("url")
    ready_test=ready
    if ready and hide and sp:
        q=urllib.parse.urlencode({"hide_target":hide,"snap_target":sp}); ready_test=ready+("&" if "?" in ready else "?")+q
    ready_button=f'<a class="ready" href="{ready_test}">Open Ready cross-app test</a>' if ready_test else ""
    msg=f'<p class="msg">{message}</p>' if message else ""
    return f'''<!doctype html><html lang="ko"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TAKY Runtime Hub</title><style>
body{{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f4f5f7;color:#18202b}}main{{max-width:820px;margin:auto;padding:22px}}
h1{{font-size:26px;margin-bottom:6px}}h2{{font-size:17px;margin:0 0 5px}}.sub,.meta{{color:#697386;font-size:13px}}.msg{{padding:10px 12px;border-radius:10px;background:#fff4c7}}
section{{background:white;padding:15px;margin:11px 0;border-radius:16px;box-shadow:0 3px 18px #0000000c;border:1px solid #e9edf2}}
a{{display:inline-block;margin:7px 8px 0 0;padding:9px 12px;border-radius:10px;background:#eef1f4;color:#18202b;text-decoration:none;font-weight:650}}
a.go,a.ready{{background:#16243a;color:#fff}}.top{{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}}.row{{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}}.status{{font-size:12px;color:#315a43}}
</style><main><h1>TAKY Runtime Hub</h1><p class="sub">Mobile ChatGPT → isolated work branches / local runtimes → office PC → HTTPS gateway → iPhone</p>{msg}<div class="top"><a href="/sync?app=all">Sync all</a><a href="/">Refresh</a></div>{ready_button}{app_cards(snap)}<p class="sub">Registry-driven runtime. main/production promotion is not performed by this hub.</p></main></html>'''

class Handler(BaseHTTPRequestHandler):
    def _send_json(self,status,payload):
        body=json.dumps(payload,ensure_ascii=False,indent=2).encode("utf-8"); self.send_response(status); self.send_header("Content-Type","application/json; charset=utf-8"); self.send_header("Cache-Control","no-store"); self.send_header("Content-Length",str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        parsed=urllib.parse.urlparse(self.path)
        if parsed.path=="/sync":
            target=urllib.parse.parse_qs(parsed.query).get("app",["all"])[0]
            if target=="all":
                sync_all()
                for name in APPS: ensure_server(name)
                message="All registered runtimes checked."
            elif target in APPS:
                _,message=sync_app(target); ensure_server(target)
            else: message="Unknown app."
            body=page_html(message).encode("utf-8")
        elif parsed.path=="/state.json":
            with state_lock: self._send_json(200,state)
            return
        else: body=page_html().encode("utf-8")
        self.send_response(200); self.send_header("Content-Type","text/html; charset=utf-8"); self.send_header("Cache-Control","no-store"); self.send_header("Content-Length",str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self,fmt,*args): pass

def auto_sync_loop():
    while not STOP_FILE.exists():
        time.sleep(SYNC_INTERVAL)
        if STOP_FILE.exists(): break
        sync_all()
        for name in APPS: ensure_server(name)

def cleanup(*_args):
    STOP_FILE.write_text("stop",encoding="utf-8")
    for p in reversed(processes):
        try: p.terminate()
        except Exception: pass
    raise SystemExit(0)

def main():
    signal.signal(signal.SIGINT,cleanup)
    if hasattr(signal,"SIGBREAK"): signal.signal(signal.SIGBREAK,cleanup)
    print("TAKY Runtime Hub starting...",flush=True); sync_all()
    for name in APPS:
        ok,msg=ensure_server(name); print(("[PASS] " if ok else "[FAIL] ")+f"{name}: {msg}",flush=True)
    gateway=ThreadingHTTPServer(("127.0.0.1",GATEWAY_PORT),Handler); threading.Thread(target=gateway.serve_forever,daemon=True).start()
    for name,cfg in APPS.items(): start_tunnel(name,int(cfg["port"]))
    start_tunnel("gateway",GATEWAY_PORT); threading.Thread(target=auto_sync_loop,daemon=True).start()
    while not STOP_FILE.exists():
        time.sleep(1)
        with state_lock: done=state["gateway_url"] and all(v["url"] for v in state["apps"].values()); url=state["gateway_url"]
        if done:
            print("\n=== TAKY RUNTIME HUB MOBILE URL ===\n"+url+"\n",flush=True); break
    while not STOP_FILE.exists(): time.sleep(2)

if __name__=="__main__": main()
