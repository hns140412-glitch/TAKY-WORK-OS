#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path

import ezdxf

MODULE_PATH = Path(__file__).with_name("drawing_dxf_adapter.py")
spec = importlib.util.spec_from_file_location("drawing_dxf_adapter", MODULE_PATH)
adapter = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(adapter)


def make_dxf(path: Path, *, end_x=100, color=7):
    doc = ezdxf.new("R2018")
    doc.layers.add("A-WALL", color=color)
    msp = doc.modelspace()
    msp.add_line((0, 0), (end_x, 0), dxfattribs={"layer": "A-WALL", "color": color})
    msp.add_lwpolyline([(0, 0), (0, 50), (50, 50)], close=False, dxfattribs={"layer": "A-WALL"})
    msp.add_text("ROOM", dxfattribs={"height": 2.5, "layer": "A-WALL"}).set_placement((10, 10))
    doc.saveas(path)


with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    a = root / "a.dxf"
    b = root / "b.dxf"
    c = root / "c.dxf"

    make_dxf(a, end_x=100, color=7)
    make_dxf(b, end_x=100, color=1)
    make_dxf(c, end_x=110, color=7)

    ra = adapter.extract_dxf(a)
    rb = adapter.extract_dxf(b)
    rc = adapter.extract_dxf(c)

    assert ra["source"]["geometry_status"] == "DIRECT_CAD_PARSE"
    assert ra["source"]["source_authority"] == "UNCLASSIFIED_CAD_SOURCE"
    assert ra["stats"]["geometry_entities"] == 2
    assert ra["stats"]["annotation_entities"] == 1
    assert ra["geometry_digest"] == rb["geometry_digest"]
    assert ra["geometry_digest"] != rc["geometry_digest"]
    assert ra["annotation_digest"] == rb["annotation_digest"]

print("drawing_dxf_adapter: PASS")
