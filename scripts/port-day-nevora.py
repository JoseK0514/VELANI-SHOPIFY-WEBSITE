"""One-time port of the approved NEVORA mockup into the Day theme sources (kept for provenance).

Reads docs/design/2026-11-18-premium-software/{nevora.template.html,nevora.js} and writes
src/day/{nevora.body.html,nevora.css,nevora.js}. Also moves the device frames, plans and app-screen
styles out of src/day/home.css into src/day/devices.css, which Home and NEVORA both load.
Mockup-only parts (design notes, Tweaks, inline styles) are dropped; placeholders become real
routes. Ran once on November 20, 2026; src/day/* are the source from then on.
"""
import re, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..'))
SRC = os.path.join(REPO, 'docs/design/2026-11-18-premium-software')
OUT = os.path.join(REPO, 'src/day')
import sys
if os.path.exists(os.path.join(OUT, 'nevora.body.html')):
    sys.exit('src/day/nevora.body.html exists: this one-time port already ran and src/day is the source now.')
rd = lambda p: open(os.path.join(SRC, p)).read()
N = rd('nevora.template.html')

# ---- split home.css: devices + pricing + screens are shared
home = open(os.path.join(OUT, 'home.css')).read()
def cut(text, a, b):
    i = text.index(a); j = text.index(b, i) if b else len(text)
    return text[:i] + text[j:], text[i:j]
home, devices = cut(home, '/* ---------------- devices', '/* ---------------- hero')
home, pricing = cut(home, '/* ---------------- pricing', '/* ---------------- bilingual')
home, screens = cut(home, '/* ---------------- NEVORA screens', None)
shared_head = home[:home.index('/* ---------------- hero')]
app_font = ':root{--app:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}\n'
assert app_font in shared_head
home = home.replace(app_font, '')
open(os.path.join(OUT, 'home.css'), 'w').write(home)
open(os.path.join(OUT, 'devices.css'), 'w').write(
    '/* Device frames, plan cards and the NEVORA app screens (drawings with sample data), shared by Home and NEVORA. */\n'
    + app_font + devices + pricing + screens)

# ---- NEVORA CSS: everything the page adds (the shared Day rules already cover atmo, reveal, chapters basics)
css = N[N.index('/* Layout: Apple-style product page.'):N.index('{{SCREEN_CSS}}')]
for line in ['.atmo{', '.atmo::after{', '[data-rv]{', 'html.rm [data-rv]{']:
    css = '\n'.join(l for l in css.split('\n') if not l.startswith(line))
css = css.replace('.i{display:block}\n', '')
css += '\n.close .relay .more{font-size:15px;min-height:0}\n.sec[data-flush]{padding-top:0}\n'
assert '{{' not in css
open(os.path.join(OUT, 'nevora.css'), 'w').write('/* NEVORA on the Day design: section bar, zoom hero, highlights, one chapter per job with a working demo. Ported from the approved mockup. */\n' + css)

# ---- body: the section bar goes inside main (the theme layout owns the header)
ln = N[N.index('<div class="ln" id="ln">'):N.index('<div class="atmo"')]
body = ln + N[N.index('<div class="atmo"'):N.index('</main>')].replace('<main id="top">\n', '')
body = re.sub(r'\s*<p class="dn">.*?</p>', '', body, flags=re.S)
rep = {
    '{{TRIAL_URL}}': '/pages/contact?interest=nevora-demo',
    '{{RELAY_URL}}': '/pages/nevora#relay',
    '{{CHEV}}': '{{chev}}', '{{CHECK}}': '{{icon:check}}',
    '<p class="relay">': '<p class="relay" id="relay">',
    '<a class="more" style="font-size:15px;min-height:0" href="/pages/nevora#relay">Join the waitlist{{chev}}</a>':
        '<a class="more" href="/pages/contact?interest=relay">Join the waitlist{{chev}}</a>',
    ' style="padding-top:0"': ' data-flush',
    # the section bar's trial goes where every trial goes
    '<a class="cta" href="#plans">': '<a class="cta" href="/pages/contact?interest=nevora-demo">',
    'Prices may change before online billing opens.': 'Prices are in US dollars and may change before online billing opens.',
}
for a, b in rep.items():
    assert a in body or a.startswith('{{'), a  # placeholders may be absent; wording changes must apply
    body = body.replace(a, b)
body = re.sub(r'<!--[A-Z ]+-->\n?', '', body)
left = sorted(set(re.findall(r'\{\{(?!I:|SCR_|SB:|NV_|ICON|STRIP|chev|icon:)[^}]*\}\}', body)))
assert not left, left
open(os.path.join(OUT, 'nevora.body.html'), 'w').write(body.strip() + '\n')

# ---- script: the shared Day script draws the sky and the reveals; drop those and the Tweaks
js = rd('nevora.js')
js = js[:js.index('  /* ---------------- Tweaks')] + '})();\n'
a = 'function tick(){heroTick();navTick();fanTick();skyTick();rvTick()}'
assert a in js
js = js.replace(a, 'function tick(){heroTick();navTick();fanTick()}')
open(os.path.join(OUT, 'nevora.js'), 'w').write('/* NEVORA on the Day design: zoom hero, section bar, highlights, schedule, team fan, time clock, Rondo, timecards, pay. Ported from the approved mockup. */\n' + js)
print('ported', len(devices + pricing + screens), len(css), len(body), len(js))
