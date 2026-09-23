#!/usr/bin/env python3
import importlib.util
from pathlib import Path
from PIL import Image

MODULE_PATH = Path(__file__).with_name("drawing_multiply_compositor.py")
spec = importlib.util.spec_from_file_location("drawing_multiply_compositor", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

under = Image.new("RGB", (3, 1), (240, 230, 220))
source = Image.new("RGB", (3, 1), "white")
source.putpixel((1, 0), (0, 0, 0))
source.putpixel((2, 0), (128, 128, 128))

out = mod.multiply_snapshot(under, source)
assert out.getpixel((0, 0)) == (240, 230, 220)
assert out.getpixel((1, 0)) == (0, 0, 0)
assert 115 <= out.getpixel((2, 0))[0] <= 121

try:
    mod.multiply_snapshot(Image.new("RGB", (2, 2)), Image.new("RGB", (3, 3)))
    raise AssertionError("size mismatch should fail")
except ValueError as exc:
    assert str(exc) == "UNDERLAY_SOURCE_SIZE_MISMATCH"

print("drawing_multiply_compositor: PASS")
