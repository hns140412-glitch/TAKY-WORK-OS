#!/usr/bin/env python3
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("prom", HERE/"drawing_dxf_rule_promoter.py")
m=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)

cands={"schema":"TAKY_DXF_RULE_CANDIDATES_V1","candidates":[
 {"candidate_id":"c1","field":"layer","match":"exact","pattern":"A-AREA","suggested_semantic_type":"ROOM_BOUNDARY","promotion_state":"PROPOSAL_ONLY"},
 {"candidate_id":"c2","field":"layer","match":"exact","pattern":"I-FURN","suggested_semantic_type":"FURNITURE","promotion_state":"PROPOSAL_ONLY"}
]}
approvals={"rule_set_id":"P1","approvals":[
 {"candidate_id":"c1","decision":"APPROVE","evidence_state":"PROJECT_STANDARD_VERIFIED","evidence_ref":"project CAD standard"},
 {"candidate_id":"c2","decision":"APPROVE","evidence_state":"NAME_ONLY"}
]}
r=m.promote(cands,approvals)
assert len(r["rules"])==1
assert r["rules"][0]["verification_state"]=="CAD_RULE_VERIFIED"
assert r["rules"][0]["semantic_type"]=="ROOM_BOUNDARY"
assert len(r["invalid_approvals"])==1
print("drawing_dxf_rule_promoter: PASS")
