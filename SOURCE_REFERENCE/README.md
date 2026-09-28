# Work OS source references — no raw replication

Status: candidate implementation / not connected to Work OS production runtime.
Authority: central TAKY Work OS and storage-routing contracts take precedence.

This module solves one bounded problem: a work item may refer to a file stored
in an approved **local SOURCE VAULT** or **Google Drive** without copying the
entire SOURCE_ARCHIVE, captures, Notion snapshots, PDFs or images into the
TAKY-WORK-OS Git repository.

## Storage boundaries

| Surface | Role |
| --- | --- |
| SOURCE VAULT / approved local folders | Original bytes, local captures, evidence hashes, retrieval receipts |
| Google Drive | User-authorized source and working files; existing file IDs, no forced duplicate copy |
| TAKY Indexing | Stable source IDs, version/duplicate relations, provenance and search pointers |
| Work OS | The specific work item's source_ref and minimal permitted evidence/result |
| GitHub | Implementation code, tests, schemas and **non-sensitive** contracts only |

A pointer does **not** authorize reading material and does **not** count as
content acquisition, verified original, Indexing approval, Mining completion or
a new canonical document. The caller must separately establish its task scope,
provider permissions, and actual content inspection before making claims.

## Minimal reference shape (illustrative only)

Local:
~~~json
{
  "schema": "TAKY_WORK_OS_SOURCE_POINTER_V1",
  "source_id": "source:example",
  "provider": "LOCAL_VAULT",
  "locator": {
    "root_key": "SOURCE_VAULT",
    "relative_path": "project/example.pdf"
  },
  "expected_sha256": "OPTIONAL_REAL_64_CHARACTER_DIGEST",
  "approved_use": "TASK_SCOPED_REFERENCE",
  "content_transfer": "ON_DEMAND_ONLY"
}
~~~

Drive:
~~~json
{
  "schema": "TAKY_WORK_OS_SOURCE_POINTER_V1",
  "source_id": "source:example-drive",
  "provider": "GOOGLE_DRIVE",
  "locator": {"file_id": "FILE_ID_FROM_AUTHORIZED_DRIVE_CONNECTOR"},
  "approved_use": "TASK_SCOPED_REFERENCE",
  "content_transfer": "ON_DEMAND_ONLY"
}
~~~

Examples are illustrative; the placeholder digest/file ID is not a valid input.

## Runtime expectations

- Local roots are explicitly provided to the caller, never discovered from
  someone else's PC path or inferred from a Git clone.
- Local reference resolution checks a bounded relative path and rejects
  traversal and symlink path segments. Default checks existence only; an
  explicit byte-verification call computes a digest without copying the file.
  Digest mismatch is HOLD. A computed digest without an independently known
  expected digest does not confer document authority.
- A Drive pointer requires an authorized connector's metadata and access check
  returning the same file ID. If unavailable, the state is CONNECTOR_NOT_BOUND.
  The resolver never sends a Drive file to GitHub, emits signed download links,
  performs remote download, or manufactures permission from a source ID.
- The pointer carries TASK_SCOPED_REFERENCE as an input contract; **caller
  approval/permission remains a separate gate**. Work OS itself remains HOLD.
- Runtime private manifests, user-linked references, originals, extracted
  text, receipts and generated local cache belong only in an authorized local
  workspace or Drive, **not** a public Git commit, PR, issue, workflow artifact
  or Work OS source tree.
- GitHub Actions runners cannot access the user's PC drive letter. A future
  local runner or authorized Drive connector must perform the actual on-demand
  read with consent and the appropriate security boundary.
- The repository does not add a runtime startup, scheduler, push, sync, or
  deployment hook. No existing 03:30/13:00 SOURCE VAULT task is touched.

## Regression

From this repository root:

~~~powershell
python -m unittest discover -s SOURCE_REFERENCE -p "source_reference_test.py" -v
git check-ignore -v -- "SOURCE_ARCHIVE/_probe.raw"
git check-ignore -v -- "SOURCE_REFERENCE/runtime/_probe.json"
~~~

The tests use temporary fabricated bytes and metadata callbacks; they do NOT
exercise a real Drive login, a real SOURCE VAULT file or hosted Work OS.
