#!/usr/bin/env python3
"""TAKY Drawing Engine - preview-space to source-PDF region mapper.

Converts review rectangles selected on a rendered / rotated preview back into
source PDF page coordinates. This prevents manual coordinate-rotation mistakes
before exact-path selection.

Rotation is the counter-clockwise rotation applied to the rendered preview.
Supported values: 0, 90, 180, 270 degrees.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable, List


def _rect(value: Iterable[float]) -> List[float]:
    vals=list(map(float,value))
    if len(vals)!=4:
        raise ValueError("RECT_REQUIRES_4_VALUES")
    x0,y0,x1,y1=vals
    return [min(x0,x1),min(y0,y1),max(x0,x1),max(y0,y1)]


def preview_point_to_pdf(
    x: float,
    y: float,
    *,
    page_width: float,
    page_height: float,
    render_scale: float,
    rotation_ccw: int,
) -> List[float]:
    if render_scale <= 0:
        raise ValueError("RENDER_SCALE_MUST_BE_POSITIVE")
    rot=int(rotation_ccw)%360
    if rot not in {0,90,180,270}:
        raise ValueError("ROTATION_MUST_BE_0_90_180_270")

    x=float(x)
    y=float(y)
    s=float(render_scale)
    pw=float(page_width)
    ph=float(page_height)

    if rot==0:
        return [x/s,y/s]
    if rot==90:
        # PIL/Image-style CCW rotation:
        # preview x = source-raster y
        # preview y = source-raster width - source-raster x
        return [pw-(y/s),x/s]
    if rot==180:
        return [pw-(x/s),ph-(y/s)]
    # 270 CCW / 90 CW
    return [y/s,ph-(x/s)]


def preview_rect_to_pdf(
    rect: Iterable[float],
    *,
    page_width: float,
    page_height: float,
    render_scale: float,
    rotation_ccw: int,
) -> List[float]:
    x0,y0,x1,y1=_rect(rect)
    points=[
        preview_point_to_pdf(x0,y0,page_width=page_width,page_height=page_height,render_scale=render_scale,rotation_ccw=rotation_ccw),
        preview_point_to_pdf(x1,y0,page_width=page_width,page_height=page_height,render_scale=render_scale,rotation_ccw=rotation_ccw),
        preview_point_to_pdf(x0,y1,page_width=page_width,page_height=page_height,render_scale=render_scale,rotation_ccw=rotation_ccw),
        preview_point_to_pdf(x1,y1,page_width=page_width,page_height=page_height,render_scale=render_scale,rotation_ccw=rotation_ccw),
    ]
    xs=[p[0] for p in points]
    ys=[p[1] for p in points]
    return [round(min(xs),4),round(min(ys),4),round(max(xs),4),round(max(ys),4)]


def map_manifest(manifest: dict) -> dict:
    preview=manifest["preview"]
    page=manifest["source_page"]
    mapped=[]
    for raw in manifest.get("regions",[]):
        rec=dict(raw)
        rec["preview_rect"]=list(map(float,raw["preview_rect"]))
        rec["rect"]=preview_rect_to_pdf(
            rec["preview_rect"],
            page_width=float(page["width"]),
            page_height=float(page["height"]),
            render_scale=float(preview["render_scale"]),
            rotation_ccw=int(preview.get("rotation_ccw",0)),
        )
        mapped.append(rec)
    return {
        "schema":"TAKY_PREVIEW_REGION_MAP_V1",
        "source_page":page,
        "preview":preview,
        "regions":mapped,
        "mapping_status":"DETERMINISTIC",
    }


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("manifest")
    p.add_argument("--out")
    args=p.parse_args()
    source=json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    out=map_manifest(source)
    text=json.dumps(out,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
