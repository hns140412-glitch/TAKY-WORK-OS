#!/usr/bin/env python3
import importlib.util
import tempfile
from pathlib import Path
import ezdxf

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("pipe",HERE/"drawing_dxf_mask_pipeline.py")
m=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"fixture.dxf"
    doc=ezdxf.new("R2018")
    for layer in ["A-AREA","I-FURN","A-ANNO","MISC"]:
        if layer not in doc.layers:
            doc.layers.add(layer)
    ms=doc.modelspace()
    ms.add_lwpolyline([(0,0),(10,0),(10,8),(0,8)],close=True,dxfattribs={"layer":"A-AREA"})
    block=doc.blocks.new("CHAIR")
    block.add_circle((0,0),0.5)
    ms.add_blockref("CHAIR",(4,4),dxfattribs={"layer":"I-FURN"})
    ms.add_text("ROOM A",dxfattribs={"layer":"A-ANNO","height":1}).set_placement((2,2))
    ms.add_line((0,0),(1,1),dxfattribs={"layer":"MISC"})
    doc.saveas(p)

    rules={
      "rule_set_id":"fixture",
      "rule_set_version":"1",
      "rule_set_digest":"fixture-digest",
      "status":"VERIFIED_ACTIVE_RULES",
      "rules":[
        {"rule_id":"room","enabled":True,"field":"layer","match":"exact","pattern":"A-AREA","semantic_type":"ROOM_BOUNDARY","verification_state":"CAD_RULE_VERIFIED","confidence":"PROJECT_STANDARD_VERIFIED"},
        {"rule_id":"furn","enabled":True,"field":"layer","match":"exact","pattern":"I-FURN","semantic_type":"FURNITURE","verification_state":"CAD_RULE_VERIFIED","confidence":"PROJECT_STANDARD_VERIFIED"},
        {"rule_id":"anno","enabled":True,"field":"layer","match":"exact","pattern":"A-ANNO","semantic_type":"ANNOTATION","verification_state":"CAD_RULE_VERIFIED","confidence":"PROJECT_STANDARD_VERIFIED"}
      ]
    }
    r=m.run_pipeline(p,rules)
    mids={x["mask_id"] for x in r["mask_manifest"]["mask_summaries"]}
    assert {"ROOM_MATERIAL","FURNITURE","ANNOTATION"}.issubset(mids)
    assert r["semantic"]["stats"]["verified_candidate"]==3
    assert r["semantic"]["stats"]["unmapped"]>=1
    assert r["sales_inputs"]["source_line_route"]=="DXF_SVG"
    assert r["canonical_promotion"] is False

    bad=dict(rules)
    bad["status"]="PROPOSAL_ONLY"
    try:
        m.run_pipeline(p,bad)
        raise AssertionError("unverified rule set should fail")
    except ValueError as exc:
        assert str(exc)=="VERIFIED_RULE_SET_REQUIRED"

print("drawing_dxf_mask_pipeline: PASS")
