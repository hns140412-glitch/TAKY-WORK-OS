@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist runtime mkdir runtime
echo stop>runtime\STOP
echo Stop signal sent. If the gateway window remains open, press Ctrl+C once.
pause
