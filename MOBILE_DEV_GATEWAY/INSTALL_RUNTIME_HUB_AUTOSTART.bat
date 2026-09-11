@echo off
setlocal
set "TARGET=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\TAKY_RUNTIME_HUB.vbs"
> "%TARGET%" echo Option Explicit
>>"%TARGET%" echo Dim shell
>>"%TARGET%" echo Set shell = CreateObject("WScript.Shell")
>>"%TARGET%" echo shell.Run Chr(34) ^& "%~dp0START_BACKGROUND_GATEWAY.vbs" ^& Chr(34), 0, False
echo [PASS] TAKY Runtime Hub Windows logon autostart installed.
echo %TARGET%
endlocal
