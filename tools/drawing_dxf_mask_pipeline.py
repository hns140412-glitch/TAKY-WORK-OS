#!/usr/bin/env python3
"""TAKY Drawing Engine - strict DXF semantic mask pipeline.

Input:
- DXF source
- VERIFIED semantic rule set

Output:
- direct CAD extraction evidence
- semantic candidates from verified rules only
- presentation mask manifest

This pipeline does not mine or auto-promote rules. Candidate mining and
verified promotion are separate onboarding steps.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
from typing import Any, Dict


HERE=Path(__file__).resolve().parent


def _load(name: str, filename: str):
    spec=importlib.util.spec_from_file_location(name, HERE/filename)
    mod=importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


adapter=_load("drawing_dxf_adapter","drawing_dxf_adapter.py")
mapper=_load("drawing_semantic_mapper","drawing_semantic_mapper.py")
masker=_load("drawing_mask_manifest","drawing_mask_manifest.py")
profiler=_load("drawing_dxf_layer_profiler","drawing_dxf_layer_profiler.py")


def run_pipeline(dxf_path: str | Path, verified_rules: Dict[str, Any]) -> Dict[str, Any]:
    if verified_rules.get("status") not in {"VERIFIED_ACTIVE_RULES","ACTIVE_VERIFIED_RULES"}:
        raise ValueError("VERIFIED_RULE_SET_REQUIRED")

    extracted=adapter.extract_dxf(dxf_path, include_entities=True)
    profile=profiler.profile_payload(extracted)
    semantic=mapper.map_entities(extracted, verified_rules)
    masks=masker.build_manifest(semantic)

    return {
        "schema":"TAKY_DXF_MASK_PIPELINE_V1",
        "source":{
            "sha256":extracted["source"]["sha256"],
            "geometry_digest":extracted["geometry_digest"],
            "annotation_digest":extracted["annotation_digest"],
            "route_id":"DXF_DIRECT_PARSE",
            "source_authority":"UNCLASSIFIED_CAD_SOURCE",
        },
        "rule_set":{
            "rule_set_id":verified_rules.get("rule_set_id"),
            "rule_set_version":verified_rules.get("rule_set_version"),
            "rule_set_digest":verified_rules.get("rule_set_digest"),
            "status":verified_rules.get("status"),
        },
        "layer_profile":profile,
        "semantic":semantic,
        "mask_manifest":masks,
        "sales_inputs":{
            "source_line_route":"DXF_SVG",
            "mask_summaries":masks.get("mask_summaries",[]),
        },
        "canonical_promotion":False,
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("dxf")
    p.add_argument("verified_rule_json")
    p.add_argument("--out")
    args=p.parse_args()
    rules=json.loads(Path(args.verified_rule_json).read_text(encoding="utf-8"))
    result=run_pipeline(args.dxf,rules)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if args.out:
        Path(args.out).write_text(text,encoding="utf-8")
    else:
        print(text)


if __name__=="__main__":
    main()
