#!/usr/bin/env python3
import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("drawing_semantic_mapper.py")
spec = importlib.util.spec_from_file_location("drawing_semantic_mapper", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

payload = {
    "entities": [
        {"handle": "1", "type": "LINE", "layer": "A-WALL", "geometry": {"type": "LineString", "coordinates": [[0,0],[1,0]]}},
        {"handle": "2", "type": "LWPOLYLINE", "layer": "A-ROOM", "geometry": {"type": "LineString", "coordinates": [[0,0],[1,0]], "closed": True}},
        {"handle": "3", "type": "LINE", "layer": "MISC", "geometry": {"type": "LineString", "coordinates": [[0,0],[0,1]]}}
    ]
}
rules = {
    "rule_set_id": "fixture",
    "rule_set_version": "1",
    "rules": [
        {"rule_id": "wall", "field": "layer", "match": "exact", "pattern": "A-WALL", "semantic_type": "WALL", "confidence": "PROJECT_STANDARD_VERIFIED", "verification_state":"CAD_RULE_VERIFIED"},
        {"rule_id": "room", "field": "layer", "match": "exact", "pattern": "A-ROOM", "semantic_type": "ROOM_BOUNDARY", "confidence": "PROJECT_STANDARD_VERIFIED", "verification_state":"CAD_RULE_VERIFIED"}
    ]
}
r = mod.map_entities(payload, rules)
assert r["stats"]["candidate"] == 2
assert r["stats"]["verified_candidate"] == 2
assert r["stats"]["unmapped"] == 1
assert r["records"][0]["semantic_type"] == "WALL"
assert r["records"][0]["verification_state"] == "CAD_RULE_VERIFIED"
assert r["records"][2]["semantic_type"] == "UNKNOWN"
assert r["canonical_promotion"] is False

unverified = {
    "rule_set_id":"u","rule_set_version":"1",
    "rules":[
        {"rule_id":"u1","field":"layer","match":"exact","pattern":"A-WALL","semantic_type":"COLUMN","enabled":True}
    ]
}
ru = mod.map_entities({"entities":[payload["entities"][0]]}, unverified)
assert ru["records"][0]["semantic_type"] == "UNKNOWN"
assert ru["stats"]["ignored_unverified_rule_count"] == 1

conflict = {
    "rule_set_id":"c","rule_set_version":"1",
    "rules":[
        {"rule_id":"a","field":"layer","match":"prefix","pattern":"A-","semantic_type":"WALL","verification_state":"CAD_RULE_VERIFIED"},
        {"rule_id":"b","field":"layer","match":"exact","pattern":"A-WALL","semantic_type":"COLUMN","verification_state":"CAD_RULE_VERIFIED"}
    ]
}
r2 = mod.map_entities({"entities":[payload["entities"][0]]}, conflict)
assert r2["records"][0]["semantic_state"] == "REVIEW_REQUIRED"
assert r2["records"][0]["semantic_type"] == "UNKNOWN"

print("drawing_semantic_mapper: PASS")
