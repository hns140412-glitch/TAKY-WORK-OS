#!/usr/bin/env python3
"""Objective line-hierarchy delta metric.

Measures the intended effect of a source-style-rank operation without making
claims about architectural semantics or professional quality.
"""

from __future__ import annotations

import argparse
import json
import statistics
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Any

RANK_ORDER=("LIGHT","SECONDARY","PRIMARY","HEAVY")


def _width(elem):
    try:
        return float(str(elem.attrib.get("stroke-width","")).strip())
    except Exception:
        return None


def _paths(root):
    out={}
    for elem in root.iter():
        ident=elem.attrib.get("id")
        if not ident:
            continue
        if "d" not in elem.attrib:
            continue
        out[ident]=elem
    return out


def measure(baseline_svg: str, candidate_svg: str) -> Dict[str,Any]:
    b=ET.fromstring(baseline_svg)
    c=ET.fromstring(candidate_svg)
    bp=_paths(b)
    cp=_paths(c)

    if set(bp)!=set(cp):
        return {"ok":False,"reason":"PATH_ID_SET_MISMATCH"}

    rows=[]
    for ident in sorted(bp):
        be=bp[ident]
        ce=cp[ident]
        if be.attrib.get("d")!=ce.attrib.get("d"):
            return {"ok":False,"reason":"PATH_GEOMETRY_MISMATCH","path_id":ident}
        bw=_width(be)
        cw=_width(ce)
        if bw is None or cw is None or bw<=0 or cw<=0:
            continue
        rank=ce.attrib.get("data-presentation-rank")
        if rank not in RANK_ORDER:
            continue
        rows.append((ident,bw,cw,rank))

    if not rows:
        return {"ok":False,"reason":"RANKED_PATHS_REQUIRED"}

    by_rank={r:[] for r in RANK_ORDER}
    source_by_rank={r:[] for r in RANK_ORDER}
    for _,bw,cw,rank in rows:
        source_by_rank[rank].append(bw)
        by_rank[rank].append(cw)

    rank_stats={}
    for r in RANK_ORDER:
        if not by_rank[r]:
            continue
        rank_stats[r]={
            "count":len(by_rank[r]),
            "source_median":statistics.median(source_by_rank[r]),
            "candidate_median":statistics.median(by_rank[r]),
        }

    present=[r for r in RANK_ORDER if r in rank_stats]
    monotonic=True
    for a,b_rank in zip(present,present[1:]):
        if max(by_rank[a])>min(by_rank[b_rank])+1e-12:
            monotonic=False
            break

    source_all=[x[1] for x in rows]
    candidate_all=[x[2] for x in rows]
    source_dynamic=max(source_all)/min(source_all)
    candidate_dynamic=max(candidate_all)/min(candidate_all)
    dynamic_gain=candidate_dynamic/source_dynamic if source_dynamic else 1.0

    adjacent=[]
    for a,b_rank in zip(present,present[1:]):
        source_sep=rank_stats[b_rank]["source_median"]/rank_stats[a]["source_median"]
        candidate_sep=rank_stats[b_rank]["candidate_median"]/rank_stats[a]["candidate_median"]
        adjacent.append({
            "from":a,
            "to":b_rank,
            "source_ratio":source_sep,
            "candidate_ratio":candidate_sep,
            "gain":candidate_sep/source_sep if source_sep else 1.0,
        })

    min_adjacent_gain=min((x["gain"] for x in adjacent),default=1.0)
    changed=sum(1 for _,bw,cw,_ in rows if abs(bw-cw)>1e-12)

    effect=bool(
        monotonic
        and changed>0
        and dynamic_gain>=1.10
        and min_adjacent_gain>=1.03
    )

    return {
        "ok":True,
        "schema":"TAKY_LINE_HIERARCHY_DELTA_V1",
        "measurement_scope":"OBJECTIVE_LINE_HIERARCHY_ONLY",
        "semantic_inference":False,
        "professional_quality_claim":False,
        "path_count":len(rows),
        "changed_paths":changed,
        "monotonic_order_preserved":monotonic,
        "source_dynamic_range":round(source_dynamic,6),
        "candidate_dynamic_range":round(candidate_dynamic,6),
        "dynamic_range_gain":round(dynamic_gain,6),
        "minimum_adjacent_separation_gain":round(min_adjacent_gain,6),
        "rank_stats":rank_stats,
        "adjacent_rank_separation":adjacent,
        "objective_effect_detected":effect,
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("baseline_svg")
    p.add_argument("candidate_svg")
    args=p.parse_args()
    result=measure(
        Path(args.baseline_svg).read_text(encoding="utf-8"),
        Path(args.candidate_svg).read_text(encoding="utf-8"),
    )
    print(json.dumps(result,ensure_ascii=False,indent=2))
    raise SystemExit(0 if result.get("ok") else 2)


if __name__=="__main__":
    main()
