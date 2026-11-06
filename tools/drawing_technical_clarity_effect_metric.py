#!/usr/bin/env python3
"""Objective staging metric for verified-role technical-clarity effects."""
from __future__ import annotations
import argparse, hashlib, json, statistics
from pathlib import Path
import xml.etree.ElementTree as ET

SCHEMA="TAKY_TECHNICAL_SYSTEM_READABILITY_DELTA_V1"
ROLES=("STRUCTURE","PROGRAM","ENVELOPE")
GEOMETRY_ATTRS=("d","points","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","width","height","viewBox","transform")

def geometry_digest(root):
    rows=[]
    for i,e in enumerate(root.iter()):
        rows.append({"index":i,"tag":e.tag,"id":e.attrib.get("id"),
          "presentation_role":e.attrib.get("data-taky-presentation-role"),
          "attrs":{k:e.attrib[k] for k in GEOMETRY_ATTRS if k in e.attrib}})
    return hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def f(e,key,default=1.0):
    try: return float(e.attrib.get(key,str(default)))
    except ValueError: return float(default)

def collect(root,proof):
    grouped={r:[] for r in ROLES}; findings=[]
    for e in root.iter():
        role=e.attrib.get("data-taky-presentation-role")
        if role not in ROLES: continue
        if e.attrib.get("data-taky-role-source")!="VERIFIED":
            findings.append({"id":e.attrib.get("id"),"reason":"VERIFIED_ROLE_SOURCE_REQUIRED"}); continue
        if proof and e.attrib.get("data-taky-role-proof-sha256")!=proof:
            findings.append({"id":e.attrib.get("id"),"reason":"VERIFIED_ROLE_PROOF_MISMATCH"}); continue
        grouped[role].append({"opacity":f(e,"opacity",1.0),"stroke_width":f(e,"stroke-width",1.0)})
    missing=[r for r in ROLES if not grouped[r]]
    if missing: findings.append({"reason":"VERIFIED_PRESENTATION_ROLE_SET_INCOMPLETE","missing_roles":missing})
    summary={}
    for role,rows in grouped.items():
        if rows:
            summary[role]={
                "count":len(rows),
                "mean_opacity":statistics.mean(x["opacity"] for x in rows),
                "mean_stroke_width":statistics.mean(x["stroke_width"] for x in rows),
            }
    return summary,findings

def separation(summary):
    if any(r not in summary for r in ROLES): return {"opacity_span":0.0,"stroke_span":0.0,"minimum_pair_gap":0.0}
    op=[summary[r]["mean_opacity"] for r in ROLES]
    sw=[summary[r]["mean_stroke_width"] for r in ROLES]
    pair=[]
    for values in (op,sw):
        s=sorted(values)
        pair.extend([s[1]-s[0],s[2]-s[1]])
    return {"opacity_span":max(op)-min(op),"stroke_span":max(sw)-min(sw),"minimum_pair_gap":min(pair)}

def measure(baseline_svg,candidate_svg,verified_role_proof_sha256):
    br=ET.parse(baseline_svg).getroot(); cr=ET.parse(candidate_svg).getroot()
    geometry_preserved=geometry_digest(br)==geometry_digest(cr)
    b,bf=collect(br,verified_role_proof_sha256); c,cf=collect(cr,verified_role_proof_sha256)
    bs=separation(b); cs=separation(c)
    opacity_gain=cs["opacity_span"]-bs["opacity_span"]
    stroke_gain=cs["stroke_span"]-bs["stroke_span"]
    order_ok=bool(all(r in c for r in ROLES) and
      c["STRUCTURE"]["mean_opacity"]>c["ENVELOPE"]["mean_opacity"]>c["PROGRAM"]["mean_opacity"] and
      c["STRUCTURE"]["mean_stroke_width"]>c["PROGRAM"]["mean_stroke_width"])
    contract=bool(not cf and order_ok and cs["opacity_span"]>=.25 and cs["stroke_span"]>=.10)
    objective=bool(geometry_preserved and contract and (opacity_gain>=.18 or stroke_gain>=.08))
    return {
      "ok":not cf,
      "schema":SCHEMA,
      "reference_id":"SOM_FOSTER_TECHNICAL_CLARITY",
      "verified_role_proof_sha256":verified_role_proof_sha256,
      "geometry_preserved":geometry_preserved,
      "baseline":{"roles":b,"findings":bf,"separation":bs},
      "candidate":{"roles":c,"findings":cf,"separation":cs},
      "opacity_separation_gain":round(opacity_gain,6),
      "stroke_separation_gain":round(stroke_gain,6),
      "role_order_contract_pass":order_ok,
      "contract_pass":contract,
      "objective_effect_detected":objective,
      "production_claimable":False,
    }

def main():
    p=argparse.ArgumentParser(); p.add_argument("baseline_svg"); p.add_argument("candidate_svg"); p.add_argument("--verified-role-proof-sha256",required=True); a=p.parse_args()
    print(json.dumps(measure(Path(a.baseline_svg),Path(a.candidate_svg),a.verified_role_proof_sha256),ensure_ascii=False,sort_keys=True))
if __name__=="__main__": main()
