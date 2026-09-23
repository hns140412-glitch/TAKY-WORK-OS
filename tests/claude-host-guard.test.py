#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HOOK=ROOT/".claude"/"hooks"/"taky-production-guard.py"
SETTINGS=ROOT/".claude"/"settings.json"

settings=json.loads(SETTINGS.read_text(encoding="utf-8"))
permissions=settings.get("permissions",{})
deny=set(permissions.get("deny",[]))
assert "Bash" in deny
assert "PowerShell" in deny
assert "Edit(/artifacts/production/**)" in deny
assert "Edit(/.claude/**)" in deny
assert "Edit(/.mcp.json)" in deny
assert permissions.get("disableBypassPermissionsMode")=="disable"
assert permissions.get("disableAutoMode")=="disable"

def run(tool_name, tool_input):
    payload=json.dumps({"tool_name":tool_name,"tool_input":tool_input})
    env=dict(os.environ)
    env["CLAUDE_PROJECT_DIR"]=str(ROOT)
    return subprocess.run(
        [sys.executable,str(HOOK)],
        input=payload,
        text=True,
        capture_output=True,
        env=env,
    )

assert run("Write",{"file_path":"artifacts/staging/test.txt"}).returncode==0
assert run("Edit",{"file_path":"runtime/safe.js"}).returncode==0

blocked=run("Write",{"file_path":"artifacts/production/final.pdf"})
assert blocked.returncode==2
assert "DIRECT_PRODUCTION_WRITE_FORBIDDEN" in blocked.stderr

blocked=run("Bash",{"command":"cp artifacts/staging/a.pdf artifacts/production/a.pdf"})
assert blocked.returncode==2

blocked=run("Edit",{"file_path":".claude/settings.json"})
assert blocked.returncode==2
assert "ENFORCEMENT_CONFIGURATION_IS_PROTECTED" in blocked.stderr

blocked=run("Bash",{"command":"sed -i s/a/b/ .mcp.json"})
assert blocked.returncode==2

print("claude-host-guard: PASS")
