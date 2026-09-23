#!/usr/bin/env python3
"""TAKY Drawing Engine - vector PDF to source-line SVG exporter.

Exports PDF vector paths into SVG while preserving source page coordinates.
It intentionally omits AI/material layers. The result is suitable as the final
source-line overlay in controlled presentation workflows.
"""

from __future__ import annotations

import argparse
import html
from pathlib import Path
from typing import Any, List

try:
    import fitz
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


def _q(v: float) -> str:
    s = f"{float(v):.4f}".rstrip("0").rstrip(".")
    return s or "0"


def _path_d(items: List[Any]) -> str:
    parts: List[str] = []
    cursor = None
    for item in items:
        kind = item[0]
        if kind == "l":
            p1, p2 = item[1], item[2]
            if cursor != (p1.x, p1.y):
                parts.append(f"M {_q(p1.x)} {_q(p1.y)}")
            parts.append(f"L {_q(p2.x)} {_q(p2.y)}")
            cursor = (p2.x, p2.y)
        elif kind == "c":
            p1, c1, c2, p2 = item[1], item[2], item[3], item[4]
            if cursor != (p1.x, p1.y):
                parts.append(f"M {_q(p1.x)} {_q(p1.y)}")
            parts.append(
                f"C {_q(c1.x)} {_q(c1.y)} {_q(c2.x)} {_q(c2.y)} {_q(p2.x)} {_q(p2.y)}"
            )
            cursor = (p2.x, p2.y)
        elif kind == "re":
            r = item[1]
            parts.append(
                f"M {_q(r.x0)} {_q(r.y0)} "
                f"L {_q(r.x1)} {_q(r.y0)} "
                f"L {_q(r.x1)} {_q(r.y1)} "
                f"L {_q(r.x0)} {_q(r.y1)} Z"
            )
            cursor = (r.x0, r.y0)
        elif kind == "qu":
            q = item[1]
            parts.append(
                f"M {_q(q.ul.x)} {_q(q.ul.y)} "
                f"L {_q(q.ur.x)} {_q(q.ur.y)} "
                f"L {_q(q.lr.x)} {_q(q.lr.y)} "
                f"L {_q(q.ll.x)} {_q(q.ll.y)} Z"
            )
            cursor = (q.ul.x, q.ul.y)
    return " ".join(parts)


def _rgb(color: Any, fallback: str = "none") -> str:
    if color is None:
        return fallback
    vals = [max(0, min(255, round(float(c) * 255))) for c in color]
    return f"rgb({vals[0]},{vals[1]},{vals[2]})"


def export_page(pdf_path: str | Path, page_index: int = 0) -> str:
    raw = Path(pdf_path).read_bytes()
    doc = fitz.open(stream=raw, filetype="pdf")
    if page_index < 0 or page_index >= doc.page_count:
        raise IndexError("page_index out of range")

    page = doc[page_index]
    rect = page.rect
    body: List[str] = []

    for index, drawing in enumerate(page.get_drawings()):
        d = _path_d(drawing.get("items", []))
        if not d:
            continue
        stroke = _rgb(drawing.get("color"), "none")
        fill = _rgb(drawing.get("fill"), "none")
        width = max(float(drawing.get("width") or 0.0), 0.01)
        attrs = [
            f'id="src-{index}"',
            'data-authority="source-snapshot"',
            f'd="{html.escape(d, quote=True)}"',
            f'stroke="{stroke}"',
            f'fill="{fill}"',
            f'stroke-width="{_q(width)}"',
            'vector-effect="non-scaling-stroke"',
        ]
        if drawing.get("closePath"):
            attrs.append('data-closed="true"')
        body.append("<path " + " ".join(attrs) + "/>")

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{_q(rect.width)}" height="{_q(rect.height)}" '
        f'viewBox="0 0 {_q(rect.width)} {_q(rect.height)}">'
        f'<g id="source-linework" data-authority="source-snapshot">'
        + "".join(body)
        + "</g></svg>"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--page", type=int, default=0)
    parser.add_argument("--out")
    args = parser.parse_args()
    svg = export_page(args.pdf, args.page)
    if args.out:
        Path(args.out).write_text(svg, encoding="utf-8")
    else:
        print(svg)


if __name__ == "__main__":
    main()
