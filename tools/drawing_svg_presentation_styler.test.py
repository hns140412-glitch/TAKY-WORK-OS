#!/usr/bin/env python3
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location("styler",HERE/"drawing_svg_presentation_styler.py")
m=importlib.util.module_from_spec(s)
assert s.loader is not None
s.loader.exec_module(m)

svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">
<g data-role="CUT"><path d="M10 10 L100 10" stroke="#000" stroke-width="0.1"/></g>
<g data-role="CONTEXT" transform="translate(0 0)"><path d="M10 20 L100 20" stroke="#000" stroke-width="0.1"/></g>
</svg>'''

r=m.apply_styles(svg)
assert r["geometry_preserved"] is True
assert r["geometry_fingerprint_before"] == r["geometry_fingerprint_after"]
assert r["styled_elements"] == 2
assert 'stroke-width="0.70mm"' in r["svg"] or 'stroke-width="0.7mm"' in r["svg"]
assert 'opacity="0.55"' in r["svg"]

try:
    m.apply_styles(svg, {"CUT":{"transform":"scale(2)"}})
    raise AssertionError("forbidden geometry-affecting style key should fail")
except ValueError as exc:
    assert "FORBIDDEN_STYLE_ATTRIBUTE" in str(exc)

print("drawing_svg_presentation_styler: PASS")
