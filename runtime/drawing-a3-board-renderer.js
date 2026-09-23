(function(root,factory){
  let reportPkg,compositor,narrative;
  if(typeof module==='object'&&module.exports){
    reportPkg=require('./drawing-report-package');
    compositor=require('./svg-presentation-compositor');
    narrative=require('./drawing-narrative-decision-engine');
    module.exports=factory(reportPkg,compositor,narrative);
  }else{
    root.TakyDrawingA3BoardRenderer=Object.freeze(factory(
      root.TakyReportPackage,
      root.TakySvgPresentationCompositor,
      root.TakyDrawingNarrativeDecisionEngine
    ));
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(reportPkg,compositor,narrative){
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

  function splitLines(text,maxChars=32,maxLines=4){
    const words=String(text||'').trim().split(/\s+/).filter(Boolean);
    const lines=[];
    let current='';
    for(const word of words){
      const next=current?current+' '+word:word;
      if(next.length>maxChars && current){
        lines.push(current);
        current=word;
        if(lines.length>=maxLines-1) break;
      }else current=next;
    }
    if(current && lines.length<maxLines) lines.push(current);
    return lines.slice(0,maxLines);
  }

  function textBlock({x,y,text,label,ink,muted,width=760,maxChars=31}){
    const lines=splitLines(text,maxChars,4);
    const labelSvg=label?
      '<text x="'+x+'" y="'+y+'" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" letter-spacing="3.5" fill="'+muted+'">'+esc(label)+'</text>':'';
    const start=y+(label?54:0);
    const lineSvg=lines.map((line,i)=>
      '<text x="'+x+'" y="'+(start+i*48)+'" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="'+(i===0?'700':'500')+'" fill="'+ink+'">'+esc(line)+'</text>'
    ).join('');
    return labelSvg+lineSvg;
  }

  function renderPage({
    package_data,
    page_id,
    presentation_profile,
    source_svg,
    source_viewbox,
    support_items=[]
  }={}){
    if(!reportPkg||!compositor||!narrative) return {ok:false,reason:'ENGINE_DEPENDENCY_REQUIRED'};
    const validation=reportPkg.validate(package_data||{});
    if(!validation.ok) return {ok:false,reason:'PACKAGE_INVALID',findings:validation.findings};

    const page=(package_data.pages||[]).find(x=>x.page_id===page_id);
    if(!page) return {ok:false,reason:'PAGE_NOT_FOUND',page_id};

    const narrativeState=narrative.compilePage({package_data,page_id});
    if(!narrativeState.ok) return narrativeState;

    const profile=presentation_profile||{};
    const pageProfile=profile.pages?.[page_id]||{};
    const a3=profile.a3||{};
    const widthMm=Number(a3.width_mm||420);
    const heightMm=Number(a3.height_mm||297);
    const unit=10;
    const width=widthMm*unit;
    const height=heightMm*unit;
    const margin=Number(a3.margin_mm||12)*unit;

    const headerH=165;
    const footerH=64;
    const gap=105;
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
      x:hero.x+8,y:hero.y+8,width:hero.width-16,height:hero.height-16
    });

    const sourcePlaced=
      '<defs><clipPath id="source-a3-clip" clipPathUnits="userSpaceOnUse"><rect x="'+(hero.x+8)+'" y="'+(hero.y+8)+'" width="'+(hero.width-16)+'" height="'+(hero.height-16)+'"/></clipPath></defs>'+
      '<g clip-path="url(#source-a3-clip)">'+
      '<svg id="source-slot" data-source-geometry="locked" '+
      'x="'+(hero.x+8)+'" y="'+(hero.y+8)+'" '+
      'width="'+(hero.width-16)+'" height="'+(hero.height-16)+'" '+
      'viewBox="'+sb.x+' '+sb.y+' '+sb.width+' '+sb.height+'" '+
      'preserveAspectRatio="xMidYMid meet">'+
      body+'</svg></g>';

    const project=package_data.project||{};
    const idx=pageIndex(package_data,page_id);
    const title=pageProfile.title||page.title||page_id;
    const subtitle=String(pageProfile.hero||'SOURCE DRAWING').replace(/_/g,' ');
    const projectTitle=project.title||'';
    const methods=(pageProfile.methods||[]).slice(0,3).join(' · ');

    const ink='#151515';
    const muted='#777169';
    const hair='#b7afa3';
    const paper='#f5f1e9';
    const accent='#9a8263';

    const messageText=narrativeState.message?.text||'';
    const whyText=narrativeState.why_it_matters?.text||'';
    const decisions=(narrativeState.decision_points||[]).slice(0,2);

    let narrativeSvg='';
    let cursorY=rail.y+355;
    if(messageText){
      narrativeSvg+=textBlock({
        x:rail.x,y:cursorY,text:messageText,label:'PAGE MESSAGE',
        ink,muted,maxChars:28
      });
      cursorY+=245;
    }
    if(whyText){
      narrativeSvg+=
        '<line x1="'+rail.x+'" y1="'+cursorY+'" x2="'+(rail.x+rail.width)+'" y2="'+cursorY+'" stroke="'+hair+'" stroke-width="2"/>';
      narrativeSvg+=textBlock({
        x:rail.x,y:cursorY+42,text:whyText,label:'WHY THIS MATTERS',
        ink,muted,maxChars:29
      });
      cursorY+=260;
    }

    const decisionSvg=decisions.map((d,i)=>{
      const y=cursorY+i*150;
      return '<g>'+
        '<line x1="'+rail.x+'" y1="'+y+'" x2="'+(rail.x+rail.width)+'" y2="'+y+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<text x="'+rail.x+'" y="'+(y+44)+'" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="3.2" fill="'+muted+'">DECISION '+String(i+1).padStart(2,'0')+'</text>'+
        '<text x="'+rail.x+'" y="'+(y+94)+'" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="'+ink+'">'+esc(d.text)+'</text>'+
      '</g>';
    }).join('');

    const fallbackSupport=(support_items||[]).slice(0,2).map((item,i)=>{
      const y=rail.y+920+i*150;
      return '<g>'+
        '<line x1="'+rail.x+'" y1="'+y+'" x2="'+(rail.x+rail.width)+'" y2="'+y+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<text x="'+rail.x+'" y="'+(y+44)+'" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="'+muted+'">'+esc(item.title||'')+'</text>'+
        '<text x="'+rail.x+'" y="'+(y+94)+'" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="'+ink+'">'+esc(item.value||'')+'</text>'+
      '</g>';
    }).join('');

    const presentation=
      '<g id="a3-editorial-frame">'+
        '<text x="'+margin+'" y="'+(margin+30)+'" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="4.5" fill="'+ink+'">ARCHITECTURAL REVIEW · '+esc(page_id)+'</text>'+
        '<text x="'+margin+'" y="'+(margin+78)+'" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="'+muted+'">'+esc(projectTitle)+'</text>'+
        '<text x="'+(width-margin)+'" y="'+(margin+30)+'" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="'+muted+'">'+String(idx).padStart(2,'0')+'</text>'+
        '<line x1="'+margin+'" y1="'+(margin+112)+'" x2="'+(width-margin)+'" y2="'+(margin+112)+'" stroke="'+ink+'" stroke-width="3"/>'+

        '<text x="'+rail.x+'" y="'+(rail.y+58)+'" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" letter-spacing="4.2" fill="'+muted+'">'+esc(subtitle)+'</text>'+
        '<text x="'+rail.x+'" y="'+(rail.y+158)+'" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="700" fill="'+ink+'">'+esc(title)+'</text>'+
        '<rect x="'+rail.x+'" y="'+(rail.y+214)+'" width="92" height="5" fill="'+accent+'"/>'+
        '<text x="'+rail.x+'" y="'+(rail.y+270)+'" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="'+muted+'">'+esc(methods)+'</text>'+

        narrativeSvg+
        decisionSvg+
        (narrativeState.status==='NO_NARRATIVE_BLOCK'?fallbackSupport:'')+

        '<line x1="'+margin+'" y1="'+(height-margin-footerH)+'" x2="'+(width-margin)+'" y2="'+(height-margin-footerH)+'" stroke="'+hair+'" stroke-width="2"/>'+
        '<text x="'+margin+'" y="'+(height-margin-12)+'" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="'+muted+'">TAKY WORK OS · A3 SVG BOARD STATE</text>'+
        '<text x="'+(width-margin)+'" y="'+(height-margin-12)+'" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="'+muted+'">SOURCE GEOMETRY LOCKED</text>'+
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
      schema:'A3_SVG_BOARD_STATE_V2',
      page_id,
      narrative_status:narrativeState.status,
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

  return Object.freeze({version:'2.0.0',renderPage,parseViewBox,sourceBody,fitTransform});
});