@echo off
setlocal
cd /d "%~dp0"

if exist runtime\STOP del /q runtime\STOP >nul 2>&1

rem Start the GitHub-task Codex queue watcher in a separate console so it can keep
rem processing mobile ChatGPT task files while the gateway serves/tunnels apps.
start "TAKY Codex Queue" cmd /k "python codex_queue_runner.py"

rem Keep the main gateway in this console.
python taky_mobile_gateway.py

endlocal
