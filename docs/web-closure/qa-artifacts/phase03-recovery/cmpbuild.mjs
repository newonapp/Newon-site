import fs from "node:fs";import path from "node:path";
const R="/home/claude/newonapp/newon-site",B=process.argv[2];const apply=process.argv[3]==="--apply";
const LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
const {PAGES}=await import(R+"/scripts/business-model-pages.mjs");
const HDR=/<header class="(?:site-header gnav|gnav site-header)[\s\S]*?<\/header>/, FTR=/<footer\b[\s\S]*?<\/footer>/;
const norm=s=>s.replace(/\?v=[\w.-]+/g,"?v=X").replace(/\s+/g,"");
let same=0,ws=0,real=[];
for(const l of LANGS)for(const k of Object.keys(PAGES)){
 const f=`${l}/${k}/index.html`;const r=fs.readFileSync(path.join(R,f),"utf8");let b=fs.readFileSync(path.join(B,f),"utf8");
 const hr=r.match(HDR),fr=r.match(FTR);
 if(hr&&HDR.test(b))b=b.replace(HDR,()=>hr[0]);
 {const rf=r.match(/<footer\b[\s\S]*?<\/footer>/g)||[],bf=b.match(/<footer\b[\s\S]*?<\/footer>/g)||[];if(rf.length===bf.length)bf.forEach((x,i)=>{b=b.replace(x,()=>rf[i])})}
 b=b.replace(/\?v=[\w.-]+/g,m=>m);
 if(r===b){same++;continue}
 if(norm(r)===norm(b)){ws++;continue}
 real.push(f);
}
console.log({same,ws,real:real.length});fs.writeFileSync(process.argv[4]||"/dev/null",real.join("\n"));
