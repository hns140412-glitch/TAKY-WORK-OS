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

    def test_path_filter_selects_light_fill_only(self):
        with tempfile.TemporaryDirectory() as td:
            pdf=Path(td)/"x.pdf"
            doc=fitz.open()
            page=doc.new_page(width=200,height=200)

            light=page.new_shape()
            light.draw_rect(fitz.Rect(20,20,40,40))
            light.finish(color=None,fill=(0.98,0.98,0.98))
            light.commit()

            dark=page.new_shape()
            dark.draw_rect(fitz.Rect(50,20,70,40))
            dark.finish(color=None,fill=(0.2,0.2,0.2))
            dark.commit()

            stroke=page.new_shape()
            stroke.draw_rect(fitz.Rect(80,20,100,40))
            stroke.finish(color=(0,0,0),fill=None)
            stroke.commit()

            doc.save(pdf)
            manifest={
                "regions":[
                    {
                        "region_id":"WHITE_BG",
                        "role":"FURNITURE_BACKGROUND",
                        "policy":"REMOVE_CANDIDATE",
                        "verification_state":"USER_CONFIRMED",
                        "rect":[10,10,110,50],
                        "path_filter":{
                            "require_fill":True,
                            "fill_luma_min":0.95,
                            "fill_chroma_max":0.03
                        }
                    }
                ]
            }
            out=select_candidates(pdf,manifest)
            self.assertEqual(out["schema"],"TAKY_PDF_PATH_CANDIDATES_V2")
            self.assertEqual(out["stats"]["candidate_count"],1)
            self.assertGreaterEqual(out["stats"]["rejected_by_filter"],2)
            ev=out["candidates"][0]["presentation_evidence"]
            self.assertGreaterEqual(ev["fill_luma"],0.95)


if __name__=="__main__":
    unittest.main()
