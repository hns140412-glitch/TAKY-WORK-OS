#!/usr/bin/env python3
"""TAKY Drawing Engine - exact-path SVG selective editor.

Applies only verified presentation edits to exact source path IDs. Geometry
attributes are immutable. Suppression hides an approved source object without
deleting its geometry from the SVG DOM, enabling geometry preservation checks.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict

TRUSTED_STATES = {
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "CAD_RULE_VERIFIED",
    "VERIFIED_SEMANTIC",
}
GEOMETRY_ATTRS = (
    "d","points","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry",
    "width","height","viewBox","transform"
)
STYLE_ATTRS = {
    "stroke","stroke-width","stroke-opacity","fill","fill-opacity","opacity",
    "stroke-linecap","stroke-linejoin","stroke-dasharray","display","visibility"
}


def _local(tag: str) -> str:
    return tag.split("}", 1)[-1]


def _geometry_fingerprint(root: ET.Element) -> str:
    records = []
    for elem in root.iter():
        elem_id = elem.attrib.get("id")
        attrs = {k: elem.attrib[k] for k in GEOMETRY_ATTRS if k in elem.attrib}
        if elem_id and attrs:
            records.append({"id": elem_id, "tag": _local(elem.tag), "attrs": attrs})
    payload = json.dumps(records, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


def apply_edit_plan(svg_text: str, plan: Dict[str, Any]) -> Dict[str, Any]:
    root = ET.fromstring(svg_text)
    before = _geometry_fingerprint(root)
    by_id = {elem.attrib.get("id"): elem for elem in root.iter() if elem.attrib.get("id")}
    findings = []
    applied = []

    for op in plan.get("operations", []):
        path_id = str(op.get("path_id", ""))
        action = str(op.get("action", "")).upper()
        state = str(op.get("verification_state", "")).upper()
        elem = by_id.get(path_id)

        if elem is None:
            findings.append({"code":"PATH_ID_NOT_FOUND","severity":"CRITICAL","path_id":path_id})
            continue
        if state not in TRUSTED_STATES:
            findings.append({"code":"UNVERIFIED_EDIT_FORBIDDEN","severity":"CRITICAL","path_id":path_id})
            continue
        if str(op.get("protected", False)).lower() == "true":
            findings.append({"code":"PROTECTED_PATH_EDIT_FORBIDDEN","severity":"CRITICAL","path_id":path_id})
            continue

        if action == "SUPPRESS":
            elem.set("display", "none")
            elem.set("data-suppressed", "presentation-only")
            elem.set("data-verification-state", state)
            applied.append({"path_id":path_id,"action":action})
        elif action == "STYLE":
            attrs = op.get("attributes") or {}
            bad = [k for k in attrs if k not in STYLE_ATTRS]
            if bad:
                findings.append({"code":"FORBIDDEN_STYLE_ATTRIBUTE","severity":"CRITICAL","path_id":path_id,"attrs":bad})
                continue
            for k,v in attrs.items():
                elem.set(k, str(v))
            elem.set("data-verification-state", state)
            applied.append({"path_id":path_id,"action":action,"attributes":attrs})
        else:
            findings.append({"code":"UNKNOWN_ACTION","severity":"CRITICAL","path_id":path_id,"action":action})

    after = _geometry_fingerprint(root)
    if before != after:
        findings.append({"code":"GEOMETRY_MUTATION_DETECTED","severity":"CRITICAL"})

    ok = not any(x["severity"] == "CRITICAL" for x in findings)
    return {
        "ok": ok,
        "svg": ET.tostring(root, encoding="unicode"),
        "geometry_fingerprint_before": before,
        "geometry_fingerprint_after": after,
        "geometry_preserved": before == after,
        "source_object_count": len(by_id),
        "applied": applied,
        "findings": findings,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("svg")
    p.add_argument("edit_plan")
    p.add_argument("--out", required=True)
    p.add_argument("--manifest")
    args = p.parse_args()

    svg_text = Path(args.svg).read_text(encoding="utf-8")
    plan = json.loads(Path(args.edit_plan).read_text(encoding="utf-8"))
    result = apply_edit_plan(svg_text, plan)
    if not result["ok"]:
        raise SystemExit(json.dumps({k:v for k,v in result.items() if k != "svg"}, ensure_ascii=False, indent=2))

    Path(args.out).write_text(result["svg"], encoding="utf-8")
    if args.manifest:
        Path(args.manifest).write_text(
            json.dumps({k:v for k,v in result.items() if k != "svg"}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
