#!/usr/bin/env python3
"""TAKY Drawing Engine - full-page PDF to SVG exporter.

Uses PyMuPDF's full page SVG exporter for high visual preservation.
This SVG is an issued/source snapshot representation, not CAD geometry authority.
"""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    import fitz
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


def export_page(pdf_path: str | Path, page_index: int = 0, *, text_as_path: bool = True) -> str:
    doc = fitz.open(pdf_path)
    if page_index < 0 or page_index >= doc.page_count:
        raise IndexError("page_index out of range")
    return doc[page_index].get_svg_image(text_as_path=text_as_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--page", type=int, default=0)
    parser.add_argument("--text-as-text", action="store_true")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    svg = export_page(args.pdf, args.page, text_as_path=not args.text_as_text)
    Path(args.out).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
