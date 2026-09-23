#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("bundle",HERE/"drawing_a3_bundle_exporter.py")
bundle=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(bundle)

SVG='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">
<rect width="420" height="297" fill="white"/>
<path d="M10 10 L410 10 L410 287 L10 287 Z" fill="none" stroke="black" stroke-width="0.5"/>
<text x="20" y="30" font-size="8">TAKY A3 FIXTURE</text>
</svg>'''

with tempfile.TemporaryDirectory() as tmp:
    root=Path(tmp)
    svg=root/"board.svg"
    svg.write_text(SVG,encoding="utf-8")
    result=bundle.export_verified(svg,root/"out",orientation="landscape",dpi=300,max_attempts=2)
    assert result["status"]=="PASS", result
    assert result["attempts"]==1
    for key in ["html","pdf","png","pptx","xlsx"]:
        assert Path(result["outputs"][key]).exists()
        assert result["validation"]["results"][key]["ok"] is True

    bad=root/"bad.svg"
    bad.write_text(SVG.replace('width="420mm"','width="400mm"'),encoding="utf-8")
    try:
        bundle.export_once(bad,root/"badout")
        raise AssertionError("bad A3 svg should fail")
    except ValueError as exc:
        assert str(exc)=="SVG_A3_WIDTH_REQUIRED"

print("drawing_a3_bundle_exporter: PASS")
