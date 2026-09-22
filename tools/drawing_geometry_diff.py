#!/usr/bin/env python3
"""TAKY Drawing Engine - deterministic geometry diff.

Compares stable object IDs and 2D point/line/polygon geometry with a configurable
absolute tolerance. It is intentionally small and does not infer object identity.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


def _distance(a: Iterable[float], b: Iterable[float]) -> float:
    ax, ay = a
    bx, by = b
    return math.hypot(float(ax) - float(bx), float(ay) - float(by))


def _coords_close(a: Any, b: Any, tolerance: float) -> bool:
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if len(a) != len(b):
            return False
        if len(a) == 2 and all(isinstance(x, (int, float)) for x in a + b):
            return _distance(a, b) <= tolerance
        return all(_coords_close(x, y, tolerance) for x, y in zip(a, b))
    return a == b


def geometry_equal(a: Dict[str, Any] | None, b: Dict[str, Any] | None, tolerance: float) -> bool:
    if a is None or b is None:
        return a is b
    if a.get("type") != b.get("type"):
        return False

    kind = a.get("type")
    if kind in {"Point", "LineString", "Polygon"}:
        if bool(a.get("closed", False)) != bool(b.get("closed", False)):
            return False
        return _coords_close(a.get("coordinates"), b.get("coordinates"), tolerance)

    if kind in {"Circle", "Arc"}:
        if not _coords_close(a.get("center"), b.get("center"), tolerance):
            return False
        if abs(float(a.get("radius", 0)) - float(b.get("radius", 0))) > tolerance:
            return False
        if kind == "Arc":
            return (
                abs(float(a.get("start_angle", 0)) - float(b.get("start_angle", 0))) <= tolerance
                and abs(float(a.get("end_angle", 0)) - float(b.get("end_angle", 0))) <= tolerance
            )
        return True

    if kind == "Insert":
        if a.get("name") != b.get("name"):
            return False
        if not _coords_close(a.get("insert"), b.get("insert"), tolerance):
            return False
        for field in ("xscale", "yscale", "rotation"):
            if abs(float(a.get(field, 0)) - float(b.get(field, 0))) > tolerance:
                return False
        return True

    return a == b


def compare(before: Dict[str, Any], after: Dict[str, Any], tolerance: float = 1e-6) -> Dict[str, Any]:
    bmap = {str(item["object_id"]): item for item in before.get("objects", [])}
    amap = {str(item["object_id"]): item for item in after.get("objects", [])}
    findings: List[Dict[str, Any]] = []

    for object_id, b in bmap.items():
        a = amap.get(object_id)
        if a is None:
            findings.append({"code": "MISSING_OBJECT", "severity": "CRITICAL", "object_id": object_id})
            continue
        if b.get("object_type") != a.get("object_type"):
            findings.append({"code": "OBJECT_TYPE_CHANGED", "severity": "CRITICAL", "object_id": object_id})
        if not geometry_equal(b.get("geometry"), a.get("geometry"), tolerance):
            findings.append({"code": "GEOMETRY_DRIFT", "severity": "CRITICAL", "object_id": object_id})

    for object_id, a in amap.items():
        if object_id not in bmap and not bool(a.get("presentation_only", False)):
            findings.append({"code": "NEW_GEOMETRY_OBJECT", "severity": "CRITICAL", "object_id": object_id})

    return {
        "ok": not any(f["severity"] == "CRITICAL" for f in findings),
        "tolerance": tolerance,
        "before_count": len(bmap),
        "after_count": len(amap),
        "findings": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("before")
    parser.add_argument("after")
    parser.add_argument("--tolerance", type=float, default=1e-6)
    args = parser.parse_args()
    before = json.loads(Path(args.before).read_text(encoding="utf-8"))
    after = json.loads(Path(args.after).read_text(encoding="utf-8"))
    print(json.dumps(compare(before, after, args.tolerance), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
