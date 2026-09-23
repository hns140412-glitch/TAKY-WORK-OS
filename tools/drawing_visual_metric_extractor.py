#!/usr/bin/env python3
"""TAKY objective visual metric extractor.

Measures only objective artifact properties. It does NOT claim professional
quality, architectural intent, or user value.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict

import fitz
import numpy as np
from PIL import Image


def _clamp(v: float, lo: float=0.0, hi: float=1.0) -> float:
    return max(lo,min(hi,float(v)))


def _gray_metrics(gray: np.ndarray) -> Dict[str, Any]:
    arr=gray.astype(np.float32)
    white=arr>=245
    dark=arr<=80
    ink=arr<245

    gx=np.zeros_like(arr)
    gy=np.zeros_like(arr)
    gx[:,1:]=np.abs(arr[:,1:]-arr[:,:-1])
    gy[1:,:]=np.abs(arr[1:,:]-arr[:-1,:])
    grad=np.maximum(gx,gy)
    edges=grad>=24

    ys,xs=np.where(ink)
    if len(xs):
        x0,x1=int(xs.min()),int(xs.max())
        y0,y1=int(ys.min()),int(ys.max())
        bbox=[x0,y0,x1,y1]
        coverage=((x1-x0+1)*(y1-y0+1))/(arr.shape[0]*arr.shape[1])
        margins={
            "left":x0/arr.shape[1],
            "right":(arr.shape[1]-1-x1)/arr.shape[1],
            "top":y0/arr.shape[0],
            "bottom":(arr.shape[0]-1-y1)/arr.shape[0],
        }
    else:
        bbox=None
        coverage=0.0
        margins={"left":1.0,"right":1.0,"top":1.0,"bottom":1.0}

    return {
        "width_px":int(arr.shape[1]),
        "height_px":int(arr.shape[0]),
        "mean_luminance":round(float(arr.mean()/255.0),6),
        "contrast_std_norm":round(float(arr.std()/127.5),6),
        "whitespace_ratio":round(float(white.mean()),6),
        "ink_ratio":round(float(ink.mean()),6),
        "dark_ratio":round(float(dark.mean()),6),
        "edge_density":round(float(edges.mean()),6),
        "edge_strength_mean":round(float(grad.mean()/255.0),6),
        "content_bbox_px":bbox,
        "content_coverage_ratio":round(float(coverage),6),
        "normalized_margins":{k:round(float(v),6) for k,v in margins.items()},
    }


def _pdf(path: Path,page_index: int=0,dpi: int=144) -> Dict[str, Any]:
    doc=fitz.open(path)
    page=doc[page_index]
    zoom=dpi/72.0
    pix=page.get_pixmap(matrix=fitz.Matrix(zoom,zoom),colorspace=fitz.csGRAY,alpha=False)
    gray=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width)
    metrics=_gray_metrics(gray)
    width_mm=page.rect.width*25.4/72.0
    height_mm=page.rect.height*25.4/72.0

    clipped=False
    for block in page.get_text("blocks"):
        x0,y0,x1,y1=block[:4]
        if x0 < -0.5 or y0 < -0.5 or x1 > page.rect.width+0.5 or y1 > page.rect.height+0.5:
            clipped=True
            break

    metrics.update({
        "format":"PDF",
        "page_index":page_index,
        "page_count":doc.page_count,
        "width_mm":round(width_mm,3),
        "height_mm":round(height_mm,3),
        "landscape":bool(width_mm>height_mm),
        "a3_landscape":bool(abs(width_mm-420)<=2 and abs(height_mm-297)<=2),
        "text_bbox_outside_page":clipped,
    })
    return metrics


def _image(path: Path) -> Dict[str, Any]:
    im=Image.open(path).convert("L")
    gray=np.asarray(im)
    metrics=_gray_metrics(gray)
    dpi=im.info.get("dpi")
    width_mm=height_mm=None
    if dpi and dpi[0] and dpi[1]:
        width_mm=im.width/dpi[0]*25.4
        height_mm=im.height/dpi[1]*25.4
    metrics.update({
        "format":path.suffix.lower().lstrip(".").upper(),
        "width_mm":round(width_mm,3) if width_mm else None,
        "height_mm":round(height_mm,3) if height_mm else None,
        "landscape":bool(im.width>im.height),
        "a3_landscape":bool(width_mm and height_mm and abs(width_mm-420)<=2 and abs(height_mm-297)<=2),
        "text_bbox_outside_page":None,
    })
    return metrics


def extract(path: str|Path,page_index: int=0) -> Dict[str, Any]:
    p=Path(path)
    suffix=p.suffix.lower()
    if suffix==".pdf":
        metrics=_pdf(p,page_index)
    elif suffix in {".png",".jpg",".jpeg",".webp"}:
        metrics=_image(p)
    else:
        raise ValueError("UNSUPPORTED_VISUAL_ARTIFACT_FORMAT")
    return {
        "schema":"TAKY_OBJECTIVE_VISUAL_METRICS_V1",
        "measurement_scope":"OBJECTIVE_ONLY",
        "professional_quality_claim":False,
        "metrics":metrics,
    }


def compare(baseline: Dict[str,Any],candidate: Dict[str,Any]) -> Dict[str,Any]:
    b=baseline["metrics"]
    c=candidate["metrics"]
    keys=["contrast_std_norm","whitespace_ratio","dark_ratio","edge_density","content_coverage_ratio","mean_luminance"]
    delta={k:round(float(c[k]-b[k]),6) for k in keys}
    structural=sum(abs(delta[k]) for k in ["whitespace_ratio","dark_ratio","edge_density","content_coverage_ratio"])/4.0
    tonal=(abs(delta["mean_luminance"])+abs(delta["contrast_std_norm"]))/2.0
    meaningful=(structural*0.7+tonal*0.3)
    clarity_only=bool(tonal>=0.035 and structural<0.012)
    return {
        "schema":"TAKY_OBJECTIVE_REFERENCE_DELTA_V1",
        "measurement_scope":"OBJECTIVE_ONLY",
        "delta":delta,
        "structural_presentation_delta":round(structural,6),
        "tonal_delta":round(tonal,6),
        "combined_effect_score":round(meaningful,6),
        "clarity_only_suspected":clarity_only,
        "objective_effect_detected":bool(meaningful>=0.018 and not clarity_only),
        "professional_family_claim":False,
    }


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("artifact")
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--baseline")
    args=p.parse_args()
    candidate=extract(args.artifact,args.page)
    if args.baseline:
        baseline=extract(args.baseline,args.page)
        print(json.dumps({
            "candidate":candidate,
            "baseline":baseline,
            "comparison":compare(baseline,candidate)
        },ensure_ascii=False))
    else:
        print(json.dumps(candidate,ensure_ascii=False))


if __name__=="__main__":
    main()
