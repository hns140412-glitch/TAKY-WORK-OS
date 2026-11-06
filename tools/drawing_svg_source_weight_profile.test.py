#!/usr/bin/env python3
import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    "source_weight_profile",
    HERE / "drawing_svg_source_weight_profile.py",
)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
<path d="M0 0L10 0" stroke="#000" stroke-width="1"/>
<path d="M0 10L10 10" stroke="#000" stroke-width="2"/>
<path d="M0 20L10 20" stroke="#000" stroke-width="3"/>
<path d="M0 30L10 30" stroke="#000" stroke-width="4"/>
<path d="M0 40L10 40" stroke="#000" stroke-width="6"/>
<path d="M0 50L10 50" stroke="#000" stroke-width="8"/>
</svg>"""

r = mod.apply_profile(SVG, "PUBLICATION")
assert r["geometry_preserved"] is True
assert r["semantic_inference"] is False
assert r["source_width_roles"]["1.0"] == "SOURCE_LIGHT"
assert r["source_width_roles"]["2.0"] == "SOURCE_BASE"
assert r["source_width_roles"]["3.0"] == "SOURCE_SECONDARY"
assert r["source_width_roles"]["4.0"] == "SOURCE_PRIMARY"
assert r["source_width_roles"]["6.0"] == "SOURCE_HEAVY"
assert r["source_width_roles"]["8.0"] == "SOURCE_HEAVY"
assert 'data-source-weight-role="SOURCE_HEAVY"' in r["svg"]

t = mod.apply_profile(SVG, "TECHNICAL_CLEAN")
assert t["geometry_fingerprint"] == r["geometry_fingerprint"]

s = mod.apply_profile(SVG, "SECTION_PRESENTATION_SAFE")
assert s["geometry_preserved"] is True

try:
    mod.apply_profile(SVG, "NOPE")
    raise AssertionError("unknown profile should fail")
except ValueError as exc:
    assert str(exc) == "UNKNOWN_SOURCE_WEIGHT_PROFILE"

print("drawing_svg_source_weight_profile: PASS")
