import tempfile
import unittest
from pathlib import Path

import fitz

from drawing_controlled_presentation_pipeline import run_pipeline


class ControlledPipelineTests(unittest.TestCase):
    def test_pipeline_source_style_rank_preserves_geometry(self):
        with tempfile.TemporaryDirectory() as td:
            pdf=Path(td)/"rank.pdf"
            doc=fitz.open()
            page=doc.new_page(width=100,height=100)
            for y,w in [(10,0.1),(20,0.2),(30,0.3),(40,0.4)]:
                shape=page.new_shape()
                shape.draw_line(fitz.Point(10,y),fitz.Point(90,y))
                shape.finish(color=(0,0,0),width=w)
                shape.commit()
            doc.save(pdf)
            out=run_pipeline(pdf,source_style_policy={
                "multipliers":{
                    "LIGHT":0.86,
                    "SECONDARY":0.96,
                    "PRIMARY":1.06,
                    "HEAVY":1.16,
                }
            })
            self.assertTrue(out["ok"])
            self.assertTrue(out["geometry_preserved"])
            self.assertIsNotNone(out["source_style_result"])
            self.assertTrue(out["source_style_result"]["applied"])
            self.assertFalse(out["source_style_result"]["semantic_inference"])
            self.assertTrue(out["source_style_result"]["monotonic_order_preserved"])

    def test_pipeline_without_edits_preserves_source(self):
        with tempfile.TemporaryDirectory() as td:
            pdf=Path(td)/"x.pdf"
            doc=fitz.open()
            page=doc.new_page(width=100,height=100)
            shape=page.new_shape()
            shape.draw_line(fitz.Point(10,10),fitz.Point(90,10))
            shape.finish(color=(0,0,0))
            shape.commit()
            doc.save(pdf)
            out=run_pipeline(pdf)
            self.assertTrue(out["ok"])
            self.assertTrue(out["geometry_preserved"])
            self.assertGreater(out["source_path_count"],0)


if __name__=="__main__":
    unittest.main()
