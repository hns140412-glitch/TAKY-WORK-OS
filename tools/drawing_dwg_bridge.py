#!/usr/bin/env python3
"""Strict DWG -> DXF bridge for TAKY using GNU LibreDWG dwgread.

Preserves original DWG identity and fails closed on decoder diagnostics that can
indicate unsupported/invalid content. The derived DXF is never promoted to the
original source authority.
"""
from __future__ import annotations
import argparse, hashlib, json, os, re, shutil, subprocess
from pathlib import Path

try:
    import ezdxf
except ImportError as exc:
    raise SystemExit("ezdxf is required") from exc

SCHEMA="TAKY_DWG_DECODE_BRIDGE_V1"
RISK_RE=re.compile(
    r"(DWG_ERR_|UNHANDLEDCLASS|UNHANDLED CLASS|NOTYETSUPPORTED|NOT YET SUPPORTED|"
    r"WRONGCRC|INVALIDDWG|INVALID DWG|SECTIONNOTFOUND|CLASSESNOTFOUND)",
    re.I,
)

def _sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def probe_decoder(binary=None):
    candidate=binary or os.environ.get("TAKY_DWGREAD_BIN") or shutil.which("dwgread")
    if not candidate:
        return {"ok":False,"available":False,"reason":"LIBREDWG_DWGREAD_RUNTIME_REQUIRED"}
    try:
        cp=subprocess.run([candidate,"--version"],capture_output=True,text=True,timeout=10)
    except Exception as exc:
        return {"ok":False,"available":False,"reason":"DWG_DECODER_PROBE_FAILED","error":str(exc)}
    version=((cp.stdout or "")+"\n"+(cp.stderr or "")).strip()
    if cp.returncode!=0:
        return {"ok":False,"available":False,"reason":"DWG_DECODER_PROBE_FAILED","returncode":cp.returncode}
    if "libredwg" not in version.lower():
        return {"ok":False,"available":True,"reason":"UNTRUSTED_DWG_DECODER_IDENTITY","version":version[:300]}
    return {
        "ok":True,
        "available":True,
        "decoder":"GNU_LIBREDWG_DWGREAD",
        "binary":candidate,
        "version":version.splitlines()[0][:300],
    }

def convert_dwg_to_dxf(source,out_dxf,*,binary=None,strict=True):
    source=Path(source); out_dxf=Path(out_dxf); raw=source.read_bytes()
    source_sha=hashlib.sha256(raw).hexdigest()
    if len(raw)<6 or not raw[:6].startswith(b"AC"):
        return {"ok":False,"schema":SCHEMA,"reason":"DWG_SIGNATURE_INVALID","source_sha256":source_sha}

    probe=probe_decoder(binary)
    if not probe.get("ok"):
        return {"ok":False,"schema":SCHEMA,**probe,"source_sha256":source_sha}

    out_dxf.parent.mkdir(parents=True,exist_ok=True)
    cp=subprocess.run(
        [probe["binary"],"-O","DXF","-o",str(out_dxf),str(source)],
        capture_output=True,
        text=True,
        timeout=120,
    )
    diagnostics=((cp.stdout or "")+"\n"+(cp.stderr or "")).strip()
    risky=[line.strip() for line in diagnostics.splitlines() if RISK_RE.search(line)]

    if cp.returncode!=0:
        return {
            "ok":False,
            "schema":SCHEMA,
            "reason":"DWG_DECODE_FAILED",
            "returncode":cp.returncode,
            "diagnostics":diagnostics[-2000:],
        }
    if strict and risky:
        return {
            "ok":False,
            "schema":SCHEMA,
            "reason":"DWG_DECODER_DIAGNOSTIC_BLOCK",
            "risk_lines":risky[:40],
        }
    if not out_dxf.exists() or out_dxf.stat().st_size<32:
        return {"ok":False,"schema":SCHEMA,"reason":"DWG_DERIVED_DXF_MISSING"}

    try:
        doc=ezdxf.readfile(out_dxf)
        entity_count=sum(1 for _ in doc.modelspace())
    except Exception as exc:
        return {"ok":False,"schema":SCHEMA,"reason":"DWG_DERIVED_DXF_PARSE_FAILED","error":str(exc)}

    return {
        "ok":True,
        "schema":SCHEMA,
        "source_type":"DWG",
        "source_sha256":source_sha,
        "dwg_signature":raw[:6].decode("ascii","replace"),
        "decoder":probe["decoder"],
        "decoder_version":probe["version"],
        "strict_diagnostics_pass":not risky,
        "derived_dxf_path":str(out_dxf),
        "derived_dxf_sha256":_sha(out_dxf),
        "derived_modelspace_entities":entity_count,
        "authority":"DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE",
        "semantic_inference":False,
        "production_claimable":False,
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("dwg")
    p.add_argument("--out-dxf",required=True)
    p.add_argument("--decoder")
    p.add_argument("--allow-diagnostics",action="store_true")
    p.add_argument("--manifest")
    a=p.parse_args()
    result=convert_dwg_to_dxf(
        a.dwg,
        a.out_dxf,
        binary=a.decoder,
        strict=not a.allow_diagnostics,
    )
    text=json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)
    if a.manifest:
        Path(a.manifest).write_text(text,encoding="utf-8")
    print(text)

if __name__=="__main__":
    main()
