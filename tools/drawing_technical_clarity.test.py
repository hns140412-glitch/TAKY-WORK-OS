import tempfile
from pathlib import Path
import importlib.util
ROOT=Path(__file__).resolve().parent

def load(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/file); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod
adapter=load("technical_adapter","drawing_technical_clarity_adapter.py")
metric=load("technical_metric","drawing_technical_clarity_effect_metric.py")
PROOF="b"*64
SVG=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g id="s" data-taky-presentation-role="STRUCTURE" data-taky-role-source="VERIFIED" data-taky-role-proof-sha256="{PROOF}" stroke-width="1"><path d="M0 0 L20 0"/></g>
<g id="p" data-taky-presentation-role="PROGRAM" data-taky-role-source="VERIFIED" data-taky-role-proof-sha256="{PROOF}" stroke-width="1"><rect x="10" y="10" width="20" height="10"/></g>
<g id="e" data-taky-presentation-role="ENVELOPE" data-taky-role-source="VERIFIED" data-taky-role-proof-sha256="{PROOF}" stroke-width="1"><path d="M0 30 L30 30"/></g>
</svg>'''
POLICY={"reference_id":"SOM_FOSTER_TECHNICAL_CLARITY","mode":"VERIFIED_PRESENTATION_ROLE_CLARITY","compile_digest":"a"*64,"verified_role_proof_sha256":PROOF}
with tempfile.TemporaryDirectory() as raw:
    td=Path(raw); src=td/"base.svg"; out=td/"candidate.svg"; src.write_text(SVG,encoding="utf-8")
    result=adapter.apply_technical_clarity(src,out,POLICY)
    assert result["ok"] and result["geometry_preserved"],result
    assert result["applied"] and result["production_claimable"] is False,result
    m=metric.measure(src,out,PROOF)
    assert m["ok"] and m["geometry_preserved"] and m["objective_effect_detected"],m
    out2=td/"candidate2.svg"; again=adapter.apply_technical_clarity(out,out2,POLICY)
    assert again["ok"] and not again["applied"],again
    m2=metric.measure(out,out2,PROOF); assert not m2["objective_effect_detected"],m2
    bad_svg=td/"bad.svg"; bad_svg.write_text(SVG.replace('data-taky-role-source="VERIFIED"','data-taky-role-source="DECLARED"',1),encoding="utf-8")
    bad=adapter.apply_technical_clarity(bad_svg,td/"bad-out.svg",POLICY); assert not bad["ok"] and bad["reason"]=="VERIFIED_PRESENTATION_ROLE_AUTHORITY_REQUIRED",bad
    wrong=dict(POLICY); wrong["verified_role_proof_sha256"]="c"*64
    mismatch=adapter.apply_technical_clarity(src,td/"mismatch.svg",wrong); assert not mismatch["ok"] and mismatch["reason"]=="VERIFIED_PRESENTATION_ROLE_AUTHORITY_REQUIRED",mismatch
    tampered=td/"tampered.svg"; tampered.write_text(out.read_text(encoding="utf-8").replace("M0 0 L20 0","M0 0 L40 0"),encoding="utf-8")
    mt=metric.measure(src,tampered,PROOF); assert not mt["geometry_preserved"] and not mt["objective_effect_detected"],mt
print("drawing_technical_clarity: PASS")
