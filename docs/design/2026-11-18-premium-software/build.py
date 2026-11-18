"""Assemble the self-contained mockup: python3 build.py <scratch-dir-with-b64-assets>"""
import re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '../../..'))
B64 = sys.argv[1]
t = open(os.path.join(HERE, 'home.template.html')).read()
css = open(os.path.join(HERE, 'screens.css')).read()
parts = dict(re.findall(r'<!--@(\w+)-->\n(.*?)(?=\n<!--@|\Z)', open(os.path.join(HERE, 'screens.html')).read(), re.S))
svg = open(os.path.join(REPO, 'src/brand/velani-wordmark.svg')).read().replace('\n', '')
svg = re.sub(r'fill="#[0-9a-fA-F]+"', 'fill="currentColor"', svg, count=1)
WIFI = '<svg class="wifi" viewBox="0 0 17 12" aria-hidden="true"><path fill="currentColor" d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.2 10.2 0 0 0 8.5.7 10.2 10.2 0 0 0 1 3.7l1.2 1.2a8.6 8.6 0 0 1 6.3-2.5Zm0 3.3c1.5 0 2.8.5 3.9 1.5l1.2-1.2a7.3 7.3 0 0 0-10.2 0l1.2 1.2c1-1 2.4-1.5 3.9-1.5Zm0 3.3c.7 0 1.2.2 1.7.6L8.5 11.3 6.8 9.6c.5-.4 1-.6 1.7-.6Z"/></svg>'
def sb(m):
    return f'<div class="sb"><span>{m.group(1)}</span><span class="sbi"><span class="bars"><i></i><i></i><i></i><i></i></span>{WIFI}<span class="bat"><i></i></span></span></div>'
for k, v in parts.items():
    t = t.replace('{{' + k + '}}', v.strip())
t = t.replace('{{SCREEN_CSS}}', css)
t = re.sub(r'\{\{SB:([0-9:]+)\}\}', sb, t)
CHEV = '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK = '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>'
STRIP = ''.join(f'<span>{d}</span>' for d in range(10)) + '<span></span>'
rep = {
  '{{VELANI}}': svg.replace('<svg ', '<svg class="wm" role="img" aria-label="Velani" ', 1),
  '{{CHEV}}': CHEV, '{{CHECK}}': CHECK, '{{STRIP}}': STRIP,
  '{{NV_WHITE}}': 'data:image/png;base64,' + open(os.path.join(B64, 'nv-white.b64')).read(),
  '{{NV_INK}}': 'data:image/png;base64,' + open(os.path.join(B64, 'nv-ink.b64')).read(),
  '{{ICON}}': 'data:image/png;base64,' + open(os.path.join(B64, 'icon.b64')).read(),
}
for k, v in rep.items():
    t = t.replace(k, v)
left = re.findall(r'\{\{[A-Z_:0-9]+\}\}', t)
assert not left, left
open(os.path.join(HERE, 'velani-premium-home.html'), 'w').write(t)
print('ok', len(t))
