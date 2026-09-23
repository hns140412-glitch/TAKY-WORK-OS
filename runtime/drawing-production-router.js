(function(root,factory){
  const api=factory(
    typeof require==='function' ? require('./drawing-report-package.js') : root.TakyReportPackage,
    typeof require==='function' ? require('./pre-user-validation.js') : root.TakyPreUserValidation,
    typeof require==='function' ? require('./reference-compiler.js') : root.TakyReferenceCompiler
  );
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TakyDrawingProductionRouter=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this,function(ReportPackage,PreUserValidation,ReferenceCompiler){
  'use strict';

  const AUTHORIZED_ENGINES=Object.freeze({
    REPORT_PACKAGE:'runtime/drawing-report-package.js',
    REFERENCE_COMPILER:'runtime/reference-compiler.js',
    PRE_USER_VALIDATION:'runtime/pre-user-validation.js',
    A3_RENDERER:'AUTHORIZED_A3_SVG_RENDERER'
  });
  const ONE_OFF_TYPES=new Set(['PYTHON','REPORTLAB','GENERIC_HTML','RASTER_MASK_SCRIPT','GENERATIVE_REDRAW']);

  function route(request={}){
    const mode=request.mode||'PRODUCTION';
    if(mode!=='PRODUCTION'){
      return Object.freeze({ok:true,mode,user_facing:false,artifact_class:'EXPERIMENT_DIAGNOSTIC',production_authorized:false});
    }

    if(request.user_facing!==true){
      return Object.freeze({ok:false,reason:'PRODUCTION_MUST_DECLARE_USER_FACING_STATE'});
    }
    if(ONE_OFF_TYPES.has(request.executor_type)){
      return Object.freeze({ok:false,reason:'ONE_OFF_EXECUTOR_FORBIDDEN_FOR_PRODUCTION',executor_type:request.executor_type});
    }
    if(request.engine_id!=='DRAWING_PRODUCTION_ROUTER'){
      return Object.freeze({ok:false,reason:'UNAUTHORIZED_PRODUCTION_ROUTE',engine_id:request.engine_id||null});
    }

    const pkgValidation=ReportPackage.validate(request.report_package||{});
    if(!pkgValidation.ok) return Object.freeze({ok:false,reason:'PACKAGE_INVALID',findings:pkgValidation.findings});

    const compiled=ReferenceCompiler.compile(request.reference_input||{});
    if(!compiled.ok) return Object.freeze({ok:false,reason:'REFERENCE_COMPILE_FAIL',findings:compiled.findings});

    const gateResult=PreUserValidation.run({
      ...request.validation_input,
      reference_compilation:compiled
    });
    if(!gateResult.ok){
      return Object.freeze({
        ok:false,
        reason:'NO_PASS_NO_SHOW',
        user_exposure:'BLOCKED',
        gate_result:gateResult
      });
    }

    return Object.freeze({
      ok:true,
      production_authorized:true,
      user_exposure:'PASS',
      content_canonical:'REPORT_PACKAGE',
      visual_canonical:'A3_SVG_BOARD_STATE',
      reference_parameters:compiled.parameters,
      routes:Object.freeze({
        PDF:'A3_SVG_BOARD_STATE -> AUTHORIZED_A3_SVG_RENDERER -> PDF',
        HTML:'A3_SVG_BOARD_STATE -> AUTHORIZED_A3_SVG_RENDERER -> HTML',
        PPTX:'A3_SVG_BOARD_STATE -> AUTHORIZED_A3_SVG_RENDERER -> PPTX',
        PNG:'A3_SVG_BOARD_STATE -> AUTHORIZED_A3_SVG_RENDERER -> PNG',
        SVG:'A3_SVG_BOARD_STATE -> AUTHORIZED_A3_SVG_RENDERER'
      }),
      engines:AUTHORIZED_ENGINES
    });
  }

  return Object.freeze({version:'1.0.0',AUTHORIZED_ENGINES,route});
});