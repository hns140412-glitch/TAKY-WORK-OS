#!/usr/bin/env python3
"""Only synthetic temporary files are used. No user SOURCE_ARCHIVE is read by CI."""
import tempfile
from pathlib import Path
import unittest

from source_archive_reconcile import ComparisonError, compare_archive


class ArchiveReconcileTests(unittest.TestCase):
    def roots(self, td):
        root = Path(td)
        archive = root / "work_os" / "SOURCE_ARCHIVE"
        vault = root / "TAKY-SOURCE-VAULT"
        (archive / "a").mkdir(parents=True)
        (vault / "captures_v04" / "b").mkdir(parents=True)
        return archive, vault

    def test_exact_bytes_candidate_without_deletion(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            src = a / "a" / "source.png"
            dst = v / "captures_v04" / "b" / "renamed.png"
            src.write_bytes(b"same bytes, separate original")
            dst.write_bytes(b"same bytes, separate original")
            before = (src.read_bytes(), dst.read_bytes())
            r = compare_archive(a, v, ["captures_v04"])
            self.assertEqual(r["byte_identical_candidate_count"], 1)
            self.assertEqual(r["archive_entries"][0]["state"], "BYTE_IDENTICAL_CANDIDATE")
            self.assertEqual(r["archive_entries"][0]["matched_vault_path_count"], 1)
            self.assertFalse(r["archive_entries"][0]["deletion_authorized"])
            self.assertFalse(r["archive_entries"][0]["provenance_equivalence_verified"])
            self.assertEqual((src.read_bytes(), dst.read_bytes()), before)
            self.assertEqual((r["files_deleted"], r["files_moved"], r["files_copied"]), (0, 0, 0))

    def test_no_match_is_scoped_not_global_source_loss_claim(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            (a / "a" / "source.png").write_bytes(b"first")
            (v / "captures_v04" / "b" / "other.png").write_bytes(b"second")
            r = compare_archive(a, v, ["captures_v04"])
            self.assertEqual(r["not_found_in_scanned_scope_count"], 1)
            self.assertEqual(r["archive_entries"][0]["state"], "NOT_FOUND_IN_SCANNED_VAULT_SCOPE")
            self.assertFalse(r["deletion_authorized"])

    def test_duplicate_matches_do_not_promote_source_identity(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            (a / "a" / "s.png").write_bytes(b"same")
            (v / "captures_v04" / "b" / "s1.png").write_bytes(b"same")
            (v / "captures_v04" / "b" / "s2.png").write_bytes(b"same")
            r = compare_archive(a, v, ["captures_v04"])
            self.assertEqual(r["archive_entries"][0]["matched_vault_path_count"], 2)
            self.assertFalse(r["archive_entries"][0]["provenance_equivalence_verified"])

    def test_missing_vault_subtree_never_claims_complete(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            (a / "a" / "source.png").write_bytes(b"unchanged")
            r = compare_archive(a, v)
            self.assertIn("data/notion_incremental/snapshots", r["vault_missing_subtrees"])
            self.assertFalse(r["scan_scope_complete"])

    def test_symlink_target_not_read(self):
        with tempfile.TemporaryDirectory() as td, tempfile.TemporaryDirectory() as private:
            a, v = self.roots(td)
            secret = Path(private) / "outside.png"
            secret.write_bytes(b"private")
            link = a / "a" / "link.png"
            try:
                link.symlink_to(secret)
            except (OSError, NotImplementedError):
                self.skipTest("Symlink creation not available on this host")
            r = compare_archive(a, v, ["captures_v04"])
            self.assertEqual(r["archive_file_count_hashed"], 0)
            self.assertEqual(r["archive_holds_count"], 1)
            self.assertEqual(r["archive_holds"][0]["reason"], "SYMLINK_FILE_SKIPPED")

    def test_same_or_nested_roots_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            with self.assertRaises(ComparisonError):
                compare_archive(a, a)
            with self.assertRaises(ComparisonError):
                compare_archive(a, a / "a")
            with self.assertRaises(ComparisonError):
                compare_archive(v, v / "captures_v04")

    def test_unsafe_subtree_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            for name in ("../outside", "/tmp", "a\\b", "captures_v04/../../x", "a//b"):
                with self.subTest(name=name), self.assertRaises(ComparisonError):
                    compare_archive(a, v, [name])

    def test_no_scanned_vault_subtree_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            with self.assertRaises(ComparisonError):
                compare_archive(a, v, ["unavailable"])

    def test_private_relative_paths_and_hashes_only_no_contents(self):
        with tempfile.TemporaryDirectory() as td:
            a, v = self.roots(td)
            raw = b"PRIVATE_SOURCE_BYTES_NOT_FOR_REPORT"
            (a / "a" / "source.png").write_bytes(raw)
            r = compare_archive(a, v, ["captures_v04"])
            self.assertNotIn(raw.decode(), str(r))
            self.assertTrue(all(not k.startswith("C:") for k in r["archive_entries"][0]))
            self.assertEqual(r["git_operations"], 0)


if __name__ == "__main__":
    unittest.main()
