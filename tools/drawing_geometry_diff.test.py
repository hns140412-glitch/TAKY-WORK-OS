#!/usr/bin/env python3
import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("drawing_geometry_diff.py")
spec = importlib.util.spec_from_file_location("drawing_geometry_diff", MODULE_PATH)
diff = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(diff)

before = {
    "objects": [
        {"object_id": "W1", "object_type": "WALL", "geometry": {"type": "LineString", "coordinates": [[0, 0], [10, 0]]}},
        {"object_id": "P1", "object_type": "COLUMN", "geometry": {"type": "Point", "coordinates": [5, 5]}},
    ]
}

within = {
    "objects": [
        {"object_id": "W1", "object_type": "WALL", "geometry": {"type": "LineString", "coordinates": [[0, 0], [10.0004, 0]]}},
        {"object_id": "P1", "object_type": "COLUMN", "geometry": {"type": "Point", "coordinates": [5, 5]}},
        {"object_id": "H1", "object_type": "HUMAN", "geometry": None, "presentation_only": True},
    ]
}

drift = {
    "objects": [
        {"object_id": "W1", "object_type": "WALL", "geometry": {"type": "LineString", "coordinates": [[0, 0], [10.01, 0]]}},
        {"object_id": "P1", "object_type": "COLUMN", "geometry": {"type": "Point", "coordinates": [5, 5]}},
    ]
}

assert diff.compare(before, within, tolerance=0.001)["ok"] is True
r = diff.compare(before, drift, tolerance=0.001)
assert r["ok"] is False
assert any(x["code"] == "GEOMETRY_DRIFT" for x in r["findings"])

missing = {"objects": [before["objects"][0]]}
assert any(x["code"] == "MISSING_OBJECT" for x in diff.compare(before, missing)["findings"])

print("drawing_geometry_diff: PASS")
