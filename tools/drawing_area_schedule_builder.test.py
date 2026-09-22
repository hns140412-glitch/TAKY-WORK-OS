#!/usr/bin/env python3
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location(
    "schedule",
    HERE/"drawing_area_schedule_builder.py",
)
m=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)

extraction={"candidates":[
 {"candidate_id":"site","area_m2":500.0},
 {"candidate_id":"build","area_m2":200.0},
 {"candidate_id":"floor1","area_m2":180.0},
 {"candidate_id":"floor2","area_m2":180.0},
 {"candidate_id":"exclusive","area_m2":84.5},
]}
assignments={"assignments":[
 {"candidate_id":"site","role":"SITE_AREA","verification_state":"SOURCE_EXPLICIT"},
 {"candidate_id":"build","role":"BUILDING_AREA","verification_state":"CAD_RULE_VERIFIED"},
 {"candidate_id":"floor1","role":"GROSS_FLOOR_AREA","verification_state":"CAD_RULE_VERIFIED"},
 {"candidate_id":"floor2","role":"GROSS_FLOOR_AREA","verification_state":"CAD_RULE_VERIFIED"},
 {"candidate_id":"exclusive","role":"RESIDENTIAL_EXCLUSIVE_INTERIOR_FACE","verification_state":"USER_CONFIRMED","boundary_evidence":"INTERIOR_FACE_BOUNDARY"},
]}
profile={
 "profile_id":"fixture",
 "status":"TEST",
 "role_requirements":{
   "RESIDENTIAL_EXCLUSIVE_INTERIOR_FACE":{"boundary_requirement":"INTERIOR_FACE_BOUNDARY"}
 },
 "aggregates":{
   "site_area_m2":{"include_roles":["SITE_AREA"]},
   "building_area_m2":{"include_roles":["BUILDING_AREA"]},
   "gross_floor_area_m2":{"include_roles":["GROSS_FLOOR_AREA"]},
   "residential_exclusive_m2":{"include_roles":["RESIDENTIAL_EXCLUSIVE_INTERIOR_FACE"]},
 },
 "ratios":{
   "building_coverage_percent":{"numerator":"building_area_m2","denominator":"site_area_m2","multiplier":100},
   "gross_floor_ratio_percent":{"numerator":"gross_floor_area_m2","denominator":"site_area_m2","multiplier":100},
 }
}
r=m.build_schedule(extraction,assignments,profile)
assert r["design_overview"]["building_coverage_percent"]==40.0
assert r["design_overview"]["gross_floor_ratio_percent"]==72.0
assert r["design_overview"]["residential_exclusive_m2"]==84.5

bad={"assignments":[
 {"candidate_id":"exclusive","role":"RESIDENTIAL_EXCLUSIVE_INTERIOR_FACE","verification_state":"USER_CONFIRMED","boundary_evidence":"CENTERLINE"}
]}
r2=m.build_schedule(extraction,bad,profile)
assert len(r2["accepted_assignments"])==0
assert r2["rejected_assignments"][0]["reason"]=="BOUNDARY_EVIDENCE_MISMATCH"

print("drawing_area_schedule_builder: PASS")
