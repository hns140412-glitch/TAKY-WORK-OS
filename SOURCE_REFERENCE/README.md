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
| Existing local SOURCE VAULT / Google Drive-synchronized data folder | Data/original bytes, captures, indices, local state, receipts and results; verify real synchronization rather than assuming it |
| Google Drive | Authorized data and work-file storage via existing IDs; no forced duplicate local-to-cloud mirror |
| TAKY Indexing | Stable source IDs, version/duplicate relations, provenance and search pointers |
| Work OS | The specific work item's source_ref and minimal permitted evidence/result |
| GitHub | PWA/app source code, explicitly approved runtime assets, UI/build/test/deployment machinery and minimal implementation contracts; central TAKY may hold governance code/contracts/tests. NO raw reference/source data or user-linked manifests |

**Term distinction:** In "GitHub source repository", *source* means development source code (plus approved PWA assets and build machinery), not raw research/source evidence. The latter is data and belongs to Drive or its already-synchronized local data folder. A data folder inside a Git clone does not become safe cloud backup merely because Git ignores it.

**User-confirmed scope (2026-09-28):** GitHub must not become a data/source warehouse. The SOURCE_REFERENCE code in this Draft is merely an optional PWA/Work OS implementation mechanism, NOT permission to create source pointer inventories, copy SOURCE_ARCHIVE, commit private receipts, upload extracted text, or publish captured reference imagery as an app asset. A source image is not an approved PWA asset. Until a relevant PWA actually needs this implementation, keep the module Draft/HOLD and do not activate it or expand GitHub storage. Local SOURCE VAULT and existing authorized Google Drive retain originals and derived data; app-specific approved assets alone may be versioned for the build.

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


## Local SOURCE_ARCHIVE reconciliation before any cleanup

The ignored PC folder inside the Work OS clone remains **on local disk**.
An ignore rule prevents Git upload but does not move, archive, or delete a file.
Do not assume its reported ~9k files are duplicates of SOURCE VAULT's captures_v04
merely because counts look close. Items may differ in bytes, provenance or dates.

The controlled offline script SOURCE_REFERENCE/source_archive_reconcile.py
compares SHA-256 and byte length between explicitly given folders. Default
VAULT scope is captures_v04 and data/notion_incremental/snapshots only.
It creates local-private SOURCE_REFERENCE/runtime/SOURCE_ARCHIVE_COMPARE.json.
It never deletes, moves, copies, commits, pushes, or uploads source files.

Example read-only PowerShell invocation, only once PC folders are confirmed:

    Set-Location -LiteralPath 'D:\Git PWA\TAKY-WORK-OS'
    python .\SOURCE_REFERENCE\source_archive_reconcile.py --archive-root 'D:\Git PWA\TAKY-WORK-OS\SOURCE_ARCHIVE' --vault-root 'D:\Git PWA\TAKY-SOURCE-VAULT'

BYTE_IDENTICAL_CANDIDATE only says that bytes match in the selected VAULT
scope; it does NOT verify provenance, permissions, metadata, source lineage or
backup completeness and does NOT authorize deleting the archive copy.
Missing or unreadable subtree, skipped symlink, changed file, and partial
source scope prevent completeness claims. Keep this report private on the PC:
filenames may reveal personal context, and must not be committed to GitHub.

Actual cleanup is a separate action requiring preview of proposed targets and
verified backup/persistence. No deletion capability is included in this PR.


## Single file read — not bulk ingestion

SOURCE_REFERENCE/source_reader.py provides a separate opt-in in-memory one-source read. It is not started or scheduled by this Draft. The Work OS caller must supply **both** a concrete work_item_id and a trusted independent authorization callback that approves exactly one source/provider/work-item/action. A field in the source pointer cannot self-authorize it. Local sources require an explicit approved root; Drive sources require an independently connected, authorized Drive byte-reader for the same exact Drive file ID. A read is limited to 8 MiB by default, with a hard 25 MiB ceiling. If an independent expected SHA-256 is supplied, mismatch rejects the read. The returned receipt contains only source identity, size, hash, and authority flags; actual bytes are transient in the caller's memory and this module never persists or uploads them.

**Security and activation limits:** The Drive callback is a dependency interface, not an installed OAuth/connector binding. The local reader cannot be safely exposed as a public unauthenticated HTTP endpoint; it needs a trusted local caller and operating-system file permissions. It must not be wired into the current mobile gateway/tunnel. Full document formats, sensitive data screening and legitimate Work OS downstream artifact policy require separate domain handling. Passing a fabricated callback in CI establishes code behavior only, not real user permission.

The pending SOURCE VAULT queue and existing daily 03:30/13:00 automation are separate from Work OS. Neither the new reader nor the local archive byte-audit runs automatically from GitHub, and neither runs on the user's PC merely because a GitHub branch has this code. The actual folder is not copied or deleted.
