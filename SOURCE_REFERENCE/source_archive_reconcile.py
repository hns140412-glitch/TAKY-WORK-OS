#!/usr/bin/env python3
"""Read-only byte comparison of ignored Work OS SOURCE_ARCHIVE and SOURCE VAULT.

No deletion, movement, copying or Git actions. This scan only identifies
byte-identical candidates inside explicitly selected vault subtrees.
Name, path, timestamp or equal size never establish source equivalence.
Results stay private in SOURCE_REFERENCE/runtime/ (git-ignored).
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
from typing import Any, Iterable

SCHEMA = "TAKY_SOURCE_ARCHIVE_READ_ONLY_BYTE_COMPARISON_V1"
CHUNK_SIZE = 1024 * 1024
MAX_FILES = 100_000
DEFAULT_VAULT_SUBTREES = ("captures_v04", "data/notion_incremental/snapshots")

class ComparisonError(ValueError):
    pass


def _safe_root(root: Path) -> Path:
    if root.is_symlink() or not root.is_dir():
        raise ComparisonError("ROOT_MISSING_OR_SYMLINK")
    return root.resolve(strict=True)


def _subtree(root: Path, name: str) -> Path:
    if not isinstance(name, str) or not name or "\\" in name or ":" in name:
        raise ComparisonError("UNSAFE_VAULT_SUBTREE")
    p = PurePosixPath(name)
    if p.is_absolute() or any(part in {"", ".", ".."} for part in name.split("/")):
        raise ComparisonError("UNSAFE_VAULT_SUBTREE")
    current = root
    for segment in p.parts:
        current = current / segment
        if current.is_symlink():
            raise ComparisonError("VAULT_SUBTREE_SYMLINK_FORBIDDEN")
    path = current.resolve(strict=False)
    if not path.is_relative_to(root):
        raise ComparisonError("VAULT_SUBTREE_OUTSIDE_ROOT")
    return path


def _digest_stable(path: Path) -> tuple[str, int]:
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode):
        raise ComparisonError("NON_REGULAR_FILE")
    h = hashlib.sha256()
    with path.open("rb") as stream:
        current = os.fstat(stream.fileno())
        if (current.st_ino, current.st_dev, current.st_size, current.st_mtime_ns) != (
            before.st_ino, before.st_dev, before.st_size, before.st_mtime_ns
        ):
            raise ComparisonError("FILE_CHANGED_BEFORE_HASH")
        for piece in iter(lambda: stream.read(CHUNK_SIZE), b""):
            h.update(piece)
        current = os.fstat(stream.fileno())
        after = path.stat(follow_symlinks=False)
    initial = (before.st_ino, before.st_dev, before.st_size, before.st_mtime_ns)
    final = (current.st_ino, current.st_dev, current.st_size, current.st_mtime_ns)
    path_final = (after.st_ino, after.st_dev, after.st_size, after.st_mtime_ns)
    if final != initial or path_final != initial:
        raise ComparisonError("FILE_CHANGED_DURING_HASH")
    return h.hexdigest(), before.st_size


def _inventory(root: Path, *, relative_to: Path, limit: int = MAX_FILES) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    holds: list[dict[str, str]] = []
    visited = 0

    def on_error(exc: OSError) -> None:
        holds.append({"relative_path": "SCAN_ERROR", "reason": type(exc).__name__})

    for directory, folders, files in os.walk(root, followlinks=False, onerror=on_error):
        folder = Path(directory)
        remaining = []
        for d in sorted(folders):
            candidate = folder / d
            if candidate.is_symlink():
                holds.append({"relative_path": candidate.relative_to(relative_to).as_posix(),
                              "reason": "SYMLINK_DIRECTORY_SKIPPED"})
            else:
                remaining.append(d)
        folders[:] = remaining
        for name in sorted(files):
            visited += 1
            if visited > limit:
                raise ComparisonError("SCAN_FILE_COUNT_LIMIT")
            file = folder / name
            rel = file.relative_to(relative_to).as_posix()
            if file.is_symlink():
                holds.append({"relative_path": rel, "reason": "SYMLINK_FILE_SKIPPED"})
                continue
            try:
                real = file.resolve(strict=True)
                if not real.is_relative_to(root.resolve(strict=True)):
                    raise ComparisonError("PATH_ESCAPES_SCANNED_ROOT")
                sha, size = _digest_stable(file)
                rows.append({"relative_path": rel, "sha256": sha, "size_bytes": size})
            except (OSError, ComparisonError) as exc:
                holds.append({"relative_path": rel,
                              "reason": str(exc) if isinstance(exc, ComparisonError) else type(exc).__name__})
    return {"rows": rows, "holds": holds, "visited": visited}


def compare_archive(
    archive_root: Path,
    vault_root: Path,
    vault_subtrees: Iterable[str] = DEFAULT_VAULT_SUBTREES,
) -> dict[str, Any]:
    archive = _safe_root(archive_root)
    vault = _safe_root(vault_root)
    if archive == vault or archive.is_relative_to(vault) or vault.is_relative_to(archive):
        raise ComparisonError("OVERLAPPING_ARCHIVE_AND_VAULT_ROOTS")

    archive_scan = _inventory(archive, relative_to=archive)
    vault_rows: list[dict[str, Any]] = []
    vault_holds: list[dict[str, str]] = []
    scanned_subtrees: list[str] = []
    missing_subtrees: list[str] = []
    for name in dict.fromkeys(vault_subtrees):
        root = _subtree(vault, name)
        if not root.is_dir():
            missing_subtrees.append(name)
            continue
        scan = _inventory(root, relative_to=vault)
        vault_rows.extend(scan["rows"])
        vault_holds.extend(scan["holds"])
        scanned_subtrees.append(name)
    if not scanned_subtrees:
        raise ComparisonError("NO_VAULT_SUBTREE_AVAILABLE")

    by_bytes: dict[tuple[int, str], list[str]] = defaultdict(list)
    for row in vault_rows:
        by_bytes[(row["size_bytes"], row["sha256"])].append(row["relative_path"])

    entries = []
    matches = 0
    for source in archive_scan["rows"]:
        candidates = sorted(by_bytes.get((source["size_bytes"], source["sha256"]), []))
        if candidates:
            matches += 1
        entries.append({
            **source,
            "state": "BYTE_IDENTICAL_CANDIDATE" if candidates else "NOT_FOUND_IN_SCANNED_VAULT_SCOPE",
            "matched_vault_path_count": len(candidates),
            "matched_vault_paths_preview": candidates[:10],
            "provenance_equivalence_verified": False,
            "deletion_authorized": False,
        })

    all_scope_clean = not archive_scan["holds"] and not vault_holds and not missing_subtrees
    return {
        "schema": SCHEMA,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "archive_file_count_hashed": len(archive_scan["rows"]),
        "archive_holds_count": len(archive_scan["holds"]),
        "vault_file_count_hashed": len(vault_rows),
        "vault_holds_count": len(vault_holds),
        "vault_scanned_subtrees": scanned_subtrees,
        "vault_missing_subtrees": missing_subtrees,
        "byte_identical_candidate_count": matches,
        "not_found_in_scanned_scope_count": len(entries) - matches,
        "scan_scope_complete": all_scope_clean,
        "archive_entries": entries,
        "archive_holds": archive_scan["holds"],
        "vault_holds": vault_holds,
        "deletion_authorized": False,
        "files_deleted": 0,
        "files_copied": 0,
        "files_moved": 0,
        "git_operations": 0,
        "final_state": "REVIEW_ONLY__NO_AUTOMATIC_CLEANUP",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--archive-root", required=True, type=Path)
    ap.add_argument("--vault-root", required=True, type=Path)
    ap.add_argument("--vault-subtree", action="append",
                    help="Explicitly scan a VAULT relative subtree; repeat to add more.")
    args = ap.parse_args()
    report = compare_archive(args.archive_root, args.vault_root,
                             args.vault_subtree or DEFAULT_VAULT_SUBTREES)
    output = Path(__file__).resolve().parent / "runtime" / "SOURCE_ARCHIVE_COMPARE.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_name(output.name + ".tmp")
    temp.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, output)
    print(json.dumps({
        "result": report["final_state"],
        "archive_hashed": report["archive_file_count_hashed"],
        "byte_identical_candidates": report["byte_identical_candidate_count"],
        "not_found_in_scanned_scope": report["not_found_in_scanned_scope_count"],
        "archive_holds": report["archive_holds_count"],
        "vault_holds": report["vault_holds_count"],
        "missing_subtrees": report["vault_missing_subtrees"],
        "scan_scope_complete": report["scan_scope_complete"],
        "output": str(output),
        "files_deleted": 0,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
