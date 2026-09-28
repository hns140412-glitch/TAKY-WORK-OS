# TAKY WORK OS

Status: REV_00 / PRE-CONFIRMATION EVOLVING DESIGN SOURCE

## Purpose
TAKY-WORK-OS is the implementation and operating layer for AI-assisted professional work through conversation. It stores reusable workflows, automation logic, validation rules, schemas, scripts, and integration policies. It is not the primary warehouse for business project files.

## Authority
TAKY / GRAND MASTER rules govern this repository. Work OS rules may specialize execution but may not weaken validation, evidence, approval, privacy, source-of-truth, Deep Analysis, or anti-omission rules.

## Interaction principle
The user should be able to provide files in chat and request work naturally. TAKY handles classification, naming, filing, validation, and result organization behind the scenes. Do not force the user to operate a complex lifecycle folder tree for ordinary work.

## Storage authority clarification — reference first (2026-09-28 DRAFT)

Confirmed storage split:
- DATA STORAGE: existing Google Drive or already synchronized local folder for originals, collected/reference material, indices, run state, source manifests, private receipts and work results. Verify actual persistence/sync before claiming it. Existing synchronized folder is used directly; no secondary mirror or redundant Drive root.
- GITHUB: the development source repository (PWA/application code, tests, UI/build/deployment tooling and implementation contracts) and expressly approved application assets needed for the app. App assets are different from collected RAW/reference images, even if both have image extensions.
- RUNTIME LINK: use an existing Drive file ID or scoped local source pointer and read only what the current work item needs; never push a data corpus/metadata inventory into GitHub or replicate the whole dataset into Work OS.


This subordinate implementation inherits central TAKY OS/DRIVE_STORAGE_MAP.json:
there is one existing governed TAKY Drive root. The older illustrative
"TAKY-WORK-OS/" folder drawing below is **not authority to create another
independent Drive root**. Existing project files stay in their owned local or
Drive locations with stable source_ref/Drive file ID whenever recoverable.

For an already preserved original, a Work OS work item records a task-scoped
source pointer, checked permission/persistence, and only the relevant output;
it does not replicate the entire SOURCE_ARCHIVE, SOURCE VAULT, Notion captures,
images or other raw datasets into GitHub, a fresh Drive project folder or Work OS.
"Preserve supplied originals" below means do not overwrite or discard originals;
it does not require making another binary copy when the original is already
durably accessible. Any necessary task-specific duplicate/export must be
separately justified by access/recoverability, user rights and change scope,
and must not claim Indexing approval or canonical promotion by mere reference.

SOURCE_REFERENCE is an opt-in draft library only; it is not an active sync job,
unauthenticated browser endpoint, automated Work OS importer or local Drive
authorization provider. Work OS remains HOLD. Private reference metadata and
raw content must not be Git committed. Actual Drive access and local runner
binding remain separate verified activation steps.

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

## Deep Analysis operating rule
Work OS inherits TAKY Deep Analysis. For material professional work, analysis shall recover relevant source/context/decisions, check coverage, assess source reliability, actively use authoritative sources and relevant cases, compare alternatives, extract useful principles, verify local/domain/project applicability, classify prior decisions, find omissions/conflicts/errors, complement, improve and optimize, then self-correct, self-validate, cross-validate, impact/regression-check and recheck decision coverage.

Comparative research is for principle extraction, not direct copying. Foreign or external practices must be localized and revalidated against applicable Korean law/administration and project conditions before adoption when the project is in Korea.

Relevant prior items must end in a traceable state: PRESERVE / ADOPT / ADJUST / HOLD / REJECT / CONFLICT / SUPERSEDED. A source that was merely read is not necessarily covered; non-adopted items must not disappear without disposition.

## Architecture project state model
For architecture workflows distinguish:
- DOMAIN_STAGE: planning / schematic / review / permit / technical design / start / construction / completion or the applicable local equivalents
- ADMIN_CASE: committee review / permit / permit amendment / start notification / completion/use approval / other administrative cases
- WORK_ITEM: consultation / supplement / review / reply / drawing revision / calculation validation / submission

PROJECT STAGE ≠ ADMIN CASE ≠ WORK ITEM.
STAGE DATE REACHED ≠ STAGE COMPLETE.

Stage gates should use ENTRY CONDITION → REQUIRED INPUT → REQUIRED DECISION / COORDINATION → REQUIRED CHECK → REQUIRED DELIVERABLE → EXIT GATE.
Submission readiness should verify required drawings, calculations, forms, consultants, evidence, cross-checks and unresolved critical issues before READY TO SUBMIT.

## Architecture Regulatory Map / Applicability Engine
For architecture projects, build or recover a PROJECT REGULATORY MAP at fit-for-purpose depth from project facts such as jurisdiction, site, use, use-by-area, site area, gross/floor area, floors, height, units/rooms/seats, basement, excavation depth, development area, parking, land-use controls, surrounding protected/special zones, public/private status and project/construction method.

Applicability shall not be reduced to a single size threshold. Evaluate, where material:
PROJECT TYPE × SIZE × USE × LOCATION × PUBLIC/PRIVATE × ADMINISTRATIVE STAGE × EFFECTIVE DATE × EXCEPTION/TRANSITION × LOCAL ADDITIONAL REQUIREMENT.

The regulatory map should determine, when applicable, required / conditional / not-applicable / verification-required status for building permit/review and related impact assessments, consultations, certifications and approvals such as environmental, traffic, disaster, educational environment, underground safety, landscape, structural/special-structure, fire/performance-based design, energy, zero-energy, green-building, accessibility and other location-specific regimes. This list is a discovery scope, not an assertion that every item applies.

For each material regulatory item preserve:
WHY / LEGAL BASIS / TRIGGER / THRESHOLD OR CLASSIFICATION / EXCEPTION / EFFECTIVE DATE / AUTHORITY / REQUIRED STAGE / DELIVERABLE / STATUS / EVIDENCE / DESIGN-SCHEDULE-COST IMPACT.

Hard rules:
- SIZE THRESHOLD PASS ≠ APPLICABILITY PASS
- STATUTE CHECK ≠ ADMINISTRATIVE REQUIREMENT CHECK
- TECHNICAL COMPLIANCE ≠ PROCEDURAL COMPLIANCE
- LATEST LAW ≠ APPLICABLE LAW
- LAW TEXT FOUND ≠ APPLICABILITY VERIFIED
- APPLICABLE ≠ DESIGN COMPLIANT
- ADMIN CASE ≠ STATUTORY RULE

Use official law, implementing rules, ordinances, notices/plans, government/authority guidance, official interpretations/replies, permit/review/consultation cases and actual project evidence with explicit authority distinction. Administrative cases are evidence for interpretation/application patterns, not automatic statutory rules.

## Jurisdiction / Rule / Knowledge model
Where material, preserve:
COUNTRY → REGION/STATE → CITY/LOCAL AUTHORITY → BASE LAW/CODE → ADOPTED EDITION/EFFECTIVE DATE → LOCAL AMENDMENT/ORDINANCE → DISTRICT/SITE RULE → REVIEW/PERMIT CONDITION → PROJECT APPLICATION.

External/foreign systems shall not be flattened into one global rule set. Base rules may require jurisdictional override and project-specific conditions.

Knowledge classes remain distinct:
LAW / AUTHORITY / STANDARD / DETAIL / DESIGN REFERENCE.
DESIGN REFERENCE ≠ LEGAL REQUIREMENT.
STANDARD DETAIL ≠ PROJECT DETAIL.
REFERENCE VALID ≠ PROJECT APPLICABLE.
HISTORICAL KNOWLEDGE ≠ CURRENT STANDARD.

## Regulatory calculation / validation modes
Route legal and technical checks to the appropriate validation mode rather than a flat O/X checklist:
1. CLASSIFICATION / LOOKUP — use, construction/fire-resistance classification, etc.
2. THRESHOLD CHECK — count, area, ratio, distance, etc.
3. GEOMETRIC CALCULATION — basement/ground surface, height, travel distance, separation, etc.
4. EFFECTIVE-AREA / PERFORMANCE CALCULATION — smoke vent, ventilation, daylight and similar checks.
5. PROCEDURAL CHECK — required submission, consultation, approval, inspection, timing and evidence.

Preserve source inputs, formulas/logic, derived values, drawing/document references and result evidence. PROJECT VALUE ≠ SOURCE VALUE UNTIL TRACEABLE.

## Code / Regulatory Profile and pre-check
For material projects maintain a compact project code/regulatory profile appropriate to the jurisdiction, including use, mixed-use conditions, height, stories, area, fire/life-safety conditions, accessibility, parking, structural/energy/performance conditions and project-specific administrative conditions.

Run early regulatory PRE-CHECK where late discovery would create major redesign or schedule risk. PERMIT CHECK ≠ FIRST CODE CHECK.

## Conditions / Consultation
Maintain a Condition Register when approvals, reviews or consultations create conditions. APPROVAL RECEIVED ≠ CONDITIONS CLOSED.

Consultation lifecycle may include:
REQUEST → DEPARTMENT/AUTHORITY → RESPONSE → CONDITION → ACTION PLAN → DESIGN REFLECTION → RESUBMISSION → RECONFIRMATION → CLOSE.

Keep decision classification separate from execution/reflection status.

## Evidence maturity and process state
Do not collapse value maturity, process state and evidence maturity into one status.

VALUE MATURITY: ASSUMPTION → TARGET → DESIGN → CONFIRMED.
PROCESS STATE: OPEN → REVIEW → COORDINATION → APPROVAL → CLOSED, specialized as required.
EVIDENCE MATURITY: NONE → BASIS → DOCUMENTED/SPECIFIED → SUBMITTED → APPROVED → INSTALLED → INSPECTED → VERIFIED/CLOSED, specialized as required.

APPROVED DESIGN VALUE ≠ INSTALLED / VERIFIED EVIDENCE.

## Data lineage / impact / reverse validation
Where values propagate across tools and documents, preserve lineage such as:
SOURCE DATA → DERIVED DATA → DESIGN DOCUMENT → SUBMISSION DOCUMENT → ADMINISTRATIVE RESULT.

Reverse validation should trace administrative result/submission/drawing/calculation back to source. DOCUMENT MATCH ≠ SOURCE MATCH.

Changes to material project facts should trigger impact analysis across dependent calculations, drawings, submissions, assessments, certifications, conditions and schedules where relevant.

## CAD ↔ spreadsheet validation pattern
For CAD/area/spreadsheet review, prefer structured CAD object evidence over screenshot-only numeric inference when authoritative accuracy is required. Relevant evidence can include layer, object type, closed polyline, text, color, position, calculated area, spreadsheet mapping, formulas, totals, and rounding rules.

Typical flow:
CAD/DXF or available source evidence → structured extraction → spreadsheet mapping → calculation/check → reverse comparison → discrepancy report → validation → user approval where required.

Screenshots/PDFs may support visual review but do not replace authoritative CAD object data when exact geometry is required.

Hard rules:
- VISIBLE SHEET PASS ≠ WORKBOOK PASS
- VALUE MATCH ≠ FORMULA / DEPENDENCY PASS
- CURRENT SHEET ≠ FULL VERSION HISTORY
- EXTERNAL LINK PRESENT ≠ SOURCE RECOVERABLE

## Legacy project structure recognition
Do not force physical migration of established project folders solely to match Work OS. Recognize legacy semantics such as CURRENT / ARCHIVE / STUDY / SENT / RECEIVED / OFFICE MEMO / BACKUP / APPROVAL and map them to logical Work OS state while preserving the user's established physical structure unless migration is separately approved.

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
