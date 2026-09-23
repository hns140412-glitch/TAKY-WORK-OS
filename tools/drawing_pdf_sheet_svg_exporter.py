#!/usr/bin/env python3
"""TAKY Drawing Engine - issued PDF sheet to full SVG snapshot.

Preserves the issued PDF page as a vector/text SVG snapshot for A3 board
composition. Unlike line-only extraction, this route keeps annotations,
dimension text, fills, and embedded vector content.

Optional crop changes only the outer SVG viewBox / displayed extent. It does
not rewrite source geometry.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Iterable

try:
    import fitz
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


def _rect(value: Iterable[float] | None, page_rect: fitz.Rect) -> fitz.Rect:
    if value is None:
        return fitz.Rect(page_rect)
    vals=list(map(float,value))
    if len(vals)!=4:
        raise ValueError("CROP_REQUIRES_4_VALUES")
    r=fitz.Rect(*vals)
    if r.is_empty or r.is_infinite:
        raise ValueError("INVALID_CROP")
    if not page_rect.contains(r):
        raise ValueError("CROP_OUTSIDE_PAGE")
    return r


def export_sheet(
    pdf_path: str | Path,
    page_index: int = 0,
    crop: Iterable[float] | None = None,
) -> dict:
    path=Path(pdf_path)
    raw=path.read_bytes()
    source_sha=hashlib.sha256(raw).hexdigest()
    doc=fitz.open(stream=raw,filetype="pdf")
    if page_index<0 or page_index>=doc.page_count:
        raise IndexError("page_index out of range")
    page=doc[page_index]
    page_rect=fitz.Rect(page.rect)
    crop_rect=_rect(crop,page_rect)

    svg=page.get_svg_image(matrix=fitz.Matrix(1,1),text_as_path=False)

    if crop is not None:
        width=crop_rect.width
        height=crop_rect.height
        replacement=(
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
            f'version="1.1" width="{width:.4f}" height="{height:.4f}" '
            f'viewBox="{crop_rect.x0:.4f} {crop_rect.y0:.4f} {width:.4f} {height:.4f}"'
        )
        svg=re.sub(r'^<svg\b[^>]*',replacement,svg,count=1)

    manifest={
        "schema":"TAKY_ISSUED_PDF_SHEET_SVG_V1",
        "source_file":path.name,
        "source_sha256":source_sha,
        "page_index":page_index,
        "page_rect":[page_rect.x0,page_rect.y0,page_rect.x1,page_rect.y1],
        "crop_rect":[crop_rect.x0,crop_rect.y0,crop_rect.x1,crop_rect.y1],
        "geometry_mutated":False,
        "content_mode":"FULL_ISSUED_SNAPSHOT",
        "text_preserved":True,
    }
    return {"svg":svg,"manifest":manifest}


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--crop",nargs=4,type=float)
    p.add_argument("--out-svg",required=True)
    p.add_argument("--manifest",required=True)
    args=p.parse_args()

    result=export_sheet(args.pdf,args.page,args.crop)
    Path(args.out_svg).write_text(result["svg"],encoding="utf-8")
    Path(args.manifest).write_text(
        json.dumps(result["manifest"],ensure_ascii=False,indent=2),
        encoding="utf-8",
    )


if __name__=="__main__":
    main()
