#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
import fitz

MODULE_PATH = Path(__file__).with_name("drawing_pdf_full_svg_exporter.py")
spec = importlib.util.spec_from_file_location("drawing_pdf_full_svg_exporter", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "fixture.pdf"
    doc = fitz.open()
    page = doc.new_page(width=200, height=100)
    page.draw_line((10, 10), (190, 10), color=(0, 0, 0), width=1)
    page.insert_text((20, 50), "ROOM A", fontsize=12)
    doc.save(p)

    svg = mod.export_page(p, text_as_path=True)
    assert svg.startswith("<svg ")
    assert "viewBox" in svg
    assert "<path" in svg
    assert "ROOM A" not in svg  # text converted to paths

print("drawing_pdf_full_svg_exporter: PASS")
