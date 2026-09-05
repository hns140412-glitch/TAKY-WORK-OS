# TAKY WORK OS

Status: REV_00 / PRE-CONFIRMATION EVOLVING DESIGN SOURCE

## Purpose
TAKY-WORK-OS is the implementation and operating layer for AI-assisted professional work through conversation. It stores reusable workflows, automation logic, validation rules, schemas, scripts, and integration policies. It is not the primary warehouse for business project files.

## Authority
TAKY / GRAND MASTER rules govern this repository. Work OS rules may specialize execution but may not weaken validation, evidence, approval, privacy, or source-of-truth rules.

## Interaction principle
The user should be able to provide files in chat and request work naturally. TAKY handles classification, naming, filing, validation, and result organization behind the scenes. Do not force the user to operate a complex lifecycle folder tree for ordinary work.

## Google Drive workspace
Preferred governed workspace name: TAKY-WORK-OS.
Google Drive holds actual project inputs and generated business artifacts such as DWG/DXF, PDF, XLSX, DOCX, images, references, and deliverables.

Default visible structure:

TAKY-WORK-OS/
└─ [PROJECT]/
   └─ [YYYY-MM-DD]_[WORK-TITLE]/
      ├─ 요청자료/
      │  └─ original files supplied for the request
      ├─ 요청사항.md
      └─ TAKY-generated review, working, report, and final artifacts

Do not create INPUT/WORKING/REVIEW/OUTPUT subfolders by default. Those are lifecycle states, not mandatory user-facing folders. Add subfolders only when scale or a specific workflow genuinely requires them.

## Work-item record
요청사항.md should capture, as applicable:
- Project
- Request date
- Work title
- User request summary
- Source/input file list
- Validation/review status
- Items requiring user decision

## File safety
1. Preserve supplied originals in 요청자료.
2. Never silently overwrite an original source file.
3. Create reviewed/modified versions as clearly named separate artifacts unless explicit replacement is authorized.
4. Ambiguous classifications or technical conclusions must be marked REVIEW_REQUIRED / UNVERIFIED rather than guessed.

## Automatic project classification
If project identity is clear from conversation, filenames, source documents, or approved project context, classify automatically. Ask the user only when ambiguity materially changes where the work belongs or how it should be executed.

## CAD ↔ spreadsheet validation pattern
For CAD/area/spreadsheet review, prefer structured CAD object evidence over screenshot-only numeric inference when authoritative accuracy is required. Relevant evidence can include layer, object type, closed polyline, text, color, position, calculated area, spreadsheet mapping, formulas, totals, and rounding rules.

Typical flow:
CAD/DXF or available source evidence → structured extraction → spreadsheet mapping → calculation/check → reverse comparison → discrepancy report → validation → user approval where required.

Screenshots/PDFs may support visual review but do not replace authoritative CAD object data when exact geometry is required.

## Internal lifecycle
The simplified Drive view does not remove GRAND MASTER gates. Internally preserve intent, fit, orchestration, routing, execution trace, handoff, self-validation, evidence validation, cross-validation, regression/impact checks, human approval where required, commit/action, and history.

AI5 remains:
ORCHESTRATION → ROUTING → HANDOFF → CROSS-VALIDATION → HUMAN APPROVAL

## Storage separation
- TAKY: canonical central governance/master logic
- TAKY-WORK-OS GitHub: reusable work execution logic and automation definitions
- TAKY-ASSETS: reusable development/product assets
- Google Drive TAKY-WORK-OS: actual business/project source files and generated deliverables
- Netlify: deployment only for actual webapps/PWAs that require it
- Company PC: synchronized local working environment, not canonical master authority
