#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path

import fitz

MODULE_PATH = Path(__file__).with_name("drawing_pdf_vector_adapter.py")
spec = importlib.util.spec_from_file_location("drawing_pdf_vector_adapter", MODULE_PATH)
adapter = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(adapter)


def make_pdf(path: Path, *, color=(0, 0, 0), width=1.0, x2=100):
    doc = fitz.open()
    page = doc.new_page(width=200, height=200)
    shape = page.new_shape()
    shape.draw_line((20, 20), (x2, 20))
    shape.draw_rect(fitz.Rect(20, 40, 100, 100))
    shape.finish(color=color, width=width)
    shape.commit()
    doc.save(path)


with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    a = root / "a.pdf"
    b = root / "b.pdf"
    c = root / "c.pdf"
    blank = root / "blank.pdf"

    make_pdf(a, color=(0, 0, 0), width=1.0, x2=100)
    make_pdf(b, color=(1, 0, 0), width=3.0, x2=100)
    make_pdf(c, color=(0, 0, 0), width=1.0, x2=110)

    doc = fitz.open()
    doc.new_page(width=200, height=200)
    doc.save(blank)

    ra = adapter.extract_pdf(a)
    rb = adapter.extract_pdf(b)
    rc = adapter.extract_pdf(c)
    rz = adapter.extract_pdf(blank)

    assert ra["vector_present"] is True
    assert ra["source"]["source_authority"] == "DERIVED_VECTOR"
    assert ra["source"]["geometry_status"] == "DERIVED"
    assert ra["geometry_digest"] == rb["geometry_digest"]
    assert ra["presentation_digest"] != rb["presentation_digest"]
    assert ra["geometry_digest"] != rc["geometry_digest"]
    assert rz["vector_present"] is False
    assert "paths" not in ra["pages"][0]

print("drawing_pdf_vector_adapter: PASS")
