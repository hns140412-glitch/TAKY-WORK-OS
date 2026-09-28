#!/usr/bin/env python3
"""Task-scoped, read-only source pointers for TAKY Work OS.

A locator is NOT a copied original, an Indexing receipt or content authority.
Nothing here uploads bytes to GitHub, creates a Work OS archive, or fetches
Google Drive content. The caller supplies the local root or a previously
authorized Google Drive metadata checker. Both fail closed by default.
"""
from __future__ import annotations

import hashlib
from pathlib import Path, PurePosixPath
import re
from typing import Any, Callable, Mapping

SCHEMA = "TAKY_WORK_OS_SOURCE_POINTER_V1"
PROVIDERS = {"LOCAL_VAULT", "GOOGLE_DRIVE"}
HASH_RE = re.compile(r"^[0-9a-fA-F]{64}$")
DRIVE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{10,256}$")


class SourcePointerError(ValueError):
    pass


def _pointer(pointer: object) -> tuple[str, str, dict, str | None]:
    if not isinstance(pointer, dict) or pointer.get("schema") != SCHEMA:
        raise SourcePointerError("SOURCE_POINTER_SCHEMA_INVALID")
    source_id = pointer.get("source_id")
    provider = pointer.get("provider")
    locator = pointer.get("locator")
    if not isinstance(source_id, str) or not source_id.strip() or len(source_id) > 256:
        raise SourcePointerError("SOURCE_ID_INVALID")
    if provider not in PROVIDERS or not isinstance(locator, dict):
        raise SourcePointerError("SOURCE_PROVIDER_OR_LOCATOR_INVALID")
    if pointer.get("content_transfer") != "ON_DEMAND_ONLY":
        raise SourcePointerError("BULK_TRANSFER_FORBIDDEN")
    if pointer.get("approved_use") != "TASK_SCOPED_REFERENCE":
        raise SourcePointerError("WORK_SCOPE_NOT_ESTABLISHED")
    expected = pointer.get("expected_sha256")
    if expected is not None and (not isinstance(expected, str) or not HASH_RE.fullmatch(expected)):
        raise SourcePointerError("EXPECTED_SHA256_INVALID")
    return source_id, provider, locator, expected.lower() if expected else None


def _relative(name: object) -> PurePosixPath:
    if not isinstance(name, str) or not name or "\\" in name or "\x00" in name or ":" in name or "//" in name:
        raise SourcePointerError("RELATIVE_PATH_INVALID")
    rel = PurePosixPath(name)
    if rel.is_absolute() or any(part in ("", ".", "..") for part in name.split("/")):
        raise SourcePointerError("RELATIVE_PATH_TRAVERSAL")
    return rel


def _hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for piece in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(piece)
    return digest.hexdigest()


def resolve_pointer(
    pointer: Mapping[str, Any],
    *,
    allowed_local_roots: Mapping[str, Path | str] | None = None,
    drive_metadata_check: Callable[[str], Mapping[str, Any]] | None = None,
    verify_local_bytes: bool = False,
) -> dict[str, Any]:
    """Resolve only the specified task-scoped pointer.

    An unconfigured connector is a HOLD, not a guessed success. Local files are
    never opened unless hash verification is explicitly requested. This function
    returns no source bytes or signed URLs and never copies a file.
    """
    sid, provider, locator, expected = _pointer(pointer)
    base = {"schema": SCHEMA, "source_id": sid, "provider": provider,
            "read_only": True, "bytes_copied": 0, "github_upload": False,
            "work_os_raw_ingested": False, "indexing_approval": False}
    if provider == "GOOGLE_DRIVE":
        file_id = locator.get("file_id")
        if not isinstance(file_id, str) or not DRIVE_ID_RE.fullmatch(file_id):
            raise SourcePointerError("DRIVE_FILE_ID_INVALID")
        if not callable(drive_metadata_check):
            return {**base, "state": "CONNECTOR_NOT_BOUND"}
        try:
            checked = drive_metadata_check(file_id)
        except Exception:
            return {**base, "state": "CONNECTOR_ACCESS_UNVERIFIED"}
        if (not isinstance(checked, Mapping) or checked.get("file_id") != file_id
                or checked.get("accessible") is not True):
            return {**base, "state": "CONNECTOR_ACCESS_UNVERIFIED"}
        mime_type = checked.get("mime_type")
        if not isinstance(mime_type, str) or not mime_type:
            return {**base, "state": "DRIVE_FILE_TYPE_UNVERIFIED"}
        if mime_type == "application/vnd.google-apps.folder":
            return {**base, "state": "DRIVE_FOLDER_NOT_A_SOURCE_FILE"}
        if mime_type == "application/vnd.google-apps.shortcut":
            return {**base, "state": "DRIVE_SHORTCUT_NEEDS_TARGET_RESOLUTION"}
        # A same-ID, authenticated metadata check is not a byte/hash check.
        return {**base, "state": "AUTHENTICATED_REFERENCE_AVAILABLE",
                "mime_type": mime_type, "content_hash_verified": False,
                "next": "AUTHORIZED_TASK_SCOPED_READ"}

    key = locator.get("root_key")
    if not isinstance(key, str) or not key or not allowed_local_roots or key not in allowed_local_roots:
        return {**base, "state": "LOCAL_ROOT_NOT_BOUND"}
    rel = _relative(locator.get("relative_path"))
    root = Path(allowed_local_roots[key]).resolve(strict=True)
    if not root.is_dir():
        raise SourcePointerError("LOCAL_ROOT_NOT_DIRECTORY")
    candidate = root
    for part in rel.parts:
        candidate = candidate / part
        if candidate.is_symlink():
            raise SourcePointerError("LOCAL_SYMLINK_FORBIDDEN")
    resolved = candidate.resolve(strict=False)
    if not resolved.is_relative_to(root):
        raise SourcePointerError("LOCAL_ROOT_ESCAPE")
    if not resolved.is_file():
        return {**base, "state": "LOCAL_SOURCE_MISSING", "content_hash_verified": False}
    stat = resolved.stat()
    if not verify_local_bytes:
        return {**base, "state": "LOCAL_FILE_LOCATED_NOT_CONTENT_VERIFIED",
                "size_bytes": stat.st_size, "content_hash_verified": False}
    actual = _hash_file(resolved)
    if expected is not None and expected != actual:
        return {**base, "state": "LOCAL_HASH_MISMATCH", "size_bytes": stat.st_size,
                "content_hash_verified": False}
    return {**base, "state": "LOCAL_HASH_VERIFIED" if expected else "LOCAL_HASH_OBSERVED_ONLY",
            "sha256": actual, "size_bytes": stat.st_size,
            "content_hash_verified": expected is not None}
