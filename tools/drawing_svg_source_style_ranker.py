#!/usr/bin/env python3
"""TAKY Drawing Engine - source-style rank adapter.

Uses only measured source presentation values (stroke width) to strengthen
relative hierarchy without inferring architectural semantics.

Geometry is immutable. Semantic labels are never created.
"""

from __future__ import annotations

import argparse
import json
import math
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List

from drawing_svg_presentation_styler import geometry_fingerprint

RANKS=("LIGHT","SECONDARY","PRIMARY","HEAVY")
DEFAULT_MULTIPLIERS={
    "LIGHT":0.86,
    "SECONDARY":0.96,
    "PRIMARY":1.06,
    "HEAVY":1.16,
}


def _number(value: Any):
    try:
        s=str(value).strip().lower().replace("px","").replace("pt","")
        return float(s)
    except Exception:
        return None


def _percentile(values: List[float], q: float) -> float:
    if not values:
        raise ValueError("VALUES_REQUIRED")
    xs=sorted(values)
    if len(xs)==1:
        return xs[0]
    pos=(len(xs)-1)*q
    lo=math.floor(pos)
    hi=math.ceil(pos)
    if lo==hi:
        return xs[lo]
    frac=pos-lo
    return xs[lo]*(1-frac)+xs[hi]*frac


def _rank(width: float, q25: float, q50: float, q75: float) -> str:
    if width>=q75:
        return "HEAVY"
    if width>=q50:
        return "PRIMARY"
    if width>=q25:
        return "SECONDARY"
    return "LIGHT"


def apply_source_style_rank(svg_text: str, policy: Dict[str,Any] | None=None) -> Dict[str,Any]:
    policy=policy or {}
    root=ET.fromstring(svg_text)
    before=geometry_fingerprint(root)

    elements=[]
    widths=[]
    for elem in root.iter():
        stroke=str(elem.attrib.get("stroke","")).strip().lower()
        width=_number(elem.attrib.get("stroke-width"))
        if width is None or width<=0 or stroke in {"","none"}:
            continue
        elements.append((elem,width))
        widths.append(width)

    if not widths:
        return {
            "ok":True,
            "applied":False,
            "reason":"NO_STROKED_SOURCE_ELEMENTS",
            "semantic_inference":False,
            "geometry_preserved":True,
            "geometry_fingerprint_before":before,
            "geometry_fingerprint_after":before,
            "styled_elements":0,
            "rank_counts":{},
            "svg":svg_text,
        }

    unique=sorted(set(round(v,8) for v in widths))
    if len(unique)<2:
        return {
            "ok":True,
            "applied":False,
            "reason":"NO_SOURCE_WIDTH_HIERARCHY",
            "semantic_inference":False,
            "geometry_preserved":True,
            "geometry_fingerprint_before":before,
            "geometry_fingerprint_after":before,
            "styled_elements":0,
            "source_widths":{"min":min(widths),"max":max(widths),"unique":len(unique)},
            "rank_counts":{"PRIMARY":len(widths)},
            "svg":svg_text,
        }

    unique_values=sorted(set(round(v,8) for v in widths))
    width_rank={}
    for index,width in enumerate(unique_values):
        band=min(len(RANKS)-1,(index*len(RANKS))//len(unique_values))
        width_rank[width]=RANKS[band]

    raw_multipliers=policy.get("multipliers") or DEFAULT_MULTIPLIERS
    multipliers={}
    previous=0.0
    for rank in RANKS:
        v=float(raw_multipliers.get(rank,DEFAULT_MULTIPLIERS[rank]))
        if v<=0 or v>1.5:
            raise ValueError("SOURCE_STYLE_MULTIPLIER_OUT_OF_RANGE:"+rank)
        if v<previous:
            raise ValueError("SOURCE_STYLE_MULTIPLIER_ORDER_INVALID")
        multipliers[rank]=v
        previous=v

    rank_counts=Counter()
    changed=0
    samples=[]
    for elem,width in elements:
        rank=width_rank[round(width,8)]
        rank_counts[rank]+=1
        new_width=width*multipliers[rank]
        elem.set("data-presentation-rank",rank)
        elem.set("data-source-stroke-width",f"{width:.8g}")
        elem.set("data-style-origin","SOURCE_STYLE_RANK_V1")
        elem.set("stroke-width",f"{new_width:.8g}")
        if abs(new_width-width)>1e-12:
            changed+=1
        if len(samples)<12:
            samples.append({
                "source_width":width,
                "rank":rank,
                "multiplier":multipliers[rank],
                "result_width":new_width,
            })

    after=geometry_fingerprint(root)
    if before!=after:
        raise RuntimeError("GEOMETRY_MUTATION_DETECTED")

    rank_order={
        rank:sorted(width*multipliers[rank] for _,width in elements if width_rank[round(width,8)]==rank)
        for rank in RANKS
    }
    nonempty=[(rank,vals) for rank,vals in rank_order.items() if vals]
    monotonic=True
    for (_,a),(_,b) in zip(nonempty,nonempty[1:]):
        if max(a)>min(b)+1e-12:
            monotonic=False
            break
    if not monotonic:
        raise RuntimeError("SOURCE_STYLE_RANK_ORDER_REVERSAL")

    return {
        "ok":True,
        "applied":changed>0,
        "schema":"TAKY_SOURCE_STYLE_RANK_V1",
        "semantic_inference":False,
        "geometry_preserved":True,
        "geometry_fingerprint_before":before,
        "geometry_fingerprint_after":after,
        "styled_elements":changed,
        "source_widths":{
            "min":min(widths),
            "max":max(widths),
            "unique":len(unique),
            "rank_basis":"DISTINCT_SOURCE_WIDTH_ORDER",
            "width_rank_map":{str(k):v for k,v in width_rank.items()},
        },
        "rank_counts":dict(rank_counts),
        "multipliers":multipliers,
        "monotonic_order_preserved":True,
        "samples":samples,
        "svg":ET.tostring(root,encoding="unicode"),
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("svg")
    p.add_argument("--policy")
    p.add_argument("--out",required=True)
    args=p.parse_args()
    svg=Path(args.svg).read_text(encoding="utf-8")
    policy=json.loads(Path(args.policy).read_text(encoding="utf-8")) if args.policy else None
    result=apply_source_style_rank(svg,policy)
    Path(args.out).write_text(result.pop("svg"),encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=="__main__":
    main()
