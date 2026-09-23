#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
import ezdxf

MODULE_PATH = Path(__file__).with_name("drawing_dxf_svg_exporter.py")
spec = importlib.util.spec_from_file_location("drawing_dxf_svg_exporter", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "fixture.dxf"
    doc = ezdxf.new("R2018")
    msp = doc.modelspace()
    msp.add_line((0, 0), (100, 0))
    msp.add_line((100, 0), (100, 100))
    msp.add_circle((50, 50), 10)
    doc.saveas(p)

    out = mod.export_dxf(p, monochrome=True)
    assert "<svg" in out
    assert "<path" in out
    assert "#000000" in out

print("drawing_dxf_svg_exporter: PASS")
