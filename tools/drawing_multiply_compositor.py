#!/usr/bin/env python3
"""TAKY Drawing Engine - multiply source-snapshot compositor.

Automates the classic CAD/PDF Multiply-overlay finishing method without making
the snapshot geometry authority. White source pixels leave the presentation
unchanged; darker source content restores source linework / annotations.
"""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow is required") from exc


def multiply_snapshot(underlay: Image.Image, source_snapshot: Image.Image) -> Image.Image:
    base = underlay.convert("RGB")
    source = source_snapshot.convert("RGB")
    if base.size != source.size:
        raise ValueError("UNDERLAY_SOURCE_SIZE_MISMATCH")
    return ImageChops.multiply(base, source)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("underlay")
    parser.add_argument("source_snapshot")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    result = multiply_snapshot(Image.open(args.underlay), Image.open(args.source_snapshot))
    result.save(args.out)


if __name__ == "__main__":
    main()
