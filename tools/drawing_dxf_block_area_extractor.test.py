#!/usr/bin/env python3
import importlib.util
import math
import tempfile
from pathlib import Path

import ezdxf

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location(
    "block_area",
    HERE/"drawing_dxf_block_area_extractor.py",
)
mod=importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as td:
    p=Path(td)/"block_area.dxf"
    doc=ezdxf.new("R2018")
    doc.header["$INSUNITS"]=4  # mm
    unit=doc.blocks.new("UNIT")
    unit.add_lwpolyline(
        [(0,0),(6000,0),(6000,10000),(0,10000)],
        close=True,
        dxfattribs={"layer":"A-AREA"},
    )

    group=doc.blocks.new("GROUP")
    group.add_blockref("UNIT",(0,0))
    group.add_blockref("UNIT",(8000,0),dxfattribs={"rotation":90})

    msp=doc.modelspace()
    msp.add_blockref("GROUP",(1000,2000))
    msp.add_blockref("UNIT",(30000,0),dxfattribs={"xscale":-1,"yscale":1})
    msp.add_blockref("UNIT",(50000,0),dxfattribs={"xscale":2,"yscale":2})
    doc.saveas(p)

    r=mod.extract_area_candidates(p)
    areas=sorted(round(x["area_m2"],6) for x in r["candidates"])
    assert len(areas)==4, areas
    assert areas.count(60.0)==3, areas
    assert math.isclose(areas[-1],240.0,rel_tol=0,abs_tol=1e-6)
    assert r["policy"]["source_mutation"] is False
    assert r["policy"]["nested_block_support"] is True
    assert r["source"]["unit_status"]=="KNOWN"
    assert any(len(x["block_lineage"])>=2 for x in r["candidates"])

print("drawing_dxf_block_area_extractor: PASS")
