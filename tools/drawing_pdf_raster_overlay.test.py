#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path

import fitz

MODULE_PATH = Path(__file__).with_name("drawing_pdf_raster_overlay.py")
spec = importlib.util.spec_from_file_location("drawing_pdf_raster_overlay", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    pdf = root / "fixture.pdf"
    doc = fitz.open()
    page = doc.new_page(width=100, height=100)
    page.draw_line((10, 50), (90, 50), color=(0, 0, 0), width=2)
    doc.save(pdf)

    overlay = mod.build_overlay(pdf, dpi=72)
    assert overlay.mode == "RGBA"
    assert overlay.getpixel((0, 0))[3] == 0
    assert overlay.getpixel((50, 50))[3] > 0

print("drawing_pdf_raster_overlay: PASS")
