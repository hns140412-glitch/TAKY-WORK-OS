#!/usr/bin/env python3
import importlib.util
import math
import tempfile
from pathlib import Path

import fitz

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location(
    "polygonizer",
    HERE/"drawing_pdf_vector_polygonizer.py",
)
m=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"fragmented.pdf"
    doc=fitz.open()
    page=doc.new_page(width=200,height=120)

    # Rectangle 100 x 50 pt drawn as four independent strokes.
    page.draw_line((10,10),(110,10),color=(0,0,0),width=1)
    page.draw_line((110,10),(110,60),color=(0,0,0),width=1)
    page.draw_line((110,60),(10,60),color=(0,0,0),width=1)
    page.draw_line((10,60),(10,10),color=(0,0,0),width=1)
    doc.save(p)

    r=m.polygonize_pdf(
        p,
        scale_denominator=100,
        scale_confirmed=True,
        min_area_m2=0.01,
    )
    assert r["stats"]["segments"]>=4
    assert len(r["candidates"])==1
    expected=(100*m.PT_TO_MM*100/1000)*(50*m.PT_TO_MM*100/1000)
    assert math.isclose(r["candidates"][0]["area_m2"],expected,rel_tol=0,abs_tol=1e-6)
    assert r["candidates"][0]["semantic_role"]=="UNKNOWN"
    assert r["policy"]["legal_role_inference"] is False

print("drawing_pdf_vector_polygonizer: PASS")
