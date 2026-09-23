#!/usr/bin/env python3
"""TAKY Drawing Engine — source geometry primitive adapter.

DXF/PDF vector geometry -> normalized immutable primitives for geometry fingerprinting.
No architectural semantic role is inferred here.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import tempfile
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

try:
    import ezdxf
    import pymupdf as fitz
except ImportError as exc:
    raise SystemExit("Requires ezdxf and pymupdf") from exc


def _q(v: float, digits: int = 6) -> float:
    return round(float(v), digits)


def _stable_id(payload: Dict[str, Any]) -> str:
    raw=json.dumps(payload,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    return "geo-"+hashlib.sha256(raw).hexdigest()[:20]


def _base(kind: str, geom: Dict[str, Any], **meta: Any) -> Dict[str, Any]:
    payload={"type":kind,**geom}
    return {
        "id":_stable_id(payload),
        "type":kind,
        "role":"GEOMETRY",
        "semantic_state":"UNKNOWN",
        **geom,
        **meta,
    }


def _iter_dxf(entity: Any, lineage: List[str], depth: int=0) -> Iterable[Tuple[Any,List[str]]]:
    if depth>16:
        return
    if entity.dxftype()!="INSERT":
        yield entity,lineage
        return
    name=str(entity.dxf.name)
    for inst in (entity.multi_insert() if getattr(entity,"mcount",1)>1 else [entity]):
        try:
            for child in inst.virtual_entities():
                yield from _iter_dxf(child,lineage+[name],depth+1)
        except Exception:
            continue


def extract_dxf_primitives(path: str | Path) -> Dict[str, Any]:
    file_path=Path(path)
    raw=file_path.read_bytes()
    doc=ezdxf.readfile(file_path)
    msp=doc.modelspace()
    primitives: List[Dict[str, Any]]=[]

    for top in msp:
        for e,lineage in _iter_dxf(top,[]):
            kind=e.dxftype()
            layer=str(getattr(e.dxf,"layer","0") or "0")
            meta={"layer":layer,"block_lineage":lineage}
            if kind=="LINE":
                primitives.append(_base("LINE",{
                    "x1":_q(e.dxf.start.x),"y1":_q(e.dxf.start.y),
                    "x2":_q(e.dxf.end.x),"y2":_q(e.dxf.end.y),
                },**meta))
            elif kind=="LWPOLYLINE":
                pts=[[_q(x),_q(y)] for x,y,*_ in e.get_points("xy")]
                primitives.append(_base("POLYLINE",{"points":pts,"closed":bool(e.closed)},**meta))
            elif kind=="POLYLINE":
                pts=[[_q(v.dxf.location.x),_q(v.dxf.location.y)] for v in e.vertices]
                primitives.append(_base("POLYLINE",{"points":pts,"closed":bool(e.is_closed)},**meta))
            elif kind=="CIRCLE":
                primitives.append(_base("CIRCLE",{
                    "cx":_q(e.dxf.center.x),"cy":_q(e.dxf.center.y),"r":_q(e.dxf.radius)
                },**meta))
            elif kind=="ARC":
                primitives.append(_base("ARC",{
                    "cx":_q(e.dxf.center.x),"cy":_q(e.dxf.center.y),"r":_q(e.dxf.radius),
                    "start_deg":_q(e.dxf.start_angle),"end_deg":_q(e.dxf.end_angle)
                },**meta))

    primitives.sort(key=lambda x:x["id"])
    return {
        "schema":"TAKY_GEOMETRY_PRIMITIVES_V1",
        "source_type":"DXF",
        "source_sha256":hashlib.sha256(raw).hexdigest(),
        "authority":"AUTHORITATIVE_VECTOR",
        "semantic_inference":False,
        "primitive_count":len(primitives),
        "primitives":primitives,
    }


def _sample_cubic(p0: Any,p1: Any,p2: Any,p3: Any,steps: int=12) -> List[List[float]]:
    out=[]
    for i in range(steps+1):
        t=i/steps
        u=1-t
        x=u**3*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t**3*p3.x
        y=u**3*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t**3*p3.y
        out.append([_q(x),_q(y)])
    return out


def extract_pdf_primitives(path: str | Path,page_index: int=0) -> Dict[str, Any]:
    file_path=Path(path)
    raw=file_path.read_bytes()
    doc=fitz.open(stream=raw,filetype="pdf")
    page=doc[page_index]
    primitives: List[Dict[str, Any]]=[]

    for path_index,d in enumerate(page.get_drawings()):
        meta={"page_index":page_index,"path_index":path_index}
        for item_index,item in enumerate(d.get("items",[])):
            kind=item[0]
            item_meta={**meta,"item_index":item_index}
            if kind=="l":
                a,b=item[1],item[2]
                primitives.append(_base("LINE",{
                    "x1":_q(a.x),"y1":_q(a.y),"x2":_q(b.x),"y2":_q(b.y)
                },**item_meta))
            elif kind=="re":
                r=item[1]
                pts=[[_q(r.x0),_q(r.y0)],[_q(r.x1),_q(r.y0)],[_q(r.x1),_q(r.y1)],[_q(r.x0),_q(r.y1)]]
                primitives.append(_base("POLYLINE",{"points":pts,"closed":True},**item_meta))
            elif kind=="qu":
                q=item[1]
                pts=[[_q(q.ul.x),_q(q.ul.y)],[_q(q.ur.x),_q(q.ur.y)],[_q(q.lr.x),_q(q.lr.y)],[_q(q.ll.x),_q(q.ll.y)]]
                primitives.append(_base("POLYLINE",{"points":pts,"closed":True},**item_meta))
            elif kind=="c":
                primitives.append(_base("CURVE",{"points":_sample_cubic(item[1],item[2],item[3],item[4])},**item_meta))

    primitives.sort(key=lambda x:x["id"])
    return {
        "schema":"TAKY_GEOMETRY_PRIMITIVES_V1",
        "source_type":"PDF_VECTOR",
        "source_sha256":hashlib.sha256(raw).hexdigest(),
        "authority":"DERIVED_VECTOR",
        "semantic_inference":False,
        "page_index":page_index,
        "page_rect":[_q(page.rect.x0),_q(page.rect.y0),_q(page.rect.x1),_q(page.rect.y1)],
        "primitive_count":len(primitives),
        "primitives":primitives,
    }


def extract(path: str | Path,source_type: str,page_index: int=0) -> Dict[str, Any]:
    s=source_type.upper()
    if s=="DXF":
        return extract_dxf_primitives(path)
    if s in {"PDF","VECTOR_PDF"}:
        return extract_pdf_primitives(path,page_index=page_index)
    if s=="DWG":
        try:
            from drawing_dwg_bridge import convert_dwg_to_dxf
        except ImportError:
            return {
                "schema":"TAKY_GEOMETRY_PRIMITIVES_V1",
                "source_type":"DWG",
                "status":"BLOCKED",
                "blocker":"DWG_BRIDGE_MODULE_REQUIRED",
                "semantic_inference":False,
            }
        with tempfile.TemporaryDirectory(prefix="taky-dwg-") as td:
            dxf_path=Path(td)/"decoded.dxf"
            decoded=convert_dwg_to_dxf(path,dxf_path,strict=True)
            if decoded.get("ok") is not True:
                return {
                    "schema":"TAKY_GEOMETRY_PRIMITIVES_V1",
                    "source_type":"DWG",
                    "status":"BLOCKED",
                    "blocker":decoded.get("reason") or "DWG_DECODE_FAILED",
                    "decoder_manifest":decoded,
                    "semantic_inference":False,
                }
            result=extract_dxf_primitives(dxf_path)
            result["source_type"]="DWG_DERIVED_DXF"
            result["source_sha256"]=decoded["source_sha256"]
            result["derived_dxf_sha256"]=decoded["derived_dxf_sha256"]
            result["authority"]="DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE"
            result["production_claimable"]=False
            result["decoder_manifest"]={
                k:v for k,v in decoded.items()
                if k!="derived_dxf_path"
            }
            return result
    raise ValueError("UNSUPPORTED_SOURCE_TYPE")


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("source")
    p.add_argument("--type",required=True,choices=["DXF","PDF","VECTOR_PDF","DWG"])
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--out")
    args=p.parse_args()
    result=extract(args.source,args.type,page_index=args.page)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
