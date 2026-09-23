'use strict';

const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const cp=require('child_process');

const Renderer=require('./drawing-a3-board-renderer.js');
const ReferenceCompiler=require('./reference-compiler.js');
const ReferenceApplication=require('./reference-application.js');
const HumanIntent=require('./human-intent-contract.js');
const TestSigner=require('../tests/validator-test-helper.js');
const Pipeline=require('./production-pipeline.js');
const Broker=require('./artifact-broker.js');
const Contract=require('./execution-contract.js');

const ROOT=path.resolve(__dirname,'..');
const PYTHON=process.env.TAKY_PYTHON||'python3';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'taky-e2e-'));
const staging=path.join(tmp,'staging');
const production=path.join(tmp,'production');
fs.mkdirSync(staging,{recursive:true});
process.env.TAKY_STAGING_ROOT=staging;
process.env.TAKY_PRODUCTION_ROOT=production;

function run(command,args,opts={}){
  const r=cp.spawnSync(command,args,{encoding:'utf8',cwd:ROOT,maxBuffer:40*1024*1024,...opts});
  if(r.status!==0){
    throw new Error('COMMAND_FAILED '+command+' '+args.join(' ')+'\nSTDOUT:\n'+r.stdout+'\nSTDERR:\n'+r.stderr);
  }
  return r.stdout;
}

function exportBundle(svgPath,name){
  const dir=path.join(staging,name);
  const raw=run(PYTHON,[
    path.join(ROOT,'tools/drawing_a3_bundle_exporter.py'),
    svgPath,dir,
    '--orientation','landscape',
    '--dpi','144',
    '--max-attempts','2'
  ]);
  const bundle=JSON.parse(raw);
  assert.equal(bundle.status,'PASS',JSON.stringify(bundle,null,2));
  for(const key of ['html','pdf','png','pptx','xlsx']){
    assert(fs.existsSync(bundle.outputs[key]),'missing '+name+' output '+key);
  }
  return bundle;
}

try{
  const sourcePdf=path.join(tmp,'source.pdf');
  const makePdf=[
    'import pymupdf as fitz',
    'doc=fitz.open()',
    'p=doc.new_page(width=400,height=240)',
    's=p.new_shape()',
    's.draw_rect(fitz.Rect(30,30,370,210))',
    's.draw_line((80,30),(80,210))',
    's.draw_line((200,30),(200,210))',
    's.draw_line((80,120),(370,120))',
    's.finish(color=(0,0,0),width=1.2)',
    's.commit()',
    'doc.save(r"'+sourcePdf.replace(/\\/g,'\\\\')+'")'
  ].join(';');
  run(PYTHON,['-c',makePdf]);

  const controlledSvg=path.join(staging,'controlled.svg');
  const controlledManifest=path.join(staging,'controlled-manifest.json');
  run(PYTHON,[
    path.join(ROOT,'tools/drawing_controlled_presentation_pipeline.py'),
    sourcePdf,
    '--page','0',
    '--out-svg',controlledSvg,
    '--manifest',controlledManifest
  ]);
  const controlled=JSON.parse(fs.readFileSync(controlledManifest,'utf8'));
  assert.equal(controlled.ok,true);
  assert.equal(controlled.geometry_preserved,true);

  const primitiveResult=JSON.parse(run(PYTHON,[
    path.join(ROOT,'tools/drawing_geometry_primitive_adapter.py'),
    sourcePdf,
    '--type','PDF',
    '--page','0'
  ]));
  assert.equal(primitiveResult.semantic_inference,false);
  assert(primitiveResult.primitive_count>0);

  const pkg={
    package_id:'SYNTHETIC_E2E',
    project:{title:'Synthetic TAKY E2E'},
    sources:[{source_id:'SRC-1',role:'CURRENT_GEOMETRY_SOURCE'}],
    facts:[],
    review_items:[],
    cases:[],
    methods:[],
    pages:[{
      page_id:'P01',
      title:'Synthetic Plan',
      source_visual_refs:['SRC-1'],
      method_refs:[],
      fact_refs:[],
      review_refs:[],
      case_refs:[]
    }]
  };

  const baselineProfile={
    a3:{
      width_mm:420,
      height_mm:297,
      margin_mm:4,
      layout:{hero_ratio:0.45,support_ratio:0.55}
    },
    pages:{P01:{title:'Synthetic Plan',hero:'SOURCE_DRAWING',scale_label:'1:200'}}
  };

  const compiledReference=ReferenceCompiler.compileReferenceProfile({
    reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
    context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
  });
  assert.equal(compiledReference.ok,true);

  const referenceApplication=ReferenceApplication.applyToPresentationProfile(
    baselineProfile,
    compiledReference
  );
  assert.equal(referenceApplication.ok,true);
  assert(referenceApplication.applied_parameters.length>=3);
  assert.equal(referenceApplication.geometry_mutation,false);
  assert.equal(referenceApplication.fact_mutation,false);

  const sourceSvg=fs.readFileSync(controlledSvg,'utf8');

  const baselineBoard=Renderer.renderPage({
    package_data:pkg,
    page_id:'P01',
    presentation_profile:baselineProfile,
    source_svg:sourceSvg,
    source_viewbox:'0 0 400 240'
  });
  assert.equal(baselineBoard.ok,true);

  const candidateBoard=Renderer.renderPage({
    package_data:pkg,
    page_id:'P01',
    presentation_profile:referenceApplication.profile,
    source_svg:sourceSvg,
    source_viewbox:'0 0 400 240'
  });
  assert.equal(candidateBoard.ok,true);
  assert.equal(candidateBoard.source_geometry_locked,true);
  assert.equal(candidateBoard.source_overlay_last,true);
  assert(candidateBoard.svg.includes('width="420mm"'));
  assert(candidateBoard.svg.includes('height="297mm"'));

  const baselineSvg=path.join(staging,'baseline.svg');
  const candidateSvg=path.join(staging,'candidate.svg');
  fs.writeFileSync(baselineSvg,baselineBoard.svg,'utf8');
  fs.writeFileSync(candidateSvg,candidateBoard.svg,'utf8');

  const baselineBundle=exportBundle(baselineSvg,'baseline-bundle');
  const candidateBundle=exportBundle(candidateSvg,'candidate-bundle');

  const baselinePdf=baselineBundle.outputs.pdf;
  const candidatePdf=candidateBundle.outputs.pdf;
  const digest=Broker.sha256File(candidatePdf);

  const humanIntent=HumanIntent.compileHumanIntent({
    desired_outcome:'Produce a source-faithful A3 architectural report whose reference-driven hierarchy is clear enough for human decision.',
    success_criteria:[
      'source geometry remains unchanged',
      'reference effect is visibly attributable',
      'final PDF is suitable for decision review'
    ]
  });
  assert.equal(humanIntent.ok,true);

  const metrics=JSON.parse(run(PYTHON,[
    path.join(ROOT,'tools/drawing_visual_metric_extractor.py'),
    candidatePdf,
    '--page','0'
  ]));
  const measurement=TestSigner.signVisualMeasurement({
    artifact_digest:digest,
    metrics
  });
  assert.equal(measurement.ok,true);

  const comparisonPayload=JSON.parse(run(PYTHON,[
    path.join(ROOT,'tools/drawing_visual_metric_extractor.py'),
    candidatePdf,
    '--page','0',
    '--baseline',baselinePdf
  ]));
  assert.equal(comparisonPayload.comparison.schema,'TAKY_OBJECTIVE_REFERENCE_DELTA_V1');
  assert.equal(
    comparisonPayload.comparison.objective_effect_detected,
    true,
    JSON.stringify(comparisonPayload.comparison,null,2)
  );
  assert.equal(comparisonPayload.comparison.clarity_only_suspected,false);

  const refReceipt=TestSigner.signReferenceEffect({
    baseline_digest:Broker.sha256File(baselinePdf),
    candidate_digest:digest,
    reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
    reference_compile_digest:compiledReference.compile_digest,
    comparison:comparisonPayload.comparison
  });
  assert.equal(refReceipt.ok,true);

  const vision=TestSigner.signVisionReview({
    artifact_digest:digest,
    intent_digest:humanIntent.intent_digest,
    professional_family_pass:true,
    reference_effect_visible_without_explanation:true,
    generic_layout_detected:false,
    decision_value_pass:true
  });
  assert.equal(vision.ok,true);

  const primitives=primitiveResult.primitives;
  const finalized=Pipeline.finalizeStagedProduction({
    staging_path:candidatePdf,
    task:{task_type:'ARCH_REPORT_ASSEMBLY',requested_output:'USER_FACING'},
    source_identity:{current_content:'synthetic-source-v1',previous_content:'synthetic-source-v1'},
    geometry:{
      source:{primitives},
      output:{primitives},
      protected_anchors_source:[],
      protected_anchors_output:[],
      crop_source:[0,0,400,240],
      crop_output:[0,0,400,240],
      rotation_source:0,
      rotation_output:0,
      scale_source:'1:200',
      scale_output:'1:200',
      mask_intersections:[]
    },
    semantics:[],
    claims:[],
    human_intent:{
      desired_outcome:humanIntent.desired_outcome,
      success_criteria:[...humanIntent.success_criteria]
    },
    reference:{
      reference_ids:['DIVISARE_EDITORIAL_RESTRAINT'],
      context:{scale:'1:200',output_size:'A3',source_density:'MEDIUM'}
    },
    reference_application:referenceApplication,
    visual_measurement_receipt:measurement.receipt,
    reference_effect_receipt:refReceipt.receipt,
    vision_review_receipt:vision.receipt,
    provenance:{
      source_ids:['SRC-1'],
      module_ids:[
        'DRAWING_CONTROLLED_PRESENTATION_V1',
        'DRAWING_A3_BOARD_RENDERER_V1',
        'DRAWING_A3_BUNDLE_EXPORTER_V1'
      ]
    },
    report_package:pkg,
    exposure_target:'FINAL_APPROVABLE'
  });

  assert.equal(finalized.ok,true,JSON.stringify(finalized,null,2));
  assert.equal(finalized.status,'FINAL_APPROVABLE');
  assert.equal(finalized.evidence.refApplication.ok,true);

  const auth=Contract.verifyProductionAuthorization(finalized.authorization);
  assert.equal(auth.ok,true);

  const published=Broker.publishProductionArtifact({
    artifact_id:'SYNTHETIC-E2E-PDF',
    artifact_type:'PDF',
    producer_id:auth.payload.producer_id,
    execution_graph_id:auth.payload.execution_graph_id,
    source_ids:['SRC-1'],
    staging_path:candidatePdf,
    file_name:'synthetic-final.pdf',
    exposure_grant:finalized.exposure_grant
  });

  assert.equal(published.ok,true,JSON.stringify(published,null,2));
  assert.equal(published.record.status,'PUBLISHED_PRODUCTION_ARTIFACT');
  assert.equal(Broker.sha256File(path.join(production,'synthetic-final.pdf')),digest);

  console.log('drawing-production-e2e: PASS');
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
