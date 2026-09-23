import unittest

from drawing_svg_selective_editor import apply_edit_plan


SVG='''<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
<path id="src-0" d="M 0 0 L 10 0" stroke="#000" fill="none"/>
<path id="src-1" d="M 20 0 L 30 0" stroke="#000" fill="none"/>
</svg>'''


class SelectiveEditorTests(unittest.TestCase):
    def test_verified_suppression_preserves_geometry(self):
        result=apply_edit_plan(SVG,{
            "operations":[{
                "path_id":"src-1",
                "action":"SUPPRESS",
                "verification_state":"USER_CONFIRMED"
            }]
        })
        self.assertTrue(result["ok"])
        self.assertTrue(result["geometry_preserved"])
        self.assertIn('display="none"',result["svg"])

    def test_unverified_edit_fails_closed(self):
        result=apply_edit_plan(SVG,{
            "operations":[{
                "path_id":"src-1",
                "action":"SUPPRESS",
                "verification_state":"UNVERIFIED"
            }]
        })
        self.assertFalse(result["ok"])
        self.assertEqual(result["findings"][0]["code"],"UNVERIFIED_EDIT_FORBIDDEN")


if __name__=="__main__":
    unittest.main()
