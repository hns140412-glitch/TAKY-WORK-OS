@echo off
setlocal
cd /d "%~dp0"
echo ==================================================
echo TAKY Runtime Hub - background startup
echo ==================================================
if exist runtime\STOP del /q runtime\STOP >nul 2>&1
echo [1/2] Preflight: Python + cloudflared
python --version >nul 2>&1
if errorlevel 1 (echo [FAIL] Python not found.& pause& exit /b 1)
where cloudflared >nul 2>&1
if errorlevel 1 (echo [FAIL] cloudflared not found in PATH.& pause& exit /b 1)
echo [2/2] Starting TAKY Runtime Hub in background
wscript.exe "%~dp0START_BACKGROUND_GATEWAY.vbs"
echo.
echo [PASS] TAKY Runtime Hub startup requested.
echo Ready / Hide / Snap / Gangbuk7 are registry-managed.
echo Mobile URL state: runtime\mobile_urls.json
timeout /t 2 /nobreak >nul
endlocal
