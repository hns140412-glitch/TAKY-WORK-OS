#!/usr/bin/env python3
"""Apply declared-role diagram reference policies to a canonical SVG.

Presentation-only: no architectural semantic inference and no geometry-bearing
SVG attribute mutation.
"""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
import xml.etree.ElementTree as ET

ET.register_namespace("", "http://www.w3.org/2000/svg")
GEOMETRY_ATTRS=("d","points","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","width","height","viewBox","transform")
SUPPORTED={
 "OMA_RELATION_FIRST":{"mode":"DECLARED_PRIMARY_RELATION_FOCUS"},
 "BIG_ONE_MOVE":{"mode":"DECLARED_BASE_MOVE_RESULT_EMPHASIS"},
}

def sha256_file(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def geometry_digest(root):
    records=[]
    for i,e in enumerate(root.iter()):
        records.append({"index":i,"tag":e.tag,"id":e.attrib.get("id"),
          "diagram_id":e.attrib.get("data-taky-diagram-id"),
          "diagram_role":e.attrib.get("data-taky-diagram-role"),
          "attrs":{k:e.attrib[k] for k in GEOMETRY_ATTRS if k in e.attrib}})
    return hashlib.sha256(json.dumps(records,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def groups(root):
    out={}
    for e in root.iter():
        did=e.attrib.get("data-taky-diagram-id"); role=e.attrib.get("data-taky-diagram-role")
        if did and role: out.setdefault(did,[]).append(e)
    return out

def declared(elems): return all(e.attrib.get("data-taky-role-source")=="DECLARED" for e in elems)

def set_opacity(e,target):
    rendered=f"{target:.2f}".rstrip("0").rstrip(".")
    try:
        if e.attrib.get("opacity") is not None and abs(float(e.attrib["opacity"])-target)<1e-9: return False
    except ValueError: pass
    e.set("opacity",rendered); return True

def apply_oma(root):
    changed=0; count=0; findings=[]
    for did,elems in groups(root).items():
        relevant=[e for e in elems if e.attrib.get("data-taky-diagram-role") in {"RELATION","DECORATION"}]
        if not relevant: continue
        count+=1
        if not declared(relevant):
            findings.append({"diagram_id":did,"reason":"DECLARED_ROLE_SOURCE_REQUIRED"}); continue
        rel=[e for e in relevant if e.attrib.get("data-taky-diagram-role")=="RELATION"]
        primary=[e for e in rel if e.attrib.get("data-taky-primary")=="true"]
        if not rel:
            findings.append({"diagram_id":did,"reason":"RELATION_REQUIRED"}); continue
        if len(primary)!=1:
            findings.append({"diagram_id":did,"reason":"EXACTLY_ONE_DECLARED_PRIMARY_RELATION_REQUIRED"}); continue
        for e in rel: changed+=int(set_opacity(e,1.0 if e is primary[0] else .20))
        for e in relevant:
            if e.attrib.get("data-taky-diagram-role")=="DECORATION": changed+=int(set_opacity(e,.10))
    if count==0: findings.append({"reason":"DECLARED_DIAGRAM_TARGET_REQUIRED"})
    return changed,count,findings

def apply_big(root):
    changed=0; count=0; findings=[]
    targets={"BASE_CONDITION":.58,"MOVE":1.0,"RESULT":.82,"DECORATION":.18}
    for did,elems in groups(root).items():
        relevant=[e for e in elems if e.attrib.get("data-taky-diagram-role") in targets]
        roles={e.attrib.get("data-taky-diagram-role") for e in relevant}
        if not {"BASE_CONDITION","MOVE","RESULT"}.issubset(roles): continue
        count+=1
        if not declared(relevant):
            findings.append({"diagram_id":did,"reason":"DECLARED_ROLE_SOURCE_REQUIRED"}); continue
        bad=False
        for role in ("BASE_CONDITION","MOVE","RESULT"):
            if len([e for e in relevant if e.attrib.get("data-taky-diagram-role")==role])!=1:
                findings.append({"diagram_id":did,"reason":"EXACTLY_ONE_DECLARED_SEQUENCE_ROLE_REQUIRED","role":role}); bad=True
        if bad: continue
        for e in relevant: changed+=int(set_opacity(e,targets[e.attrib.get("data-taky-diagram-role")]))
    if count==0: findings.append({"reason":"DECLARED_BASE_MOVE_RESULT_TARGET_REQUIRED"})
    return changed,count,findings

def apply_svg_reference_policies(input_svg,output_svg,policy):
    input_svg=Path(input_svg); output_svg=Path(output_svg)
    tree=ET.parse(input_svg); root=tree.getroot()
    before_geo=geometry_digest(root); baseline_sha=sha256_file(input_svg)
    requests=policy.get("requests")
    if not isinstance(requests,list) or not requests: return {"ok":False,"reason":"DIAGRAM_REFERENCE_REQUESTS_REQUIRED"}
    seen=set(); results=[]
    for req in requests:
        ref=req.get("reference_id"); mode=req.get("mode"); digest=req.get("compile_digest")
        if ref in seen: return {"ok":False,"reason":"DUPLICATE_DIAGRAM_REFERENCE_REQUEST","reference_id":ref}
        seen.add(ref); spec=SUPPORTED.get(ref)
        if not spec: return {"ok":False,"reason":"DIAGRAM_REFERENCE_NOT_SUPPORTED","reference_id":ref}
        if mode!=spec["mode"]: return {"ok":False,"reason":"DIAGRAM_REFERENCE_MODE_MISMATCH","reference_id":ref,"expected_mode":spec["mode"],"actual_mode":mode}
        if not isinstance(digest,str) or len(digest)<16: return {"ok":False,"reason":"REFERENCE_COMPILE_DIGEST_REQUIRED","reference_id":ref}
        changed,count,findings=apply_oma(root) if ref=="OMA_RELATION_FIRST" else apply_big(root)
        results.append({"reference_id":ref,"mode":mode,"compile_digest":digest,"changed_elements":changed,"diagram_count":count,"findings":findings})
    after_geo=geometry_digest(root); geo_ok=before_geo==after_geo
    output_svg.parent.mkdir(parents=True,exist_ok=True); tree.write(output_svg,encoding="utf-8",xml_declaration=True)
    candidate_sha=sha256_file(output_svg); apps=[]
    for x in results:
        apps.append({"schema":"TAKY_DIAGRAM_REFERENCE_APPLICATION_V1","reference_id":x["reference_id"],"mode":x["mode"],
          "compile_digest":x["compile_digest"],"semantic_inference":False,"role_contract":"DECLARED_ONLY","presentation_only":True,
          "geometry_preserved":geo_ok,"applied":bool(geo_ok and not x["findings"] and x["changed_elements"]>0),
          "changed_elements":x["changed_elements"],"diagram_count":x["diagram_count"],"baseline_svg_sha256":baseline_sha,
          "candidate_svg_sha256":candidate_sha,"findings":x["findings"]})
    return {"ok":bool(geo_ok and all(not a["findings"] for a in apps)),"schema":"TAKY_DIAGRAM_REFERENCE_ADAPTER_RESULT_V1",
      "geometry_preserved":geo_ok,"baseline_geometry_digest":before_geo,"candidate_geometry_digest":after_geo,
      "baseline_svg_sha256":baseline_sha,"candidate_svg_sha256":candidate_sha,"applications":apps}

def main():
    p=argparse.ArgumentParser(); p.add_argument("input_svg"); p.add_argument("output_svg"); p.add_argument("--policy",required=True); a=p.parse_args()
    policy=json.loads(Path(a.policy).read_text(encoding="utf-8"))
    print(json.dumps(apply_svg_reference_policies(a.input_svg,a.output_svg,policy),ensure_ascii=False,sort_keys=True))
if __name__=="__main__": main()
