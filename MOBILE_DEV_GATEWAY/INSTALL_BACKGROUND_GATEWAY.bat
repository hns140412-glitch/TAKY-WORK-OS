@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo TAKY Mobile Gateway - install background autostart
echo ==================================================

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET=%STARTUP%\TAKY_Mobile_Gateway.vbs"

if not exist "%STARTUP%" mkdir "%STARTUP%" >nul 2>&1
copy /y "%~dp0START_BACKGROUND_GATEWAY.vbs" "%TARGET%" >nul
if errorlevel 1 (
  echo [FAIL] Could not install startup launcher.
  pause
  exit /b 1
)

echo [PASS] Startup launcher installed.
call "%~dp0START_MOBILE_GATEWAY.bat"

echo.
echo From now on Windows login starts TAKY Gateway silently in the background.
echo To stop it, run STOP_MOBILE_GATEWAY.bat.
timeout /t 3 /nobreak >nul
endlocal
