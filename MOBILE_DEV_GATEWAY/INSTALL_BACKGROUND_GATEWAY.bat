@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo TAKY Mobile Gateway - one-time background install
echo ==================================================

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LNK=%STARTUP%\TAKY Mobile Gateway.lnk"
set "TAKY_VBS=%~dp0START_BACKGROUND_GATEWAY.vbs"

if not exist "%STARTUP%" mkdir "%STARTUP%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut($env:LNK); $s.TargetPath=$env:WINDIR+'\System32\wscript.exe'; $s.Arguments='\"'+$env:TAKY_VBS+'\"'; $s.WorkingDirectory=(Split-Path $env:TAKY_VBS); $s.Save()"
if errorlevel 1 (
  echo [FAIL] Could not install Windows-login startup shortcut.
  pause
  exit /b 1
)

echo [PASS] Windows-login background startup installed.

echo [INFO] Checking optional stable Tailscale access...
where tailscale.exe >nul 2>&1
if not errorlevel 1 (
  echo [INFO] Tailscale found. Configuring persistent HTTPS access to gateway port 4170.
  tailscale serve --bg 4170
  if errorlevel 1 (
    echo [WARN] Tailscale Serve needs one-time login/HTTPS approval. Background gateway will still use Cloudflare Quick Tunnels.
  ) else (
    echo [PASS] Stable Tailscale gateway enabled. This survives terminal close and reboot.
  )
) else (
  echo [INFO] Tailscale not found. Cloudflare Quick Tunnel fallback will be supervised in background.
)

call "%~dp0START_MOBILE_GATEWAY.bat"

echo.
echo [DONE] You no longer need to keep CMD windows open.
echo The gateway and Codex queue run under one hidden supervisor and restart if they stop.
echo To stop everything, run STOP_MOBILE_GATEWAY.bat.
timeout /t 4 /nobreak >nul
endlocal
