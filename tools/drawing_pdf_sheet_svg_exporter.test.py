import tempfile
import unittest
from pathlib import Path

import fitz

from drawing_pdf_sheet_svg_exporter import export_sheet


class PdfSheetSvgExporterTests(unittest.TestCase):
    def test_preserves_text_and_crop_only_changes_viewbox(self):
        with tempfile.TemporaryDirectory() as td:
            pdf=Path(td)/"x.pdf"
            doc=fitz.open()
            page=doc.new_page(width=200,height=100)
            page.insert_text((20,30),"DIM 3500")
            page.draw_line((10,50),(190,50),color=(0,0,0),width=1)
            doc.save(pdf)

            out=export_sheet(pdf,0,[10,10,190,90])
            self.assertIn("DIM 3500",out["svg"])
            self.assertIn('viewBox="10.0000 10.0000 180.0000 80.0000"',out["svg"])
            self.assertFalse(out["manifest"]["geometry_mutated"])
            self.assertTrue(out["manifest"]["text_preserved"])


if __name__=="__main__":
    unittest.main()
