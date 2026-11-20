"""Assemble the self-contained mockups: python3 build.py <dir-with-b64-assets>

Builds velani-premium-home.html (home.template.html) and velani-nevora.html
(nevora.template.html). The NEVORA page reuses the home page's base, pricing,
Rondo, footer and Tweaks CSS, so both pages share one source of truth.
"""
import re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '../../..'))
B64 = sys.argv[1]
rd = lambda p: open(os.path.join(HERE, p)).read()
HOME = rd('home.template.html')
CSS = rd('screens.css')
PARTS = dict(re.findall(r'<!--@(\w+)-->\n(.*?)(?=\n<!--@|\Z)', rd('screens.html'), re.S))
svg = open(os.path.join(REPO, 'src/brand/velani-wordmark.svg')).read().replace('\n', '')
svg = re.sub(r'fill="#[0-9a-fA-F]+"', 'fill="currentColor"', svg, count=1)
WIFI = '<svg class="wifi" viewBox="0 0 17 12" aria-hidden="true"><path fill="currentColor" d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.2 10.2 0 0 0 8.5.7 10.2 10.2 0 0 0 1 3.7l1.2 1.2a8.6 8.6 0 0 1 6.3-2.5Zm0 3.3c1.5 0 2.8.5 3.9 1.5l1.2-1.2a7.3 7.3 0 0 0-10.2 0l1.2 1.2c1-1 2.4-1.5 3.9-1.5Zm0 3.3c.7 0 1.2.2 1.7.6L8.5 11.3 6.8 9.6c.5-.4 1-.6 1.7-.6Z"/></svg>'
CHEV = '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK = '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>'
STRIP = ''.join(f'<span>{d}</span>' for d in range(10)) + '<span></span>'
PH = os.path.join(REPO, 'node_modules/@phosphor-icons/core/assets/bold')

def make_grain():
    """A 128px tile of faint noise that hides banding in large gradients."""
    import io, random, base64
    from PIL import Image
    random.seed(7)
    im = Image.new('RGBA', (128, 128))
    im.putdata([(v, v, v, 9) for v in (random.choice((0, 255)) for _ in range(128 * 128))])
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return base64.b64encode(b.getvalue()).decode()
GRAIN = make_grain()

def block(start, end):
    a = HOME.index(start); b = HOME.index(end, a)
    return HOME[a:b]

SHARED_CSS = '\n'.join([
    HOME[HOME.index('<style>') + len('<style>'):HOME.index('/* ---------------- hero')],
    block('/* ---------------- Rondo', '/* ---------------- product tiles'),
    block('/* ---------------- pricing', '/* ---------------- bilingual'),
    block('/* ---------------- footer', '/* ---------------- notes + tweaks'),
    block('/* ---------------- notes + tweaks', '/* ---------------- reduced motion'),
])

def sb(m):
    return f'<div class="sb"><span>{m.group(1)}</span><span class="sbi"><span class="bars"><i></i><i></i><i></i><i></i></span>{WIFI}<span class="bat"><i></i></span></span></div>'

def render(t, extra=None):
    for k, v in (extra or {}).items():
        t = t.replace(k, v)
    for k, v in PARTS.items():
        t = t.replace('{{' + k + '}}', v.strip())
    t = t.replace('{{SCREEN_CSS}}', CSS)
    t = re.sub(r'\{\{SB:([0-9:]+)\}\}', sb, t)
    syms = []
    for n in sorted(set(re.findall(r'\{\{I:([a-z-]+)\}\}', t))):
        inner = re.search(r'<svg[^>]*>(.*)</svg>', open(os.path.join(PH, n + '-bold.svg')).read(), re.S).group(1)
        syms.append(f'<symbol id="i-{n}" viewBox="0 0 256 256">{inner}</symbol>')
    sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ''.join(syms) + '</svg>'
    t = re.sub(r'\{\{I:([a-z-]+)\}\}', lambda m: f'<svg class="i" aria-hidden="true"><use href="#i-{m.group(1)}"/></svg>', t)
    t = t.replace('<header class="gn"', sprite + '\n<header class="gn"', 1)
    rep = {
      '{{GRAIN}}': 'data:image/png;base64,' + GRAIN,
      '{{VELANI}}': svg.replace('<svg ', '<svg class="wm" role="img" aria-label="Velani" ', 1),
      '{{CHEV}}': CHEV, '{{CHECK}}': CHECK, '{{STRIP}}': STRIP,
      '{{NV_WHITE}}': 'data:image/png;base64,' + open(os.path.join(B64, 'nv-white.b64')).read(),
      '{{NV_INK}}': 'data:image/png;base64,' + open(os.path.join(B64, 'nv-ink.b64')).read(),
      '{{ICON}}': 'data:image/png;base64,' + open(os.path.join(B64, 'icon.b64')).read(),
    }
    for k, v in rep.items():
        t = t.replace(k, v)
    left = re.findall(r'\{\{[A-Z_:0-9a-z-]+\}\}', t)
    assert not left, left
    return t

NV = rd('nevora.template.html')
def nblock(start, end):
    a = NV.index(start); return NV[a:NV.index(end, a)]
PRODUCT_CSS = '\n'.join([
    nblock('.gn{position:relative', '/* ---------------- hero: zoom'),
    nblock('/* ---------------- chapters', '/* schedule demo'),
    nblock('/* rondo */', '/* reduced motion */'),
])
FOOTER = NV[NV.index('<footer class="ft"'):NV.index('<script>')].strip()
URLS = {
    '{{HOME_URL}}': 'https://claude.ai/artifact/UJJ24djMRv8NiskiGmx2PA',
    '{{NEVORA_URL}}': 'https://claude.ai/artifact/Q2eKrGUyxAtdXzniZrtT13',
    '{{RONDO_URL}}': os.environ.get('RONDO_URL', 'https://claude.ai/artifact/EZNKQDGCQPJ9Pg2kdndHL9'),
    '{{RELAY_URL}}': os.environ.get('RELAY_URL', 'https://claude.ai/artifact/VDE3KAXUcc3NWqNigGGfBa'),
}
def product(js):
    d = {'{{SHARED_CSS}}': SHARED_CSS, '{{PRODUCT_CSS}}': PRODUCT_CSS, '{{FOOTER}}': FOOTER,
         '{{PRODUCT_JS}}': rd('product.js'), '{{PAGE_JS}}': rd(js)}
    d.update(URLS); return d

for src, out, extra in [
    ('home.template.html', 'velani-premium-home.html', dict(URLS)),
    ('nevora.template.html', 'velani-nevora.html', dict(URLS, **{'{{SHARED_CSS}}': SHARED_CSS, '{{NEVORA_JS}}': rd('nevora.js')})),
    ('rondo.template.html', 'velani-rondo.html', product('rondo.js')),
    ('relay.template.html', 'velani-relay.html', product('relay.js')),
]:
    html = render(rd(src), extra)
    open(os.path.join(HERE, out), 'w').write(html)
    print('ok', out, len(html))
