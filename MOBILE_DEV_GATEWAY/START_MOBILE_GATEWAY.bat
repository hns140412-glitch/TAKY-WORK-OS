@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo TAKY Mobile Dev Gateway starting...
python taky_mobile_gateway.py
pause
