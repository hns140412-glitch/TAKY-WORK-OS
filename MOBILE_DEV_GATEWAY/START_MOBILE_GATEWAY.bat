@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo TAKY Mobile Gateway - one click startup
echo ==================================================

if exist runtime\STOP del /q runtime\STOP >nul 2>&1

echo [1/3] Preflight: Git, Codex CLI, app workspaces
python -c "from pathlib import Path; from tool_resolver import resolve_codex,resolve_git; g=resolve_git(); c=resolve_codex('codex'); ws=[Path(r'D:\Git PWA\Ready ^& Set'),Path(r'D:\Git PWA\Hide ^& Seek'),Path(r'D:\Git PWA\Snap ^& Pop')]; ok=g and c and all((p/'.git').exists() for p in ws); print('[PASS] Git:',g or 'NOT FOUND'); print('[PASS] Codex:',c or 'NOT FOUND'); [print(('[PASS] ' if (p/'.git').exists() else '[FAIL] ')+str(p)) for p in ws]; raise SystemExit(0 if ok else 1)"
if errorlevel 1 (
  echo.
  echo [STOP] Preflight failed. Nothing was started.
  pause
  exit /b 1
)

echo [2/3] Starting Codex queue
start "TAKY Codex Queue" cmd /k "python codex_queue_runner.py"

echo [3/3] Starting mobile gateway
rem Direct HTTP Codex execution is intentionally disabled in config.
rem Codex work is handled by the safer GitHub task queue started above.
python taky_mobile_gateway.py

endlocal
