import glob,json,sys
from playwright.sync_api import sync_playwright
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
B='http://localhost:8768'
VPS=[1440,1280,1024,768,390,320]
PAGES=[('ko','business-hub'),('ko','business'),('ko','business/seller-center'),('ko','studio/digital'),('ko','babylog'),('ko','ongil'),('en','business-hub'),('de','business-hub'),('ja','studio'),('id','business/partners'),('hi','shareon'),('pt-br','myworld'),('fr','ai/enterprise'),('es','tools')]
R=[];ERR=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe,args=['--no-sandbox'])
    for vw in VPS:
        ctx=b.new_context(viewport={'width':vw,'height':900},has_touch=vw<=768)
        pg=ctx.new_page()
        for lang,path in PAGES:
            errs=[];bad=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:80]))
            pg.on('response',lambda r:bad.append(r.url[-60:]) if r.status>=400 and 'googleapis' not in r.url and 'gstatic' not in r.url else None)
            try: pg.goto(f'{B}/{lang}/{path}/',wait_until='load',timeout=20000)
            except Exception as e: R.append((vw,lang,path,'LOADFAIL',str(e)[:60])); continue
            pg.wait_for_timeout(250)
            d=pg.evaluate("""()=>{
              const de=document.documentElement; const o={};
              o.hscroll=de.scrollWidth-de.clientWidth;
              const bar=document.querySelector('.gnav__nav'); const tg=document.querySelector('[data-gnav-toggle]');
              o.barVisible=!!bar&&getComputedStyle(bar).display!=='none'; o.burgerVisible=!!tg&&getComputedStyle(tg).display!=='none';
              if(o.barVisible){const n=document.querySelector('.gnav__inner');o.barOverflow=bar.scrollWidth-bar.clientWidth; }
              o.imgBroken=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src&&!i.src.startsWith('data:')).map(i=>i.src.slice(-40)).slice(0,3);
              o.h1=document.querySelectorAll('h1').length; o.lang=document.documentElement.lang;
              o.canon=!!document.querySelector('link[rel=canonical]'); o.title=document.title.length>3;
              o.triggers=[...document.querySelectorAll('.gnav-dd__trigger')].map(t=>({n:t.getAttribute('aria-label')||t.textContent.trim(),e:t.getAttribute('aria-expanded'),c:!!document.getElementById(t.getAttribute('aria-controls')||'x')}));
              o.unnamed=[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&!(e.textContent.trim()||e.getAttribute('aria-label')||e.getAttribute('title')||e.querySelector('img[alt]:not([alt=""])'))}).length;
              return o}""")
            d['dd']=None
            if d['barVisible']:
                try:
                    pg.hover('[data-gnav-menu="bizhub"] .gnav__link'); pg.wait_for_timeout(300)
                    d['dd']=pg.evaluate("""()=>{const m=document.querySelector('[data-gnav-mega=bizhub]');if(!m||m.hidden)return 'closed';const r=m.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),w:innerWidth,inside:r.left>=-1&&r.right<=innerWidth+1}}""")
                except Exception as e: d['dd']='err '+str(e)[:40]
                pg.mouse.move(5,890)
            d.update(vw=vw,lang=lang,path=path,errs=errs[:2],bad=bad[:3]); R.append(d)
            pg.remove_listener
        ctx.close()
    b.close()
json.dump(R,open('matrix.json','w'),ensure_ascii=False)
fails=[]
for d in R:
    if 'LOADFAIL' in d: fails.append(d); continue
    why=[]
    if d['hscroll']>0: why.append(f"hscroll {d['hscroll']}")
    if d['barVisible'] and d.get('barOverflow',0)>0: why.append('bar overflow')
    if d['vw']>=1280 and not d['barVisible']: why.append('bar hidden>=1280')
    if d['vw']<1280 and not d['burgerVisible']: why.append('no burger<1280')
    if d['imgBroken']: why.append('img '+str(d['imgBroken']))
    if d['h1']!=1: why.append('h1='+str(d['h1']))
    if not d['canon'] or not d['title']: why.append('meta')
    if d['unnamed']: why.append('unnamed '+str(d['unnamed']))
    if d['errs']: why.append('jserr '+str(d['errs']))
    if d['bad']: why.append('http>=400 '+str(d['bad']))
    if isinstance(d['dd'],dict) and not d['dd']['inside']: why.append('dropdown outside viewport '+str(d['dd']))
    if d['dd']=='closed': why.append('hover dropdown closed')
    if any(t['e']!='false' or not t['c'] for t in d['triggers']): why.append('trigger state')
    if why: fails.append((d['vw'],d['lang'],d['path'],why))
print('checks',len(R),'issues',len(fails))
for f in fails[:40]: print(f)
