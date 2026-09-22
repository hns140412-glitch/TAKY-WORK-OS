#!/usr/bin/env python3
"""TAKY Drawing Engine - source-weight presentation profiler.

Uses only the source SVG's existing stroke-weight ordering to create a safer
presentation hierarchy. It does NOT infer architectural semantics such as
WALL / CUT / ROOM. Geometry-bearing attributes are fingerprinted before and
after and must remain identical.

Intended route:
PDF full SVG -> SOURCE_WEIGHT visual roles -> profile styling -> validation.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, Iterable, List

GEOMETRY_ATTRS = (
    "d", "points", "x", "y", "x1", "y1", "x2", "y2",
    "cx", "cy", "r", "rx", "ry", "width", "height",
    "viewBox", "transform",
)

DEFAULT_PROFILES: Dict[str, Dict[str, Dict[str, Any]]] = {
    "PUBLICATION": {
        "SOURCE_HEAVY": {"stroke": "#111111", "stroke_opacity": 1.0, "width_multiplier": 1.00},
        "SOURCE_PRIMARY": {"stroke": "#242424", "stroke_opacity": 1.0, "width_multiplier": 1.00},
        "SOURCE_SECONDARY": {"stroke": "#555555", "stroke_opacity": 0.86, "width_multiplier": 1.00},
        "SOURCE_BASE": {"stroke": "#666666", "stroke_opacity": 0.76, "width_multiplier": 0.95},
        "SOURCE_LIGHT": {"stroke": "#999999", "stroke_opacity": 0.58, "width_multiplier": 0.90},
    },
    "TECHNICAL_CLEAN": {
        "SOURCE_HEAVY": {"stroke": "#111111", "stroke_opacity": 1.0, "width_multiplier": 1.00},
        "SOURCE_PRIMARY": {"stroke": "#222222", "stroke_opacity": 1.0, "width_multiplier": 1.00},
        "SOURCE_SECONDARY": {"stroke": "#444444", "stroke_opacity": 0.94, "width_multiplier": 1.00},
        "SOURCE_BASE": {"stroke": "#555555", "stroke_opacity": 0.88, "width_multiplier": 1.00},
        "SOURCE_LIGHT": {"stroke": "#777777", "stroke_opacity": 0.76, "width_multiplier": 1.00},
    },
    "SECTION_PRESENTATION_SAFE": {
        "SOURCE_HEAVY": {"stroke": "#0d0d0d", "stroke_opacity": 1.0, "width_multiplier": 1.10},
        "SOURCE_PRIMARY": {"stroke": "#202020", "stroke_opacity": 1.0, "width_multiplier": 1.02},
        "SOURCE_SECONDARY": {"stroke": "#555555", "stroke_opacity": 0.80, "width_multiplier": 0.98},
        "SOURCE_BASE": {"stroke": "#777777", "stroke_opacity": 0.62, "width_multiplier": 0.92},
        "SOURCE_LIGHT": {"stroke": "#aaaaaa", "stroke_opacity": 0.42, "width_multiplier": 0.85},
    },
}


def _local(tag: str) -> str:
    return tag.split("}", 1)[-1]


def _style_dict(value: str | None) -> Dict[str, str]:
    out: Dict[str, str] = {}
    for part in (value or "").split(";"):
        if ":" in part:
            key, val = part.split(":", 1)
            out[key.strip()] = val.strip()
    return out


def _style_text(value: Dict[str, str]) -> str:
    return ";".join(f"{key}:{val}" for key, val in value.items())


def _get(element: ET.Element, key: str) -> str | None:
    if key in element.attrib:
        return element.attrib[key]
    return _style_dict(element.attrib.get("style")).get(key)


def _set(element: ET.Element, key: str, value: str) -> None:
    if key in element.attrib:
        element.set(key, value)
        return
    style = _style_dict(element.attrib.get("style"))
    if key in style:
        style[key] = value
        element.set("style", _style_text(style))
    else:
        element.set(key, value)


def _numeric(value: str | None) -> float | None:
    if value is None:
        return None
    match = re.match(r"\s*([0-9.+\-eE]+)", value)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def geometry_fingerprint(root: ET.Element) -> str:
    records: List[Dict[str, Any]] = []
    for index, element in enumerate(root.iter()):
        attrs = {key: element.attrib[key] for key in GEOMETRY_ATTRS if key in element.attrib}
        if attrs:
            records.append({"index": index, "tag": _local(element.tag), "attrs": attrs})
    payload = json.dumps(records, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _rank_roles(unique_widths: Iterable[float]) -> Dict[float, str]:
    values = sorted(set(float(x) for x in unique_widths))
    n = len(values)
    if not values:
        return {}
    if n == 1:
        return {values[0]: "SOURCE_BASE"}
    if n == 2:
        return {values[0]: "SOURCE_BASE", values[1]: "SOURCE_HEAVY"}
    if n == 3:
        return {
            values[0]: "SOURCE_BASE",
            values[1]: "SOURCE_PRIMARY",
            values[2]: "SOURCE_HEAVY",
        }
    if n == 4:
        return {
            values[0]: "SOURCE_BASE",
            values[1]: "SOURCE_SECONDARY",
            values[2]: "SOURCE_PRIMARY",
            values[3]: "SOURCE_HEAVY",
        }

    # Five or more visible line-weight tiers:
    # lightest -> LIGHT, next -> BASE, middle -> SECONDARY,
    # next -> PRIMARY, top one/two -> HEAVY.
    result: Dict[float, str] = {}
    for index, value in enumerate(values):
        from_top = n - 1 - index
        if from_top <= 1:
            role = "SOURCE_HEAVY"
        elif from_top == 2:
            role = "SOURCE_PRIMARY"
        elif from_top == 3:
            role = "SOURCE_SECONDARY"
        elif index == 0:
            role = "SOURCE_LIGHT"
        else:
            role = "SOURCE_BASE"
        result[value] = role
    return result


def apply_profile(
    svg_text: str,
    profile: str = "PUBLICATION",
    *,
    profiles: Dict[str, Dict[str, Dict[str, Any]]] | None = None,
) -> Dict[str, Any]:
    profile_id = profile.upper()
    available = profiles or DEFAULT_PROFILES
    if profile_id not in available:
        raise ValueError("UNKNOWN_SOURCE_WEIGHT_PROFILE")

    root = ET.fromstring(svg_text)
    before = geometry_fingerprint(root)

    candidates = []
    widths: List[float] = []
    for element in root.iter():
        stroke = _get(element, "stroke")
        width_text = _get(element, "stroke-width")
        width = _numeric(width_text)
        if stroke and stroke.lower() != "none" and width is not None and width > 0:
            candidates.append((element, width))
            widths.append(width)

    role_by_width = _rank_roles(widths)
    counts: Dict[str, int] = {}

    for element, width in candidates:
        role = role_by_width[width]
        counts[role] = counts.get(role, 0) + 1
        element.set("data-source-weight-role", role)
        style = available[profile_id][role]
        _set(element, "stroke", str(style["stroke"]))
        _set(element, "stroke-opacity", str(style["stroke_opacity"]))
        _set(element, "stroke-width", str(round(width * float(style["width_multiplier"]), 6)))

    after = geometry_fingerprint(root)
    if before != after:
        raise RuntimeError("GEOMETRY_MUTATION_DETECTED")

    return {
        "svg": ET.tostring(root, encoding="unicode"),
        "profile": profile_id,
        "geometry_preserved": True,
        "geometry_fingerprint": before,
        "source_width_roles": {str(key): value for key, value in role_by_width.items()},
        "role_counts": counts,
        "semantic_inference": False,
        "authority": "PRESENTATION_ONLY",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("svg")
    parser.add_argument(
        "--profile",
        default="PUBLICATION",
        choices=sorted(DEFAULT_PROFILES),
    )
    parser.add_argument("--out", required=True)
    parser.add_argument("--report")
    args = parser.parse_args()

    result = apply_profile(
        Path(args.svg).read_text(encoding="utf-8"),
        args.profile,
    )
    Path(args.out).write_text(result["svg"], encoding="utf-8")
    if args.report:
        report = {key: value for key, value in result.items() if key != "svg"}
        Path(args.report).write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
