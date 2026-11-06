#!/usr/bin/env python3
"""Single-source read uses fabricated files and Drive callbacks only."""
import hashlib
import tempfile
from pathlib import Path
import unittest

from source_reader import read_one, SourceReadError
from source_reference import SCHEMA, SourcePointerError


def local(digest=None, rel="docs/a.txt"):
    p = {"schema": SCHEMA, "source_id": "local:1",
         "provider": "LOCAL_VAULT",
         "locator": {"root_key": "SOURCE_VAULT", "relative_path": rel},
         "approved_use": "TASK_SCOPED_REFERENCE",
         "content_transfer": "ON_DEMAND_ONLY"}
    if digest is not None: p["expected_sha256"] = digest
    return p


def drive(digest=None):
    p = {"schema": SCHEMA, "source_id": "drive:1",
         "provider": "GOOGLE_DRIVE",
         "locator": {"file_id": "testDrivePointer123"},
         "approved_use": "TASK_SCOPED_REFERENCE",
         "content_transfer": "ON_DEMAND_ONLY"}
    if digest is not None: p["expected_sha256"] = digest
    return p


def allow(**kwargs):
    return kwargs.get("work_item_id") == "work:test:1" and kwargs.get("action") == "READ_ONE_SOURCE"


class SingleSourceReadTest(unittest.TestCase):
    def prepare(self, root, b=b"one document"):
        p = Path(root) / "docs" / "a.txt"
        p.parent.mkdir(parents=True)
        p.write_bytes(b)
        return p

    def test_local_single_exact_source_and_no_copy(self):
        with tempfile.TemporaryDirectory() as td:
            original = self.prepare(td)
            digest = hashlib.sha256(original.read_bytes()).hexdigest()
            r = read_one(local(digest), work_item_id="work:test:1", authorize=allow,
                         allowed_local_roots={"SOURCE_VAULT": td})
            self.assertEqual(r["content"], b"one document")
            self.assertTrue(r["receipt"]["sha256_expected_matched"])
            self.assertFalse(r["receipt"]["github_upload"])
            self.assertFalse(r["receipt"]["raw_persisted_by_this_module"])
            self.assertEqual(list(Path(td).rglob("*")), [original.parent, original])

    def test_denies_missing_independent_authorizer(self):
        with tempfile.TemporaryDirectory() as td:
            self.prepare(td)
            with self.assertRaisesRegex(SourceReadError, "AUTHORIZER_NOT_BOUND"):
                read_one(local(), work_item_id="work:test:1", authorize=None,
                         allowed_local_roots={"SOURCE_VAULT": td})

    def test_denies_different_work_item(self):
        with tempfile.TemporaryDirectory() as td:
            self.prepare(td)
            with self.assertRaisesRegex(SourceReadError, "NOT_AUTHORIZED"):
                read_one(local(), work_item_id="work:other", authorize=allow,
                         allowed_local_roots={"SOURCE_VAULT": td})

    def test_hash_mismatch_rejects_content(self):
        with tempfile.TemporaryDirectory() as td:
            self.prepare(td)
            with self.assertRaisesRegex(SourceReadError, "HASH_MISMATCH"):
                read_one(local("a"*64), work_item_id="work:test:1", authorize=allow,
                         allowed_local_roots={"SOURCE_VAULT": td})

    def test_bounded_file_size(self):
        with tempfile.TemporaryDirectory() as td:
            self.prepare(td, b"123456")
            with self.assertRaisesRegex(SourceReadError, "SIZE_LIMIT"):
                read_one(local(), work_item_id="work:test:1", authorize=allow,
                         allowed_local_roots={"SOURCE_VAULT": td}, max_bytes=5)

    def test_path_escape_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            self.prepare(td)
            for rel in ("../secret", "/secret", "C:/secret", "docs/../../secret"):
                with self.subTest(rel=rel), self.assertRaises(SourcePointerError):
                    read_one(local(rel=rel), work_item_id="work:test:1",
                             authorize=allow, allowed_local_roots={"SOURCE_VAULT": td})

    def test_symlink_escape_rejected(self):
        with tempfile.TemporaryDirectory() as td, tempfile.TemporaryDirectory() as external:
            root = Path(td)
            private = Path(external) / "private.txt"
            private.write_bytes(b"not allowed")
            try:
                (root / "docs").symlink_to(external, target_is_directory=True)
            except (OSError, NotImplementedError):
                self.skipTest("No symlink support")
            with self.assertRaisesRegex(SourceReadError, "SYMLINK"):
                read_one(local(rel="docs/private.txt"), work_item_id="work:test:1",
                         authorize=allow, allowed_local_roots={"SOURCE_VAULT": root})

    def test_drive_authenticated_callback_one_file(self):
        original = b"connected only when user authorized"
        digest = hashlib.sha256(original).hexdigest()
        calls = []
        def reader(**kwargs):
            calls.append(kwargs)
            return {"file_id": kwargs["file_id"], "authorized": True,
                    "size_bytes": len(original), "content": original}
        r = read_one(drive(digest), work_item_id="work:test:1", authorize=allow,
                     drive_reader=reader)
        self.assertEqual(r["content"], original)
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0]["file_id"], "testDrivePointer123")
        self.assertFalse(r["receipt"]["github_upload"])

    def test_drive_unbound_or_bad_identity_fails_closed(self):
        with self.assertRaisesRegex(SourceReadError, "READER_NOT_BOUND"):
            read_one(drive(), work_item_id="work:test:1", authorize=allow)
        def wrong(**kwargs):
            return {"file_id": "wrong", "authorized": True,
                    "content": b"x", "size_bytes": 1}
        with self.assertRaisesRegex(SourceReadError, "RECEIPT_INVALID"):
            read_one(drive(), work_item_id="work:test:1", authorize=allow, drive_reader=wrong)

    def test_drive_oversize_and_inaccurate_length(self):
        for declared in (1, 100):
            def reader(**kwargs):
                return {"file_id": kwargs["file_id"], "authorized": True,
                        "content": b"abcdef", "size_bytes": declared}
            with self.assertRaisesRegex(SourceReadError, "SIZE_MISMATCH_OR_LIMIT"):
                read_one(drive(), work_item_id="work:test:1", authorize=allow,
                         drive_reader=reader, max_bytes=5)

    def test_drive_callback_exception_fails_closed(self):
        def broken(**kwargs): raise RuntimeError("unauthorized provider")
        with self.assertRaisesRegex(SourceReadError, "READ_UNAVAILABLE"):
            read_one(drive(), work_item_id="work:test:1", authorize=allow, drive_reader=broken)

    def test_unscoped_transfer_rejected(self):
        p = local()
        p["content_transfer"] = "COPY_ALL"
        with self.assertRaises(SourcePointerError):
            read_one(p, work_item_id="work:test:1", authorize=allow)

    def test_invalid_size_cap_rejected(self):
        with self.assertRaisesRegex(SourceReadError, "LIMIT_INVALID"):
            read_one(local(), work_item_id="work:test:1", authorize=allow, max_bytes=100000000)


if __name__=="__main__":
    unittest.main()
