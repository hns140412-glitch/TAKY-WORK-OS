#!/usr/bin/env python3
import hashlib
from pathlib import Path
import tempfile
import unittest
from source_reference import SCHEMA, SourcePointerError, resolve_pointer


def local(path="archive/a.txt", digest=None):
    x = {"schema": SCHEMA, "source_id": "ref:1", "provider": "LOCAL_VAULT",
         "locator": {"root_key": "SOURCE_VAULT", "relative_path": path},
         "approved_use": "TASK_SCOPED_REFERENCE", "content_transfer": "ON_DEMAND_ONLY"}
    if digest: x["expected_sha256"] = digest
    return x


def drive():
    return {"schema": SCHEMA, "source_id": "ref:2", "provider": "GOOGLE_DRIVE",
            "locator": {"file_id": "testDrivePointer123"},
            "approved_use": "TASK_SCOPED_REFERENCE", "content_transfer": "ON_DEMAND_ONLY"}


class ReferenceTests(unittest.TestCase):
    def test_local_locates_without_copy(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "archive").mkdir()
            p = root / "archive" / "a.txt"
            p.write_bytes(b"sample")
            result = resolve_pointer(local(), allowed_local_roots={"SOURCE_VAULT": root})
            self.assertEqual(result["state"], "LOCAL_FILE_LOCATED_NOT_CONTENT_VERIFIED")
            self.assertEqual(result["bytes_copied"], 0)
            self.assertFalse(result["github_upload"])
            self.assertEqual(p.read_bytes(), b"sample")

    def test_hash_check_explicit(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "archive").mkdir()
            (root / "archive" / "a.txt").write_bytes(b"sample")
            digest = hashlib.sha256(b"sample").hexdigest()
            ok = resolve_pointer(local(digest=digest), allowed_local_roots={"SOURCE_VAULT": root},
                                 verify_local_bytes=True)
            self.assertEqual(ok["state"], "LOCAL_HASH_VERIFIED")
            bad = resolve_pointer(local(digest="a"*64), allowed_local_roots={"SOURCE_VAULT": root},
                                  verify_local_bytes=True)
            self.assertEqual(bad["state"], "LOCAL_HASH_MISMATCH")
            self.assertFalse(bad["content_hash_verified"])

    def test_missing_and_unbound(self):
        with tempfile.TemporaryDirectory() as td:
            self.assertEqual(resolve_pointer(local(), allowed_local_roots={"SOURCE_VAULT": td})["state"],
                             "LOCAL_SOURCE_MISSING")
        self.assertEqual(resolve_pointer(local())["state"], "LOCAL_ROOT_NOT_BOUND")

    def test_reject_relative_escape(self):
        with tempfile.TemporaryDirectory() as td:
            for path in ("../x", "a/../../x", "/absolute", "C:/absolute", "a\\b", "a//b"):
                with self.subTest(path=path), self.assertRaises(SourcePointerError):
                    resolve_pointer(local(path), allowed_local_roots={"SOURCE_VAULT": td})

    def test_symlink_is_rejected(self):
        with tempfile.TemporaryDirectory() as td, tempfile.TemporaryDirectory() as other:
            root = Path(td)
            try: (root / "archive").symlink_to(other, target_is_directory=True)
            except (OSError, NotImplementedError): self.skipTest("symlink not permitted")
            with self.assertRaises(SourcePointerError):
                resolve_pointer(local(), allowed_local_roots={"SOURCE_VAULT": root})

    def test_drive_unbound_is_hold(self):
        r = resolve_pointer(drive())
        self.assertEqual(r["state"], "CONNECTOR_NOT_BOUND")

    def test_drive_access_check_is_not_content_verification(self):
        ref = drive()
        file_id = ref["locator"]["file_id"]
        r = resolve_pointer(ref, drive_metadata_check=lambda x: {"file_id": file_id, "accessible": True})
        self.assertEqual(r["state"], "AUTHENTICATED_REFERENCE_AVAILABLE")
        self.assertFalse(r["content_hash_verified"])
        self.assertNotIn("download_url", r)

    def test_drive_wrong_identity_fails_closed(self):
        r = resolve_pointer(drive(), drive_metadata_check=lambda x: {"file_id": "differentId123", "accessible": True})
        self.assertEqual(r["state"], "CONNECTOR_ACCESS_UNVERIFIED")

    def test_no_bulk_transfer(self):
        p = local()
        p["content_transfer"] = "COPY_ALL_TO_WORK_OS"
        with self.assertRaises(SourcePointerError): resolve_pointer(p)

    def test_no_unscoped_use(self):
        p = drive()
        p["approved_use"] = "GLOBAL"
        with self.assertRaises(SourcePointerError): resolve_pointer(p)

    def test_schema_guard(self):
        p = drive()
        p["schema"] = "invalid"
        with self.assertRaises(SourcePointerError): resolve_pointer(p)


if __name__ == "__main__":
    unittest.main()
