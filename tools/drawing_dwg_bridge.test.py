#!/usr/bin/env python3
import importlib.util, tempfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("bridge",HERE/"drawing_dwg_bridge.py")
bridge=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

FAKE='''#!/usr/bin/env python3
import sys
from pathlib import Path
if "--version" in sys.argv:
    print("LibreDWG 0.13.4 test-fixture")
    raise SystemExit(0)
out=Path(sys.argv[sys.argv.index("-o")+1])
import ezdxf
doc=ezdxf.new("R2018")
doc.modelspace().add_line((0,0),(10,0))
doc.saveas(out)
'''
RISK='''#!/usr/bin/env python3
import sys
from pathlib import Path
if "--version" in sys.argv:
    print("LibreDWG 0.13.4 test-fixture")
    raise SystemExit(0)
out=Path(sys.argv[sys.argv.index("-o")+1])
import ezdxf
doc=ezdxf.new("R2018")
doc.modelspace().add_line((0,0),(10,0))
doc.saveas(out)
print("UNHANDLEDCLASS proxy object",file=sys.stderr)
'''
BAD='''#!/usr/bin/env python3
import sys
print("not-a-trusted-decoder")
'''

with tempfile.TemporaryDirectory() as raw:
    root=Path(raw)
    src=root/"source.dwg"
    src.write_bytes(b"AC1032"+b"fixture")
    for name,body in [("fake.py",FAKE),("risk.py",RISK),("bad.py",BAD)]:
        p=root/name
        p.write_text(body,encoding="utf-8")
        p.chmod(0o755)

    ok=bridge.convert_dwg_to_dxf(src,root/"out.dxf",binary=str(root/"fake.py"))
    assert ok["ok"],ok
    assert ok["decoder"]=="GNU_LIBREDWG_DWGREAD"
    assert ok["derived_modelspace_entities"]==1
    assert ok["authority"]=="DERIVED_VECTOR_PENDING_SOURCE_EQUIVALENCE"
    assert ok["production_claimable"] is False

    blocked=bridge.convert_dwg_to_dxf(src,root/"risk.dxf",binary=str(root/"risk.py"))
    assert not blocked["ok"] and blocked["reason"]=="DWG_DECODER_DIAGNOSTIC_BLOCK",blocked

    original_audit=bridge._audit_summary
    try:
        bridge._audit_summary=lambda doc:{
            "clean":False,
            "error_count":0,
            "fix_count":2,
            "code_counts":{"226":2},
            "errors_sample":[],
            "fixes_sample":[{"code":"226","message":"Deleted invalid HATCH boundary","entity_type":"HATCH","handle":"AA"}],
        }
        audit_block=bridge.convert_dwg_to_dxf(src,root/"audit-block.dxf",binary=str(root/"fake.py"))
        assert not audit_block["ok"] and audit_block["reason"]=="DWG_DERIVED_DXF_AUDIT_BLOCK",audit_block
        assert audit_block["audit"]["fix_count"]==2

        diagnostic=bridge.convert_dwg_to_dxf(
            src,root/"audit-diagnostic.dxf",binary=str(root/"fake.py"),strict=False
        )
        assert diagnostic["ok"],diagnostic
        assert diagnostic["strict_diagnostics_pass"] is False
        assert diagnostic["source_equivalence_candidate"] is False
        assert diagnostic["authority"]=="DIAGNOSTIC_DERIVED_VECTOR_WITH_AUDIT_REPAIRS"
        assert diagnostic["production_claimable"] is False
    finally:
        bridge._audit_summary=original_audit

    bad=bridge.convert_dwg_to_dxf(src,root/"bad.dxf",binary=str(root/"bad.py"))
    assert not bad["ok"] and bad["reason"]=="UNTRUSTED_DWG_DECODER_IDENTITY",bad

print("drawing_dwg_bridge: PASS")
