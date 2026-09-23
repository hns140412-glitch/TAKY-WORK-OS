#!/usr/bin/env python3
from pathlib import Path
import tempfile

import fitz
from PIL import Image, ImageDraw

from drawing_visual_metric_extractor import extract, compare


with tempfile.TemporaryDirectory() as d:
    root=Path(d)

    p1=root/"base.pdf"
    doc=fitz.open()
    page=doc.new_page(width=420/25.4*72,height=297/25.4*72)
    shape=page.new_shape()
    shape.draw_rect(fitz.Rect(80,80,700,400))
    shape.finish(color=(0,0,0),width=1)
    shape.commit()
    doc.save(p1)

    p2=root/"candidate.pdf"
    doc=fitz.open()
    page=doc.new_page(width=420/25.4*72,height=297/25.4*72)
    shape=page.new_shape()
    shape.draw_rect(fitz.Rect(70,70,720,410))
    shape.draw_line((70,240),(720,240))
    shape.finish(color=(0,0,0),width=2)
    shape.commit()
    doc.save(p2)

    a=extract(p1)
    b=extract(p2)
    assert a["schema"]=="TAKY_OBJECTIVE_VISUAL_METRICS_V1"
    assert a["metrics"]["a3_landscape"] is True
    assert b["metrics"]["edge_density"] >= 0
    cmp=compare(a,b)
    assert cmp["schema"]=="TAKY_OBJECTIVE_REFERENCE_DELTA_V1"
    assert "combined_effect_score" in cmp
    assert cmp["professional_family_claim"] is False

    png=root/"image.png"
    im=Image.new("L",(400,300),255)
    dr=ImageDraw.Draw(im)
    dr.rectangle((40,40,360,260),outline=0,width=4)
    im.save(png)
    m=extract(png)
    assert m["metrics"]["ink_ratio"]>0

print("drawing_visual_metric_extractor: PASS")
