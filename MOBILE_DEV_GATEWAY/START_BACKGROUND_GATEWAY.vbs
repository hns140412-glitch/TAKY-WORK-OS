Option Explicit
Dim shell, fso, baseDir, pythonw, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
pythonw = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\Python\Python313\pythonw.exe"
If Not fso.FileExists(pythonw) Then
  pythonw = "pythonw.exe"
End If
cmd = Chr(34) & pythonw & Chr(34) & " " & Chr(34) & baseDir & "\background_supervisor.py" & Chr(34)
shell.Run cmd, 0, False
