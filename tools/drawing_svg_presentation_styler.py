#!/usr/bin/env python3
"""TAKY Drawing Engine - geometry-preserving SVG presentation styler.

Only presentation attributes are changed. Geometry-bearing attributes are
fingerprinted before and after and must remain identical.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict

GEOMETRY_ATTRS = (
    "d", "points", "x", "y", "x1", "y1", "x2", "y2",
    "cx", "cy", "r", "rx", "ry", "width", "height",
    "viewBox", "transform"
)
PRESENTATION_ATTRS = {
    "stroke", "stroke-width", "stroke-opacity",
    "fill", "fill-opacity", "opacity",
    "stroke-linecap", "stroke-linejoin", "stroke-dasharray"
}

ROLE_STYLE_DEFAULTS = {
    "CUT": {"stroke": "#111111", "stroke-width": "0.70mm", "opacity": "1"},
    "PRIMARY": {"stroke": "#202020", "stroke-width": "0.38mm", "opacity": "1"},
    "SECONDARY": {"stroke": "#555555", "stroke-width": "0.22mm", "opacity": "0.90"},
    "CONTEXT": {"stroke": "#999999", "stroke-width": "0.14mm", "opacity": "0.55"},
    "FURNITURE": {"stroke": "#777777", "stroke-width": "0.16mm", "opacity": "0.72"},
    "LANDSCAPE": {"stroke": "#7d8a7d", "stroke-width": "0.16mm", "opacity": "0.62"},
    "ANNOTATION": {"stroke": "#333333", "opacity": "0.88"},
    "SHADOW": {"fill": "#000000", "fill-opacity": "0.08", "stroke": "none"},
}


def _local(tag: str) -> str:
    return tag.split("}", 1)[-1]


def geometry_fingerprint(root: ET.Element) -> str:
    records = []
    for idx, elem in enumerate(root.iter()):
        attrs = {k: elem.attrib[k] for k in GEOMETRY_ATTRS if k in elem.attrib}
        if attrs:
            records.append({"index": idx, "tag": _local(elem.tag), "attrs": attrs})
    payload = json.dumps(records, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


def apply_styles(svg_text: str, role_styles: Dict[str, Dict[str, Any]] | None = None):
    root = ET.fromstring(svg_text)
    before = geometry_fingerprint(root)
    styles = dict(ROLE_STYLE_DEFAULTS)
    if role_styles:
        for role, values in role_styles.items():
            styles[str(role).upper()] = {str(k): str(v) for k, v in values.items()}

    changed = 0
    unknown_roles = set()
    for elem in root.iter():
        role = (
            elem.attrib.get("data-role")
            or elem.attrib.get("data-layer-role")
            or elem.attrib.get("data-presentation-role")
        )
        if not role:
            continue
        role = role.upper()
        style = styles.get(role)
        if not style:
            unknown_roles.add(role)
            continue
        for key, value in style.items():
            if key not in PRESENTATION_ATTRS:
                raise ValueError(f"FORBIDDEN_STYLE_ATTRIBUTE:{key}")
            elem.set(key, str(value))
        changed += 1

    after = geometry_fingerprint(root)
    if before != after:
        raise RuntimeError("GEOMETRY_MUTATION_DETECTED")

    return {
        "svg": ET.tostring(root, encoding="unicode"),
        "geometry_fingerprint_before": before,
        "geometry_fingerprint_after": after,
        "geometry_preserved": True,
        "styled_elements": changed,
        "unknown_roles": sorted(unknown_roles),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("svg")
    p.add_argument("--styles")
    p.add_argument("--out", required=True)
    args = p.parse_args()

    text = Path(args.svg).read_text(encoding="utf-8")
    styles = json.loads(Path(args.styles).read_text(encoding="utf-8")) if args.styles else None
    result = apply_styles(text, styles)
    Path(args.out).write_text(result["svg"], encoding="utf-8")
    print(json.dumps({k:v for k,v in result.items() if k!="svg"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
