#!/usr/bin/env python3
from pathlib import Path
import tempfile

import fitz
from PIL import Image

from drawing_review_image_exporter import render

with tempfile.TemporaryDirectory() as d:
    root=Path(d)
    pdf=root/"a.pdf"
    doc=fitz.open()
    page=doc.new_page(width=842,height=595)
    page.draw_rect(fitz.Rect(100,100,700,450),color=(0,0,0),width=2)
    doc.save(pdf)

    out=root/"pdf.png"
    render(pdf,out,max_edge=1200)
    assert out.exists()
    im=Image.open(out)
    assert max(im.size)<=1205

    src=root/"src.png"
    Image.new("RGB",(2400,1200),"white").save(src)
    out2=root/"img.png"
    render(src,out2,max_edge=1600)
    assert max(Image.open(out2).size)<=1600

print("drawing_review_image_exporter: PASS")
