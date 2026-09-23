#!/usr/bin/env python3
"""TAKY Drawing Engine - DXF semantic rule candidate miner.

Produces PROPOSAL_ONLY candidates from layer/block-name signals and entity
composition. It never enables a rule and never promotes a candidate to
architectural truth.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple


SIGNALS: List[Tuple[str, str]] = [
    (r"(^|[-_. ])wall(s)?($|[-_. ])|벽", "WALL"),
    (r"(^|[-_. ])col(umn|s)?($|[-_. ])|기둥", "COLUMN"),
    (r"(^|[-_. ])door(s)?($|[-_. ])|문($|[-_. ])", "DOOR"),
    (r"(^|[-_. ])win(dow|s)?($|[-_. ])|glaz|창", "WINDOW_OR_GLAZING"),
    (r"(^|[-_. ])room($|[-_. ])|(^|[-_. ])area($|[-_. ])|space|실($|[-_. ])|면적", "ROOM_BOUNDARY"),
    (r"furn|furniture|chair|table|sofa|bed|가구", "FURNITURE"),
    (r"land|landscape|tree|plant|green|조경|식재|수목", "LANDSCAPE"),
    (r"park|parking|stall|주차", "PARKING"),
    (r"anno|text|note|label|dim|dimension|문자|주석|치수", "ANNOTATION"),
]


def _id(layer: str, semantic: str) -> str:
    raw=f"{layer}::{semantic}".encode("utf-8")
    return "cand-"+hashlib.sha256(raw).hexdigest()[:16]


def _name_signals(name: str) -> List[str]:
    out=[]
    for pattern, semantic in SIGNALS:
        if re.search(pattern, name, flags=re.IGNORECASE):
            out.append(semantic)
    return sorted(set(out))


def mine(profile: Dict[str, Any]) -> Dict[str, Any]:
    if profile.get("schema") != "TAKY_DXF_LAYER_PROFILE_V1":
        raise ValueError("DXF_LAYER_PROFILE_REQUIRED")

    candidates=[]
    for layer in profile.get("layers", []):
        layer_name=str(layer.get("layer",""))
        signals=_name_signals(layer_name)

        # Entity composition can support a proposal but never create a verified rule.
        support=[]
        if layer.get("closed_polyline_count",0)>0:
            support.append("HAS_CLOSED_POLYLINE")
        if layer.get("insert_count",0)>0:
            support.append("HAS_BLOCK_INSERT")
        if layer.get("annotation_count",0)>0:
            support.append("HAS_ANNOTATION")
        if layer.get("hatch_count",0)>0:
            support.append("HAS_HATCH")

        for semantic in signals:
            candidates.append({
                "candidate_id": _id(layer_name, semantic),
                "field": "layer",
                "match": "exact",
                "pattern": layer_name,
                "suggested_semantic_type": semantic,
                "name_signal": True,
                "supporting_evidence": support,
                "layer_evidence_digest": layer.get("evidence_digest"),
                "promotion_state": "PROPOSAL_ONLY",
                "enabled": False,
                "verification_state": "UNVERIFIED",
            })

        # Block names can separately suggest furniture/fixture semantics.
        for block_name in sorted((layer.get("block_names") or {}).keys()):
            block_signals=_name_signals(block_name)
            for semantic in block_signals:
                candidates.append({
                    "candidate_id": _id(f"BLOCK:{block_name}", semantic),
                    "field": "block_name",
                    "match": "exact",
                    "pattern": block_name,
                    "source_layer": layer_name,
                    "suggested_semantic_type": semantic,
                    "name_signal": True,
                    "supporting_evidence": ["BLOCK_NAME_SIGNAL"],
                    "layer_evidence_digest": layer.get("evidence_digest"),
                    "promotion_state": "PROPOSAL_ONLY",
                    "enabled": False,
                    "verification_state": "UNVERIFIED",
                })

    # Mark same-pattern competing suggestions as ambiguous.
    groups={}
    for c in candidates:
        key=(c["field"],c["pattern"])
        groups.setdefault(key,[]).append(c)
    for group in groups.values():
        semantics={x["suggested_semantic_type"] for x in group}
        if len(semantics)>1:
            for x in group:
                x["promotion_state"]="AMBIGUOUS_PROPOSAL"

    digest=hashlib.sha256(
        json.dumps(candidates,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")
    ).hexdigest()

    return {
        "schema":"TAKY_DXF_RULE_CANDIDATES_V1",
        "source_geometry_digest":profile.get("geometry_digest"),
        "candidate_digest":digest,
        "semantic_inference":"PROPOSAL_ONLY",
        "auto_enable":False,
        "candidates":candidates,
        "stats":{
            "candidate_count":len(candidates),
            "ambiguous_count":sum(x["promotion_state"]=="AMBIGUOUS_PROPOSAL" for x in candidates),
        },
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("profile_json")
    p.add_argument("--out")
    args=p.parse_args()
    profile=json.loads(Path(args.profile_json).read_text(encoding="utf-8"))
    result=mine(profile)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
