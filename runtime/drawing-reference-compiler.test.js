const assert=require('assert');
const c=require('./drawing-reference-compiler');
const x=c.compile([
 {reference_name:'ArchDaily',mined_dna:'PLAN_LINE_HIERARCHY',design_tokens:{wall_weight:.40,primary_weight:.28},engine_parameters:{wall_lineweight:.40,primary_lineweight:.28},output_effect:'cut walls dominate projection',validation_probe:'PLAN_HIERARCHY_VISIBLE'},
 {reference_name:'Divisare',mined_dna:'EDITORIAL_RESTRAINT',design_tokens:{whitespace_ratio:.32},engine_parameters:{whitespace_ratio:.32},output_effect:'drawing remains dominant',validation_probe:'EDITORIAL_RESTRAINT_VISIBLE'}
]);
assert.equal(x.ok,true);
const observed={
  applied_parameters:{wall_lineweight:.40,primary_lineweight:.28,whitespace_ratio:.32},
  probe_evidence:{
    PLAN_HIERARCHY_VISIBLE:{status:'PASS',validator:'visual-metric',evidence_refs:['REF-E-1'],observed_effect:'wall hierarchy visibly dominates'},
    EDITORIAL_RESTRAINT_VISIBLE:{status:'PASS',validator:'layout-metric',evidence_refs:['REF-E-2'],observed_effect:'whitespace and drawing dominance meet thresholds'}
  }
};
assert.equal(c.validateApplied(x,observed).ok,true);
assert.equal(c.validateApplied(x,{applied_parameters:['wall_lineweight'],passed_probes:['PLAN_HIERARCHY_VISIBLE']}).ok,false);
assert.equal(c.validateApplied(x,{...observed,applied_parameters:{...observed.applied_parameters,wall_lineweight:.25}}).ok,false);
assert.equal(c.compile([{reference_name:'OMA'}]).ok,false);
console.log('drawing-reference-compiler: PASS');
