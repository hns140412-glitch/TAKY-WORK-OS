#!/usr/bin/env python3
"""TAKY Drawing Engine - controlled vector-PDF presentation pipeline.

End-to-end source path:
PDF -> deterministic vector manifest -> source-line SVG -> verified exact-path
presentation edits -> optional presentation styling -> preservation manifest.

No generative redraw. No semantic guessing. Unverified edits fail closed.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from drawing_pdf_vector_adapter import extract_pdf
from drawing_pdf_svg_exporter import export_page
from drawing_svg_selective_editor import apply_edit_plan
from drawing_svg_presentation_styler import apply_styles


def run_pipeline(
    pdf_path: str | Path,
    *,
    page_index: int = 0,
    edit_plan: dict | None = None,
    role_styles: dict | None = None,
) -> dict:
    vector = extract_pdf(pdf_path, include_paths=True)
    source_svg = export_page(pdf_path, page_index)
    current_svg = source_svg

    edit_result = None
    if edit_plan:
        edit_result = apply_edit_plan(current_svg, edit_plan)
        if not edit_result["ok"]:
            return {
                "ok": False,
                "stage": "SELECTIVE_EDIT",
                "findings": edit_result["findings"],
            }
        current_svg = edit_result["svg"]

    style_result = None
    if role_styles:
        style_result = apply_styles(current_svg, role_styles)
        current_svg = style_result["svg"]

    page = vector["pages"][page_index]
    return {
        "ok": True,
        "schema": "TAKY_CONTROLLED_PRESENTATION_PIPELINE_V1",
        "source": vector["source"],
        "page_index": page_index,
        "source_geometry_digest": page["geometry_digest"],
        "source_presentation_digest": page["presentation_digest"],
        "source_path_count": page["stats"]["drawing_paths"],
        "edit_result": None if not edit_result else {
            k:v for k,v in edit_result.items() if k != "svg"
        },
        "style_result": None if not style_result else {
            k:v for k,v in style_result.items() if k != "svg"
        },
        "geometry_preserved": (
            (edit_result is None or edit_result["geometry_preserved"])
            and (style_result is None or style_result["geometry_preserved"])
        ),
        "final_svg": current_svg,
        "rules": [
            "NO_GENERATIVE_REDRAW",
            "NO_UNVERIFIED_SEMANTIC_EDIT",
            "EXACT_PATH_ID_ONLY",
            "GEOMETRY_FINGERPRINT_MUST_MATCH",
        ],
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("pdf")
    p.add_argument("--page", type=int, default=0)
    p.add_argument("--edit-plan")
    p.add_argument("--styles")
    p.add_argument("--out-svg", required=True)
    p.add_argument("--manifest", required=True)
    args = p.parse_args()

    edit_plan = json.loads(Path(args.edit_plan).read_text(encoding="utf-8")) if args.edit_plan else None
    styles = json.loads(Path(args.styles).read_text(encoding="utf-8")) if args.styles else None
    result = run_pipeline(args.pdf, page_index=args.page, edit_plan=edit_plan, role_styles=styles)
    if not result["ok"]:
        raise SystemExit(json.dumps(result, ensure_ascii=False, indent=2))

    Path(args.out_svg).write_text(result.pop("final_svg"), encoding="utf-8")
    Path(args.manifest).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
