#!/usr/bin/env python3
"""TAKY Drawing Engine - source PDF snapshot overlay generator.

Renders the issued/source PDF at controlled DPI and converts near-white pixels
to transparency. This preserves annotations / unusual PDF graphics that may not
survive vector-path extraction. It is presentation evidence, not CAD geometry.
"""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    import fitz
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF and Pillow are required") from exc


def build_overlay(
    pdf_path: str | Path,
    page_index: int = 0,
    *,
    dpi: int = 300,
    white_threshold: int = 248,
    opacity: float = 1.0,
) -> Image.Image:
    doc = fitz.open(pdf_path)
    if page_index < 0 or page_index >= doc.page_count:
        raise IndexError("page_index out of range")
    page = doc[page_index]
    scale = float(dpi) / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples).convert("RGBA")

    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    src = img.load()
    dst = out.load()
    opacity = max(0.0, min(1.0, float(opacity)))

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, _ = src[x, y]
            # Alpha is driven by distance from white; fully white disappears.
            darkness = 255 - min(r, g, b)
            if min(r, g, b) >= white_threshold:
                a = 0
            else:
                a = round(min(255, darkness * 3) * opacity)
            dst[x, y] = (r, g, b, a)

    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--page", type=int, default=0)
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--white-threshold", type=int, default=248)
    parser.add_argument("--opacity", type=float, default=1.0)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    overlay = build_overlay(
        args.pdf,
        args.page,
        dpi=args.dpi,
        white_threshold=args.white_threshold,
        opacity=args.opacity,
    )
    overlay.save(args.out)


if __name__ == "__main__":
    main()
