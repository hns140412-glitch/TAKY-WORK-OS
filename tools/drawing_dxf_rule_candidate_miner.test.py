#!/usr/bin/env python3
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("miner", HERE/"drawing_dxf_rule_candidate_miner.py")
m=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)

profile={
 "schema":"TAKY_DXF_LAYER_PROFILE_V1",
 "geometry_digest":"g",
 "layers":[
  {"layer":"A-WALL","closed_polyline_count":0,"insert_count":0,"annotation_count":0,"hatch_count":0,"block_names":{},"evidence_digest":"e1"},
  {"layer":"A-AREA","closed_polyline_count":2,"insert_count":0,"annotation_count":0,"hatch_count":0,"block_names":{},"evidence_digest":"e2"},
  {"layer":"I-FURN","closed_polyline_count":0,"insert_count":2,"annotation_count":0,"hatch_count":0,"block_names":{"CHAIR":2},"evidence_digest":"e3"},
  {"layer":"MISC","closed_polyline_count":0,"insert_count":0,"annotation_count":0,"hatch_count":0,"block_names":{},"evidence_digest":"e4"}
 ]
}
r=m.mine(profile)
assert r["auto_enable"] is False
assert all(c["enabled"] is False for c in r["candidates"])
sem={c["suggested_semantic_type"] for c in r["candidates"]}
assert "WALL" in sem
assert "ROOM_BOUNDARY" in sem
assert "FURNITURE" in sem
assert not any(c["pattern"]=="MISC" for c in r["candidates"])
print("drawing_dxf_rule_candidate_miner: PASS")
