# TAKY GOVERNANCE CORRECTION — 2026-09-23

## Correction
TAKY governance is no longer considered implemented when a rule exists only in prose, JSON, a handoff, or a prompt.

A governance rule is IMPLEMENTED only when at least one of the following is true:
- execution permission blocks the forbidden path;
- a required tool performs the logic;
- independent validation blocks progression;
- regression tests prove the failure is caught.

## Production authority
Only an authorized route may issue a production authorization token.
Diagnostic producers cannot issue user-facing artifacts.

## Validation authority
Producer != validator.
A producer cannot certify its own output.

## Exposure authority
User-visible or final-approvable state requires an authentic independent validation receipt.
Default exposure state is hidden/internal.

## Human authority
Human approval is for design/presentation choice, not defect detection.

## Failure memory
Critical failures must be converted into:
FAILURE → ROOT_CAUSE → ANTI_PATTERN → ENFORCEMENT → REGRESSION_FIXTURE → CROSS_PROJECT_POLICY.

## Resume mode
Critical governance failures require SURGERY / RE_ARCHITECTURE mode until execution-path changes and regression evidence exist.
