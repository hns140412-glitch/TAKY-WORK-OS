#!/usr/bin/env python3
"""TAKY Drawing Engine - A3 multi-format output gate."""

from __future__ import annotations
import argparse
import json
from pathlib import Path
import importlib.util

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("a3_validator", HERE/"drawing_a3_output_validator.py")
validator=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)


def gate(files, orientation="landscape", dpi=300):
    results=[validator.validate(path, orientation, dpi) for path in files]
    ok=all(r["ok"] for r in results)
    return {
        "ok":ok,
        "status":"PASS" if ok else "REEXPORT_REQUIRED",
        "orientation":orientation,
        "dpi":dpi,
        "results":results,
        "rule":"Do not ship any bundle until every required format passes A3 absolute-size validation."
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("files", nargs="+")
    p.add_argument("--orientation", default="landscape", choices=["landscape","portrait"])
    p.add_argument("--dpi", type=int, default=300)
    args=p.parse_args()
    result=gate(args.files,args.orientation,args.dpi)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    raise SystemExit(0 if result["ok"] else 2)

if __name__=="__main__":
    main()
