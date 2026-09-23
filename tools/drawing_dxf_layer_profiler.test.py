#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
import ezdxf

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("prof", HERE/"drawing_dxf_layer_profiler.py")
mod=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"fixture.dxf"
    doc=ezdxf.new("R2018")
    doc.layers.add("A-AREA")
    doc.layers.add("I-FURN")
    doc.layers.add("A-ANNO")
    m=doc.modelspace()
    m.add_lwpolyline([(0,0),(10,0),(10,10),(0,10)], close=True, dxfattribs={"layer":"A-AREA"})
    block=doc.blocks.new("CHAIR")
    block.add_circle((0,0), 1)
    m.add_blockref("CHAIR",(3,3),dxfattribs={"layer":"I-FURN"})
    m.add_text("ROOM A", dxfattribs={"layer":"A-ANNO","height":2}).set_placement((2,2))
    doc.saveas(p)

    r=mod.profile_dxf(p)
    assert r["semantic_inference"] is False
    assert r["layer_count"] >= 3
    by={x["layer"]:x for x in r["layers"]}
    assert by["A-AREA"]["closed_polyline_count"] == 1
    assert by["I-FURN"]["insert_count"] == 1
    assert by["I-FURN"]["block_names"]["CHAIR"] == 1
    assert by["A-ANNO"]["annotation_count"] == 1

print("drawing_dxf_layer_profiler: PASS")
