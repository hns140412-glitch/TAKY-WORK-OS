#!/usr/bin/env python3
"""Independent source-to-artifact fidelity validator.

Validates the real byte lineage:
source vector PDF -> controlled SVG geometry -> canonical A3 inline source
-> exported candidate artifact.

No architectural semantics are inferred.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, Tuple

import pymupdf as fitz
from PIL import Image

from drawing_pdf_svg_exporter import export_page
from drawing_svg_presentation_styler import geometry_fingerprint

MIN_ARTIFACT_PARITY = 0.999


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: str | Path) -> str:
    return sha256_bytes(Path(path).read_bytes())


def _root(svg_text: str) -> ET.Element:
    return ET.fromstring(svg_text)


def _find_id(root: ET.Element, element_id: str) -> ET.Element | None:
    for elem in root.iter():
        if elem.attrib.get("id") == element_id:
            return elem
    return None


def _children_bytes(elem: ET.Element) -> bytes:
    return b"".join(ET.tostring(child, encoding="utf-8") for child in list(elem))


def _viewbox(elem: ET.Element) -> str:
    return " ".join(str(elem.attrib.get("viewBox", "")).split())


def _render_svg_pixels(svg_text: str, width_px: int | None = None, height_px: int | None = None) -> Tuple[int, int, bytes]:
    svg_doc = fitz.open(stream=svg_text.encode("utf-8"), filetype="svg")
    pdf_doc = fitz.open(stream=svg_doc.convert_to_pdf(), filetype="pdf")
    page = pdf_doc[0]
    if width_px and height_px:
        sx = width_px / page.rect.width
        sy = height_px / page.rect.height
        pix = page.get_pixmap(matrix=fitz.Matrix(sx, sy), alpha=False)
    else:
        pix = page.get_pixmap(dpi=96, alpha=False)
    return pix.width, pix.height, pix.samples


def _render_pdf_pixels(path: str | Path) -> Tuple[int, int, bytes]:
    doc = fitz.open(path)
    if doc.page_count < 1:
        raise ValueError("CANDIDATE_PDF_PAGE_REQUIRED")
    pix = doc[0].get_pixmap(dpi=96, alpha=False)
    return pix.width, pix.height, pix.samples


def _first_zip_image(path: str | Path, prefix: str) -> bytes:
    with zipfile.ZipFile(path, "r") as zf:
        names = sorted(n for n in zf.namelist() if n.startswith(prefix) and n.lower().endswith((".png", ".jpg", ".jpeg")))
        if not names:
            raise ValueError("EMBEDDED_IMAGE_REQUIRED")
        return zf.read(names[0])


def _image_pixels(data: bytes) -> Tuple[int, int, bytes]:
    image = Image.open(io.BytesIO(data)).convert("RGB")
    return image.width, image.height, image.tobytes()


def _parity(reference: Tuple[int, int, bytes], candidate: Tuple[int, int, bytes]) -> Dict[str, Any]:
    rw, rh, rb = reference
    cw, ch, cb = candidate
    if (rw, rh) != (cw, ch) or len(rb) != len(cb):
        return {
            "ok": False,
            "score": 0.0,
            "reason": "ARTIFACT_PIXEL_DIMENSION_MISMATCH",
            "reference_px": [rw, rh],
            "candidate_px": [cw, ch],
        }
    if not rb:
        return {"ok": False, "score": 0.0, "reason": "EMPTY_PIXEL_BUFFER"}
    mad = sum(abs(a - b) for a, b in zip(rb, cb)) / (255.0 * len(rb))
    score = 1.0 - mad
    return {
        "ok": score >= MIN_ARTIFACT_PARITY,
        "score": round(score, 9),
        "mean_abs_diff_norm": round(mad, 9),
        "threshold": MIN_ARTIFACT_PARITY,
        "reference_px": [rw, rh],
        "candidate_px": [cw, ch],
    }


def _artifact_parity(canonical_svg: str, candidate_path: str | Path) -> Dict[str, Any]:
    path = Path(candidate_path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        return {"type": "PDF", **_parity(_render_svg_pixels(canonical_svg), _render_pdf_pixels(path))}

    if ext == ".png":
        cand = _image_pixels(path.read_bytes())
        ref = _render_svg_pixels(canonical_svg, cand[0], cand[1])
        return {"type": "PNG", **_parity(ref, cand)}

    if ext == ".pptx":
        cand = _image_pixels(_first_zip_image(path, "ppt/media/"))
        ref = _render_svg_pixels(canonical_svg, cand[0], cand[1])
        return {"type": "PPTX", **_parity(ref, cand)}

    if ext == ".xlsx":
        cand = _image_pixels(_first_zip_image(path, "xl/media/"))
        ref = _render_svg_pixels(canonical_svg, cand[0], cand[1])
        return {"type": "XLSX", **_parity(ref, cand)}

    if ext == ".svg":
        same = sha256_file(path) == sha256_bytes(canonical_svg.encode("utf-8"))
        return {"type": "SVG", "ok": same, "score": 1.0 if same else 0.0, "threshold": 1.0}

    if ext in {".html", ".htm"}:
        html = path.read_text(encoding="utf-8")
        m = re.search(r"(<svg\\b[\\s\\S]*?</svg>)", html, flags=re.IGNORECASE)
        if not m:
            return {"type": "HTML", "ok": False, "score": 0.0, "reason": "CANONICAL_SVG_NOT_EMBEDDED"}
        embedded = m.group(1).strip()
        same = sha256_bytes(embedded.encode("utf-8")) == sha256_bytes(canonical_svg.strip().encode("utf-8"))
        return {"type": "HTML", "ok": same, "score": 1.0 if same else 0.0, "threshold": 1.0}

    return {"type": ext or "UNKNOWN", "ok": False, "score": 0.0, "reason": "UNSUPPORTED_CANDIDATE_TYPE"}


def validate(source_pdf: str | Path, page_index: int, controlled_svg_path: str | Path,
             canonical_svg_path: str | Path, candidate_path: str | Path) -> Dict[str, Any]:
    source_pdf = Path(source_pdf)
    controlled_svg_path = Path(controlled_svg_path)
    canonical_svg_path = Path(canonical_svg_path)
    candidate_path = Path(candidate_path)

    source_bytes = source_pdf.read_bytes()
    source_digest = sha256_bytes(source_bytes)

    baseline_svg = export_page(source_pdf, page_index)
    controlled_svg = controlled_svg_path.read_text(encoding="utf-8")
    canonical_svg = canonical_svg_path.read_text(encoding="utf-8")

    baseline_root = _root(baseline_svg)
    controlled_root = _root(controlled_svg)
    canonical_root = _root(canonical_svg)

    baseline_fp = geometry_fingerprint(baseline_root)
    controlled_fp = geometry_fingerprint(controlled_root)
    controlled_geometry_match = baseline_fp == controlled_fp

    slot = _find_id(canonical_root, "source-slot")
    inline = _find_id(canonical_root, "source-inline-vector")

    source_slot_present = slot is not None
    inline_present = inline is not None
    viewbox_match = bool(slot is not None and _viewbox(slot) == _viewbox(controlled_root))
    inline_transform_safe = bool(inline is not None and not str(inline.attrib.get("transform", "")).strip())

    controlled_body_digest = sha256_bytes(_children_bytes(controlled_root))
    canonical_inline_digest = sha256_bytes(_children_bytes(inline)) if inline is not None else None
    canonical_inline_match = inline_present and canonical_inline_digest == controlled_body_digest

    artifact = _artifact_parity(canonical_svg, candidate_path)

    ok = all([
        controlled_geometry_match,
        source_slot_present,
        inline_present,
        viewbox_match,
        inline_transform_safe,
        canonical_inline_match,
        artifact.get("ok") is True,
    ])

    return {
        "schema": "TAKY_SOURCE_FIDELITY_EVIDENCE_V1",
        "ok": ok,
        "semantic_inference": False,
        "source_sha256": source_digest,
        "source_page_index": page_index,
        "source_geometry_fingerprint": baseline_fp,
        "controlled_geometry_fingerprint": controlled_fp,
        "controlled_geometry_match": controlled_geometry_match,
        "controlled_svg_sha256": sha256_file(controlled_svg_path),
        "canonical_svg_sha256": sha256_file(canonical_svg_path),
        "candidate_sha256": sha256_file(candidate_path),
        "source_slot_present": source_slot_present,
        "source_viewbox_match": viewbox_match,
        "inline_source_present": inline_present,
        "inline_transform_safe": inline_transform_safe,
        "controlled_body_sha256": controlled_body_digest,
        "canonical_inline_body_sha256": canonical_inline_digest,
        "canonical_inline_match": canonical_inline_match,
        "artifact_parity": artifact,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("source_pdf")
    p.add_argument("controlled_svg")
    p.add_argument("canonical_svg")
    p.add_argument("candidate")
    p.add_argument("--page", type=int, default=0)
    args = p.parse_args()
    result = validate(args.source_pdf, args.page, args.controlled_svg, args.canonical_svg, args.candidate)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["ok"] else 2)


if __name__ == "__main__":
    main()
