#!/usr/bin/env python3
"""TAKY Drawing Engine - DXF to SVG renderer.

Renders DXF modelspace to SVG via ezdxf's drawing frontend.
The original DXF remains the authoritative/source file; SVG is a presentation
and review representation.
"""

from __future__ import annotations

import argparse
from pathlib import Path

try:
    import ezdxf
    from ezdxf.addons.drawing import Frontend, RenderContext, layout, svg
    from ezdxf.addons.drawing.config import Configuration, ColorPolicy, BackgroundPolicy
except ImportError as exc:  # pragma: no cover
    raise SystemExit("ezdxf is required: pip install ezdxf") from exc


def export_dxf(
    dxf_path: str | Path,
    *,
    monochrome: bool = False,
    white_background: bool = True,
) -> str:
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    backend = svg.SVGBackend()
    config = Configuration(
        color_policy=ColorPolicy.BLACK if monochrome else ColorPolicy.COLOR_SWAP_BW,
        background_policy=BackgroundPolicy.WHITE if white_background else BackgroundPolicy.OFF,
    )
    Frontend(RenderContext(doc), backend, config=config).draw_layout(msp)
    page = layout.Page(0, 0, units=layout.Units.mm)
    return backend.get_string(page)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dxf")
    parser.add_argument("--monochrome", action="store_true")
    parser.add_argument("--transparent-background", action="store_true")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    content = export_dxf(
        args.dxf,
        monochrome=args.monochrome,
        white_background=not args.transparent_background,
    )
    Path(args.out).write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
