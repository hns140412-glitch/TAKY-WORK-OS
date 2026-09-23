#!/usr/bin/env python3
"""Render PDF/image artifacts to a bounded PNG for independent vision review."""

from __future__ import annotations

import argparse
from pathlib import Path

import fitz
from PIL import Image


def render(source: str|Path,out: str|Path,page: int=0,max_edge: int=2000) -> None:
    src=Path(source)
    dst=Path(out)
    suffix=src.suffix.lower()

    if suffix==".pdf":
        doc=fitz.open(src)
        pg=doc[page]
        zoom=max_edge/max(pg.rect.width,pg.rect.height)
        zoom=max(1.0,min(zoom,4.0))
        pix=pg.get_pixmap(matrix=fitz.Matrix(zoom,zoom),alpha=False)
        pix.save(dst)
        return

    if suffix in {".png",".jpg",".jpeg",".webp"}:
        im=Image.open(src).convert("RGB")
        if max(im.size)>max_edge:
            scale=max_edge/max(im.size)
            im=im.resize((max(1,int(im.width*scale)),max(1,int(im.height*scale))))
        im.save(dst,format="PNG")
        return

    raise ValueError("UNSUPPORTED_REVIEW_ARTIFACT_FORMAT")


def main() -> None:
    p=argparse.ArgumentParser()
    p.add_argument("source")
    p.add_argument("--out",required=True)
    p.add_argument("--page",type=int,default=0)
    p.add_argument("--max-edge",type=int,default=2000)
    args=p.parse_args()
    render(args.source,args.out,args.page,args.max_edge)


if __name__=="__main__":
    main()
