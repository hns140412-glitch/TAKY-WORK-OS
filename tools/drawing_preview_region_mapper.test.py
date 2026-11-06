import unittest

from drawing_preview_region_mapper import preview_point_to_pdf, preview_rect_to_pdf, map_manifest


class PreviewRegionMapperTests(unittest.TestCase):
    def test_90_ccw_point_mapping(self):
        # 842x1191 page rendered at 2.6x -> 2189.2x3096.6 then rotated CCW.
        p=preview_point_to_pdf(
            1747,631,
            page_width=842,
            page_height=1191,
            render_scale=2.6,
            rotation_ccw=90,
        )
        self.assertAlmostEqual(p[0],842-(631/2.6),places=5)
        self.assertAlmostEqual(p[1],1747/2.6,places=5)

    def test_90_ccw_rect_mapping_matches_known_hannam_region(self):
        r=preview_rect_to_pdf(
            [1747,631,1873,763],
            page_width=842,
            page_height=1191,
            render_scale=2.6,
            rotation_ccw=90,
        )
        expected=[842-(763/2.6),1747/2.6,842-(631/2.6),1873/2.6]
        for actual,want in zip(r,expected):
            self.assertAlmostEqual(actual,want,places=3)

    def test_manifest_maps_without_changing_review_metadata(self):
        src={
            "source_page":{"width":842,"height":1191},
            "preview":{"render_scale":2.6,"rotation_ccw":90},
            "regions":[
                {
                    "region_id":"R1",
                    "role":"FURNITURE_BACKGROUND",
                    "policy":"REMOVE_CANDIDATE",
                    "verification_state":"USER_CONFIRMED",
                    "preview_rect":[1747,631,1873,763],
                }
            ]
        }
        out=map_manifest(src)
        self.assertEqual(out["regions"][0]["region_id"],"R1")
        self.assertEqual(out["regions"][0]["verification_state"],"USER_CONFIRMED")
        self.assertIn("rect",out["regions"][0])


if __name__=="__main__":
    unittest.main()
