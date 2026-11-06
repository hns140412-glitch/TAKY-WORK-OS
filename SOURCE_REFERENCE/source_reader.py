#!/usr/bin/env python3
"""Single-source, permission-gated Work OS reads with NO raw-file replication.

This is an opt-in library call, not a server endpoint, scheduled job, Drive login,
indexer, crawler, or any form of implicit permission. The host supplies an
independent per-work-item authorizer and a connected Drive byte-reader (if used).
Original bytes are returned only in memory to the authorized caller. This
module neither writes them nor logs them; its receipt contains metadata only.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import stat
from typing import Any, Callable, Mapping

from source_reference import (
    _pointer, _relative, DRIVE_ID_RE, SourcePointerError
)

DEFAULT_MAX_BYTES = 8 * 1024 * 1024
ABSOLUTE_MAX_BYTES = 25 * 1024 * 1024


class SourceReadError(ValueError):
    pass


def _authorized(authorize: Callable | None, source_id: str, provider: str,
                work_item_id: str) -> None:
    if not callable(authorize):
        raise SourceReadError("INDEPENDENT_TASK_AUTHORIZER_NOT_BOUND")
    try:
        result = authorize(source_id=source_id, provider=provider,
                           work_item_id=work_item_id, action="READ_ONE_SOURCE")
    except Exception as exc:
        raise SourceReadError("TASK_AUTHORIZATION_UNAVAILABLE") from exc
    if result is not True:
        raise SourceReadError("TASK_SOURCE_READ_NOT_AUTHORIZED")


def _local_bytes(pointer: dict, roots: Mapping[str, Path | str] | None,
                 max_bytes: int) -> bytes:
    locator = pointer["locator"]
    key = locator.get("root_key")
    if not isinstance(key, str) or not roots or key not in roots:
        raise SourceReadError("LOCAL_ROOT_NOT_BOUND")
    relative = _relative(locator.get("relative_path"))
    root = Path(roots[key])
    if root.is_symlink() or not root.is_dir():
        raise SourceReadError("LOCAL_ROOT_MISSING_OR_SYMLINK")
    root = root.resolve(strict=True)
    source = root
    for part in relative.parts:
        source = source / part
        if source.is_symlink():
            raise SourceReadError("LOCAL_SYMLINK_FORBIDDEN")
    resolved = source.resolve(strict=False)
    if not resolved.is_relative_to(root) or not resolved.is_file():
        raise SourceReadError("LOCAL_FILE_MISSING_OR_ESCAPE")
    flags = os.O_RDONLY | getattr(os, "O_BINARY", 0)
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(resolved, flags)
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise SourceReadError("SOURCE_NOT_REGULAR_FILE")
        if before.st_size > max_bytes:
            raise SourceReadError("TASK_SOURCE_SIZE_LIMIT")
        with os.fdopen(fd, "rb", closefd=False) as source_handle:
            data = source_handle.read(max_bytes + 1)
        after = os.fstat(fd)
        if len(data) > max_bytes:
            raise SourceReadError("TASK_SOURCE_SIZE_LIMIT")
        identity_before = (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        identity_after = (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        stat_path = resolved.stat(follow_symlinks=False)
        identity_path = (stat_path.st_dev, stat_path.st_ino, stat_path.st_size, stat_path.st_mtime_ns)
        if identity_before != identity_after or identity_before != identity_path or len(data) != before.st_size:
            raise SourceReadError("TASK_SOURCE_CHANGED_DURING_READ")
        if source.is_symlink():
            raise SourceReadError("LOCAL_SOURCE_REPLACED_BY_SYMLINK")
        return data
    finally:
        os.close(fd)


def read_one(
    pointer: dict[str, Any],
    *,
    work_item_id: str,
    authorize: Callable | None,
    allowed_local_roots: Mapping[str, Path | str] | None = None,
    drive_reader: Callable | None = None,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> dict[str, Any]:
    source_id, provider, locator, expected = _pointer(pointer)
    if not isinstance(work_item_id, str) or not work_item_id.strip() or len(work_item_id) > 256:
        raise SourceReadError("WORK_ITEM_ID_REQUIRED")
    if not isinstance(max_bytes, int) or not 1 <= max_bytes <= ABSOLUTE_MAX_BYTES:
        raise SourceReadError("TASK_READ_LIMIT_INVALID")
    _authorized(authorize, source_id, provider, work_item_id)

    if provider == "LOCAL_VAULT":
        data = _local_bytes(pointer, allowed_local_roots, max_bytes)
    else:
        file_id = locator.get("file_id")
        if not isinstance(file_id, str) or not DRIVE_ID_RE.fullmatch(file_id):
            raise SourceReadError("DRIVE_FILE_ID_INVALID")
        if not callable(drive_reader):
            raise SourceReadError("AUTHORIZED_DRIVE_READER_NOT_BOUND")
        try:
            result = drive_reader(file_id=file_id, max_bytes=max_bytes)
        except Exception as exc:
            raise SourceReadError("DRIVE_READ_UNAVAILABLE") from exc
        if (not isinstance(result, Mapping) or result.get("file_id") != file_id
                or result.get("authorized") is not True
                or not isinstance(result.get("content"), bytes)):
            raise SourceReadError("DRIVE_BYTE_RECEIPT_INVALID")
        data = result["content"]
        if len(data) > max_bytes or result.get("size_bytes") != len(data):
            raise SourceReadError("DRIVE_SIZE_MISMATCH_OR_LIMIT")
    digest = hashlib.sha256(data).hexdigest()
    if expected is not None and expected != digest:
        raise SourceReadError("SOURCE_EXPECTED_HASH_MISMATCH")
    receipt = {
        "source_id": source_id,
        "provider": provider,
        "work_item_id": work_item_id,
        "action": "READ_ONE_SOURCE",
        "bytes_read": len(data),
        "sha256_observed": digest,
        "sha256_expected_matched": expected is not None,
        "raw_persisted_by_this_module": False,
        "github_upload": False,
        "indexing_approved": False,
        "canonical_promotion": False,
    }
    return {"content": data, "receipt": receipt}
