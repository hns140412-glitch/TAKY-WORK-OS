Option Explicit
Dim shell, fso, baseDir, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
cmd = "python.exe " & Chr(34) & baseDir & "\background_supervisor.py" & Chr(34)
shell.Run cmd, 0, False
