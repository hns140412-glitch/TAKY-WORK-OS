#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
import fitz

MODULE_PATH = Path(__file__).with_name("drawing_pdf_svg_exporter.py")
spec = importlib.util.spec_from_file_location("drawing_pdf_svg_exporter", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "fixture.pdf"
    doc = fitz.open()
    page = doc.new_page(width=200, height=100)
    shape = page.new_shape()
    shape.draw_line((10, 10), (100, 10))
    shape.draw_rect(fitz.Rect(20, 20, 80, 60))
    shape.finish(color=(0, 0, 0), width=1)
    shape.commit()
    doc.save(p)

    svg = mod.export_page(p)
    assert '<g id="source-linework"' in svg
    assert 'data-authority="source-snapshot"' in svg
    assert '<path ' in svg
    assert 'viewBox="0 0 200 100"' in svg

print("drawing_pdf_svg_exporter: PASS")
