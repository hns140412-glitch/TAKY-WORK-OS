#!/usr/bin/env python3
"""TAKY Drawing Engine - Vector PDF adapter.

Extracts PDF vector paths into a deterministic, presentation-separated record.
This adapter does NOT infer architectural semantics and does NOT promote a PDF
to authoritative CAD geometry without external authority evidence.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Iterable, List

try:
    import fitz  # PyMuPDF
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyMuPDF is required: pip install pymupdf") from exc


SCHEMA = "TAKY_DRAWING_VECTOR_PDF_V1"


def _q(value: float, digits: int = 4) -> float:
    return round(float(value), digits)


def _point(point: Any) -> List[float]:
    return [_q(point.x), _q(point.y)]


def _rect(rect: Any) -> List[float]:
    return [_q(rect.x0), _q(rect.y0), _q(rect.x1), _q(rect.y1)]


def _sha256_json(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _item(item: Any) -> Dict[str, Any]:
    kind = item[0]
    if kind == "l":
        return {"type": "line", "p1": _point(item[1]), "p2": _point(item[2])}
    if kind == "re":
        return {
            "type": "rect",
            "rect": _rect(item[1]),
            "orientation": item[2] if len(item) > 2 else None,
        }
    if kind == "qu":
        quad = item[1]
        return {
            "type": "quad",
            "ul": _point(quad.ul),
            "ur": _point(quad.ur),
            "ll": _point(quad.ll),
            "lr": _point(quad.lr),
        }
    if kind == "c":
        return {
            "type": "curve",
            "p1": _point(item[1]),
            "c1": _point(item[2]),
            "c2": _point(item[3]),
            "p2": _point(item[4]),
        }
    return {"type": str(kind), "unsupported": True}


def _geometry_record(path_record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "path_index": path_record["path_index"],
        "rect": path_record["rect"],
        "close_path": path_record["close_path"],
        "items": path_record["items"],
    }


def extract_pdf(path: str | Path, include_paths: bool = False) -> Dict[str, Any]:
    file_path = Path(path)
    raw = file_path.read_bytes()
    source_sha256 = hashlib.sha256(raw).hexdigest()
    document = fitz.open(stream=raw, filetype="pdf")

    result: Dict[str, Any] = {
        "schema": SCHEMA,
        "source": {
            "sha256": source_sha256,
            "bytes": len(raw),
            "page_count": document.page_count,
            # Vector extraction from PDF is derived evidence by default.
            "source_authority": "DERIVED_VECTOR",
            "geometry_status": "DERIVED",
            "adapter": "PYMUPDF_GET_DRAWINGS",
        },
        "pages": [],
    }

    for page_index, page in enumerate(document):
        drawings = page.get_drawings()
        type_counts: Counter[str] = Counter()
        path_records: List[Dict[str, Any]] = []

        for path_index, drawing in enumerate(drawings):
            items = [_item(item) for item in drawing.get("items", [])]
            type_counts.update(item["type"] for item in items)

            record = {
                "path_index": path_index,
                "rect": _rect(drawing["rect"]) if drawing.get("rect") else None,
                "close_path": bool(drawing.get("closePath", False)),
                "fill": list(drawing["fill"]) if drawing.get("fill") is not None else None,
                "stroke": list(drawing["color"]) if drawing.get("color") is not None else None,
                "width": _q(drawing.get("width") or 0.0),
                "dashes": drawing.get("dashes"),
                "items": items,
            }
            record["path_digest"] = _sha256_json(record)
            path_records.append(record)

        geometry_records = [_geometry_record(record) for record in path_records]
        page_record: Dict[str, Any] = {
            "page_index": page_index,
            "page_rect": _rect(page.rect),
            "rotation": int(page.rotation),
            "geometry_digest": _sha256_json(geometry_records),
            "presentation_digest": _sha256_json(path_records),
            "stats": {
                "drawing_paths": len(path_records),
                "items": sum(len(record["items"]) for record in path_records),
                "item_types": dict(type_counts),
                "fill_paths": sum(record["fill"] is not None for record in path_records),
                "stroke_paths": sum(record["stroke"] is not None for record in path_records),
                "text_blocks": len(page.get_text("blocks")),
                "images": len(page.get_images(full=True)),
            },
        }
        if include_paths:
            page_record["paths"] = path_records
        result["pages"].append(page_record)

    result["vector_present"] = any(
        page["stats"]["drawing_paths"] > 0 for page in result["pages"]
    )
    result["geometry_digest"] = _sha256_json(
        [page["geometry_digest"] for page in result["pages"]]
    )
    result["presentation_digest"] = _sha256_json(
        [page["presentation_digest"] for page in result["pages"]]
    )
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument(
        "--full",
        action="store_true",
        help="Include full path records. Default emits only deterministic summary.",
    )
    args = parser.parse_args()
    print(
        json.dumps(
            extract_pdf(args.pdf, include_paths=args.full),
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
