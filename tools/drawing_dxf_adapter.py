#!/usr/bin/env python3
"""TAKY Drawing Engine - DXF adapter.

Deterministically extracts CAD entities without inferring architectural semantics.
CAD source authority is assigned by the routing/governance layer, not by this parser.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List

try:
    import ezdxf
except ImportError as exc:  # pragma: no cover
    raise SystemExit("ezdxf is required: pip install ezdxf") from exc


SCHEMA = "TAKY_DRAWING_DXF_V1"


def _q(value: float, digits: int = 6) -> float:
    return round(float(value), digits)


def _xy(vec: Any) -> List[float]:
    return [_q(vec[0]), _q(vec[1])]


def _sha256_json(value: Any) -> str:
    payload = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _entity_record(entity: Any) -> Dict[str, Any]:
    kind = entity.dxftype()
    base: Dict[str, Any] = {
        "handle": str(entity.dxf.handle or ""),
        "type": kind,
        "layer": str(entity.dxf.layer or "0"),
    }

    if kind == "LINE":
        base["geometry"] = {
            "type": "LineString",
            "coordinates": [_xy(entity.dxf.start), _xy(entity.dxf.end)],
        }
    elif kind == "LWPOLYLINE":
        pts = [[_q(x), _q(y)] for x, y, *_ in entity.get_points("xy")]
        base["geometry"] = {
            "type": "LineString",
            "coordinates": pts,
            "closed": bool(entity.closed),
        }
    elif kind == "POLYLINE":
        pts = [_xy(v.dxf.location) for v in entity.vertices]
        base["geometry"] = {
            "type": "LineString",
            "coordinates": pts,
            "closed": bool(entity.is_closed),
        }
    elif kind == "POINT":
        base["geometry"] = {"type": "Point", "coordinates": _xy(entity.dxf.location)}
    elif kind == "CIRCLE":
        base["geometry"] = {
            "type": "Circle",
            "center": _xy(entity.dxf.center),
            "radius": _q(entity.dxf.radius),
        }
    elif kind == "ARC":
        base["geometry"] = {
            "type": "Arc",
            "center": _xy(entity.dxf.center),
            "radius": _q(entity.dxf.radius),
            "start_angle": _q(entity.dxf.start_angle),
            "end_angle": _q(entity.dxf.end_angle),
        }
    elif kind == "INSERT":
        base["geometry"] = {
            "type": "Insert",
            "name": str(entity.dxf.name),
            "insert": _xy(entity.dxf.insert),
            "xscale": _q(entity.dxf.xscale),
            "yscale": _q(entity.dxf.yscale),
            "rotation": _q(entity.dxf.rotation),
        }
    elif kind == "TEXT":
        base["annotation"] = {
            "text": str(entity.dxf.text),
            "insert": _xy(entity.dxf.insert),
            "height": _q(entity.dxf.height),
            "rotation": _q(entity.dxf.rotation),
        }
    elif kind == "MTEXT":
        base["annotation"] = {
            "text": entity.plain_text(),
            "insert": _xy(entity.dxf.insert),
            "char_height": _q(entity.dxf.char_height),
            "rotation": _q(entity.dxf.rotation),
        }
    elif kind == "DIMENSION":
        base["annotation"] = {
            "dimtype": int(entity.dxf.dimtype),
            "text": str(entity.dxf.text),
            "defpoint": _xy(entity.dxf.defpoint),
        }
    elif kind == "HATCH":
        # Preserve evidence that a hatch exists without pretending the boundary
        # has already been interpreted as architectural geometry.
        base["presentation"] = {
            "pattern_name": str(entity.dxf.pattern_name),
            "solid_fill": bool(entity.dxf.solid_fill),
            "boundary_path_count": len(entity.paths.paths),
        }
    else:
        base["unsupported"] = True

    return base


def extract_dxf(path: str | Path, include_entities: bool = False) -> Dict[str, Any]:
    file_path = Path(path)
    raw = file_path.read_bytes()
    source_sha256 = hashlib.sha256(raw).hexdigest()
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    records = [_entity_record(entity) for entity in msp]
    type_counts = Counter(record["type"] for record in records)
    layer_counts = Counter(record["layer"] for record in records)

    geometry_records = [
        {
            "handle": record["handle"],
            "type": record["type"],
            "layer": record["layer"],
            "geometry": record.get("geometry"),
        }
        for record in records
        if "geometry" in record
    ]
    annotation_records = [
        {
            "handle": record["handle"],
            "type": record["type"],
            "layer": record["layer"],
            "annotation": record.get("annotation"),
        }
        for record in records
        if "annotation" in record
    ]

    result: Dict[str, Any] = {
        "schema": SCHEMA,
        "source": {
            "sha256": source_sha256,
            "bytes": len(raw),
            "adapter": "EZDXF",
            "source_authority": "UNCLASSIFIED_CAD_SOURCE",
            "geometry_status": "DIRECT_CAD_PARSE",
            "insunits": int(doc.header.get("$INSUNITS", 0) or 0),
        },
        "stats": {
            "entities": len(records),
            "geometry_entities": len(geometry_records),
            "annotation_entities": len(annotation_records),
            "entity_types": dict(type_counts),
            "layers": dict(layer_counts),
        },
        "geometry_digest": _sha256_json(geometry_records),
        "annotation_digest": _sha256_json(annotation_records),
    }
    if include_entities:
        result["entities"] = records
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dxf")
    parser.add_argument("--full", action="store_true")
    args = parser.parse_args()
    print(
        json.dumps(
            extract_dxf(args.dxf, include_entities=args.full),
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
