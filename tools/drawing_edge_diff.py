#!/usr/bin/env python3
"""TAKY Drawing Engine - raster edge preservation diff.

Compares edge maps instead of full RGB pixels so intended material/color changes
do not dominate geometry-preservation checks.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict

try:
    from PIL import Image, ImageChops, ImageFilter, ImageOps
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow is required: pip install pillow") from exc


def _edge_map(path: str | Path, threshold: int = 32) -> Image.Image:
    img = Image.open(path).convert("L")
    edges = img.filter(ImageFilter.FIND_EDGES)
    # Ignore page-frame artifacts by clearing the outermost pixel ring.
    px = edges.load()
    w, h = edges.size
    for x in range(w):
        px[x, 0] = 0
        px[x, h - 1] = 0
    for y in range(h):
        px[0, y] = 0
        px[w - 1, y] = 0
    return edges.point(lambda v: 255 if v >= threshold else 0, mode="1").convert("L")


def compare(
    before_path: str | Path,
    after_path: str | Path,
    *,
    threshold: int = 32,
    max_mismatch_ratio: float = 0.02,
) -> Dict[str, object]:
    before = _edge_map(before_path, threshold)
    after = _edge_map(after_path, threshold)
    if before.size != after.size:
        return {
            "ok": False,
            "code": "IMAGE_SIZE_CHANGED",
            "before_size": before.size,
            "after_size": after.size,
        }

    diff = ImageChops.difference(before, after)
    hist = diff.histogram()
    changed = sum(hist[1:])
    total = before.width * before.height
    ratio = changed / total if total else 0.0

    return {
        "ok": ratio <= max_mismatch_ratio,
        "code": "PASS" if ratio <= max_mismatch_ratio else "EDGE_DRIFT",
        "mismatch_ratio": ratio,
        "max_mismatch_ratio": max_mismatch_ratio,
        "threshold": threshold,
        "size": before.size,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("before")
    parser.add_argument("after")
    parser.add_argument("--threshold", type=int, default=32)
    parser.add_argument("--max-mismatch-ratio", type=float, default=0.02)
    args = parser.parse_args()
    print(
        json.dumps(
            compare(
                args.before,
                args.after,
                threshold=args.threshold,
                max_mismatch_ratio=args.max_mismatch_ratio,
            ),
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
