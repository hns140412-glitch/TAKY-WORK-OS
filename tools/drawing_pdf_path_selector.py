#!/usr/bin/env python3
"""TAKY Drawing Engine - source PDF path candidate selector.

Maps approved review regions to exact source vector path IDs (src-N). This tool
NEVER edits the source and NEVER promotes a region hit to verified semantics.
It exists to replace unsafe rectangle painting with exact-path review.

Selection defaults to FULL CONTAINMENT only. Paths touching protected regions
are excluded. Candidate output must be user/source verified before editing.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

try:
    import fitz
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


TRUSTED_STATES = {
    "USER_CONFIRMED",
    "SOURCE_EXPLICIT",
    "CAD_RULE_VERIFIED",
    "VERIFIED_SEMANTIC",
}


def _rect(value: Iterable[float]) -> fitz.Rect:
    vals = list(value)
    if len(vals) != 4:
        raise ValueError("RECT_REQUIRES_4_VALUES")
    return fitz.Rect(*map(float, vals))


def _contains(outer: fitz.Rect, inner: fitz.Rect, margin: float = 0.0) -> bool:
    o = fitz.Rect(outer.x0 + margin, outer.y0 + margin, outer.x1 - margin, outer.y1 - margin)
    return o.contains(inner)


def _intersects(a: fitz.Rect, b: fitz.Rect) -> bool:
    return not (a.x1 <= b.x0 or a.x0 >= b.x1 or a.y1 <= b.y0 or a.y0 >= b.y1)


def _digest(index: int, rect: fitz.Rect, drawing: Dict[str, Any]) -> str:
    payload = {
        "path_id": f"src-{index}",
        "rect": [round(rect.x0, 4), round(rect.y0, 4), round(rect.x1, 4), round(rect.y1, 4)],
        "width": round(float(drawing.get("width") or 0.0), 4),
        "fill": drawing.get("fill"),
        "stroke": drawing.get("color"),
        "items": [str(item[0]) for item in drawing.get("items", [])],
    }
    return hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()


def select_candidates(
    pdf_path: str | Path,
    region_manifest: Dict[str, Any],
    page_index: int = 0,
) -> Dict[str, Any]:
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    drawings = page.get_drawings()

    regions = []
    protected = []
    for raw in region_manifest.get("regions", []):
        rec = {
            "region_id": str(raw["region_id"]),
            "role": str(raw.get("role", "UNKNOWN")).upper(),
            "policy": str(raw.get("policy", "REVIEW_ONLY")).upper(),
            "verification_state": str(raw.get("verification_state", "UNVERIFIED")).upper(),
            "rect": _rect(raw["rect"]),
            "margin": float(raw.get("containment_margin", 0.0)),
        }
        if rec["policy"] == "KEEP_PROTECTED":
            protected.append(rec)
        else:
            regions.append(rec)

    candidates: List[Dict[str, Any]] = []
    for index, drawing in enumerate(drawings):
        rect = drawing.get("rect")
        if rect is None:
            continue
        if any(_intersects(rect, p["rect"]) for p in protected):
            continue

        hits = [r for r in regions if _contains(r["rect"], rect, r["margin"])]
        if len(hits) != 1:
            continue

        region = hits[0]
        candidates.append({
            "path_id": f"src-{index}",
            "path_index": index,
            "rect": [round(rect.x0, 4), round(rect.y0, 4), round(rect.x1, 4), round(rect.y1, 4)],
            "region_id": region["region_id"],
            "role": region["role"],
            "requested_policy": region["policy"],
            "region_verification_state": region["verification_state"],
            "candidate_state": "CANDIDATE_ONLY",
            "eligible_for_edit": region["verification_state"] in TRUSTED_STATES,
            "path_digest": _digest(index, rect, drawing),
        })

    return {
        "schema": "TAKY_PDF_PATH_CANDIDATES_V1",
        "page_index": page_index,
        "source_path_count": len(drawings),
        "selection_rule": "FULL_CONTAINMENT_ONLY",
        "trusted_states": sorted(TRUSTED_STATES),
        "candidates": candidates,
        "stats": {
            "candidate_count": len(candidates),
            "eligible_count": sum(x["eligible_for_edit"] for x in candidates),
        },
        "canonical_promotion": False,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("regions_json")
    p.add_argument("--page", type=int, default=0)
    p.add_argument("--out")
    args = p.parse_args()

    regions = json.loads(Path(args.regions_json).read_text(encoding="utf-8"))
    result = select_candidates(args.pdf, regions, args.page)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)


if __name__ == "__main__":
    main()
