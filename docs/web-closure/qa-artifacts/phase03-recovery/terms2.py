import re, glob, os, sys, json, collections, html

ROOT = '/home/claude/newonapp/newon-site'
os.chdir(ROOT)
TERMS = {
    'ko': {
        '외주': r'외주',
        '개발 대행/제작 대행': r'(개발|제작|홈페이지)\s*대행|대행\s*(개발|제작)',
        '견적': r'견적',
        '납품': r'납품',
        '맞춤 제작/맞춤 앱': r'맞춤\s*(제작|앱|웹|개발)|고객(사|별)\s*맞춤',
        '시작가/starting price': r'시작가|부터\s*시작|₩\s?[\d,]+\s*~|\d[\d,]*\s*원\s*~|Starting',
        '제작 의뢰/의뢰': r'제작\s*의뢰|의뢰',
        '개발 용역': r'용역',
        '프로젝트 문의/상담': r'프로젝트\s*(문의|상담)',
        '홈페이지 제작': r'홈페이지\s*제작|웹사이트\s*제작|앱\s*제작|웹\s*제작',
    },
    'en': {
        'outsourc': r'outsourc',
        'dev agency/for hire': r'(development|dev)\s+(agency|service)|for hire|we build (it )?for you',
        'quote/estimate': r'\bquot(e|es|ation)\b|\bestimate\b',
        'deliver/handoff': r'\bdeliver(y|ables|ed)\b|hand\s?off|hand off',
        'custom dev': r'custom\s+(app|web|website|software|development|product|build)|client\s+project|client work',
        'starting price': r'starting\s+(at|from|price|engagement)|from\s+[$₩]\s?[\d,]+|[$₩]\s?[\d,]+\s*\+',
        'commission/request': r'commission|build request|project request',
        'project inquiry': r'project\s+(inquiry|consultation)|start a project',
    },
}


def text_of(path):
    t = open(path, encoding='utf8', errors='ignore').read()
    m = re.search(r'<main[\s\S]*?</main>', t)
    body = m.group(0) if m else t
    body = re.sub(r'<aside class="bm-notice[\s\S]*?</aside>', ' ', body)
    body = re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>', ' ', body)
    meta = ' '.join(re.findall(r'<title>([^<]*)|name="description" content="([^"]*)"', t) and [x for tup in re.findall(r'<title>([^<]*)|name="description" content="([^"]*)"', t) for x in tup])
    body = re.sub(r'<[^>]+>', ' ', body)
    return html.unescape(re.sub(r'\s+', ' ', body + ' ' + meta))


def scan(lang):
    res = {}
    pats = {k: re.compile(v, re.I) for k, v in TERMS[lang].items()}
    for f in sorted(glob.glob(f'{lang}/business/**/index.html', recursive=True) + glob.glob(f'{lang}/studio/**/index.html', recursive=True) + [f'{lang}/business-hub/index.html', f'{lang}/tools/index.html', f'{lang}/resources/insights/index.html', f'{lang}/ai/enterprise/index.html']):
        if not os.path.exists(f):
            continue
        t = text_of(f)
        if len(t) < 400 and 'Redirect' in t:
            continue
        c = {k: len(p.findall(t)) for k, p in pats.items()}
        c = {k: v for k, v in c.items() if v}
        if c:
            res[f] = c
    return res


if __name__ == '__main__':
    out = {}
    for lang in ('ko', 'en'):
        r = scan(lang)
        out[lang] = r
        tot = collections.Counter()
        for f, c in r.items():
            tot.update(c)
        print(f'== {lang}: pages with hits {len(r)}; term totals {dict(tot)}')
        bydir = collections.Counter()
        for f in r:
            parts = f.split('/')
            bydir['/'.join(parts[1:3]) if len(parts) > 2 else parts[1]] += 1
        print('  ', dict(sorted(bydir.items())))
    json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/terms.json', 'w'), ensure_ascii=False, indent=1)
