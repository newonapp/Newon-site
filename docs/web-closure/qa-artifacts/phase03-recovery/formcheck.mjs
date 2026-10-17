import fs from "node:fs";import cp from "node:child_process";
const R="/home/claude/newonapp/newon-site";
const {PAGES}=await import(R+"/scripts/business-model-pages.mjs");
const sig=h=>[...h.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(m=>{const f=m[0];return (f.match(/<form\b[^>]*>/)[0].replace(/\s+/g," "))+"::"+[...f.matchAll(/<(input|select|textarea|option|button)\b([^>]*)>/g)].map(x=>x[1]+":"+[...x[2].matchAll(/\s(name|value|type|required|action|method|id)(?:="([^"]*)")?/g)].map(y=>y[1]+"="+(y[2]??"")).join("&")).join("|")});
let tot=0,forms=0,diff=[];
for(const l of ["ko","en","ja","es","pt-br","fr","de","hi","id"])for(const k of Object.keys(PAGES)){
 const f=`${l}/${k}/index.html`;const base=cp.execSync(`git show dd8dd8f:${f}`,{cwd:R,maxBuffer:1e8}).toString();const now=fs.readFileSync(`${R}/${f}`,"utf8");
 const a=sig(base),b=sig(now);tot++;forms+=a.length;if(JSON.stringify(a)!==JSON.stringify(b))diff.push(f);
}
console.log({pages:tot,formsInBase:forms,pagesWithFormDiff:diff.length,diff:diff.slice(0,5)});
