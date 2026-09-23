#!/usr/bin/env python3
from pathlib import Path
import tempfile

import ezdxf
import fitz

from drawing_geometry_primitive_adapter import extract_dxf_primitives, extract_pdf_primitives


def test_dxf(tmp: Path):
    path=tmp/"sample.dxf"
    doc=ezdxf.new("R2010")
    msp=doc.modelspace()
    msp.add_line((0,0),(10,0),dxfattribs={"layer":"WALL"})
    msp.add_lwpolyline([(0,0),(10,0),(10,5),(0,5)],close=True,dxfattribs={"layer":"BOUNDARY"})
    msp.add_circle((5,2.5),1,dxfattribs={"layer":"COLUMN"})
    doc.saveas(path)

    a=extract_dxf_primitives(path)
    b=extract_dxf_primitives(path)
    assert a["schema"]=="TAKY_GEOMETRY_PRIMITIVES_V1"
    assert a["authority"]=="AUTHORITATIVE_VECTOR"
    assert a["semantic_inference"] is False
    assert a["primitive_count"]==3
    assert a["primitives"]==b["primitives"]
    assert all(x["semantic_state"]=="UNKNOWN" for x in a["primitives"])


def test_pdf(tmp: Path):
    path=tmp/"sample.pdf"
    doc=fitz.open()
    page=doc.new_page(width=300,height=200)
    shape=page.new_shape()
    shape.draw_line((10,10),(100,10))
    shape.draw_rect(fitz.Rect(20,20,80,60))
    shape.finish(color=(0,0,0))
    shape.commit()
    doc.save(path)

    a=extract_pdf_primitives(path)
    b=extract_pdf_primitives(path)
    assert a["schema"]=="TAKY_GEOMETRY_PRIMITIVES_V1"
    assert a["authority"]=="DERIVED_VECTOR"
    assert a["semantic_inference"] is False
    assert a["primitive_count"]>=2
    assert a["primitives"]==b["primitives"]


with tempfile.TemporaryDirectory() as d:
    tmp=Path(d)
    test_dxf(tmp)
    test_pdf(tmp)

print("drawing_geometry_primitive_adapter: PASS")
