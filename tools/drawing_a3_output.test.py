#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent

def load(name,file):
    s=importlib.util.spec_from_file_location(name,HERE/file)
    m=importlib.util.module_from_spec(s)
    assert s.loader is not None
    s.loader.exec_module(m)
    return m

b=load("builder","drawing_a3_output_builder.py")
v=load("validator","drawing_a3_output_validator.py")
g=load("gate","drawing_a3_output_gate.py")

with tempfile.TemporaryDirectory() as tmp:
    root=Path(tmp)
    html=root/"board.html"
    pdf=root/"board.pdf"
    png=root/"board.png"
    pptx=root/"board.pptx"
    xlsx=root/"board.xlsx"

    html.write_text(b.html_shell("<h1>Fixture</h1>"),encoding="utf-8")
    b.new_pdf(pdf)
    b.new_png(png)
    b.new_pptx(pptx)
    b.new_xlsx(xlsx)

    for p in [html,pdf,png,pptx,xlsx]:
        r=v.validate(p)
        assert r["ok"], (p,r)

    bundle=g.gate([html,pdf,png,pptx,xlsx])
    assert bundle["ok"] is True
    assert bundle["status"] == "PASS"

    from PIL import Image
    bad=root/"bad.png"
    Image.new("RGB",(1000,1000),"white").save(bad,dpi=(300,300))
    r=v.validate(bad)
    assert r["ok"] is False
    assert g.gate([bad])["status"] == "REEXPORT_REQUIRED"

print("drawing_a3_output: PASS")
