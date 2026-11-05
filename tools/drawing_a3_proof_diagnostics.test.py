#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location("diag",HERE/"drawing_a3_proof_diagnostics.py")
m=importlib.util.module_from_spec(s)
assert s.loader is not None
s.loader.exec_module(m)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"p.png"
    img=Image.new("RGB",(100,100),"white")
    d=ImageDraw.Draw(img)
    d.rectangle((20,20,80,80),outline="black",width=3)
    img.save(p)
    r=m.analyze(p)
    assert r["white_space_ratio"] > 0.8
    assert r["dark_ink_ratio"] > 0
    assert r["interpretation"].startswith("DIAGNOSTIC_ONLY")

print("drawing_a3_proof_diagnostics: PASS")
