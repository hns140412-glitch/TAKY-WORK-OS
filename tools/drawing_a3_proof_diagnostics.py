#!/usr/bin/env python3
"""TAKY Drawing Engine - A3 proof diagnostics.

Reports visual-density metrics for comparison. It does not claim that one
universal density threshold equals good architecture graphics.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from PIL import Image, ImageFilter, ImageStat


def analyze(path: str | Path):
    img=Image.open(path).convert("RGB")
    gray=img.convert("L")
    w,h=gray.size
    pixels=w*h
    hist=gray.histogram()
    white=sum(hist[245:256]) / pixels if pixels else 0.0
    dark=sum(hist[0:96]) / pixels if pixels else 0.0
    mid=sum(hist[96:245]) / pixels if pixels else 0.0

    edges=gray.filter(ImageFilter.FIND_EDGES)
    edge_hist=edges.histogram()
    edge_ratio=sum(edge_hist[48:256]) / pixels if pixels else 0.0

    stat=ImageStat.Stat(img)
    channels=stat.mean
    chroma=(max(channels)-min(channels))/255.0

    return {
        "size_px":[w,h],
        "white_space_ratio":round(white,6),
        "dark_ink_ratio":round(dark,6),
        "mid_tone_ratio":round(mid,6),
        "edge_density":round(edge_ratio,6),
        "mean_channel_chroma":round(chroma,6),
        "interpretation":"DIAGNOSTIC_ONLY_COMPARE_AGAINST_PROFILE_AND_FIXTURE"
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("image")
    args=p.parse_args()
    print(json.dumps(analyze(args.image),ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
