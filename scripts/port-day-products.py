"""One-time port of the approved Rondo and Relay mockups into the Day theme sources (kept for provenance).

Writes src/day/{rondo,relay}.{body.html,css,js} and src/day/product.css (the NEVORA product-page subset the mockups were built
on: section bar, chapters, Rondo, FAQ, closing). Relay's mockup waitlist form is replaced by the real waitlist: Contact on the
Relay topic. Ran once on November 20, 2026; src/day/* are the source from then on.
"""
import re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..'))
SRC = os.path.join(REPO, 'docs/design/2026-11-18-premium-software')
OUT = os.path.join(REPO, 'src/day')
if os.path.exists(os.path.join(OUT, 'rondo.body.html')):
    sys.exit('src/day/rondo.body.html exists: this one-time port already ran and src/day is the source now.')
rd = lambda p: open(os.path.join(SRC, p)).read()

def rm_to_media(css):
    """The mockups switched motion off with html.rm; the Day pages use the reduced-motion query."""
    keep, still = [], []
    for line in css.split('\n'):
        if line.startswith('html.rm '): still.append(line[len('html.rm '):])
        else: keep.append(line)
    return '\n'.join(keep) + ('\n@media (prefers-reduced-motion:reduce){' + ''.join(still) + '}\n' if still else '')

# ---- the product-page subset of NEVORA's styles, in the mockups' order
nev = open(os.path.join(OUT, 'nevora.css')).read()
def block(a, b):
    i = nev.index(a); return nev[i:nev.index(b, i)]
product = (block('.gn{position:relative', '/* ---------------- hero: zoom') + block('/* ---------------- chapters', '/* schedule demo')
           + block('/* rondo */', '/* reduced motion */')
           + '.sec[data-flush]{padding-top:0}\n.gn .cta{display:none}\n@media (max-width:820px){.js .gn .mb{margin-left:auto}}\n')
open(os.path.join(OUT, 'product.css'), 'w').write('/* Product pages with a section bar (Rondo, Relay): the subset of NEVORA\'s styles their designs use. Ported from the approved mockups. */\n' + rm_to_media(product))

rep_common = {'{{TRIAL_URL}}': '/pages/contact?interest=nevora-demo', '{{NEVORA_URL}}': '/pages/nevora', '{{CHEV}}': '{{chev}}', '{{CHECK}}': '{{icon:check}}',
              '<div class="ln" id="ln">': '<div class="ln" id="ln" data-bar>', ' style="padding-top:0"': ' data-flush'}
for name, hero, extra in [
    ('rondo', '<section class="rh" aria-labelledby="h1"', {'<a class="cta" href="#close">': '<a class="cta" href="/pages/contact?interest=nevora-demo">'}),
    ('relay', '<section class="xh" aria-labelledby="h1"', {}),
]:
    T = rd(name + '.template.html')
    css = T[T.index('/* Layout:'):T.index('{{SCREEN_CSS}}')]
    open(os.path.join(OUT, name + '.css'), 'w').write(rm_to_media(css))
    body = T[T.index('<div class="ln" id="ln">'):T.index('<div class="atmo"')] + T[T.index('<div class="atmo"'):T.index('</main>')].replace('<main id="top">\n', '')
    body = re.sub(r'\s*<p class="dn">.*?</p>', '', body, flags=re.S)
    body = body.replace(hero, hero.replace('<section ', '<section id="top" '), 1)
    for a, b in {**rep_common, **extra}.items():
        assert a in body or a.startswith('{{') or a == ' style="padding-top:0"', (name, a)
        body = body.replace(a, b)
    if name == 'relay':
        i = body.index('<form class="wl-card"'); j = body.index('</form>', i) + len('</form>')
        body = body[:i] + ('<div class="wl-card wl-go" data-rv><p>One short form on our Contact page: your name, your email and, if you like, your business.'
                           ' We email you when early access opens.</p><a class="pillbtn" href="/pages/contact?interest=relay">Join the waitlist</a></div>') + body[j:]
    body = re.sub(r'<!--[A-Z ]+-->\n?', '', body)
    left = sorted(set(re.findall(r'\{\{(?!I:|SCR_|SB:|NV_|ICON|chev|icon:)[^}]*\}\}', body)))
    assert not left, (name, left)
    open(os.path.join(OUT, name + '.body.html'), 'w').write(body.strip() + '\n')
    js = rd(name + '.js').replace('window.VP', 'window.VD').replace('V.rm()', 'V.still()')
    if name == 'relay':
        js = js[:js.index('  /* Waitlist form')] + '})();\n'
    open(os.path.join(OUT, name + '.js'), 'w').write(js)
    print('ported', name, len(css), len(body), len(js))
