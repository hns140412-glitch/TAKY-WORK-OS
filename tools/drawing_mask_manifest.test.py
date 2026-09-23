#!/usr/bin/env python3
import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("drawing_mask_manifest.py")
spec = importlib.util.spec_from_file_location("drawing_mask_manifest", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

payload = {
    "records": [
        {"handle":"1","layer":"A-AREA","semantic_type":"ROOM_BOUNDARY","semantic_state":"CANDIDATE","verification_state":"CAD_RULE_VERIFIED","rule_id":"r1","geometry":{"type":"LineString","coordinates":[[0,0],[1,0],[1,1],[0,1]],"closed":True}},
        {"handle":"2","layer":"MISC","semantic_type":"UNKNOWN","semantic_state":"UNMAPPED","verification_state":"UNRESOLVED","rule_id":None,"geometry":{"type":"LineString","coordinates":[[0,0],[1,0]]}},
        {"handle":"3","layer":"A-WALL","semantic_type":"WALL","semantic_state":"CANDIDATE","verification_state":"CAD_RULE_VERIFIED","rule_id":"r2","geometry":{"type":"LineString","coordinates":[[0,0],[1,0]]}},
        {"handle":"4","layer":"A-ANNO","semantic_type":"ANNOTATION","semantic_state":"CANDIDATE","verification_state":"CAD_RULE_VERIFIED","rule_id":"r4","annotation":{"text":"ROOM A","insert":[0,0]}},
        {"handle":"5","layer":"A-AREA2","semantic_type":"ROOM_BOUNDARY","semantic_state":"CANDIDATE","verification_state":"CAD_RULE_VERIFIED","rule_id":"r5","geometry":{"type":"LineString","coordinates":[[0,0],[1,0]],"closed":False}},
        {"handle":"6","layer":"I-FURN","semantic_type":"FURNITURE","semantic_state":"CANDIDATE","verification_state":"UNVERIFIED","rule_id":"r6","geometry":{"type":"Insert","name":"CHAIR","insert":[0,0]}}
    ]
}
r=mod.build_manifest(payload)
assert "ROOM_MATERIAL" in r["masks"]
assert len(r["masks"]["ROOM_MATERIAL"]) == 1
assert "ANNOTATION" in r["masks"]
assert len(r["masks"]["ANNOTATION"]) == 1
assert any(x["reason"]=="ROOM_BOUNDARY_NOT_CLOSED" for x in r["rejected"])
assert any(x["reason"]=="SEMANTIC_RULE_NOT_VERIFIED" for x in r["rejected"])
room=next(x for x in r["mask_summaries"] if x["mask_id"]=="ROOM_MATERIAL")
assert room["validation_state"]=="CAD_RULE_VERIFIED"
assert room["source_trace"]["layers"]==["A-AREA"]
assert r["canonical_promotion"] is False
print("drawing_mask_manifest: PASS")
