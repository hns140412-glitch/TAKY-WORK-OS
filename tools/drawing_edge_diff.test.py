#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

MODULE_PATH = Path(__file__).with_name("drawing_edge_diff.py")
spec = importlib.util.spec_from_file_location("drawing_edge_diff", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    a = root / "a.png"
    b = root / "b.png"
    c = root / "c.png"

    for path, x2 in [(a, 80), (b, 80), (c, 90)]:
        img = Image.new("RGB", (100, 100), "white")
        d = ImageDraw.Draw(img)
        d.line((10, 20, x2, 20), fill="black", width=2)
        d.rectangle((20, 30, 70, 80), outline="black", width=2)
        img.save(path)

    assert mod.compare(a, b)["ok"] is True
    r = mod.compare(a, c, max_mismatch_ratio=0.001)
    assert r["ok"] is False
    assert r["code"] == "EDGE_DRIFT"

print("drawing_edge_diff: PASS")
