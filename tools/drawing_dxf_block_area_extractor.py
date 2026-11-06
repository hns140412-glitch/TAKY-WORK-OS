#!/usr/bin/env python3
"""TAKY Drawing Engine - block-aware DXF area candidate extractor.

Purpose:
- preserve the original DXF;
- expand INSERT / nested INSERT instances virtually;
- apply translation / rotation / scale / mirror through ezdxf virtual entities;
- emit closed-boundary AREA CANDIDATES only;
- never assign architectural meaning to a boundary.

No EXPLODE write-back is performed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

try:
    import ezdxf
    from ezdxf.path import make_path
except ImportError as exc:  # pragma: no cover
    raise SystemExit("ezdxf is required: pip install ezdxf") from exc


INSUNITS_TO_METERS = {
    1: 0.0254,      # inch
    2: 0.3048,      # foot
    4: 0.001,       # millimeter
    5: 0.01,        # centimeter
    6: 1.0,         # meter
}


def _q(v: float, digits: int = 8) -> float:
    return round(float(v), digits)


def _polygon_area(points: List[Tuple[float, float]]) -> float:
    if len(points) < 3:
        return 0.0
    if points[0] != points[-1]:
        points = points + [points[0]]
    total = 0.0
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        total += x1 * y2 - x2 * y1
    return abs(total) * 0.5


def _candidate_id(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return "area-" + hashlib.sha256(raw).hexdigest()[:20]


def _insert_descriptor(entity: Any) -> Dict[str, Any]:
    return {
        "name": str(entity.dxf.name),
        "insert": [_q(entity.dxf.insert.x), _q(entity.dxf.insert.y)],
        "xscale": _q(getattr(entity.dxf, "xscale", 1.0)),
        "yscale": _q(getattr(entity.dxf, "yscale", 1.0)),
        "rotation": _q(getattr(entity.dxf, "rotation", 0.0)),
    }


def _iter_insert_instances(insert: Any) -> Iterable[Any]:
    # MINSERT requires instance expansion before virtual_entities().
    try:
        if getattr(insert, "mcount", 1) > 1:
            yield from insert.multi_insert()
            return
    except Exception:
        pass
    yield insert


def _walk_entity(
    entity: Any,
    lineage: List[Dict[str, Any]],
    findings: List[Dict[str, Any]],
    *,
    depth: int = 0,
    max_depth: int = 16,
) -> Iterable[Tuple[Any, List[Dict[str, Any]]]]:
    if depth > max_depth:
        findings.append({"code": "BLOCK_DEPTH_LIMIT", "lineage": lineage})
        return

    if entity.dxftype() != "INSERT":
        yield entity, lineage
        return

    for instance in _iter_insert_instances(entity):
        descriptor = _insert_descriptor(instance)
        child_lineage = lineage + [descriptor]
        skipped: List[Dict[str, str]] = []

        def _skip_callback(skipped_entity: Any, reason: str) -> None:
            skipped.append({
                "entity_type": skipped_entity.dxftype(),
                "reason": str(reason),
            })

        try:
            virtuals = list(instance.virtual_entities(skipped_entity_callback=_skip_callback))
        except Exception as exc:
            findings.append({
                "code": "BLOCK_VIRTUALIZATION_FAILED",
                "block": descriptor,
                "error": type(exc).__name__,
            })
            continue

        for item in skipped:
            findings.append({
                "code": "BLOCK_ENTITY_SKIPPED",
                "block": descriptor,
                **item,
            })

        for child in virtuals:
            yield from _walk_entity(
                child,
                child_lineage,
                findings,
                depth=depth + 1,
                max_depth=max_depth,
            )


def _polyline_points(entity: Any, flattening_distance: float) -> List[Tuple[float, float]]:
    path = make_path(entity)
    vertices = list(path.flattening(distance=flattening_distance, segments=8))
    return [(_q(v.x), _q(v.y)) for v in vertices]


def _boundary_candidate(
    entity: Any,
    lineage: List[Dict[str, Any]],
    unit_to_m: float | None,
    flattening_distance: float,
) -> Dict[str, Any] | None:
    kind = entity.dxftype()
    layer = str(getattr(entity.dxf, "layer", "0") or "0")
    points: List[Tuple[float, float]] = []
    boundary_type = None

    if kind == "LWPOLYLINE":
        if not bool(entity.closed):
            return None
        points = _polyline_points(entity, flattening_distance)
        boundary_type = "CLOSED_LWPOLYLINE"
    elif kind == "POLYLINE":
        if not bool(entity.is_closed):
            return None
        points = _polyline_points(entity, flattening_distance)
        boundary_type = "CLOSED_POLYLINE"
    elif kind == "CIRCLE":
        radius = float(entity.dxf.radius)
        area_units2 = math.pi * radius * radius
        basis = {
            "entity_type": kind,
            "layer": layer,
            "lineage": lineage,
            "center": [_q(entity.dxf.center.x), _q(entity.dxf.center.y)],
            "radius": _q(radius),
        }
        return {
            "candidate_id": _candidate_id(basis),
            "entity_type": kind,
            "layer": layer,
            "boundary_type": "CIRCLE",
            "closed": True,
            "area_drawing_units2": _q(area_units2),
            "area_m2": _q(area_units2 * unit_to_m * unit_to_m) if unit_to_m else None,
            "block_lineage": lineage,
            "verification_state": "GEOMETRY_ONLY",
            "semantic_role": "UNKNOWN",
        }
    else:
        return None

    area_units2 = _polygon_area(points)
    if area_units2 <= 0:
        return None

    basis = {
        "entity_type": kind,
        "layer": layer,
        "lineage": lineage,
        "points": points,
    }
    return {
        "candidate_id": _candidate_id(basis),
        "entity_type": kind,
        "layer": layer,
        "boundary_type": boundary_type,
        "closed": True,
        "vertex_count": len(points),
        "area_drawing_units2": _q(area_units2),
        "area_m2": _q(area_units2 * unit_to_m * unit_to_m) if unit_to_m else None,
        "block_lineage": lineage,
        "verification_state": "GEOMETRY_ONLY",
        "semantic_role": "UNKNOWN",
    }


def extract_area_candidates(
    path: str | Path,
    *,
    flattening_distance: float = 0.01,
) -> Dict[str, Any]:
    file_path = Path(path)
    raw = file_path.read_bytes()
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    insunits = int(doc.header.get("$INSUNITS", 0) or 0)
    unit_to_m = INSUNITS_TO_METERS.get(insunits)
    findings: List[Dict[str, Any]] = []
    candidates: List[Dict[str, Any]] = []

    top_level_inserts = 0
    expanded_entities = 0

    for entity in msp:
        if entity.dxftype() == "INSERT":
            top_level_inserts += 1
        for expanded, lineage in _walk_entity(entity, [], findings):
            expanded_entities += 1
            candidate = _boundary_candidate(
                expanded,
                lineage,
                unit_to_m,
                flattening_distance,
            )
            if candidate:
                candidates.append(candidate)

    return {
        "schema": "TAKY_DXF_BLOCK_AREA_CANDIDATES_V1",
        "source": {
            "sha256": hashlib.sha256(raw).hexdigest(),
            "adapter": "EZDXF_VIRTUAL_ENTITIES",
            "insunits": insunits,
            "unit_to_m": unit_to_m,
            "unit_status": "KNOWN" if unit_to_m else "UNKNOWN_INSUNITS",
        },
        "policy": {
            "source_mutation": False,
            "explode_writeback": False,
            "semantic_inference": False,
            "nested_block_support": True,
            "rotation_scale_mirror": "APPLIED_BY_VIRTUAL_ENTITY_TRANSFORM",
        },
        "stats": {
            "top_level_entities": len(msp),
            "top_level_inserts": top_level_inserts,
            "expanded_entities": expanded_entities,
            "area_candidates": len(candidates),
            "findings": len(findings),
        },
        "candidates": candidates,
        "findings": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dxf")
    parser.add_argument("--flattening-distance", type=float, default=0.01)
    parser.add_argument("--out")
    args = parser.parse_args()
    result = extract_area_candidates(
        args.dxf,
        flattening_distance=args.flattening_distance,
    )
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
