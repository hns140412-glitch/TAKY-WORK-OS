#!/usr/bin/env python3
"""TAKY Drawing Engine - verified area schedule / design-overview builder.

Consumes geometric area candidates plus an explicit assignment ledger.
It never decides architectural/legal roles from geometry alone.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict


TRUSTED_ASSIGNMENT_STATES={
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "CAD_RULE_VERIFIED",
    "VERIFIED_SEMANTIC",
}


def build_schedule(
    extraction: Dict[str,Any],
    assignments: Dict[str,Any],
    profile: Dict[str,Any],
) -> Dict[str,Any]:
    candidate_by_id={x["candidate_id"]:x for x in extraction.get("candidates",[])}
    accepted=[]
    rejected=[]

    for a in assignments.get("assignments",[]):
        cid=str(a.get("candidate_id",""))
        candidate=candidate_by_id.get(cid)
        if not candidate:
            rejected.append({"candidate_id":cid,"reason":"CANDIDATE_NOT_FOUND"})
            continue

        state=str(a.get("verification_state","")).upper()
        if state not in TRUSTED_ASSIGNMENT_STATES:
            rejected.append({"candidate_id":cid,"reason":"ASSIGNMENT_NOT_VERIFIED","verification_state":state})
            continue

        role=str(a.get("role","")).upper()
        if not role:
            rejected.append({"candidate_id":cid,"reason":"ROLE_REQUIRED"})
            continue

        area_m2=candidate.get("area_m2")
        if area_m2 is None:
            rejected.append({"candidate_id":cid,"reason":"METRIC_AREA_UNAVAILABLE"})
            continue

        requirement=(profile.get("role_requirements") or {}).get(role,{})
        required_boundary=requirement.get("boundary_requirement")
        if required_boundary:
            boundary_evidence=str(a.get("boundary_evidence","")).upper()
            if boundary_evidence!=str(required_boundary).upper():
                rejected.append({
                    "candidate_id":cid,
                    "reason":"BOUNDARY_EVIDENCE_MISMATCH",
                    "required":required_boundary,
                    "actual":boundary_evidence,
                })
                continue

        accepted.append({
            "candidate_id":cid,
            "role":role,
            "area_m2":float(area_m2),
            "verification_state":state,
            "boundary_evidence":a.get("boundary_evidence"),
            "source_trace":a.get("source_trace"),
        })

    role_totals={}
    for row in accepted:
        role_totals[row["role"]]=role_totals.get(row["role"],0.0)+row["area_m2"]
    role_totals={k:round(v,6) for k,v in sorted(role_totals.items())}

    outputs={}
    for field,spec in (profile.get("aggregates") or {}).items():
        include=[str(x).upper() for x in spec.get("include_roles",[])]
        exclude=[str(x).upper() for x in spec.get("exclude_roles",[])]
        value=sum(role_totals.get(role,0.0) for role in include)-sum(role_totals.get(role,0.0) for role in exclude)
        outputs[field]=round(value,6)

    for field,spec in (profile.get("ratios") or {}).items():
        numerator=outputs.get(spec.get("numerator"))
        denominator=outputs.get(spec.get("denominator"))
        if numerator is None or denominator in (None,0):
            outputs[field]=None
        else:
            outputs[field]=round(numerator/denominator*float(spec.get("multiplier",100.0)),6)

    return {
        "schema":"TAKY_DESIGN_OVERVIEW_AREA_SCHEDULE_V1",
        "profile_id":profile.get("profile_id"),
        "profile_status":profile.get("status"),
        "accepted_assignments":accepted,
        "rejected_assignments":rejected,
        "role_totals_m2":role_totals,
        "design_overview":outputs,
        "policy":{
            "geometry_does_not_assign_legal_role":True,
            "unknown_remains_unknown":True,
            "auto_wall_offset_forbidden":True,
        },
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("extraction_json")
    p.add_argument("assignment_json")
    p.add_argument("profile_json")
    p.add_argument("--out")
    args=p.parse_args()
    extraction=json.loads(Path(args.extraction_json).read_text(encoding="utf-8"))
    assignments=json.loads(Path(args.assignment_json).read_text(encoding="utf-8"))
    profile=json.loads(Path(args.profile_json).read_text(encoding="utf-8"))
    result=build_schedule(extraction,assignments,profile)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
