import tempfile
from pathlib import Path
import importlib.util
ROOT=Path(__file__).resolve().parent
def load(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/file); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod
adapter=load("adapter","drawing_diagram_reference_adapter.py")
metric=load("metric","drawing_diagram_reference_effect_metric.py")
SVG="""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g id="r1" data-taky-diagram-id="D1" data-taky-diagram-role="RELATION" data-taky-role-source="DECLARED" data-taky-primary="true" opacity="1"><path d="M0 0 L10 10"/></g>
<g id="r2" data-taky-diagram-id="D1" data-taky-diagram-role="RELATION" data-taky-role-source="DECLARED" opacity="1"><path d="M0 10 L10 0"/></g>
<g id="dec" data-taky-diagram-id="D1" data-taky-diagram-role="DECORATION" data-taky-role-source="DECLARED" opacity="1"><circle cx="5" cy="5" r="2"/></g>
<g id="base" data-taky-diagram-id="D2" data-taky-diagram-role="BASE_CONDITION" data-taky-role-source="DECLARED" opacity="1"><rect x="20" y="20" width="10" height="10"/></g>
<g id="move" data-taky-diagram-id="D2" data-taky-diagram-role="MOVE" data-taky-role-source="DECLARED" opacity="1"><path d="M30 30 L40 40"/></g>
<g id="result" data-taky-diagram-id="D2" data-taky-diagram-role="RESULT" data-taky-role-source="DECLARED" opacity="1"><rect x="40" y="40" width="10" height="10"/></g>
</svg>"""
with tempfile.TemporaryDirectory() as raw:
    td=Path(raw); src=td/"base.svg"; out=td/"candidate.svg"; src.write_text(SVG,encoding="utf-8")
    policy={"requests":[
      {"reference_id":"OMA_RELATION_FIRST","mode":"DECLARED_PRIMARY_RELATION_FOCUS","compile_digest":"a"*64},
      {"reference_id":"BIG_ONE_MOVE","mode":"DECLARED_BASE_MOVE_RESULT_EMPHASIS","compile_digest":"a"*64}]}
    result=adapter.apply_svg_reference_policies(src,out,policy)
    assert result["ok"] and result["geometry_preserved"],result
    assert all(x["applied"] for x in result["applications"]),result
    oma=metric.measure_reference_effect(src,out,"OMA_RELATION_FIRST"); assert oma["ok"] and oma["objective_effect_detected"],oma
    big=metric.measure_reference_effect(src,out,"BIG_ONE_MOVE"); assert big["ok"] and big["objective_effect_detected"],big
    out2=td/"candidate2.svg"; again=adapter.apply_svg_reference_policies(out,out2,policy)
    assert again["ok"] and all(not x["applied"] for x in again["applications"]),again
    assert not metric.measure_reference_effect(out,out2,"OMA_RELATION_FIRST")["objective_effect_detected"]
    tampered=td/"tampered.svg"; tampered.write_text(out.read_text(encoding="utf-8").replace("M0 0 L10 10","M0 0 L20 20"),encoding="utf-8")
    bad=metric.measure_reference_effect(src,tampered,"OMA_RELATION_FIRST"); assert not bad["geometry_preserved"] and not bad["objective_effect_detected"]
print("drawing_diagram_reference: PASS")
