#!/usr/bin/env python3
"""Staging-only SOM/Foster technical-clarity adapter.

Applies presentation-only emphasis to SVG elements whose architectural roles
were already verified elsewhere. It never infers STRUCTURE / PROGRAM / ENVELOPE.
Production claimability remains governed by the reference compiler.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path
import xml.etree.ElementTree as ET

ET.register_namespace("", "http://www.w3.org/2000/svg")
SCHEMA="TAKY_TECHNICAL_CLARITY_APPLICATION_V1"
MODE="VERIFIED_PRESENTATION_ROLE_CLARITY"
REFERENCE_ID="SOM_FOSTER_TECHNICAL_CLARITY"
ROLES=("STRUCTURE","PROGRAM","ENVELOPE")
GEOMETRY_ATTRS=("d","points","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","width","height","viewBox","transform")
HEX64=re.compile(r"^[0-9a-f]{64}$",re.I)
TARGETS={
    "STRUCTURE":{"opacity":1.0,"stroke_multiplier":1.12},
    "ENVELOPE":{"opacity":0.86,"stroke_multiplier":1.04},
    "PROGRAM":{"opacity":0.68,"stroke_multiplier":0.94},
}

def sha256_file(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def geometry_digest(root):
    rows=[]
    for i,e in enumerate(root.iter()):
        rows.append({"index":i,"tag":e.tag,"id":e.attrib.get("id"),
          "presentation_role":e.attrib.get("data-taky-presentation-role"),
          "attrs":{k:e.attrib[k] for k in GEOMETRY_ATTRS if k in e.attrib}})
    return hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def _float(e,key,default):
    try: return float(e.attrib.get(key,str(default)))
    except ValueError: return float(default)

def _set_float(e,key,value):
    rendered=f"{value:.6f}".rstrip("0").rstrip(".")
    try:
        if e.attrib.get(key) is not None and abs(float(e.attrib[key])-value)<1e-9: return False
    except ValueError:
        pass
    e.set(key,rendered); return True

def _role_elements(root):
    return [e for e in root.iter() if e.attrib.get("data-taky-presentation-role") in ROLES]

def apply_technical_clarity(input_svg,output_svg,policy):
    input_svg=Path(input_svg); output_svg=Path(output_svg)
    tree=ET.parse(input_svg); root=tree.getroot()
    baseline_sha=sha256_file(input_svg); before_geo=geometry_digest(root)

    if policy.get("reference_id")!=REFERENCE_ID:
        return {"ok":False,"reason":"TECHNICAL_CLARITY_REFERENCE_ID_REQUIRED"}
    if policy.get("mode")!=MODE:
        return {"ok":False,"reason":"TECHNICAL_CLARITY_MODE_MISMATCH","expected_mode":MODE}
    compile_digest=policy.get("compile_digest")
    if not isinstance(compile_digest,str) or len(compile_digest)<16:
        return {"ok":False,"reason":"REFERENCE_COMPILE_DIGEST_REQUIRED"}
    proof=policy.get("verified_role_proof_sha256")
    if not isinstance(proof,str) or not HEX64.fullmatch(proof):
        return {"ok":False,"reason":"VERIFIED_ROLE_PROOF_SHA256_REQUIRED"}

    elems=_role_elements(root)
    if not elems:
        return {"ok":False,"reason":"VERIFIED_PRESENTATION_ROLE_TARGET_REQUIRED"}
    roles={e.attrib.get("data-taky-presentation-role") for e in elems}
    missing=[r for r in ROLES if r not in roles]
    if missing:
        return {"ok":False,"reason":"VERIFIED_PRESENTATION_ROLE_SET_INCOMPLETE","missing_roles":missing}

    findings=[]
    for e in elems:
        if e.attrib.get("data-taky-role-source")!="VERIFIED":
            findings.append({"id":e.attrib.get("id"),"reason":"VERIFIED_ROLE_SOURCE_REQUIRED"})
        if e.attrib.get("data-taky-role-proof-sha256")!=proof:
            findings.append({"id":e.attrib.get("id"),"reason":"VERIFIED_ROLE_PROOF_MISMATCH"})
    if findings:
        return {"ok":False,"reason":"VERIFIED_PRESENTATION_ROLE_AUTHORITY_REQUIRED","findings":findings}

    changed=0; role_counts={r:0 for r in ROLES}
    for e in elems:
        role=e.attrib["data-taky-presentation-role"]; role_counts[role]+=1
        spec=TARGETS[role]
        changed+=int(_set_float(e,"opacity",spec["opacity"]))
        if e.attrib.get("data-taky-source-stroke-width") is None:
            e.set("data-taky-source-stroke-width",str(_float(e,"stroke-width",1.0)))
        base=_float(e,"data-taky-source-stroke-width",1.0)
        target=max(0.01,base*spec["stroke_multiplier"])
        changed+=int(_set_float(e,"stroke-width",target))
        e.set("data-taky-technical-clarity-role",role)

    after_geo=geometry_digest(root); geo_ok=before_geo==after_geo
    output_svg.parent.mkdir(parents=True,exist_ok=True); tree.write(output_svg,encoding="utf-8",xml_declaration=True)
    candidate_sha=sha256_file(output_svg)
    return {
        "ok":geo_ok,
        "schema":SCHEMA,
        "reference_id":REFERENCE_ID,
        "mode":MODE,
        "compile_digest":compile_digest,
        "role_contract":"VERIFIED_PRESENTATION_ROLES_ONLY",
        "verified_role_proof_sha256":proof,
        "semantic_inference":False,
        "presentation_only":True,
        "geometry_preserved":geo_ok,
        "applied":bool(geo_ok and changed>0),
        "changed_attributes":changed,
        "role_counts":role_counts,
        "baseline_svg_sha256":baseline_sha,
        "candidate_svg_sha256":candidate_sha,
        "baseline_geometry_digest":before_geo,
        "candidate_geometry_digest":after_geo,
        "production_claimable":False,
        "production_blocker":"REFERENCE_APPLICABILITY_DEFERRED_UNTIL_VERIFIED_ROLE_AUTHORITY_IS_INDEPENDENTLY_ADMITTED",
    }

def main():
    p=argparse.ArgumentParser(); p.add_argument("input_svg"); p.add_argument("output_svg"); p.add_argument("--policy",required=True); a=p.parse_args()
    policy=json.loads(Path(a.policy).read_text(encoding="utf-8"))
    print(json.dumps(apply_technical_clarity(a.input_svg,a.output_svg,policy),ensure_ascii=False,sort_keys=True))
if __name__=="__main__": main()
