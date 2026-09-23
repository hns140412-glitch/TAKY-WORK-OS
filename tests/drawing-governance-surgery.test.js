'use strict';
const assert=require('assert');
const ReportPackage=require('../runtime/drawing-report-package.js');
const Router=require('../runtime/drawing-production-router.js');

const pkg={package_id:'T',project:{title:'T'},sources:[],facts:[],review_items:[],cases:[],methods:[],pages:[]};

const direct=ReportPackage.buildOutputPlan(pkg);
assert.strictEqual(direct.ok,false);
assert.strictEqual(direct.reason,'PRODUCTION_ROUTER_REQUIRED');

const oneOff=Router.route({
  mode:'PRODUCTION',user_facing:true,engine_id:'DRAWING_PRODUCTION_ROUTER',
  executor_type:'PYTHON',report_package:pkg
});
assert.strictEqual(oneOff.ok,false);
assert.strictEqual(oneOff.reason,'ONE_OFF_EXECUTOR_FORBIDDEN_FOR_PRODUCTION');

const failGeometry=Router.route({
  mode:'PRODUCTION',user_facing:true,engine_id:'DRAWING_PRODUCTION_ROUTER',
  executor_type:'AUTHORIZED_ENGINE',report_package:pkg,
  reference_input:{references:['ARCHDAILY'],requires_line_hierarchy:true},
  validation_input:{
    gates:{
      SOURCE_GATE:'PASS',GEOMETRY_GATE:'PASS',FACT_GATE:'PASS',SEMANTIC_GATE:'PASS',
      REFERENCE_EFFECT_GATE:'PASS',ARCHITECTURAL_READABILITY_GATE:'PASS',
      A3_GATE:'PASS',USER_EFFECT_GATE:'PASS'
    },
    geometry_diff:1,
    protected_geometry:{wall:true,core:true,entry:true},
    reference_effect_visible:true
  }
});
assert.strictEqual(failGeometry.ok,false);
assert.strictEqual(failGeometry.reason,'NO_PASS_NO_SHOW');

const failReference=Router.route({
  mode:'PRODUCTION',user_facing:true,engine_id:'DRAWING_PRODUCTION_ROUTER',
  executor_type:'AUTHORIZED_ENGINE',report_package:pkg,
  reference_input:{references:[]},
  validation_input:{gates:{}}
});
assert.strictEqual(failReference.ok,false);
assert.strictEqual(failReference.reason,'REFERENCE_COMPILE_FAIL');

const pass=Router.route({
  mode:'PRODUCTION',user_facing:true,engine_id:'DRAWING_PRODUCTION_ROUTER',
  executor_type:'AUTHORIZED_ENGINE',report_package:pkg,
  reference_input:{references:['ARCHDAILY','DIVISARE','OMA'],requires_line_hierarchy:true},
  validation_input:{
    gates:{
      SOURCE_GATE:'PASS',GEOMETRY_GATE:'PASS',FACT_GATE:'PASS',SEMANTIC_GATE:'PASS',
      REFERENCE_EFFECT_GATE:'PASS',ARCHITECTURAL_READABILITY_GATE:'PASS',
      A3_GATE:'PASS',USER_EFFECT_GATE:'PASS'
    },
    geometry_diff:0,
    protected_geometry:{wall:true,core:true,entry:true},
    unsupported_narrative_claims:[],
    semantic_inference_unverified:false,
    reference_effect_visible:true,
    generic_layout_detected:false,
    user_debug_required:false
  }
});
assert.strictEqual(pass.ok,true);
assert.strictEqual(pass.user_exposure,'PASS');
assert.strictEqual(pass.production_authorized,true);
console.log('DRAWING_GOVERNANCE_SURGERY_TESTS_PASS');