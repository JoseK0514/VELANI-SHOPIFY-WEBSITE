"""One-time port of the approved Help mockup into the Day theme sources (kept for provenance).

Reads docs/design/2026-11-18-premium-software/{help.template.html,help.js} and writes src/day/{help.body.html,help.css,help.js}.
Real routes replace placeholders; the trial wording follows Jose's provisioning fact; <!--client--> marks where render.mjs
puts Jose's client request section (inside a closed "Already a Velani client?" disclosure). Ran once on November 20, 2026.
"""
import re, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..'))
SRC = os.path.join(REPO, 'docs/design/2026-11-18-premium-software')
OUT = os.path.join(REPO, 'src/day')
import sys
if os.path.exists(os.path.join(OUT, 'help.body.html')):
    sys.exit('src/day/help.body.html exists: this one-time port already ran and src/day is the source now.')
T = open(os.path.join(SRC, 'help.template.html')).read()

css = T[T.index('/* Layout: one question first'):T.index('[hidden]{display:none!important}')]
css = '\n'.join(l for l in css.split('\n') if not l.startswith('html.rm [data-rv]'))
css = css.replace('html.rm ', 'html.still ')
css = re.sub(r'\.i(?![\w-])', '.dic', css)  # Day icons are .dic
css += ('\n/* existing clients: one quiet line that opens Jose\'s client request form */\n'
        '.clientd{max-width:860px;margin:0 auto;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}\n'
        '.clientd>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px 0;min-height:44px;font:600 clamp(17px,1.5vw,19px)/1.35 var(--display);letter-spacing:-.015em}\n'
        '.clientd>summary::-webkit-details-marker{display:none}\n'
        '.clientd>summary .dic{width:20px;height:20px;color:var(--ink-2);transition:transform .35s var(--ease)}\n'
        '.clientd[open]>summary .dic{transform:rotate(180deg)}\n'
        '.clientd>summary span span{display:block;font:400 15.5px/1.45 var(--text);color:var(--ink-2);margin-top:2px}\n'
        '.client{padding:8px 0 32px}\n.client-grid{display:grid;gap:20px}\n.client-side h2{font-size:clamp(24px,2.4vw,30px);letter-spacing:-.03em}\n'
        '.client-side .lede{margin-top:8px;color:var(--ink-2)}\n.client-form{border-radius:28px;padding:clamp(20px,3vw,32px);background:rgba(255,255,255,.82);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),0 40px 80px -60px rgba(16,24,40,.4)}\n'
        '.client-note{margin:0;font-size:14px;line-height:1.45;color:var(--ink-2);max-width:40ch}\n.client-note a{color:var(--link);text-decoration:underline}\n'
        '.hub-test,.hub-off{margin:0 0 16px;padding:12px 14px;border-radius:14px;background:#FBEFE3;color:#7A3D00;font-size:14.5px}\n.hub-mail{font-weight:600;margin-top:6px}\n'
        '.sent-ref{margin:16px auto 0;display:grid;justify-items:center;gap:6px}\n.sent-ref-k{font-size:13.5px;color:var(--ink-2)}\n.sent-ref-v{font:600 20px/1.2 var(--display);letter-spacing:.02em}\n'
        '.sent-copy{all:unset;cursor:pointer;min-height:44px;padding:0 18px;border-radius:22px;background:#fff;box-shadow:inset 0 0 0 1px var(--ink-3);font-size:14px;font-weight:600;display:inline-flex;align-items:center}\n'
        '.sent-copy:focus-visible{outline:2px solid var(--link);outline-offset:3px}\n')
open(os.path.join(OUT, 'help.css'), 'w').write('/* Help on the Day design: search and topic chips over the answers, two different keys, deleting an account, existing clients and a person at the end. Ported from the approved mockup. */\n' + css)

body = T[T.index('<div class="atmo"'):T.index('</main>')].replace('<main id="top">\n', '')
body = re.sub(r'\s*<p class="dn">.*?</p>', '', body, flags=re.S)
rep = {
    '{{CONTACT_URL}}': '/pages/contact', '{{TRIAL_URL}}': '/pages/contact?interest=nevora-demo', '{{CHEV}}': '{{chev}}',
    '<p>Request a free trial. Online signup isn’t open yet: Jose from Velani replies within two business days and sets up your workplace with you. Your 30 free days start the day your workplace is ready, and no card is needed.</p>':
        '<p>Request a free trial. Online signup isn’t open yet: Jose from Velani replies within two business days and sets up your workplace with you. Your 30 free days start when your workplace is created in NEVORA, and no card is needed.</p>',
    'No app? Sign in on the web at your workplace’s address and do the same. <a href="#delete">See the four steps</a>.':
        'No app? Sign in on the web at your workplace’s address and do the same. <a href="#delete">See the four steps</a> or <a href="/pages/nevora-account-deletion">the full account deletion page</a>.',
    '<div class="acts"><a class="pillbtn" href="/pages/contact">Contact us</a><a class="more" href="/pages/contact?interest=nevora-demo">Request a free trial{{chev}}</a></div>':
        '<div class="acts"><a class="pillbtn" href="/pages/contact">Contact us</a><a class="more" href="/pages/nevora-support">NEVORA support{{chev}}</a></div>',
    '<section class="close" id="close"': '<section class="sec client-s" aria-label="Velani clients" data-sky="noon"><div class="wrap"><!--client--></div></section>\n\n<section class="close" id="close"',
}
for a, b in rep.items():
    assert a in body or a.startswith('{{'), a
    body = body.replace(a, b)
body = body.replace('{{I:', '{{icon:')
body = re.sub(r'<!--[A-Z0-9 ]+-->\n?', '', body)
left = sorted(set(re.findall(r'\{\{(?!icon:|chev|NV_)[^}]*\}\}', body)))
assert not left, left
open(os.path.join(OUT, 'help.body.html'), 'w').write(body.strip() + '\n')

js = open(os.path.join(SRC, 'help.js')).read().replace('var V=window.VP', 'var V=window.VD').replace('V.rm()', 'V.still()')
js = js.replace('})();\n', '''
  /* Existing clients: a link to #client (or ?interest=client-…) opens the request form */
  var cd=$('#client-d');
  if(cd&&(/^#client/.test(location.hash)||/[?&]interest=client-/.test(location.search))){cd.open=true;setTimeout(function(){cd.scrollIntoView({block:'start'})},0)}
})();
''', 1)
open(os.path.join(OUT, 'help.js'), 'w').write('/* Help on the Day design: search and chips filter the answers, the PIN fills in, copy the address, open the client form from a link. */\n' + js)
print('ported', len(css), len(body), len(js))
