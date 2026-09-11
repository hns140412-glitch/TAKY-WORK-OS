from __future__ import annotations
import json,os,subprocess,sys,time,urllib.request
from pathlib import Path
BASE=Path(__file__).resolve().parent; RUNTIME=BASE/"runtime"; LOG_DIR=RUNTIME/"logs"; STOP_FILE=RUNTIME/"STOP"; PID_FILE=RUNTIME/"background_supervisor.pid"; STATE_FILE=RUNTIME/"mobile_urls.json"; LOCK_FILE=RUNTIME/"background_supervisor.lock"
RUNTIME.mkdir(exist_ok=True); LOG_DIR.mkdir(exist_ok=True); STOP_FILE.unlink(missing_ok=True)
CREATE_NO_WINDOW=getattr(subprocess,"CREATE_NO_WINDOW",0); DETACHED_PROCESS=getattr(subprocess,"DETACHED_PROCESS",0); FLAGS=CREATE_NO_WINDOW|DETACHED_PROCESS

def acquire_lock():
    if os.name!="nt": return open(LOCK_FILE,"a+b")
    import msvcrt
    f=open(LOCK_FILE,"a+b")
    try:
        if f.tell()==0: f.write(b"0"); f.flush()
        f.seek(0); msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK,1)
    except OSError: f.close(); return None
    return f

def taskkill_tree(pid):
    if os.name=="nt": subprocess.run(["taskkill","/PID",str(pid),"/T","/F"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=CREATE_NO_WINDOW)
    else:
        try: os.kill(pid,15)
        except OSError: pass

def launch(script,log_name):
    log=open(LOG_DIR/log_name,"a",encoding="utf-8")
    return subprocess.Popen([sys.executable,str(BASE/script)],cwd=BASE,stdin=subprocess.DEVNULL,stdout=log,stderr=subprocess.STDOUT,creationflags=FLAGS if os.name=="nt" else 0,close_fds=True)

def public_gateway_healthy():
    if not STATE_FILE.exists(): return None
    try:
        data=json.loads(STATE_FILE.read_text(encoding="utf-8")); url=data.get("gateway_url")
        if not url: return None
        req=urllib.request.Request(url+"/state.json",headers={"User-Agent":"TAKY-Runtime-Hub-Watchdog/1.0"})
        with urllib.request.urlopen(req,timeout=12) as r: return 200 <= r.status < 400
    except Exception: return False

def main():
    lock=acquire_lock()
    if lock is None: return 0
    PID_FILE.write_text(str(os.getpid()),encoding="utf-8")
    queue=launch("codex_queue_runner.py","background-queue.log"); hub=launch("runtime_hub.py","background-runtime-hub.log"); failures=0; last_health=0.0
    try:
        while not STOP_FILE.exists():
            if queue.poll() is not None:
                time.sleep(2)
                if not STOP_FILE.exists(): queue=launch("codex_queue_runner.py","background-queue.log")
            if hub.poll() is not None:
                time.sleep(2)
                if not STOP_FILE.exists(): hub=launch("runtime_hub.py","background-runtime-hub.log"); failures=0; last_health=time.time()
            now=time.time()
            if now-last_health>=30:
                health=public_gateway_healthy(); last_health=now
                if health is False: failures+=1
                elif health is True: failures=0
                if failures>=3 and hub.poll() is None:
                    taskkill_tree(hub.pid); time.sleep(2)
                    if not STOP_FILE.exists(): hub=launch("runtime_hub.py","background-runtime-hub.log")
                    failures=0
            time.sleep(2)
    finally:
        for proc in (hub,queue):
            if proc and proc.poll() is None: taskkill_tree(proc.pid)
        PID_FILE.unlink(missing_ok=True)
        try: lock.close()
        except Exception: pass
    return 0
if __name__=="__main__": raise SystemExit(main())
