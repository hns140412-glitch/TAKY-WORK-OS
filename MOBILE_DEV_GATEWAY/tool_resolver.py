from __future__ import annotations

import os
import shutil
from pathlib import Path


def _newest(paths: list[Path]) -> str | None:
    valid = [p for p in paths if p.is_file()]
    if not valid:
        return None
    valid.sort(key=lambda p: (p.stat().st_mtime, str(p)), reverse=True)
    return str(valid[0])


def resolve_codex(command: str = "codex") -> str | None:
    override = os.environ.get("TAKY_CODEX_EXE", "").strip().strip('"')
    if override and Path(override).is_file():
        return override

    found = shutil.which(command)
    if found:
        return found

    local = Path(os.environ.get("LOCALAPPDATA", ""))
    roaming = Path(os.environ.get("APPDATA", ""))

    fixed = [
        local / "Programs" / "OpenAI" / "codex.exe",
        local / "Programs" / "Codex" / "codex.exe",
        roaming / "npm" / "codex.cmd",
        roaming / "npm" / "codex.ps1",
    ]
    for path in fixed:
        if path.is_file():
            return str(path)

    codex_bin = local / "OpenAI" / "Codex" / "bin"
    if codex_bin.is_dir():
        candidates = list(codex_bin.glob("*/codex.exe")) + list(codex_bin.glob("codex.exe"))
        newest = _newest(candidates)
        if newest:
            return newest
    return None


def resolve_git() -> str | None:
    override = os.environ.get("TAKY_GIT_EXE", "").strip().strip('"')
    if override and Path(override).is_file():
        return override

    found = shutil.which("git")
    if found:
        return found

    fixed = [
        Path(r"C:\Program Files\Git\cmd\git.exe"),
        Path(r"C:\Program Files\Git\bin\git.exe"),
    ]
    for path in fixed:
        if path.is_file():
            return str(path)

    local = Path(os.environ.get("LOCALAPPDATA", ""))
    desktop = local / "GitHubDesktop"
    if desktop.is_dir():
        patterns = [
            "app-*/resources/app/git/cmd/git.exe",
            "app-*/resources/app/git/bin/git.exe",
            "app-*/resources/app/git/mingw64/bin/git.exe",
        ]
        candidates: list[Path] = []
        for pattern in patterns:
            candidates.extend(desktop.glob(pattern))
        newest = _newest(candidates)
        if newest:
            return newest
    return None
