#!/usr/bin/env python3
"""TAKY Drawing Engine - verified semantic rule promoter.

A mined candidate becomes an active CAD rule only when an explicit approval
ledger supplies an accepted evidence state. Missing or ambiguous approval
never activates a rule.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict


ALLOWED_EVIDENCE = {
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "OFFICE_STANDARD_VERIFIED",
    "PROJECT_STANDARD_VERIFIED",
}


def promote(candidates: Dict[str, Any], approvals: Dict[str, Any]) -> Dict[str, Any]:
    if candidates.get("schema") != "TAKY_DXF_RULE_CANDIDATES_V1":
        raise ValueError("DXF_RULE_CANDIDATES_REQUIRED")

    by_id={c["candidate_id"]:c for c in candidates.get("candidates",[])}
    active=[]
    rejected=[]
    invalid=[]

    for approval in approvals.get("approvals",[]):
        cid=str(approval.get("candidate_id",""))
        candidate=by_id.get(cid)
        if not candidate:
            invalid.append({"candidate_id":cid,"reason":"CANDIDATE_NOT_FOUND"})
            continue

        decision=str(approval.get("decision","")).upper()
        if decision=="REJECT":
            rejected.append({"candidate_id":cid,"reason":approval.get("reason")})
            continue
        if decision!="APPROVE":
            invalid.append({"candidate_id":cid,"reason":"APPROVE_OR_REJECT_REQUIRED"})
            continue

        evidence_state=str(approval.get("evidence_state","")).upper()
        if evidence_state not in ALLOWED_EVIDENCE:
            invalid.append({"candidate_id":cid,"reason":"VERIFIED_EVIDENCE_REQUIRED","evidence_state":evidence_state})
            continue

        if candidate.get("promotion_state")=="AMBIGUOUS_PROPOSAL" and not approval.get("semantic_type"):
            invalid.append({"candidate_id":cid,"reason":"AMBIGUOUS_SEMANTIC_REQUIRES_EXPLICIT_OVERRIDE"})
            continue

        semantic=str(approval.get("semantic_type") or candidate.get("suggested_semantic_type") or "")
        if not semantic:
            invalid.append({"candidate_id":cid,"reason":"SEMANTIC_TYPE_REQUIRED"})
            continue

        active.append({
            "rule_id":"rule-"+cid,
            "enabled":True,
            "field":candidate["field"],
            "match":candidate["match"],
            "pattern":candidate["pattern"],
            "semantic_type":semantic,
            "confidence":evidence_state,
            "verification_state":"CAD_RULE_VERIFIED",
            "evidence_state":evidence_state,
            "evidence_ref":approval.get("evidence_ref"),
            "source_candidate_id":cid,
        })

    payload={
        "rule_set_id": approvals.get("rule_set_id") or "PROMOTED_DXF_RULES",
        "rule_set_version": approvals.get("rule_set_version") or "1",
        "status":"VERIFIED_ACTIVE_RULES",
        "verification_policy":"EXPLICIT_EVIDENCE_REQUIRED",
        "rules":active,
        "rejected":rejected,
        "invalid_approvals":invalid,
    }
    payload["rule_set_digest"]=hashlib.sha256(
        json.dumps(active,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")
    ).hexdigest()
    return payload


def main():
    p=argparse.ArgumentParser()
    p.add_argument("candidate_json")
    p.add_argument("approval_json")
    p.add_argument("--out")
    args=p.parse_args()
    candidates=json.loads(Path(args.candidate_json).read_text(encoding="utf-8"))
    approvals=json.loads(Path(args.approval_json).read_text(encoding="utf-8"))
    result=promote(candidates,approvals)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
