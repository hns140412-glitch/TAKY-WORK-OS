const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const cp=require('child_process');

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a3cli-'));
const pkg={
  package_id:'T',
  project:{title:'테스트'},
  sources:[{source_id:'S',role:'CURRENT_GEOMETRY_SOURCE'}],
  facts:[],review_items:[],cases:[],methods:[],
  pages:[{page_id:'P06',title:'2F Plan',source_visual_refs:['S'],method_refs:[],fact_refs:[],review_refs:[],case_refs:[]}]
};
const profile={
  a3:{width_mm:420,height_mm:297,margin_mm:12,layout:{hero_ratio:.74,support_ratio:.26}},
  pages:{P06:{title:'2F Plan',hero:'2F_SOURCE_DRAWING',methods:['M-017','M-025']}}
};
const source='<svg viewBox="0 0 100 50"><path d="M0 0L100 50" stroke="black" fill="none"/></svg>';

fs.writeFileSync(path.join(dir,'pkg.json'),JSON.stringify(pkg));
fs.writeFileSync(path.join(dir,'profile.json'),JSON.stringify(profile));
fs.writeFileSync(path.join(dir,'source.svg'),source);

const outSvg=path.join(dir,'out.svg');
const outHtml=path.join(dir,'out.html');

const result=cp.spawnSync(process.execPath,[
  path.join(__dirname,'drawing-a3-board-cli.js'),
  '--package',path.join(dir,'pkg.json'),
  '--profile',path.join(dir,'profile.json'),
  '--page','P06',
  '--source-svg',path.join(dir,'source.svg'),
  '--source-viewbox','0 0 100 50',
  '--out-svg',outSvg,
  '--out-html',outHtml
],{encoding:'utf8'});

assert.equal(result.status,0,result.stderr);
assert(fs.existsSync(outSvg));
assert(fs.existsSync(outHtml));
assert(fs.readFileSync(outSvg,'utf8').includes('source-linework-final'));
assert(fs.readFileSync(outHtml,'utf8').includes('<main class="sheet">'));
console.log('drawing-a3-board-cli PASS');
