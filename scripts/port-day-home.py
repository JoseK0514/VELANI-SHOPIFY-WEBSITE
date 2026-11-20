"""One-time port of the approved Home mockup into the Day theme sources (kept for provenance).

Reads docs/design/2026-11-18-premium-software/{home.template.html,screens.html,screens.css}
and writes src/day/{home.body.html,home.css,home.js,screens.html}. Mockup-only parts (design
notes, Tweaks, inline styles) are dropped; placeholders become real routes and theme assets.

Ran once on November 20, 2026. src/day/home.* and screens.html are now the source and have been
edited since (accessibility and theme-check fixes): do not run this again over them.
"""
import re, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..'))
SRC = os.path.join(REPO, 'docs/design/2026-11-18-premium-software')
OUT = os.path.join(REPO, 'src/day')
rd = lambda p: open(os.path.join(SRC, p)).read()
T = rd('home.template.html')

def between(a, b):
    i = T.index(a); return T[i:T.index(b, i)]

# ---- CSS: devices .. bilingual, plus the reduced-motion block, plus the NEVORA screens
css = between('/* ---------------- devices', '/* ---------------- footer')
css += between('/* ---------------- reduced motion', '{{SCREEN_CSS}}')
css = re.sub(r'html\.dm[^{]*\{[^}]*\}\n?', '', css)
screens_css = rd('screens.css')
assert '{{' not in css + screens_css
head = ('/* Home on the Day design: devices, hero, the day, Rondo, product tiles, how starting works, plans, bilingual.\n'
        '   Ported from the approved mockup by scripts/port-day-home.py. The app screens are drawings of NEVORA with sample data. */\n'
        ':root{--app:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}\n'
        '.gn{transition:background-color .5s var(--ease),color .5s var(--ease)}\n'
        '.gn.dark{background:rgba(10,16,36,.62);color:#F5F5F7}\n'
        '.chev{display:inline-block;width:.55em;height:.55em;margin-left:.25em;vertical-align:.02em}\n'
        '.track{list-style:none;padding-right:0}\n.sj .big .es{color:inherit;display:block}\n')
open(os.path.join(OUT, 'home.css'), 'w').write(head + css + '\n/* ---------------- NEVORA screens ---------------- */\n' + screens_css)

# ---- body
body = between('<!-- HERO -->', '</main>')
body = re.sub(r'\s*<p class="dn">.*?</p>', '', body, flags=re.S)
rep = {
    '{{TRIAL_URL}}': '/pages/contact?interest=nevora-demo',
    '{{RONDO_URL}}': '/pages/nevora#rondo', '{{RELAY_URL}}': '/pages/nevora#relay',
    'https://claude.ai/artifact/Q2eKrGUyxAtdXzniZrtT13': '/pages/nevora',
    '{{CHEV}}': '{{chev}}', '{{CHECK}}': '{{icon:check}}',
    ' style="list-style:none;padding-right:0"': '',
    '<span lang="es" style="color:inherit;display:block">': '<span lang="es" class="es">',
    # Jose's current facts (development 5d2e545 and the Plans page)
    '<p>Jose sets up your workplace with you, then your team gets their accounts.</p>':
        '<p>Jose sets up your workplace with you. Your 30 days start when it’s created in NEVORA.</p>',
    '<p class="fine">On day 30 the Owner picks a plan; nothing is charged until then. Prices may change before online billing opens. NEVORA calculates pay; it doesn\'t pay employees or file payroll taxes.</p>':
        '<p class="fine">On day 30 the Owner picks a plan in NEVORA; nothing is charged until then. Prices are in US dollars and may change before online billing opens. NEVORA calculates pay; it doesn’t pay employees or file payroll taxes.</p>',
}
for a, b in rep.items():
    assert a in body, a
    body = body.replace(a, b)
body = body.replace('<!-- ', '<!--').replace('<!--HERO -->', '')
body = re.sub(r'<!--[A-Z ]+-->\n?', '', body)
open(os.path.join(OUT, 'home.body.html'), 'w').write(body.strip() + '\n')

# ---- screens: copied as-is; day.mjs fills their placeholders
open(os.path.join(OUT, 'screens.html'), 'w').write(rd('screens.html'))

# ---- script: everything but the Tweaks panel
js = T[T.index('<script>\n(function(){', T.index('</main>')) + len('<script>\n'):T.rindex('</script>')]
js = js[:js.index('  /* ---------------- Tweaks')] + '})();\n'
js = '/* Home on the Day design: time-of-day hero, the pinned day, Rondo conversation, start track. Ported from the approved mockup. */\n' + js
open(os.path.join(OUT, 'home.js'), 'w').write(js)
print('ported', len(css), len(body), len(js))
