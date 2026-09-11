@echo off
setlocal
cd /d "%~dp0"
if not exist runtime mkdir runtime
> runtime\STOP echo stop

echo [STOP] Signal written.
echo The hidden supervisor will stop Gateway, Codex queue, app servers, and Cloudflare child processes.
echo Tailscale Serve, if enabled, is left configured so it can resume automatically next time.
timeout /t 2 /nobreak >nul
endlocal
