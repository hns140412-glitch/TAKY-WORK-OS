import json
import tempfile
import unittest
from pathlib import Path

import fitz

from drawing_pdf_path_selector import select_candidates


class PdfPathSelectorTests(unittest.TestCase):
    def test_selects_only_fully_contained_path(self):
        with tempfile.TemporaryDirectory() as td:
            pdf=Path(td)/"x.pdf"
            doc=fitz.open()
            page=doc.new_page(width=200,height=200)
            shape=page.new_shape()
            shape.draw_rect(fitz.Rect(20,20,40,40))
            shape.finish(color=(0,0,0),fill=None)
            shape.commit()
            shape=page.new_shape()
            shape.draw_rect(fitz.Rect(80,80,130,130))
            shape.finish(color=(0,0,0),fill=None)
            shape.commit()
            doc.save(pdf)
            manifest={
                "regions":[
                    {
                        "region_id":"R1",
                        "role":"FURNITURE",
                        "policy":"REMOVE_CANDIDATE",
                        "verification_state":"USER_CONFIRMED",
                        "rect":[10,10,50,50],
                    }
                ]
            }
            out=select_candidates(pdf,manifest)
            self.assertEqual(out["stats"]["candidate_count"],1)
            self.assertTrue(out["candidates"][0]["eligible_for_edit"])


if __name__=="__main__":
    unittest.main()
