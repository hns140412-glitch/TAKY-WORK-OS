# WORK / LEARNING_FAMILY / SHARED HUB DOMAIN ISOLATION — CANDIDATE

Status: CANDIDATE / NOT CENTRAL TAKY CANONICAL
Date: 2026-09-08

## 1. Goal
Prevent business Work OS state, family/learning state, and common capabilities from silently mixing while still allowing both domains to reuse common capabilities when needed.

## 2. Domain contract
`DOMAIN = WORK | LEARNING_FAMILY | SHARED`

- WORK = business/work projects, CAD, spreadsheet, document, mail, project automation.
- LEARNING_FAMILY = family learning, timetable, assignment intake, Planner, Ready & Set, Hide & Seek, Snap & Pop, piano practice, parent/child flows.
- SHARED = common capability hub only. Shared is not the canonical owner of project or family data.

## 3. Hard isolation candidates
- `WORK -> LEARNING_FAMILY` automatic inheritance = FAIL.
- `LEARNING_FAMILY -> WORK` automatic inheritance = FAIL.
- Shared capabilities may be reused, but state/history/task data retain their originating domain.
- Search, recommendation, automation and history must default to the current domain.
- Cross-domain use requires an explicit REFERENCE/BRIDGE object; silent copy or promotion is prohibited.
- A user who operates only WORK must not receive learning/family surfaces by default.
- A user who operates only LEARNING_FAMILY must not receive business/CAD/mail/project surfaces by default.
- When both are active, current context must be resolved before domain-owned write actions.

## 4. Shared Hub examples
The following may live as reusable capability contracts without owning domain data:
- Guide capability
- Action/Skill Registry
- Capture/OCR engine
- file intake / media quality checks
- authentication / identity adapter
- sync primitives
- cost/token guard
- validation / trace framework

Example:
`WORK document photo -> SHARED OCR capability -> result stored in WORK`
`homework photo -> SHARED OCR capability -> result stored in LEARNING_FAMILY`

`SAME ENGINE != SAME DATA DOMAIN`

## 5. Ready & Set role boundary candidate
Within LEARNING_FAMILY:
- Parent = assignment source input / fact confirmation / grading / support.
- Planner/Learning Master = allocation owner.
- Child = today's assigned-task selection / execution / event-homework intake / progress.
- Child-added school/event homework keeps provenance `CHILD_ADDED` and may carry `PARENT_REVIEW_PENDING`, while remaining executable when appropriate.
- Parent does not manually become the normal allocation engine.

## 6. Data contract candidate
Every persistent entity that can cross a shared capability should carry at least:
`domain / ownerType / memberId or projectId / source / provenance / createdAt / visibility / lifecycleState`

Cross-domain bridge adds:
`bridgeId / sourceDomain / targetDomain / sourceEntityId / bridgePurpose / approvalState / copiedOrReferenced`

## 7. Implementation order
1. Preserve domain field in new schemas.
2. Route UI by domain and role.
3. Make Shared Hub capability calls stateless or explicitly scoped.
4. Add regression tests preventing cross-domain history/task leakage.
5. Only later add a unified multi-domain hub/dashboard if needed.

## 8. Current status
- Work OS / Learning separation concept: RECOVERED / PRESERVE.
- Shared Hub concept: RECOVERED / ADOPT CANDIDATE.
- Full two-track runtime: NOT IMPLEMENTED.
- Ready Stage F role split: staging implementation candidate; does not implement this whole domain contract.

END
