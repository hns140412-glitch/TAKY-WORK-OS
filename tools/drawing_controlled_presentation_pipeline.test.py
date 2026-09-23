import tempfile
import unittest
from pathlib import Path

import fitz

from drawing_controlled_presentation_pipeline import run_pipeline


class ControlledPipelineTests(unittest.TestCase):
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
