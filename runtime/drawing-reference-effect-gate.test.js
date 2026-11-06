const assert=require('assert');
const compiler=require('./drawing-reference-compiler');
const gate=require('./drawing-reference-effect-gate');
const compiled=compiler.compile([{
  reference_name:'ArchDaily',
  mined_dna:'PLAN_LINE_HIERARCHY',
  design_tokens:{wall_weight:.4},
  engine_parameters:{wall_lineweight:.4},
  output_effect:'cut walls dominate projection',
  validation_probe:'PLAN_HIERARCHY_VISIBLE'
}]);
const good=gate.evaluate({
  compiled,
  application_receipts:[{parameter:'wall_lineweight',applied_value:.4,engine_owner:'VECTOR_STYLE_LAYER',artifact_ref:'ART-1'}],
  probe_evidence:{PLAN_HIERARCHY_VISIBLE:{status:'PASS',validator:'visual-metric',evidence_refs:['EV-1'],observed_effect:'cut wall hierarchy is immediately visible'}},
  professional_family:{status:'PASS',validator:'reference-family-crosscheck',evidence_refs:['EV-FAMILY-1']},
  generic_layout_detected:false,
  explanation_required_to_notice_gain:false
});
assert.equal(good.ok,true);
assert.equal(good.proof_type,'REFERENCE_EFFECT_RECEIPT');
assert.equal(gate.evaluate({...good,compiled,application_receipts:[]}).ok,false);
assert.equal(gate.evaluate({
  compiled,
  application_receipts:[{parameter:'wall_lineweight',applied_value:.4,engine_owner:'VECTOR_STYLE_LAYER',artifact_ref:'ART-1'}],
  probe_evidence:{PLAN_HIERARCHY_VISIBLE:{status:'PASS',validator:'visual-metric',evidence_refs:['EV-1'],observed_effect:'visible'}},
  professional_family:{status:'PASS',validator:'reference-family-crosscheck',evidence_refs:['EV-FAMILY-1']},
  generic_layout_detected:true
}).ok,false);
assert.equal(gate.evaluate({
  compiled,
  application_receipts:[{parameter:'wall_lineweight',applied_value:.4,engine_owner:'VECTOR_STYLE_LAYER',artifact_ref:'ART-1'}],
  probe_evidence:{PLAN_HIERARCHY_VISIBLE:{status:'PASS',validator:'visual-metric',evidence_refs:['EV-1'],observed_effect:'visible'}},
  professional_family:{status:'PASS',validator:'reference-family-crosscheck',evidence_refs:['EV-FAMILY-1']},
  explanation_required_to_notice_gain:true
}).ok,false);
console.log('drawing-reference-effect-gate: PASS');
