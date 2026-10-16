import glob,json
from playwright.sync_api import sync_playwright
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
JS="""()=>{
 const parse=c=>{const m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b)};
 const blend=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 const bgOf=el=>{let layers=[];let e=el;let img=false;while(e&&e.nodeType===1){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none')img=true;const c=parse(cs.backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=1)break}e=e.parentElement}
   let base={r:255,g:255,b:255,a:1};for(let i=layers.length-1;i>=0;i--)base=blend(layers[i],base);return {c:base,img}};
 const out=[];const seen=new Set();
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){const t=n.textContent.trim();if(t.length<2)continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.opacity)===0)continue;
  const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;
  let op=1,e=el;while(e&&e.nodeType===1){op*=parseFloat(getComputedStyle(e).opacity);e=e.parentElement}
  if(op<0.5)continue; /* reveal-animation hidden */
  const fg=parse(cs.color);const bg=bgOf(el);if(!fg)continue;const fgb=fg.a<1?blend(fg,bg.c):fg;
  const L1=lum(fgb),L2=lum(bg.c);const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
  const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;const large=size>=24||(size>=18.66&&bold);
  const need=large?3:4.5;
  if(ratio<need)out.push({t:t.slice(0,28),ratio:+ratio.toFixed(2),need,img:bg.img,cls:(el.className||el.tagName).toString().slice(0,40),inHdr:!!el.closest('header,footer')})}
 return out}"""
PAGES=[('ko','business-hub'),('ko','business/seller-center'),('ko','business'),('ko','studio'),('ko','babylog'),('ko','ongil'),('en','business-hub'),('de','business-hub')]
agg={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe,args=['--no-sandbox'])
    for vw in (1440,390):
        pg=b.new_page(viewport={'width':vw,'height':900})
        for lang,path in PAGES:
            pg.goto(f'http://localhost:8768/{lang}/{path}/',wait_until='load'); pg.wait_for_timeout(300)
            h=pg.evaluate("document.body.scrollHeight")
            for y in range(0,h,600): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(60)
            pg.wait_for_timeout(400)
            r=pg.evaluate(JS)
            solid=[x for x in r if not x['img']]
            print(vw,lang,path,'low-contrast (solid bg):',len(solid),'| over image/gradient (indeterminate):',len(r)-len(solid))
            for x in solid[:6]: print('    ',x)
    b.close()
