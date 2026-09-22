#!/usr/bin/env python3
"""TAKY Drawing Engine - presentation mask manifest builder.

Builds mask-ready geometry manifests only from already mapped semantic candidates.
It does not perform rasterization and does not infer missing room/material boundaries.
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


def build_manifest(payload: Dict[str, Any], semantic_to_mask: Dict[str, str] | None = None) -> Dict[str, Any]:
    mapping = dict(DEFAULT_MAP)
    if semantic_to_mask:
        mapping.update(semantic_to_mask)

    masks: Dict[str, List[Dict[str, Any]]] = {}
    rejected: List[Dict[str, Any]] = []

    for record in payload.get("records", []):
        semantic = record.get("semantic_type")
        state = record.get("semantic_state")
        if state != "CANDIDATE" or semantic == "UNKNOWN":
            rejected.append({"handle": record.get("handle"), "reason": "SEMANTIC_NOT_CONFIRMED_CANDIDATE"})
            continue

        mask_id = mapping.get(str(semantic))
        if not mask_id:
            rejected.append({"handle": record.get("handle"), "reason": "NO_MASK_MAPPING", "semantic_type": semantic})
            continue

        geometry = record.get("geometry")
        if not geometry:
            rejected.append({"handle": record.get("handle"), "reason": "GEOMETRY_REQUIRED", "semantic_type": semantic})
            continue

        masks.setdefault(mask_id, []).append(
            {
                "handle": record.get("handle"),
                "semantic_type": semantic,
                "geometry": geometry,
                "source_layer": record.get("layer"),
                "rule_id": record.get("rule_id"),
            }
        )

    return {
        "schema": "TAKY_PRESENTATION_MASK_MANIFEST_V1",
        "canonical_promotion": False,
        "masks": masks,
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
