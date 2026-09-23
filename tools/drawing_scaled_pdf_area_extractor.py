#!/usr/bin/env python3
"""TAKY Drawing Engine - scaled vector PDF area candidate extractor.

Only explicit closed vector paths / rectangles / quads are converted to area
candidates. Independent line segments are NOT auto-joined.

PDF scale must be supplied explicitly. Computed values remain derived evidence,
not CAD authority.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

try:
    import fitz
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


PT_TO_MM = 25.4 / 72.0


def _q(v: float, digits: int = 8) -> float:
    return round(float(v), digits)


def _area(points: List[Tuple[float, float]]) -> float:
    if len(points) < 3:
        return 0.0
    if points[0] != points[-1]:
        points=points+[points[0]]
    return abs(sum(
        x1*y2-x2*y1
        for (x1,y1),(x2,y2) in zip(points,points[1:])
    ))*0.5


def _sample_cubic(p0: Any, p1: Any, p2: Any, p3: Any, steps: int = 12) -> List[Tuple[float,float]]:
    out=[]
    for i in range(1,steps+1):
        t=i/steps
        u=1-t
        x=u**3*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t**3*p3.x
        y=u**3*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t**3*p3.y
        out.append((_q(x),_q(y)))
    return out


def _id(payload: Dict[str, Any]) -> str:
    raw=json.dumps(payload,sort_keys=True,separators=(",",":")).encode("utf-8")
    return "pdf-area-"+hashlib.sha256(raw).hexdigest()[:20]


def extract_scaled_pdf_areas(
    path: str | Path,
    *,
    scale_denominator: float,
    page_index: int = 0,
    scale_confirmed: bool = False,
) -> Dict[str, Any]:
    if scale_denominator <= 0:
        raise ValueError("POSITIVE_SCALE_DENOMINATOR_REQUIRED")

    file_path=Path(path)
    raw=file_path.read_bytes()
    doc=fitz.open(stream=raw,filetype="pdf")
    page=doc[page_index]
    real_m_per_pt=(PT_TO_MM*scale_denominator)/1000.0

    candidates=[]
    rejected=[]

    for path_index,drawing in enumerate(page.get_drawings()):
        simple_points: List[Tuple[float,float]]=[]
        path_supported=True
        item_candidates=[]

        for item_index,item in enumerate(drawing.get("items",[])):
            kind=item[0]
            if kind=="re":
                r=item[1]
                pts=[
                    (_q(r.x0),_q(r.y0)),(_q(r.x1),_q(r.y0)),
                    (_q(r.x1),_q(r.y1)),(_q(r.x0),_q(r.y1)),
                ]
                item_candidates.append(("RECT",item_index,pts))
            elif kind=="qu":
                q=item[1]
                pts=[
                    (_q(q.ul.x),_q(q.ul.y)),(_q(q.ur.x),_q(q.ur.y)),
                    (_q(q.lr.x),_q(q.lr.y)),(_q(q.ll.x),_q(q.ll.y)),
                ]
                item_candidates.append(("QUAD",item_index,pts))
            elif kind=="l":
                p1,p2=item[1],item[2]
                if not simple_points:
                    simple_points.append((_q(p1.x),_q(p1.y)))
                simple_points.append((_q(p2.x),_q(p2.y)))
            elif kind=="c":
                p0,c1,c2,p3=item[1],item[2],item[3],item[4]
                if not simple_points:
                    simple_points.append((_q(p0.x),_q(p0.y)))
                simple_points.extend(_sample_cubic(p0,c1,c2,p3))
            else:
                path_supported=False

        if bool(drawing.get("closePath")) and path_supported and len(simple_points)>=3:
            item_candidates.append(("CLOSED_PATH",None,simple_points))

        for boundary_type,item_index,pts in item_candidates:
            paper_area_pt2=_area(pts)
            if paper_area_pt2<=0:
                continue
            payload={
                "page_index":page_index,
                "path_index":path_index,
                "item_index":item_index,
                "boundary_type":boundary_type,
                "points":pts,
            }
            candidates.append({
                "candidate_id":_id(payload),
                "page_index":page_index,
                "path_index":path_index,
                "item_index":item_index,
                "boundary_type":boundary_type,
                "area_pdf_pt2":_q(paper_area_pt2),
                "area_m2":_q(paper_area_pt2*real_m_per_pt*real_m_per_pt),
                "scale_denominator":_q(scale_denominator),
                "scale_verification":"CONFIRMED" if scale_confirmed else "UNVERIFIED_INPUT",
                "verification_state":"DERIVED_VECTOR",
                "semantic_role":"UNKNOWN",
            })

        if not path_supported:
            rejected.append({
                "page_index":page_index,
                "path_index":path_index,
                "reason":"UNSUPPORTED_VECTOR_ITEM_PRESENT",
            })

    return {
        "schema":"TAKY_SCALED_PDF_AREA_CANDIDATES_V1",
        "source":{
            "sha256":hashlib.sha256(raw).hexdigest(),
            "authority":"DERIVED_VECTOR",
            "page_index":page_index,
            "page_rect":[_q(page.rect.x0),_q(page.rect.y0),_q(page.rect.x1),_q(page.rect.y1)],
        },
        "scale":{
            "denominator":_q(scale_denominator),
            "confirmed":bool(scale_confirmed),
            "real_m_per_pdf_point":_q(real_m_per_pt,12),
        },
        "policy":{
            "auto_join_independent_segments":False,
            "semantic_inference":False,
            "cad_authority_claim":False,
        },
        "candidates":candidates,
        "rejected":rejected,
    }


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("--scale-denominator",type=float,required=True)
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--scale-confirmed",action="store_true")
    p.add_argument("--out")
    args=p.parse_args()
    result=extract_scaled_pdf_areas(
        args.pdf,
        scale_denominator=args.scale_denominator,
        page_index=args.page,
        scale_confirmed=args.scale_confirmed,
    )
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
