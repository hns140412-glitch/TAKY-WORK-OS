#!/usr/bin/env python3
"""TAKY Drawing Engine - vector PDF line-network polygonizer.

Purpose:
- recover closed geometric faces from fragmented vector linework;
- support scaled-PDF area review when a boundary is not stored as one closed path;
- emit DERIVED GEOMETRY CANDIDATES only.

This tool does NOT decide which polygon is a site, building, floor, room, etc.
Dimension lines, furniture, hatches and other linework can also form polygons.
Therefore semantic/legal promotion requires an explicit assignment gate.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

try:
    import fitz
    from shapely.geometry import LineString
    from shapely.ops import polygonize, unary_union
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF and Shapely are required") from exc


PT_TO_MM = 25.4 / 72.0


def _q(v: float, digits: int = 8) -> float:
    return round(float(v), digits)


def _cubic_points(p0: Any, p1: Any, p2: Any, p3: Any, steps: int) -> List[Tuple[float,float]]:
    out=[]
    for i in range(steps+1):
        t=i/steps
        u=1.0-t
        x=u**3*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t**3*p3.x
        y=u**3*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t**3*p3.y
        out.append((_q(x),_q(y)))
    return out


def _edge_pairs(points: List[Tuple[float,float]]) -> Iterable[Tuple[Tuple[float,float],Tuple[float,float]]]:
    for a,b in zip(points,points[1:]):
        if a != b:
            yield a,b


def _segments_from_item(item: Any, curve_steps: int) -> List[LineString]:
    kind=item[0]
    segments: List[LineString]=[]

    if kind=="l":
        p1,p2=item[1],item[2]
        segments.append(LineString([(p1.x,p1.y),(p2.x,p2.y)]))
    elif kind=="re":
        r=item[1]
        pts=[(r.x0,r.y0),(r.x1,r.y0),(r.x1,r.y1),(r.x0,r.y1),(r.x0,r.y0)]
        segments.extend(LineString([a,b]) for a,b in _edge_pairs(pts))
    elif kind=="qu":
        q=item[1]
        pts=[
            (q.ul.x,q.ul.y),(q.ur.x,q.ur.y),
            (q.lr.x,q.lr.y),(q.ll.x,q.ll.y),(q.ul.x,q.ul.y),
        ]
        segments.extend(LineString([a,b]) for a,b in _edge_pairs(pts))
    elif kind=="c":
        pts=_cubic_points(item[1],item[2],item[3],item[4],curve_steps)
        segments.extend(LineString([a,b]) for a,b in _edge_pairs(pts))
    return segments


def polygonize_pdf(
    path: str | Path,
    *,
    scale_denominator: float,
    page_index: int = 0,
    scale_confirmed: bool = False,
    min_area_m2: float = 0.1,
    curve_steps: int = 8,
    include_geometry: bool = False,
) -> Dict[str,Any]:
    if scale_denominator <= 0:
        raise ValueError("POSITIVE_SCALE_DENOMINATOR_REQUIRED")
    if curve_steps < 2:
        raise ValueError("CURVE_STEPS_MUST_BE_AT_LEAST_2")

    file_path=Path(path)
    raw=file_path.read_bytes()
    doc=fitz.open(stream=raw,filetype="pdf")
    page=doc[page_index]
    real_m_per_pt=(PT_TO_MM*scale_denominator)/1000.0

    segments: List[LineString]=[]
    skipped_fill_only=0

    for drawing in page.get_drawings():
        # Fill-only graphics are presentation evidence, not line-network evidence.
        if drawing.get("color") is None and drawing.get("fill") is not None:
            skipped_fill_only += 1
            continue
        for item in drawing.get("items",[]):
            segments.extend(_segments_from_item(item,curve_steps))

    merged=unary_union(segments) if segments else None
    polygons=list(polygonize(merged)) if merged is not None else []

    candidates=[]
    for poly in polygons:
        area_m2=float(poly.area)*real_m_per_pt*real_m_per_pt
        if area_m2 < min_area_m2:
            continue
        bounds=tuple(_q(v,4) for v in poly.bounds)
        basis={
            "page_index":page_index,
            "bounds":bounds,
            "area_pdf_pt2":_q(poly.area),
            "perimeter_pdf_pt":_q(poly.length),
        }
        candidate={
            "candidate_id":"poly-"+hashlib.sha256(
                json.dumps(basis,sort_keys=True,separators=(",",":")).encode("utf-8")
            ).hexdigest()[:20],
            "page_index":page_index,
            "boundary_type":"POLYGONIZED_LINE_NETWORK",
            "area_pdf_pt2":_q(poly.area),
            "area_m2":_q(area_m2),
            "perimeter_m":_q(float(poly.length)*real_m_per_pt),
            "bounds_pdf_pt":list(bounds),
            "scale_denominator":_q(scale_denominator),
            "scale_verification":"CONFIRMED" if scale_confirmed else "UNVERIFIED_INPUT",
            "verification_state":"DERIVED_TOPOLOGY",
            "semantic_role":"UNKNOWN",
        }
        if include_geometry:
            candidate["exterior_pdf_pt"]=[
                [_q(x,4),_q(y,4)] for x,y in poly.exterior.coords
            ]
        candidates.append(candidate)

    candidates.sort(key=lambda x:x["area_m2"],reverse=True)

    return {
        "schema":"TAKY_PDF_LINE_NETWORK_POLYGONS_V1",
        "source":{
            "sha256":hashlib.sha256(raw).hexdigest(),
            "authority":"DERIVED_VECTOR",
            "page_index":page_index,
        },
        "scale":{
            "denominator":_q(scale_denominator),
            "confirmed":bool(scale_confirmed),
            "real_m_per_pdf_point":_q(real_m_per_pt,12),
        },
        "policy":{
            "semantic_inference":False,
            "legal_role_inference":False,
            "polygonization_is_candidate_generation_only":True,
            "fill_only_paths_skipped":True,
        },
        "stats":{
            "segments":len(segments),
            "polygon_faces_total":len(polygons),
            "candidates_after_area_filter":len(candidates),
            "skipped_fill_only_paths":skipped_fill_only,
        },
        "candidates":candidates,
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("--scale-denominator",type=float,required=True)
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--scale-confirmed",action="store_true")
    p.add_argument("--min-area-m2",type=float,default=0.1)
    p.add_argument("--curve-steps",type=int,default=8)
    p.add_argument("--include-geometry",action="store_true")
    p.add_argument("--out")
    args=p.parse_args()

    result=polygonize_pdf(
        args.pdf,
        scale_denominator=args.scale_denominator,
        page_index=args.page,
        scale_confirmed=args.scale_confirmed,
        min_area_m2=args.min_area_m2,
        curve_steps=args.curve_steps,
        include_geometry=args.include_geometry,
    )
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
