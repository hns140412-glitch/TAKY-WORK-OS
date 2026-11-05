#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const renderer=require('./drawing-a3-board-renderer');
const htmlExporter=require('./drawing-html-exporter');

function arg(name,required=false){
  const i=process.argv.indexOf('--'+name);
  if(i<0){
    if(required) throw new Error('ARG_REQUIRED:'+name);
    return null;
  }
  const value=process.argv[i+1];
  if(value===undefined) throw new Error('ARG_VALUE_REQUIRED:'+name);
  return value;
}

function main(){
  const packagePath=arg('package',true);
  const profilePath=arg('profile',true);
  const pageId=arg('page',true);
  const sourceSvgPath=arg('source-svg',true);
  const sourceViewBox=arg('source-viewbox',true);
  const sourceHref=arg('source-href',false);
  const outSvg=arg('out-svg',true);
  const outHtml=arg('out-html',false);

  const pkg=JSON.parse(fs.readFileSync(packagePath,'utf8'));
  const profile=JSON.parse(fs.readFileSync(profilePath,'utf8'));
  const sourceSvg=fs.readFileSync(sourceSvgPath,'utf8');

  const board=renderer.renderPage({
    package_data:pkg,
    page_id:pageId,
    presentation_profile:profile,
    source_svg:sourceSvg,
    source_viewbox:sourceViewBox,
    source_href:sourceHref
  });
  if(!board.ok){
    process.stderr.write(JSON.stringify(board,null,2)+'\n');
    process.exit(2);
  }
  fs.writeFileSync(outSvg,board.svg,'utf8');

  if(outHtml){
    const html=htmlExporter.exportHtml({
      svg:board.svg,
      title:(pkg.project&&pkg.project.title?pkg.project.title:'TAKY')+' · '+pageId
    });
    if(!html.ok){
      process.stderr.write(JSON.stringify(html,null,2)+'\n');
      process.exit(3);
    }
    fs.writeFileSync(outHtml,html.html,'utf8');
  }

  process.stdout.write(JSON.stringify({
    ok:true,
    page_id:pageId,
    source_geometry_locked:board.source_geometry_locked,
    source_overlay_last:board.source_overlay_last,
    out_svg:path.resolve(outSvg),
    out_html:outHtml?path.resolve(outHtml):null,
    route:'REPORT_PACKAGE -> A3_SVG_BOARD_STATE -> HTML'
  },null,2)+'\n');
}

if(require.main===module) main();
