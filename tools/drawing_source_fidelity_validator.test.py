#!/usr/bin/env python3
import tempfile
from pathlib import Path

import pymupdf as fitz

from drawing_pdf_svg_exporter import export_page
from drawing_source_fidelity_validator import validate


def source_body(svg: str) -> str:
    start=svg.index(">")+1
    end=svg.rfind("</svg>")
    return svg[start:end]


def canonical_svg(controlled: str, slot_viewbox: str="0 0 400 240") -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 4200 2970">'
        '<rect x="0" y="0" width="4200" height="2970" fill="#f5f1e9"/>'
        '<svg id="source-slot" data-source-geometry="locked" x="120" y="240" width="2800" height="2200" '
        f'viewBox="{slot_viewbox}" preserveAspectRatio="xMidYMid meet" overflow="hidden">'
        '<g id="source-inline-vector" data-authority="source">'
        + source_body(controlled)
        + '</g></svg>'
        '<text x="3100" y="300" font-size="80">TEST</text>'
        '</svg>'
    )


def pdf_from_svg(svg: str, out_path: Path):
    source=fitz.open(stream=svg.encode("utf-8"),filetype="svg")
    source_pdf=fitz.open(stream=source.convert_to_pdf(),filetype="pdf")
    out=fitz.open()
    page=out.new_page(width=420/25.4*72,height=297/25.4*72)
    page.show_pdf_page(page.rect,source_pdf,0,keep_proportion=False)
    out.save(out_path)
    out.close()


with tempfile.TemporaryDirectory() as td:
    td=Path(td)
    source=td/"source.pdf"
    doc=fitz.open()
    page=doc.new_page(width=400,height=240)
    shape=page.new_shape()
    shape.draw_rect(fitz.Rect(30,30,370,210))
    shape.draw_line((80,30),(80,210))
    shape.draw_line((200,30),(200,210))
    shape.finish(color=(0,0,0),width=1.2)
    shape.commit()
    doc.save(source)
    doc.close()

    controlled_text=export_page(source,0)
    controlled=td/"controlled.svg"
    controlled.write_text(controlled_text,encoding="utf-8")

    canonical_text=canonical_svg(controlled_text)
    canonical=td/"canonical.svg"
    canonical.write_text(canonical_text,encoding="utf-8")

    candidate=td/"candidate.pdf"
    pdf_from_svg(canonical_text,candidate)

    good=validate(source,0,controlled,canonical,candidate)
    assert good["ok"] is True, good
    assert good["controlled_geometry_match"] is True
    assert good["source_viewbox_match"] is True
    assert good["canonical_inline_match"] is True
    assert good["artifact_parity"]["score"] >= 0.999

    # Geometry mutation in the controlled SVG cannot be hidden by a matching canonical.
    mutated_controlled_text=controlled_text.replace("M 30 30", "M 31 30", 1)
    mutated_controlled=td/"controlled-mutated.svg"
    mutated_controlled.write_text(mutated_controlled_text,encoding="utf-8")
    mutated_canonical_text=canonical_svg(mutated_controlled_text)
    mutated_canonical=td/"canonical-mutated.svg"
    mutated_canonical.write_text(mutated_canonical_text,encoding="utf-8")
    mutated_candidate=td/"candidate-mutated-lineage.pdf"
    pdf_from_svg(mutated_canonical_text,mutated_candidate)
    bad_geometry=validate(source,0,mutated_controlled,mutated_canonical,mutated_candidate)
    assert bad_geometry["ok"] is False
    assert bad_geometry["controlled_geometry_match"] is False

    # Cropping the source slot is a fidelity failure even if the inline body is untouched.
    cropped_text=canonical_svg(controlled_text,slot_viewbox="0 0 390 240")
    cropped=td/"canonical-cropped.svg"
    cropped.write_text(cropped_text,encoding="utf-8")
    cropped_candidate=td/"candidate-cropped.pdf"
    pdf_from_svg(cropped_text,cropped_candidate)
    bad_crop=validate(source,0,controlled,cropped,cropped_candidate)
    assert bad_crop["ok"] is False
    assert bad_crop["source_viewbox_match"] is False

    # Candidate bytes must remain visually identical to the canonical export.
    tampered=td/"candidate-tampered.pdf"
    tamper_doc=fitz.open(candidate)
    p=tamper_doc[0]
    p.draw_rect(fitz.Rect(50,50,250,180),color=(1,0,0),fill=(1,1,1),width=5)
    tamper_doc.save(tampered)
    tamper_doc.close()
    bad_artifact=validate(source,0,controlled,canonical,tampered)
    assert bad_artifact["ok"] is False
    assert bad_artifact["artifact_parity"]["ok"] is False

print("drawing_source_fidelity_validator: PASS")
