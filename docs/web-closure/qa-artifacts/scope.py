import subprocess,re,sys,json,collections
base,head=sys.argv[1],sys.argv[2]
def git(*a): return subprocess.run(['git']+list(a),capture_output=True,text=True,errors='replace').stdout
rows=[l.split('\t') for l in git('diff','--name-status',base,head).splitlines()]
H=re.compile(r'<header class="(?:site-header gnav|gnav site-header)[\s\S]*?</header>')
F=re.compile(r'<footer[\s\S]*?</footer>')
V=re.compile(r'\?v=[A-Za-z0-9._-]+')
def norm(t):
    t=H.sub('<HDR/>',t); t=F.sub('<FTR/>',t); t=V.sub('?v=',t)
    return re.sub(r'\s+','',t)
cat=collections.Counter(); unexpected=[]; examples=collections.defaultdict(list)
for r in rows:
    st,p=r[0],r[-1]
    if st=='D': cat['deleted']+=1; unexpected.append(('deleted',p)); continue
    if p.startswith('scripts/') or p.endswith(('.css','.mjs')) or (p.endswith('.js') and '/' not in p) or p.startswith('templates/'):
        c='source'
    elif p.startswith('locales/'): c='translation(locales)'
    elif p.startswith('docs/'): c='docs'
    elif p in('sitemap.xml',) or p.endswith('.xml'): c='generated(sitemap)'
    elif p.endswith('.html'):
        if st=='A': c='new page'
        else:
            old=git('show',f'{base}:{p}'); new=git('show',f'{head}:{p}')
            if norm(old)==norm(new): c='html: menu/footer(+css ver) only'
            else:
                c='html: BODY CHANGED'; unexpected.append(('body',p))
    elif p.endswith('.json'): c='generated(json)'
    else: c='other'
    cat[c]+=1; 
    if len(examples[c])<3: examples[c].append(p)
print(f'== {base[:7]}..{head[:7]}: {len(rows)} files')
for k,v in cat.most_common(): print(f'{v:6d}  {k}   e.g. {examples[k][:2]}')
print('unexpected/body-changed count',len(unexpected))
json.dump(unexpected,open(f'/tmp/claude-0/-home-claude/6c729d68-f9d7-571d-9221-b0a50736d560/scratchpad/qa/unexpected-{head[:7]}.json','w'),indent=0)
