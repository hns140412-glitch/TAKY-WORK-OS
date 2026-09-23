#!/usr/bin/env python3
"""Objective metrics for declared-role OMA/BIG diagram reference effects."""
from __future__ import annotations
import argparse, hashlib, json, statistics
from pathlib import Path
import xml.etree.ElementTree as ET
GEOMETRY_ATTRS=("d","points","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","width","height","viewBox","transform")

def geometry_digest(root):
    rows=[]
    for i,e in enumerate(root.iter()):
        rows.append({"index":i,"tag":e.tag,"id":e.attrib.get("id"),"diagram_id":e.attrib.get("data-taky-diagram-id"),
          "diagram_role":e.attrib.get("data-taky-diagram-role"),"attrs":{k:e.attrib[k] for k in GEOMETRY_ATTRS if k in e.attrib}})
    return hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def opacity(e):
    try: return float(e.attrib.get("opacity","1"))
    except ValueError: return 1.0
def groups(root):
    out={}
    for e in root.iter():
        did=e.attrib.get("data-taky-diagram-id"); role=e.attrib.get("data-taky-diagram-role")
        if did and role: out.setdefault(did,[]).append(e)
    return out
def declared(elems): return all(e.attrib.get("data-taky-role-source")=="DECLARED" for e in elems)

def oma_metrics(root):
    rows=[]; findings=[]
    for did,elems in groups(root).items():
        relv=[e for e in elems if e.attrib.get("data-taky-diagram-role") in {"RELATION","DECORATION"}]
        if not relv: continue
        if not declared(relv): findings.append({"diagram_id":did,"reason":"DECLARED_ROLE_SOURCE_REQUIRED"}); continue
        rel=[e for e in relv if e.attrib.get("data-taky-diagram-role")=="RELATION"]
        primary=[e for e in rel if e.attrib.get("data-taky-primary")=="true"]
        if len(primary)!=1 or not rel: findings.append({"diagram_id":did,"reason":"EXACTLY_ONE_DECLARED_PRIMARY_RELATION_REQUIRED"}); continue
        p=opacity(primary[0]); others=[opacity(e) for e in rel if e is not primary[0]]
        dec=[opacity(e) for e in relv if e.attrib.get("data-taky-diagram-role")=="DECORATION"]; mo=max(others) if others else 0.0
        rows.append({"diagram_id":did,"primary_opacity":p,"max_secondary_relation_opacity":mo,
          "decoration_opacity":statistics.mean(dec) if dec else 0.0,"focus_gap":p-mo})
    if not rows: findings.append({"reason":"DECLARED_RELATION_DIAGRAM_REQUIRED"})
    return rows,findings

def big_metrics(root):
    rows=[]; findings=[]
    for did,elems in groups(root).items():
        by={}
        for e in elems:
            role=e.attrib.get("data-taky-diagram-role")
            if role in {"BASE_CONDITION","MOVE","RESULT"}: by.setdefault(role,[]).append(e)
        if not {"BASE_CONDITION","MOVE","RESULT"}.issubset(by): continue
        relv=[e for values in by.values() for e in values]
        if not declared(relv): findings.append({"diagram_id":did,"reason":"DECLARED_ROLE_SOURCE_REQUIRED"}); continue
        if any(len(by[r])!=1 for r in ("BASE_CONDITION","MOVE","RESULT")):
            findings.append({"diagram_id":did,"reason":"EXACTLY_ONE_DECLARED_SEQUENCE_ROLE_REQUIRED"}); continue
        b=opacity(by["BASE_CONDITION"][0]); m=opacity(by["MOVE"][0]); r=opacity(by["RESULT"][0])
        rows.append({"diagram_id":did,"base_opacity":b,"move_opacity":m,"result_opacity":r,
          "move_contrast":m-max(b,r),"result_over_base":r-b})
    if not rows: findings.append({"reason":"DECLARED_BASE_MOVE_RESULT_DIAGRAM_REQUIRED"})
    return rows,findings

def measure_reference_effect(baseline_svg,candidate_svg,reference_id):
    br=ET.parse(baseline_svg).getroot(); cr=ET.parse(candidate_svg).getroot()
    geo=geometry_digest(br)==geometry_digest(cr)
    if reference_id=="OMA_RELATION_FIRST":
        b,bf=oma_metrics(br); c,cf=oma_metrics(cr)
        bfocus=min((x["focus_gap"] for x in b),default=0); cfocus=min((x["focus_gap"] for x in c),default=0)
        bdec=max((x["decoration_opacity"] for x in b),default=0); cdec=max((x["decoration_opacity"] for x in c),default=0)
        fg=cfocus-bfocus; dr=bdec-cdec; contract=bool(not cf and cfocus>=.65 and cdec<=.20)
        return {"ok":not cf,"schema":"TAKY_RELATION_FOCUS_DELTA_V1","reference_id":reference_id,"geometry_preserved":geo,
          "baseline":{"diagrams":b,"findings":bf},"candidate":{"diagrams":c,"findings":cf},"focus_gap_gain":round(fg,6),
          "decoration_visibility_reduction":round(dr,6),"contract_pass":contract,
          "objective_effect_detected":bool(geo and contract and (fg>=.20 or dr>=.20))}
    if reference_id=="BIG_ONE_MOVE":
        b,bf=big_metrics(br); c,cf=big_metrics(cr)
        bc=min((x["move_contrast"] for x in b),default=0); cc=min((x["move_contrast"] for x in c),default=0)
        bo=min((x["result_over_base"] for x in b),default=0); co=min((x["result_over_base"] for x in c),default=0)
        cg=cc-bc; sg=co-bo
        contract=bool(not cf and all(x["move_opacity"]>=.95 and x["base_opacity"]<=.65 and .70<=x["result_opacity"]<=.90 and x["move_contrast"]>=.15 and x["result_over_base"]>=.15 for x in c))
        return {"ok":not cf,"schema":"TAKY_ONE_MOVE_EMPHASIS_DELTA_V1","reference_id":reference_id,"geometry_preserved":geo,
          "baseline":{"diagrams":b,"findings":bf},"candidate":{"diagrams":c,"findings":cf},"move_contrast_gain":round(cg,6),
          "role_separation_gain":round(sg,6),"contract_pass":contract,"objective_effect_detected":bool(geo and contract and cg>=.12 and sg>=.12)}
    return {"ok":False,"reason":"DIAGRAM_REFERENCE_NOT_SUPPORTED","reference_id":reference_id}

def main():
    p=argparse.ArgumentParser(); p.add_argument("baseline_svg"); p.add_argument("candidate_svg"); p.add_argument("--reference-id",required=True); a=p.parse_args()
    print(json.dumps(measure_reference_effect(Path(a.baseline_svg),Path(a.candidate_svg),a.reference_id),ensure_ascii=False,sort_keys=True))
if __name__=="__main__": main()
