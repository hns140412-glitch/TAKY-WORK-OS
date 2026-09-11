@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo TAKY Mobile Gateway - background startup
echo ==================================================

if exist runtime\STOP del /q runtime\STOP >nul 2>&1

echo [1/2] Preflight: Git, Codex CLI, app workspaces
python -c "from pathlib import Path; from tool_resolver import resolve_codex,resolve_git; g=resolve_git(); c=resolve_codex('codex'); ws=[Path('D:/Git PWA/Ready '+chr(38)+' Set'),Path('D:/Git PWA/Hide '+chr(38)+' Seek'),Path('D:/Git PWA/Snap '+chr(38)+' Pop')]; ok=g and c and all((p/'.git').exists() for p in ws); print('[PASS] Git:',g or 'NOT FOUND'); print('[PASS] Codex:',c or 'NOT FOUND'); [print(('[PASS] ' if (p/'.git').exists() else '[FAIL] ')+str(p)) for p in ws]; raise SystemExit(0 if ok else 1)"
if errorlevel 1 (
  echo.
  echo [STOP] Preflight failed. Nothing was started.
  pause
  exit /b 1
)

echo [2/2] Starting unified gateway in background
wscript.exe "%~dp0START_BACKGROUND_GATEWAY.vbs"

echo.
echo [PASS] TAKY Gateway is running in background.
echo This window may now close. Codex queue, app servers, and Cloudflare tunnels are supervised automatically.
echo Mobile URL is written to: runtime\mobile_urls.json

timeout /t 2 /nobreak >nul
endlocal
