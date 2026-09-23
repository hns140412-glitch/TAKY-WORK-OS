#!/usr/bin/env python3
"""Claude Code PreToolUse guard for TAKY production exclusivity.

Blocks direct writes/commands targeting artifacts/production and protects
the enforcement configuration itself. MCP broker publication is not performed
through Edit/Write/Bash, so it is unaffected.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

PROJECT=Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()).resolve()
PRODUCTION=(PROJECT/"artifacts"/"production").resolve()

PROTECTED=(
    (PROJECT/".claude"/"settings.json").resolve(),
    (PROJECT/".claude"/"hooks"/"taky-production-guard.py").resolve(),
    (PROJECT/".mcp.json").resolve(),
    (PROJECT/"MCP"/"HOST_TOOL_PERMISSION_POLICY_V1.json").resolve(),
)

def norm(value: str) -> str:
    return str(value or "").replace("\\","/")

def blocked_path(raw: str) -> str | None:
    if not raw:
        return None
    try:
        p=Path(raw)
        if not p.is_absolute():
            p=PROJECT/p
        p=p.resolve()
    except Exception:
        return None

    if p==PRODUCTION or PRODUCTION in p.parents:
        return "DIRECT_PRODUCTION_WRITE_FORBIDDEN_USE_TAKY_MCP_BROKER"

    for protected in PROTECTED:
        if p==protected:
            return "ENFORCEMENT_CONFIGURATION_IS_PROTECTED"

    return None

def main() -> int:
    try:
        data=json.load(sys.stdin)
    except Exception:
        print("TAKY guard: invalid hook JSON",file=sys.stderr)
        return 2

    tool=str(data.get("tool_name") or "")
    inp=data.get("tool_input") or {}

    if tool in {"Edit","Write","NotebookEdit"}:
        target=inp.get("file_path") or inp.get("notebook_path") or ""
        reason=blocked_path(target)
        if reason:
            print(f"TAKY BLOCKED: {reason}: {target}",file=sys.stderr)
            return 2
        return 0

    if tool in {"Bash","PowerShell"}:
        command=norm(inp.get("command") or "")
        forbidden_fragments=[
            "artifacts/production",
            ".claude/settings.json",
            ".claude/hooks/taky-production-guard.py",
            ".mcp.json",
            "MCP/HOST_TOOL_PERMISSION_POLICY_V1.json",
        ]
        for fragment in forbidden_fragments:
            if fragment in command:
                print(f"TAKY BLOCKED: protected production/enforcement path in command: {fragment}",file=sys.stderr)
                return 2

    return 0

if __name__=="__main__":
    raise SystemExit(main())
