import glob
from playwright.sync_api import sync_playwright
exe=glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome')[0]
P=[('ko','business/web'),('ja','business/web'),('en','studio/digital'),('ko','business/inquiry'),('de','business/automation'),('ko','studio/care')]
bad=0;n=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=exe,args=['--no-sandbox'])
    for vw in (320,390,768,1440):
        pg=b.new_page(viewport={'width':vw,'height':900})
        for th in ('light','dark'):
            for l,k in P:
                pg.goto(f'http://localhost:8768/{l}/{k}/',wait_until='load')
                if th=='dark':pg.evaluate("document.documentElement.setAttribute('data-newon-shell-theme','dark');document.documentElement.setAttribute('data-theme','dark')")
                pg.wait_for_timeout(200)
                r=pg.evaluate("""()=>{const a=document.querySelector('.bm-notice');if(!a)return null;const r=a.getBoundingClientRect();const cs=getComputedStyle(a.querySelector('p'));return {w:r.width,l:r.left,r:r.right,vw:innerWidth,sw:document.documentElement.scrollWidth,color:cs.color,bg:getComputedStyle(a).backgroundColor,vis:r.height>10}}""")
                n+=1
                if not r or not r['vis'] or r['sw']>r['vw']+1 or r['r']>r['vw']+1 or r['l']<-1:
                    bad+=1;print('ISSUE',vw,th,l,k,r)
    print('checked',n,'issues',bad)
