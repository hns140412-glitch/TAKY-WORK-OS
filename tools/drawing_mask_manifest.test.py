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
        {"handle":"1","layer":"A-AREA","semantic_type":"ROOM_BOUNDARY","semantic_state":"CANDIDATE","rule_id":"r1","geometry":{"type":"LineString","coordinates":[[0,0],[1,0],[1,1],[0,1]],"closed":True}},
        {"handle":"2","layer":"MISC","semantic_type":"UNKNOWN","semantic_state":"UNMAPPED","rule_id":None,"geometry":{"type":"LineString","coordinates":[[0,0],[1,0]]}},
        {"handle":"3","layer":"A-WALL","semantic_type":"WALL","semantic_state":"CANDIDATE","rule_id":"r2","geometry":{"type":"LineString","coordinates":[[0,0],[1,0]]}}
    ]
}
r=mod.build_manifest(payload)
assert "ROOM_MATERIAL" in r["masks"]
assert len(r["masks"]["ROOM_MATERIAL"]) == 1
assert len(r["rejected"]) == 2
assert r["canonical_promotion"] is False
print("drawing_mask_manifest: PASS")
