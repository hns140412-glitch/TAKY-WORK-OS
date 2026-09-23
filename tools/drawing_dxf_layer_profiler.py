#!/usr/bin/env python3
"""TAKY Drawing Engine - DXF layer/entity profiler.

Evidence-only profiler. It summarizes what exists in the CAD file without
assigning architectural meaning to layer names or entity shapes.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict


HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("drawing_dxf_adapter", HERE / "drawing_dxf_adapter.py")
_adapter = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_adapter)


def _digest(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def profile_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if "entities" not in payload:
        raise ValueError("FULL_ENTITY_PAYLOAD_REQUIRED")

    buckets: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "entity_count": 0,
        "geometry_count": 0,
        "annotation_count": 0,
        "hatch_count": 0,
        "closed_polyline_count": 0,
        "insert_count": 0,
        "unsupported_count": 0,
        "entity_types": Counter(),
        "geometry_types": Counter(),
        "block_names": Counter(),
        "annotation_types": Counter(),
    })

    for entity in payload.get("entities", []):
        layer = str(entity.get("layer", "0"))
        bucket = buckets[layer]
        bucket["entity_count"] += 1

        kind = str(entity.get("type", "UNKNOWN"))
        bucket["entity_types"][kind] += 1

        geometry = entity.get("geometry")
        if geometry:
            bucket["geometry_count"] += 1
            gtype = str(geometry.get("type", "UNKNOWN"))
            bucket["geometry_types"][gtype] += 1
            if gtype == "LineString" and geometry.get("closed") is True:
                bucket["closed_polyline_count"] += 1
            if gtype == "Insert":
                bucket["insert_count"] += 1
                name = str(geometry.get("name", ""))
                if name:
                    bucket["block_names"][name] += 1

        annotation = entity.get("annotation")
        if annotation:
            bucket["annotation_count"] += 1
            bucket["annotation_types"][kind] += 1

        presentation = entity.get("presentation")
        if presentation:
            bucket["hatch_count"] += 1

        if entity.get("unsupported"):
            bucket["unsupported_count"] += 1

    layers = []
    for layer in sorted(buckets):
        b = buckets[layer]
        record = {
            "layer": layer,
            "entity_count": b["entity_count"],
            "geometry_count": b["geometry_count"],
            "annotation_count": b["annotation_count"],
            "hatch_count": b["hatch_count"],
            "closed_polyline_count": b["closed_polyline_count"],
            "insert_count": b["insert_count"],
            "unsupported_count": b["unsupported_count"],
            "entity_types": dict(sorted(b["entity_types"].items())),
            "geometry_types": dict(sorted(b["geometry_types"].items())),
            "block_names": dict(sorted(b["block_names"].items())),
            "annotation_types": dict(sorted(b["annotation_types"].items())),
        }
        record["evidence_digest"] = _digest(record)
        layers.append(record)

    return {
        "schema": "TAKY_DXF_LAYER_PROFILE_V1",
        "source": payload.get("source"),
        "geometry_digest": payload.get("geometry_digest"),
        "annotation_digest": payload.get("annotation_digest"),
        "semantic_inference": False,
        "canonical_promotion": False,
        "layer_count": len(layers),
        "layers": layers,
    }


def profile_dxf(path: str | Path) -> Dict[str, Any]:
    payload = _adapter.extract_dxf(path, include_entities=True)
    return profile_payload(payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dxf")
    parser.add_argument("--out")
    args = parser.parse_args()
    result = profile_dxf(args.dxf)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
