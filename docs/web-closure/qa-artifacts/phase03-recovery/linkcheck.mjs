import fs from "node:fs";import cp from "node:child_process";
const {PAGES}=await import("/home/claude/newonapp/newon-site/scripts/business-model-pages.mjs");
const LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
const hrefs=h=>{const s=new Set();for(const m of h.matchAll(/<a\b[^>]*?\shref="([^"#][^"]*)"/g))s.add(m[1].replace(/\?v=\d+/,""));return s};
const forms=h=>[...h.matchAll(/<form\b[^>]*>/g)].length+"|"+[...h.matchAll(/<(?:input|select|textarea|option|button)\b[^>]*?\s(?:name|value|type|required|data-[a-z-]+)="([^"]*)"/g)].map(m=>m[1]).join(",");
const out=[];let tot=0,miss=0,formDiff=0,missingFile=0;
for(const l of LANGS)for(const k of Object.keys(PAGES)){
 const f=`${l}/${k}/index.html`;let base;
 try{base=cp.execSync(`git show dd8dd8f:${f}`,{cwd:"/home/claude/newonapp/newon-site",maxBuffer:1e8}).toString()}catch{missingFile++;continue}
 if(!fs.existsSync(f)){out.push({f,err:"missing now"});continue}
 const now=fs.readFileSync(f,"utf8");tot++;
 const b=hrefs(base),n=hrefs(now);
 const lost=[...b].filter(x=>!n.has(x));const added=[...n].filter(x=>!b.has(x));
 const fd=forms(base)!==forms(now);
 if(lost.length)miss++;if(fd)formDiff++;
 if(lost.length||fd)out.push({f,lost,added,formDiff:fd});
}
fs.writeFileSync(process.argv[2]||"/dev/stdout",JSON.stringify({tot,pagesWithLostLinks:miss,formDiff,missingFile,detail:out},null,1));
console.log({tot,miss,formDiff,missingFile});
