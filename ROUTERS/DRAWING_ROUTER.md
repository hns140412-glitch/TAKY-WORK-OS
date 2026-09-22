# DRAWING ROUTER

Status: ACTIVE CANDIDATE / BRANCH IMPLEMENTATION

Purpose: choose the lightest drawing workflow that preserves source authority and satisfies the user's intended result.

## Route

### FAST
Use when:
- request is style-only;
- no numeric/geometry authority claim is required;
- output does not change architecture.

Typical:
- line-weight cleanup
- grayscale hierarchy
- presentation polish

### CONTROLLED
Use when:
- sales/publication/section/site/CG/A3 presentation is requested;
- material, furniture, landscape, entourage or AI layers may be introduced;
- source geometry must remain locked.

Required:
- KEY_STATE
- KEEP/CHANGE/MAY_CHANGE/UNKNOWN policy
- preservation validation
- user-intent check

### AUTHORITATIVE
Use when:
- area, dimensions, CAD-to-Excel, regulatory geometry or authoritative measurement is claimed;
- geometry is intentionally edited.

Required:
- authoritative or explicitly qualified source
- structured extraction
- deterministic calculation/check
- reverse validation

## Anti-patterns

- PRETTY != COMPLETE
- CONTROLNET != GEOMETRY GUARANTEE
- RASTER DERIVATION != AUTHORITATIVE CAD
- VALIDATION != SUBSTITUTE FOR BUILD
- UNKNOWN != PERMISSION TO GUESS

## Output purpose mapping

- TECHNICAL_CLEAN -> FAST or CONTROLLED
- PUBLICATION -> CONTROLLED
- SITE_PRESENTATION -> CONTROLLED
- SECTION_PRESENTATION -> CONTROLLED
- SALES_CLEAN -> CONTROLLED
- SALES_TEXTURED -> CONTROLLED
- CG_HANDOFF -> CONTROLLED
- A3_REPORT -> CONTROLLED
- CAD_EXCEL -> AUTHORITATIVE
- AREA_ANALYSIS -> AUTHORITATIVE
- REGULATORY_CHECK -> AUTHORITATIVE
