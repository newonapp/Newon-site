import re,os,glob,html,json,sys,collections
os.chdir('/home/claude/newonapp/newon-site')
LANGS=['ko','en','ja','es','pt-br','fr','de','hi','id']
PAGES=['business-hub','business','business/automation','business/seller-center','tools','ai/enterprise','resources/insights','business/partners','studio','studio/partnerships','studio/digital','studio/projects','studio/contact','babylog','petlog','myworld','shareon','lifestage','ongil','apps','ai','about']
def rd(p): return open(p,encoding='utf8',errors='ignore').read()
def body(t):
    m=re.search(r'<main[\s\S]*?</main>',t); b=m.group(0) if m else t
    b=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',b)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',b))).strip()
def resolve(base,h):
    h=h.split('#')[0].split('?')[0]
    if not h or re.match(r'^(https?:|mailto:|tel:|javascript:|data:)',h): return True
    p=h if h.startswith('/') else os.path.normpath(os.path.join(os.path.dirname(base),h))
    p=p.lstrip('/')
    return os.path.exists(p) and (os.path.isfile(p) or os.path.exists(os.path.join(p,'index.html'))) or os.path.exists(p+'/index.html')
out={}
bad=[]
for pg in PAGES:
    en=body(rd(f'en/{pg}/index.html')) if os.path.exists(f'en/{pg}/index.html') else ''
    for l in LANGS:
        f=f'{l}/{pg}/index.html'
        if not os.path.exists(f): out[(l,pg)]='MISSING'; continue
        t=rd(f); b=body(t)
        title=re.search(r'<title>([^<]*)',t); desc=re.search(r'name="description" content="([^"]*)"',t)
        canon=re.search(r'rel="canonical" href="([^"]*)"',t); hl=len(re.findall(r'hreflang="',t))
        h1=len(re.findall(r'<h1\b',t))
        links=re.findall(r'<a\b[^>]*href="([^"]*)"',t)
        brk=[h for h in set(links) if not resolve(f,h)]
        # english-fallback: share of body sentences identical to en
        same=None
        if l not in('ko','en') and en:
            ws=set(re.split(r'(?<=[.!?])\s+',en)); sent=[s for s in re.split(r'(?<=[.!?])\s+',b) if len(s)>25]
            same=round(100*sum(1 for s in sent if s in ws)/max(1,len(sent)))
        redirect=len(b)<200 and 'refresh' in t.lower()
        out[(l,pg)]=dict(redirect=redirect,title=bool(title and title.group(1).strip()),desc=bool(desc and len(desc.group(1))>20),canon=bool(canon),hreflang=hl,h1=h1,broken=brk[:5],same_as_en=same,len=len(b))
json.dump({f'{k[0]}|{k[1]}':v for k,v in out.items()},open('pages.json','w'),ensure_ascii=False,indent=1)
miss=[k for k,v in out.items() if v=='MISSING']
print('missing',miss)
for k,v in out.items():
    if v=='MISSING': continue
    if v['broken'] or not v['title'] or not v['desc'] or not v['canon'] or (not v['redirect'] and v['h1']!=1): print(k,{x:v[x] for x in('title','desc','canon','h1','broken','redirect')})
print('--- English-identical share (non-ko/en)')
for pg in PAGES:
    print(pg.ljust(24),' '.join(f"{l}:{out[(l,pg)]['same_as_en'] if out[(l,pg)]!='MISSING' and not out[(l,pg)]['redirect'] else 'r'}" for l in LANGS[2:]))
