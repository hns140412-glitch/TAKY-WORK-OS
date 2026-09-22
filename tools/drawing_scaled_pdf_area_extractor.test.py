#!/usr/bin/env python3
import importlib.util
import math
import tempfile
from pathlib import Path
import fitz

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location(
    "pdf_area",
    HERE/"drawing_scaled_pdf_area_extractor.py",
)
mod=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"scaled.pdf"
    doc=fitz.open()
    page=doc.new_page(width=300,height=200)
    # 100 x 50 PDF points rectangle.
    page.draw_rect(fitz.Rect(10,10,110,60),color=(0,0,0),width=1)
    doc.save(p)

    r=mod.extract_scaled_pdf_areas(
        p,
        scale_denominator=100,
        scale_confirmed=True,
    )
    assert r["policy"]["auto_join_independent_segments"] is False
    assert len(r["candidates"])>=1
    rect=next(x for x in r["candidates"] if x["boundary_type"]=="RECT")
    expected=(100*mod.PT_TO_MM*100/1000)*(50*mod.PT_TO_MM*100/1000)
    assert math.isclose(rect["area_m2"],expected,rel_tol=0,abs_tol=1e-6)
    assert rect["scale_verification"]=="CONFIRMED"

print("drawing_scaled_pdf_area_extractor: PASS")
