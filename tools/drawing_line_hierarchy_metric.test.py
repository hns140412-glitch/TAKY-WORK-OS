import unittest

from drawing_line_hierarchy_metric import measure


class LineHierarchyMetricTests(unittest.TestCase):
    def test_detects_bounded_hierarchy_gain(self):
        baseline='''<svg xmlns="http://www.w3.org/2000/svg">
          <path id="a" d="M 0 0 L 1 0" stroke-width="0.10"/>
          <path id="b" d="M 0 1 L 1 1" stroke-width="0.20"/>
          <path id="c" d="M 0 2 L 1 2" stroke-width="0.40"/>
          <path id="d" d="M 0 3 L 1 3" stroke-width="0.80"/>
        </svg>'''
        candidate='''<svg xmlns="http://www.w3.org/2000/svg">
          <path id="a" d="M 0 0 L 1 0" stroke-width="0.086" data-presentation-rank="LIGHT"/>
          <path id="b" d="M 0 1 L 1 1" stroke-width="0.192" data-presentation-rank="SECONDARY"/>
          <path id="c" d="M 0 2 L 1 2" stroke-width="0.424" data-presentation-rank="PRIMARY"/>
          <path id="d" d="M 0 3 L 1 3" stroke-width="0.928" data-presentation-rank="HEAVY"/>
        </svg>'''
        out=measure(baseline,candidate)
        self.assertTrue(out["ok"])
        self.assertTrue(out["objective_effect_detected"])
        self.assertTrue(out["monotonic_order_preserved"])
        self.assertGreaterEqual(out["dynamic_range_gain"],1.10)
        self.assertFalse(out["semantic_inference"])
        self.assertFalse(out["professional_quality_claim"])

    def test_geometry_change_is_rejected(self):
        baseline='''<svg><path id="a" d="M 0 0 L 1 0" stroke-width="0.1"/></svg>'''
        candidate='''<svg><path id="a" d="M 0 0 L 2 0" stroke-width="0.08" data-presentation-rank="LIGHT"/></svg>'''
        out=measure(baseline,candidate)
        self.assertFalse(out["ok"])
        self.assertEqual(out["reason"],"PATH_GEOMETRY_MISMATCH")

    def test_small_change_does_not_claim_effect(self):
        baseline='''<svg>
          <path id="a" d="M 0 0 L 1 0" stroke-width="0.10"/>
          <path id="b" d="M 0 1 L 1 1" stroke-width="0.20"/>
        </svg>'''
        candidate='''<svg>
          <path id="a" d="M 0 0 L 1 0" stroke-width="0.099" data-presentation-rank="LIGHT"/>
          <path id="b" d="M 0 1 L 1 1" stroke-width="0.202" data-presentation-rank="HEAVY"/>
        </svg>'''
        out=measure(baseline,candidate)
        self.assertTrue(out["ok"])
        self.assertFalse(out["objective_effect_detected"])


if __name__=="__main__":
    unittest.main()
