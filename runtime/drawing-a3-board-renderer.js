(function(root,factory){
  let reportPkg,compositor;
  if(typeof module==='object'&&module.exports){
    reportPkg=require('./drawing-report-package');
    compositor=require('./svg-presentation-compositor');
    module.exports=factory(reportPkg,compositor);
  }else{
    root.TakyDrawingA3BoardRenderer=Object.freeze(factory(
      root.TakyReportPackage,
      root.TakySvgPresentationCompositor
    ));
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(reportPkg,compositor){
  'use strict';

  const esc=v=>String(v??'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&apos;');

  function parseViewBox(value){
    const nums=String(value||'').trim().split(/\s+/).map(Number);
    if(nums.length!==4||nums.some(x=>!Number.isFinite(x))) return null;
    return {x:nums[0],y:nums[1],width:nums[2],height:nums[3]};
  }

  function sourceBody(svg){
    const text=String(svg||'').trim();
    if(!text) return '';
    const m=text.match(/^<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/i);
    return m?m[1]:text;
  }

  function fitTransform(sourceBox,target){
    const scale=Math.min(target.width/sourceBox.width,target.height/sourceBox.height);
    const w=sourceBox.width*scale;
    const h=sourceBox.height*scale;
    const x=target.x+(target.width-w)/2-sourceBox.x*scale;
    const y=target.y+(target.height-h)/2-sourceBox.y*scale;
    return {scale,x,y};
  }

  function pageIndex(pkg,pageId){
    const pages=pkg.pages||[];
    const i=pages.findIndex(p=>p.page_id===pageId);
    return i>=0?i+1:1;
  }

  function renderPage({
    package_data,
    page_id,
    presentation_profile,
    source_svg,
    source_viewbox,
    support_items=[]
  }={}){
    if(!reportPkg||!compositor) return {ok:false,reason:'ENGINE_DEPENDENCY_REQUIRED'};
    const validation=reportPkg.validate(package_data||{});
    if(!validation.ok) return {ok:false,reason:'PACKAGE_INVALID',findings:validation.findings};

    const page=(package_data.pages||[]).find(x=>x.page_id===page_id);
    if(!page) return {ok:false,reason:'PAGE_NOT_FOUND',page_id};

    const profile=presentation_profile||{};
    const pageProfile=profile.pages?.[page_id]||{};
    const a3=profile.a3||{};
    const widthMm=Number(a3.width_mm||420);
    const heightMm=Number(a3.height_mm||297);
    const unit=10;
    const width=widthMm*unit;
    const height=heightMm*unit;
    const margin=Number(a3.margin_mm||12)*unit;

    const headerH=180;
    const footerH=70;
    const gap=110;
    const contentY=margin+headerH;
    const contentH=height-(margin*2)-headerH-footerH;
    const contentW=width-(margin*2);
    const heroRatio=Number(a3.layout?.hero_ratio||0.74);
    const supportRatio=Number(a3.layout?.support_ratio||0.26);
    const usable=contentW-gap;
    const heroW=usable*(heroRatio/(heroRatio+supportRatio));
    const supportW=usable-heroW;

    const hero={x:margin,y:contentY,width:heroW,height:contentH};
    const rail={x:margin+heroW+gap,y:contentY,width:supportW,height:contentH};

    const sb=parseViewBox(source_viewbox);
    if(!sb) return {ok:false,reason:'SOURCE_VIEWBOX_REQUIRED'};
    const body=sourceBody(source_svg);
    if(!body) return {ok:false,reason:'SOURCE_SVG_REQUIRED'};

    const fit=fitTransform(sb,{
      x:hero.x+20,y:hero.y+20,width:hero.width-40,height:hero.height-40
    });

    const sourcePlaced=
      '<g id="source-slot" data-source-geometry="locked" '+
      'transform="translate('+fit.x.toFixed(4)+' '+fit.y.toFixed(4)+') scale('+fit.scale.toFixed(8)+')">'+
      body+'</g>';

    const project=package_data.project||{};
    const idx=pageIndex(package_data,page_id);
    const title=pageProfile.title||page.title||page_id;
    const subtitle=String(pageProfile.hero||'SOURCE DRAWING').replace(/_/g,' ');
    const projectTitle=project.title||'';
    const methods=(pageProfile.methods||[]).slice(0,3).join(' · ');

    const accentA='#d8bf88';
    const accentB='#86a8c7';
    const ink='#161616';
    const muted='#777269';
    const hair='#b8b1a5';
    const paper='#f3efe7';

    const support=(support_items||[]).slice(0,3).map((item,i)=>{
      const y=rail.y+880+(i*170);
      return '<g class="support-item">'+
        '<line x1="'+rail.x+'" y1="'+y+'" x2="'+(rail.x+rail.width)+'" y2="'+y+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<text x="'+rail.x+'" y="'+(y+54)+'" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="'+ink+'">'+esc(item.title||'')+'</text>'+
        '<text x="'+rail.x+'" y="'+(y+102)+'" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="'+muted+'">'+esc(item.value||'')+'</text>'+
      '</g>';
    }).join('');

    const presentation=
      '<g id="a3-editorial-frame">'+
        '<text x="'+margin+'" y="'+(margin+28)+'" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="4" fill="'+ink+'">DESIGN REVIEW · '+esc(page_id)+'</text>'+
        '<text x="'+margin+'" y="'+(margin+82)+'" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="'+muted+'">'+esc(projectTitle)+'</text>'+
        '<text x="'+(width-margin)+'" y="'+(margin+28)+'" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="'+muted+'">'+String(idx).padStart(2,'0')+'</text>'+
        '<line x1="'+margin+'" y1="'+(margin+118)+'" x2="'+(width-margin)+'" y2="'+(margin+118)+'" stroke="'+ink+'" stroke-width="3"/>'+

        '<text x="'+rail.x+'" y="'+(rail.y+90)+'" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" letter-spacing="5" fill="'+muted+'">'+esc(subtitle)+'</text>'+
        '<text x="'+rail.x+'" y="'+(rail.y+205)+'" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="'+ink+'">'+esc(title)+'</text>'+
        '<line x1="'+rail.x+'" y1="'+(rail.y+285)+'" x2="'+(rail.x+rail.width)+'" y2="'+(rail.y+285)+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<rect x="'+rail.x+'" y="'+(rail.y+345)+'" width="54" height="54" fill="'+accentA+'"/>'+
        '<text x="'+(rail.x+78)+'" y="'+(rail.y+385)+'" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="'+ink+'">TYPE A</text>'+
        '<rect x="'+rail.x+'" y="'+(rail.y+430)+'" width="54" height="54" fill="'+accentB+'"/>'+
        '<text x="'+(rail.x+78)+'" y="'+(rail.y+470)+'" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="'+ink+'">TYPE B</text>'+
        '<text x="'+rail.x+'" y="'+(rail.y+590)+'" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="'+muted+'">SOURCE GEOMETRY LOCKED</text>'+
        '<text x="'+rail.x+'" y="'+(rail.y+635)+'" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="'+muted+'">'+esc(methods)+'</text>'+
        support+
        '<line x1="'+margin+'" y1="'+(height-margin-footerH)+'" x2="'+(width-margin)+'" y2="'+(height-margin-footerH)+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<text x="'+margin+'" y="'+(height-margin-12)+'" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="'+muted+'">TAKY WORK OS · A3 SVG BOARD STATE</text>'+
        '<text x="'+(width-margin)+'" y="'+(height-margin-12)+'" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="'+muted+'">SOURCE LINE FINAL</text>'+
      '</g>';

    const background='<rect x="0" y="0" width="'+width+'" height="'+height+'" fill="'+paper+'"/>';

    const composed=compositor.composeLayeredSvg({
      width,
      height,
      viewBox:'0 0 '+width+' '+height,
      background,
      layer_outputs:[{
        layer_id:'L5_ANNOTATION',
        id:'a3-board-annotation',
        content:presentation,
        opacity:1,
        blend_mode:'normal'
      }],
      source_linework:sourcePlaced
    });

    if(!composed.ok) return composed;

    return Object.freeze({
      ok:true,
      schema:'A3_SVG_BOARD_STATE_V1',
      page_id,
      width_mm:widthMm,
      height_mm:heightMm,
      hero_rect:Object.freeze(hero),
      support_rect:Object.freeze(rail),
      source_geometry_locked:true,
      source_slot_transform:Object.freeze(fit),
      source_overlay_last:composed.source_overlay_last,
      svg:composed.svg
    });
  }

  return Object.freeze({version:'1.0.0',renderPage,parseViewBox,sourceBody,fitTransform});
});