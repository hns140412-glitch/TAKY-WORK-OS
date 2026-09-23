import unittest

from drawing_svg_source_style_ranker import apply_source_style_rank
from drawing_svg_presentation_styler import geometry_fingerprint
import xml.etree.ElementTree as ET


class SourceStyleRankTests(unittest.TestCase):
    def test_rank_application_preserves_geometry_and_semantics(self):
        svg='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 10 0" stroke="#111" fill="none" stroke-width="0.10"/>
          <path d="M 0 10 L 10 10" stroke="#111" fill="none" stroke-width="0.20"/>
          <path d="M 0 20 L 10 20" stroke="#111" fill="none" stroke-width="0.30"/>
          <path d="M 0 30 L 10 30" stroke="#111" fill="none" stroke-width="0.40"/>
        </svg>'''
        before=geometry_fingerprint(ET.fromstring(svg))
        out=apply_source_style_rank(svg)
        self.assertTrue(out["ok"])
        self.assertTrue(out["applied"])
        self.assertTrue(out["geometry_preserved"])
        self.assertTrue(out["monotonic_order_preserved"])
        self.assertFalse(out["semantic_inference"])
        self.assertEqual(before,out["geometry_fingerprint_after"])
        self.assertEqual(out["styled_elements"],4)
        self.assertEqual(sum(out["rank_counts"].values()),4)
        self.assertNotIn("data-role=",out["svg"])
        self.assertNotIn("data-layer-role=",out["svg"])

    def test_single_width_does_not_manufacture_hierarchy(self):
        svg='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 10 0" stroke="#111" fill="none" stroke-width="0.20"/>
          <path d="M 0 10 L 10 10" stroke="#111" fill="none" stroke-width="0.20"/>
        </svg>'''
        out=apply_source_style_rank(svg)
        self.assertTrue(out["ok"])
        self.assertFalse(out["applied"])
        self.assertEqual(out["reason"],"NO_SOURCE_WIDTH_HIERARCHY")
        self.assertTrue(out["geometry_preserved"])

    def test_skewed_frequency_uses_distinct_width_order(self):
        lines=[]
        specs=[(0.01,4),(0.1167,1),(0.24,40),(0.54,6),(1.02,2)]
        y=0
        for width,count in specs:
            for _ in range(count):
                y+=1
                lines.append(f'<path d="M 0 {y} L 10 {y}" stroke="#111" fill="none" stroke-width="{width}"/>')
        svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'+''.join(lines)+'</svg>'
        out=apply_source_style_rank(svg)
        self.assertTrue(out["ok"])
        self.assertTrue(out["applied"])
        m=out["source_widths"]["width_rank_map"]
        self.assertEqual(m["0.01"],"LIGHT")
        self.assertEqual(m["0.1167"],"LIGHT")
        self.assertEqual(m["0.24"],"SECONDARY")
        self.assertEqual(m["0.54"],"PRIMARY")
        self.assertEqual(m["1.02"],"HEAVY")
        self.assertGreater(out["rank_counts"]["SECONDARY"],out["rank_counts"]["PRIMARY"])

    def test_invalid_multiplier_order_is_blocked(self):
        svg='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 10 0" stroke="#111" fill="none" stroke-width="0.10"/>
          <path d="M 0 10 L 10 10" stroke="#111" fill="none" stroke-width="0.40"/>
        </svg>'''
        with self.assertRaises(ValueError):
            apply_source_style_rank(svg,{
              "multipliers":{
                "LIGHT":1.2,
                "SECONDARY":1.0,
                "PRIMARY":1.1,
                "HEAVY":1.3,
              }
            })


if __name__=="__main__":
    unittest.main()
