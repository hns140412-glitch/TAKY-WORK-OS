#!/usr/bin/env python3
"""TAKY Drawing Engine - presentation mask manifest builder.

Builds mask-ready manifests only from VERIFIED semantic candidates.
It does not infer missing room/material boundaries.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List


DEFAULT_MAP = {
    "ROOM_BOUNDARY": "ROOM_MATERIAL",
    "LANDSCAPE": "LANDSCAPE",
    "FURNITURE": "FURNITURE",
    "ANNOTATION": "ANNOTATION",
}

TRUSTED_VERIFICATION = {
    "CAD_RULE_VERIFIED",
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "VERIFIED_SEMANTIC",
}


def build_manifest(payload: Dict[str, Any], semantic_to_mask: Dict[str, str] | None = None) -> Dict[str, Any]:
    mapping = dict(DEFAULT_MAP)
    if semantic_to_mask:
        mapping.update(semantic_to_mask)

    masks: Dict[str, List[Dict[str, Any]]] = {}
    rejected: List[Dict[str, Any]] = []

    for record in payload.get("records", []):
        semantic = str(record.get("semantic_type") or "")
        state = record.get("semantic_state")
        verification = str(record.get("verification_state") or "").upper()

        if state != "CANDIDATE" or semantic == "UNKNOWN":
            rejected.append({"handle": record.get("handle"), "reason": "SEMANTIC_NOT_CONFIRMED_CANDIDATE"})
            continue
        if verification not in TRUSTED_VERIFICATION:
            rejected.append({"handle": record.get("handle"), "reason": "SEMANTIC_RULE_NOT_VERIFIED", "verification_state": verification})
            continue

        mask_id = mapping.get(semantic)
        if not mask_id:
            rejected.append({"handle": record.get("handle"), "reason": "NO_MASK_MAPPING", "semantic_type": semantic})
            continue

        geometry = record.get("geometry")
        annotation = record.get("annotation")

        if semantic == "ANNOTATION":
            if not annotation:
                rejected.append({"handle": record.get("handle"), "reason": "ANNOTATION_PAYLOAD_REQUIRED", "semantic_type": semantic})
                continue
        else:
            if not geometry:
                rejected.append({"handle": record.get("handle"), "reason": "GEOMETRY_REQUIRED", "semantic_type": semantic})
                continue

        if semantic == "ROOM_BOUNDARY":
            if geometry.get("type") == "LineString" and geometry.get("closed") is not True:
                rejected.append({"handle": record.get("handle"), "reason": "ROOM_BOUNDARY_NOT_CLOSED", "semantic_type": semantic})
                continue

        masks.setdefault(mask_id, []).append(
            {
                "handle": record.get("handle"),
                "semantic_type": semantic,
                "verification_state": verification,
                "geometry": geometry,
                "annotation": annotation,
                "source_layer": record.get("layer"),
                "rule_id": record.get("rule_id"),
            }
        )

    summaries=[]
    for mask_id, records in sorted(masks.items()):
        states={str(x.get("verification_state","")).upper() for x in records}
        validation_state="CAD_RULE_VERIFIED" if states and states.issubset(TRUSTED_VERIFICATION) else "UNVERIFIED"
        summaries.append({
            "mask_id":mask_id,
            "record_count":len(records),
            "validation_state":validation_state,
            "source_trace":{
                "layers":sorted({str(x.get("source_layer","")) for x in records if x.get("source_layer")}),
                "rule_ids":sorted({str(x.get("rule_id","")) for x in records if x.get("rule_id")}),
            },
            "presentation_only":False,
        })

    return {
        "schema": "TAKY_PRESENTATION_MASK_MANIFEST_V2",
        "canonical_promotion": False,
        "trusted_verification_states": sorted(TRUSTED_VERIFICATION),
        "masks": masks,
        "mask_summaries": summaries,
        "rejected": rejected,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("semantic_json")
    parser.add_argument("--out")
    args = parser.parse_args()
    payload = json.loads(Path(args.semantic_json).read_text(encoding="utf-8"))
    result = build_manifest(payload)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
