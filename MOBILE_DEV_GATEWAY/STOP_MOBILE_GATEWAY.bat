@echo off
setlocal
cd /d "%~dp0"
if not exist runtime mkdir runtime
> runtime\STOP echo stop

echo Stop signal written. Gateway and Codex queue will exit cleanly after their current bounded step.
echo If a Cloudflare tunnel console remains, close that console manually.

endlocal
