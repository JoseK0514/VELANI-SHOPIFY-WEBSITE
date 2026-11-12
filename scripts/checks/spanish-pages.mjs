// Spanish pages (2026-11-05): the five /pages/es* routes on the local preview, Chromium and WebKit at 1440, 834 and 390.
// Language and layout, the header/phone menu/footer/cookie dialog in Spanish, the EN↔ES switch on all five pairs, the contact
// variants and errors and the preview "sent" panel per topic, the time clock starting in Spanish, Rondo opening in Spanish
// (stand-in API and Turnstile; nothing leaves the machine), keyboard, focus and reduced motion. Screenshots and a dump of
// every Spanish page's visible text go to evidence/spanish-pages-2026-11-05/.
// Usage: PLAYWRIGHT_FROM=/path/with/playwright node scripts/checks/spanish-pages.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const pw = process.env.PLAYWRIGHT_FROM ? createRequire(process.env.PLAYWRIGHT_FROM + '/package.json')('playwright') : await import('@playwright/test');
const API = 'https://velani-ai.test', PORT = 4207, base = `http://127.0.0.1:${PORT}`, out = 'evidence/spanish-pages-2026-11-05'; await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(PORT)], { env: { ...process.env, VELANI_ASSISTANT_API: API }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(r => server.stdout.once('data', r));
const results = []; let fails = 0; const ok = (c, m) => { results.push((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAIRS = [['/', '/pages/es'], ['/pages/nevora', '/pages/es-nevora'], ['/pages/plans', '/pages/es-planes'], ['/pages/products', '/pages/es-productos'], ['/pages/contact', '/pages/es-contacto']];
const ES = PAIRS.map(p => p[1]);
// English UI words that must not show in the Spanish chrome or form (product names, Legal and Marketing are the same in Spanish)
const DENY = /\b(Products|Websites|Custom apps|Plans|Support|About|Contact|Request free|Start a project|Skip to content|Main menu|Name|Email|Company|optional|Topic|Team size|Number of locations|Something else|Cookie choices|Necessary|Preferences|Analytics|Sale or sharing|Always on|Reject all|Accept all|Save choices|All rights reserved|Client support|Monday|Language|Check draft|Privacy notice|Back to home|Message sent|In development|Coming soon|Scheduling|Time clock|Enter your PIN|Ask Rondo)\b/;
const TURNSTILE = `window.turnstile={render(sel,o){window.__ts=o;setTimeout(()=>o.callback('tok-'+Math.random()),50);return 'w1'},reset(){const o=window.__ts;setTimeout(()=>o.callback('tok-'+Math.random()),50)}};`;
function backend(ctx, log) {
 return ctx.route(API + '/**', async route => {
  const req = route.request(), url = new URL(req.url()), m = req.method();
  const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': base }, body: JSON.stringify(body) });
  if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base, 'access-control-allow-headers': 'content-type,authorization', 'access-control-allow-methods': 'GET,POST,DELETE' } });
  if (url.pathname === '/v1/config') return json(200, { assistantName: 'Rondo', requireCaptcha: true, turnstileSiteKey: 'k' });
  const body = req.postDataJSON?.() ?? null; log.push({ path: url.pathname, body });
  if (url.pathname === '/v1/sessions') return json(201, { sessionToken: 's1', sessionId: 'id1', expiresAt: new Date(Date.now() + 3600e3).toISOString() });
  if (url.pathname === '/v1/session' && m === 'DELETE') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base } });
  if (url.pathname === '/v1/chat') return json(200, { message: 'Respuesta de prueba.', sources: [], action: /registro/.test(body.message) ? 'show_demo' : 'lead_form', confidence: 'grounded', model: 'test' });
  return json(404, { error: { code: 'not_found', message: 'x' } });
 });
}
const visible = (p, sel) => p.evaluate(s => { const el = document.querySelector(s); if (!el) return false; const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 0 && r.height > 0; }, sel);
// Geometry sweep from fixes-2026-11-05b: panel text never overlaps a panel visual; plus sibling text blocks in the same container
const overlaps = p => p.evaluate(() => {
 const res = [], box = el => el.getBoundingClientRect(), shown = el => { const s = getComputedStyle(el), r = box(el); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
 const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
 for (const panel of document.querySelectorAll('.hpanel')) {
  const vis = [...panel.querySelectorAll('.hshot,.hwin,.hchat,.rcard,.hduo,.hweb')].filter(shown);
  const txt = [...panel.querySelectorAll('.hcopy h1,.hcopy h2,.hcopy p,.hcopy a')].filter(shown);
  for (const v of vis) for (const t of txt) if (hit(box(v), box(t))) res.push(panel.id + ' ' + v.className.split(' ')[0] + '×' + t.tagName);
 }
 for (const group of document.querySelectorAll('.hcopy,.head,.rail,.feat,.spec,.checks,.acts,.hacts,.gnav-in,.lnav-in,.foot-links,.foot-nav,.cform,.rondo-copy')) {
  if (!shown(group)) continue;
  const kids = [...group.children].filter(shown);
  for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) if (hit(box(kids[i]), box(kids[j])) && !kids[i].contains(kids[j]) && !kids[j].contains(kids[i])) res.push((group.id || group.className.split(' ')[0]) + ': ' + kids[i].tagName + '.' + kids[i].className.split(' ')[0] + '×' + kids[j].tagName + '.' + kids[j].className.split(' ')[0]);
 }
 return res;
});
const textDump = []; const dump = (title, s) => textDump.push('=== ' + title + '\n' + s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n');
try {
 for (const engine of ['chromium', 'webkit']) {
  const b = await pw[engine].launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 834, h: 1112 }, { w: 390, h: 844, m: true }]) {
   const tag = engine + ' ' + vp.w;
   const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m });
   await ctx.route('https://challenges.cloudflare.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: TURNSTILE }));
   const log = []; await backend(ctx, log);
   const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
   // ---------- every Spanish page: lang, overflow, overlap, screenshots, text ----------
   for (const path of ES) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    const s = await p.evaluate(() => ({ lang: document.documentElement.lang, over: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('main h1:not([hidden] h1)').length, title: document.title }));
    ok(s.lang === 'es' && s.over <= 0, `${tag} ${path}: lang=es, no horizontal overflow (${s.over}px)`);
    // Scroll through so every reveal has run, then measure the settled page
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await sleep(700);
    const hits = await overlaps(p);
    ok(hits.length === 0, `${tag} ${path}: no text/visual or text/text overlap (${hits.slice(0, 5).join(', ') || 'none'})`);
    const over2 = await p.evaluate(() => [...document.querySelectorAll('main *,header *,footer *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.hph,.foot-glow,.hdawn,.gnav-ddmenu,.lnav-vmenu,[data-scroll-x],.zoom,.hshot,.hwin,.hweb,.hduo,.slab,.pin'); }).slice(0, 5).map(el => el.tagName + '.' + el.className));
    ok(over2.length === 0, `${tag} ${path}: no element runs past the right edge (${over2.join(', ') || 'none'})`);
    if (vp.w === 1440 || vp.w === 390) await p.screenshot({ path: `${out}/${engine}-${vp.w}${path.replace(/\//g, '_')}.png`, fullPage: true });
    if (engine === 'chromium' && vp.w === 1440) dump(path + ' (title: ' + s.title + ')', await p.evaluate(() => [document.querySelector('header')?.innerText, document.querySelector('.lnav')?.innerText, document.querySelector('main').innerText, document.querySelector('footer').innerText].filter(Boolean).join('\n\n')));
   }
   // ---------- header, Products menu, phone menu, footer, cookie dialog ----------
   await p.goto(base + '/pages/es', { waitUntil: 'networkidle' });
   if (!vp.m) {
    const head = await p.innerText('#gnav');
    ok(!DENY.test(head) && /Productos/.test(head) && /Planes/.test(head) && /Prueba gratis/.test(head), `${tag}: header in Spanish (${head.replace(/\s+/g, ' ').slice(0, 90)})`);
    await p.hover('.gnav-ddlink'); await sleep(300);
    const dd = await p.evaluate(() => { const c = [...document.querySelectorAll('.gnav-ddmenu .nav-soon')].map(x => ({ t: x.textContent, wraps: x.getBoundingClientRect().height > 24 })); return { text: document.querySelector('.gnav-ddmenu').innerText, c, label: document.querySelector('.gnav-ddbtn').getAttribute('aria-label'), exp: document.querySelector('.gnav-ddbtn').getAttribute('aria-expanded') }; });
    ok(dd.exp === 'true' && dd.label === 'Menú de productos' && !DENY.test(dd.text) && dd.c.map(x => x.t).join('|') === 'En desarrollo|Próximamente' && dd.c.every(x => !x.wraps), `${tag}: Products menu opens on hover, Spanish names, descriptions and status chips`);
    await p.keyboard.press('Escape'); await sleep(250);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'false', `${tag}: Escape closes the Products menu`);
    await p.mouse.move(5, vp.h - 5); await sleep(200);
   } else {
    await p.click('#gmenu-btn'); await sleep(300);
    const m = await p.evaluate(() => ({ text: document.getElementById('gmenu').innerText, label: document.getElementById('gmenu-btn').getAttribute('aria-label'), inert: document.querySelector('main').inert && document.querySelector('footer').inert, sw: !!document.querySelector('#gmenu .lang-sw a[aria-current][lang=es]') }));
    ok(!DENY.test(m.text) && /Contacto/.test(m.text) && /Pide la prueba gratis de NEVORA/.test(m.text) && /lunes a viernes/.test(m.text), `${tag}: phone menu in Spanish`);
    ok(m.label === 'Cerrar menú' && m.inert && m.sw, `${tag}: phone menu says Cerrar menú, the page behind is inert, the switch is in the menu with ES current`);
    await p.keyboard.press('Escape'); await sleep(200);
    ok(await p.evaluate(() => document.activeElement.id === 'gmenu-btn' && document.getElementById('gmenu').hidden && document.getElementById('gmenu-btn').getAttribute('aria-label') === 'Menú' && !document.querySelector('main').inert), `${tag}: Escape closes the phone menu, focus returns to Menú`);
   }
   // Keyboard: the first Tab reaches the Spanish skip link
   // (WebKit, like Safari, moves Tab between links only with Option held)
   await p.goto(base + '/pages/es-planes', { waitUntil: 'networkidle' }); await p.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab');
   ok(await p.evaluate(() => document.activeElement.classList.contains('skip') && document.activeElement.textContent === 'Saltar al contenido'), `${tag}: first Tab lands on "Saltar al contenido"`);
   const foot = await p.innerText('footer');
   ok(!DENY.test(foot) && /Todos los derechos reservados/.test(foot) && /Opciones de cookies/.test(foot) && /en inglés/.test(foot), `${tag}: footer in Spanish, notes that legal pages are in English`);
   await p.locator('.foot [data-cookie-open]').click(); await sleep(400);
   const dlg = await p.evaluate(() => ({ text: document.getElementById('cookie-dialog').innerText, n: document.querySelectorAll('#cookie-dialog [data-consent]').length, open: document.getElementById('cookie-dialog').open }));
   ok(dlg.open && dlg.n === 4 && !DENY.test(dlg.text) && /Necesarias/.test(dlg.text) && /Preferencias/.test(dlg.text) && /Analítica/.test(dlg.text) && /Marketing/.test(dlg.text) && /Venta o intercambio de datos/.test(dlg.text) && /Vista previa local/.test(dlg.text), `${tag}: cookie dialog in Spanish with the four purposes`);
   if (engine === 'chromium' && vp.w === 1440) dump('cookie dialog', dlg.text);
   await p.click('[data-cookie-save]'); await sleep(300);
   ok(/Opciones de vista previa actualizadas/.test(await p.innerText('#cookie-dialog .consent-status')), `${tag}: saving choices reports in Spanish`);
   await p.keyboard.press('Escape'); await sleep(200);
   ok(await p.evaluate(() => !document.getElementById('cookie-dialog').open && document.activeElement.matches('[data-cookie-open]')), `${tag}: Escape closes the cookie dialog and returns focus`);
   // ---------- language switch round trip, all five pairs ----------
   for (const [en, es] of PAIRS) {
    await p.goto(base + en, { waitUntil: 'networkidle' });
    const where = await p.evaluate(m => { const vis = s => { const el = document.querySelector(s); return el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none'; }; return !m && vis('.lnav-lang') ? '.lnav-lang' : !m && vis('.gnav-lang') ? '.gnav-lang' : '.foot-lang'; }, !!vp.m);
    const enCur = await p.getAttribute(where + ' a[lang=en]', 'aria-current');
    // Lazy images above the footer load as it comes into view and push it down: let the page settle before clicking
    const settle = async () => { if (where !== '.foot-lang') return; let h = 0; for (let i = 0; i < 20; i++) { await p.locator(where).scrollIntoViewIfNeeded(); await sleep(250); const n = await p.evaluate(() => document.body.scrollHeight); if (n === h) break; h = n; } };
    await settle(); await p.locator(where + ' a[lang=es]').click(); await p.waitForLoadState('networkidle');
    const a = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
    await settle(); await p.locator(where + ' a[lang=en]').click(); await p.waitForLoadState('networkidle');
    const back = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
    ok(enCur === 'true' && a.path === es && a.lang === 'es' && back.path === en && back.lang === 'en', `${tag}: switch (${where}) ${en} → ${a.path} → ${back.path}`);
   }
   await p.goto(base + '/pages/contact?interest=nevora-demo', { waitUntil: 'networkidle' });
   await p.locator('.foot-lang').scrollIntoViewIfNeeded(); await sleep(400); await p.locator('.foot-lang a[lang=es]').click(); await p.waitForLoadState('networkidle');
   ok(p.url().endsWith('/pages/es-contacto?interest=nevora-demo'), `${tag}: switching from the trial form keeps the trial (${p.url().replace(base, '')})`);
   await p.goto(base + '/pages/about', { waitUntil: 'networkidle' });
   ok((await p.getAttribute('.foot-lang a[lang=es]', 'href')) === '/pages/es' && (await p.getAttribute('.foot-lang a[lang=es]', 'aria-label')) === 'Español', `${tag}: an English page with no Spanish version offers Spanish home`);
   // ---------- contact: trial variant, more than 30, errors, sent panel per topic ----------
   await p.goto(base + '/pages/es-contacto?interest=nevora-demo', { waitUntil: 'networkidle' });
   const h1 = () => p.evaluate(() => { const h = document.querySelector('.cform-hero h1'); return [...h.children].filter(s => getComputedStyle(s).display !== 'none').map(s => s.textContent).join('').replace(/\s+/g, ' ').trim(); });
   const trial = await p.evaluate(() => ({ title: document.title, btn: document.querySelector('[data-inquiry-submit]').innerText, kick: [...document.querySelector('.cform-hero .kicker').children].filter(s => getComputedStyle(s).display !== 'none').map(s => s.textContent).join('') }));
   ok((await h1()) === 'Pide tu prueba gratis de NEVORA.' && trial.title === 'Prueba gratis de NEVORA · Velani' && trial.btn === 'Revisar el borrador' && trial.kick === 'Prueba gratis de NEVORA por 30 días', `${tag}: trial variant heading, title and button in Spanish (${trial.btn})`);
   await p.fill('#inquiry-name', 'Ana Prueba'); await p.fill('#inquiry-email', 'ana@example.com');
   await p.selectOption('#inquiry-team', { label: 'Más de 30 (por cotización)' }); await sleep(200);
   const big = await p.evaluate(() => ({ note: document.querySelector('.quote-note').hidden ? '' : document.querySelector('.quote-note').textContent, topic: document.getElementById('inquiry-interest').value, title: document.title, value: document.getElementById('inquiry-team').value }));
   ok((await h1()) === 'Pide una cotización de NEVORA.' && big.topic === 'nevora' && /^Los equipos de más de 30 personas reciben una cotización/.test(big.note) && big.title === 'NEVORA para tu equipo · Velani' && big.value === 'More than 30 (by quote)', `${tag}: more than 30 switches to a quote with the Spanish note; the submitted value stays the English one`);
   if (vp.w === 1440 || vp.m) await p.screenshot({ path: `${out}/${engine}-${vp.w}-contacto-mas-de-30.png` });
   await p.selectOption('#inquiry-team', { label: '11–20' }); await sleep(200);
   ok((await h1()) === 'Pide tu prueba gratis de NEVORA.' && (await p.inputValue('#inquiry-interest')) === 'nevora-demo', `${tag}: back to 11–20 returns to the trial`);
   await p.goto(base + '/pages/es-contacto', { waitUntil: 'networkidle' });
   await p.click('[data-inquiry-submit]'); await sleep(250);
   const errors = await p.evaluate(() => ({ name: document.getElementById('error-name').textContent, email: document.getElementById('error-email').textContent, msg: document.getElementById('error-message').textContent, status: document.querySelector('.form-status').textContent, focus: document.activeElement.id }));
   ok(errors.name === 'Escribe tu nombre.' && /^Escribe un correo electrónico/.test(errors.email) && errors.msg === 'Cuéntanos de qué quieres hablar.' && /^No pudimos enviar tu consulta/.test(errors.status) && errors.focus === 'inquiry-name', `${tag}: a blank submit shows Spanish errors and focuses the first field`);
   if (engine === 'chromium' && vp.w === 1440) dump('contact errors', Object.values(errors).slice(0, 4).join('\n'));
   await p.selectOption('#inquiry-interest', 'nevora'); await p.fill('#inquiry-locations', 'dos'); await p.fill('#inquiry-name', 'Ana'); await p.fill('#inquiry-email', 'ana@example.com'); await p.click('[data-inquiry-submit]'); await sleep(200);
   ok((await p.innerText('#error-locations')) === 'Escribe el número de ubicaciones, por ejemplo, 2.' && /Algo más/.test(await p.innerText('label[for=inquiry-message]')), `${tag}: locations error in Spanish; a NEVORA topic makes the message "Algo más (opcional)"`);
   const SENT = { website: 'Mensaje enviado.', 'custom-software': 'Mensaje enviado.', nevora: 'Solicitud de cotización enviada.', 'nevora-demo': 'Solicitud de prueba enviada.', relay: 'Ya estás en la lista de Relay.', other: 'Mensaje enviado.' };
   for (const [topic, heading] of Object.entries(SENT)) {
    await p.goto(base + '/pages/es-contacto' + (topic === 'relay' ? '?interest=relay' : ''), { waitUntil: 'networkidle' });
    await p.fill('#inquiry-name', 'Ana Prueba'); await p.fill('#inquiry-email', 'ana@example.com');
    if (topic !== 'relay') await p.selectOption('#inquiry-interest', topic);
    if (!/^nevora|relay/.test(topic)) await p.fill('#inquiry-message', 'Necesitamos un sitio web nuevo.');
    await p.click('[data-inquiry-submit]'); await sleep(300);
    const s = await p.evaluate(() => { const sent = document.getElementById('inquiry-sent'); return { shown: !sent.hidden, h: sent.querySelector('[data-sent-h]').textContent, p: sent.querySelector('[data-sent-p]').textContent, note: !sent.querySelector('[data-sent-preview]').hidden, text: sent.innerText, focus: document.activeElement === sent, title: document.title, back: sent.querySelector('a.pill').getAttribute('href') }; });
    ok(s.shown && s.h === heading && s.note && s.focus && !DENY.test(s.text) && s.title === heading.replace(/\.$/, '') + ' · Velani' && s.back === '/pages/es', `${tag}: preview check for "${topic}" shows the Spanish sent panel ("${s.h}")`);
    if (engine === 'chromium' && vp.w === 1440) dump('sent panel: ' + topic, s.text);
    if (topic === 'nevora-demo' && (vp.w === 1440 || vp.m)) await p.screenshot({ path: `${out}/${engine}-${vp.w}-contacto-enviado-prueba.png` });
   }
   if (engine === 'chromium' && vp.w === 1440) for (const q of ['?interest=nevora', '?interest=nevora-demo', '?interest=relay']) { await p.goto(base + '/pages/es-contacto' + q, { waitUntil: 'networkidle' }); dump('/pages/es-contacto' + q + ' (title: ' + await p.title() + ')', await p.innerText('main')); }
   // ---------- NEVORA: the time clock starts in Spanish; the local menu ----------
   await p.goto(base + '/pages/es-nevora', { waitUntil: 'networkidle' });
   await p.locator('#kio').scrollIntoViewIfNeeded(); await sleep(300);
   const k = await p.evaluate(() => ({ lang: document.getElementById('kio').lang, h: document.getElementById('kio-pin-h').textContent, ap: document.getElementById('kio-ap').textContent, date: document.getElementById('kio-date').textContent, sw: document.getElementById('kio-lang-t').textContent, go: document.querySelector('#kio-go').innerText.trim(), del: document.querySelector('[data-act=back]').getAttribute('aria-label') }));
   ok(k.lang === 'es' && k.h === 'Ingresa tu PIN' && /^[ap]\. m\.$/.test(k.ap) && /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo), \d+ de /.test(k.date) && k.sw === 'English' && k.go === 'Continuar' && k.del === 'Borrar dígito', `${tag}: time clock starts in Spanish (${k.date} · ${k.ap})`);
   for (const d of '1234') await p.click(`#kio [data-d="${d}"]`);
   await p.click('#kio-go'); await sleep(300);
   const r = await p.evaluate(() => ({ h: document.getElementById('kio-ok-h').textContent, focus: document.activeElement.id, live: document.getElementById('kio-live').textContent, saved: document.querySelector('.kio-saved').textContent, again: document.getElementById('kio-done').textContent }));
   ok(r.h === 'Entrada registrada' && r.focus === 'kio-ok-h' && /^Entrada registrada a las \d/.test(r.live) && /^Registrada el /.test(r.saved) && r.again === 'Marcar entrada de nuevo', `${tag}: Spanish result, focus on it, announced "${r.live}" (${r.saved})`);
   if (engine === 'chromium' && vp.w === 1440) dump('time clock result', await p.innerText('#kio'));
   await p.click('#kio-done'); await p.click('#kio-lang'); await sleep(150);
   ok((await p.textContent('#kio-pin-h')) === 'Enter your PIN' && (await p.textContent('#kio-lang-t')) === 'Español', `${tag}: the demo can switch to English`);
   if (vp.w < 960) {
    await p.evaluate(() => scrollTo(0, 0)); await p.click('#lnav-tog'); await sleep(250);
    const l = await p.evaluate(() => ({ label: document.getElementById('lnav-tog').getAttribute('aria-label'), focus: document.getElementById('lnav-list').contains(document.activeElement), text: document.getElementById('lnav-list').innerText, sw: !!document.querySelector('#lnav-list .lang-sw a[aria-current][lang=es]') }));
    ok(l.label === 'Cerrar menú' && l.focus && l.sw && /Registro de tiempo/.test(l.text) && /en inglés/.test(l.text), `${tag}: NEVORA local menu in Spanish with the language switch`);
    await p.keyboard.press('Escape'); await sleep(150);
    ok(await p.evaluate(() => document.activeElement.id === 'lnav-tog' && document.getElementById('lnav-tog').getAttribute('aria-label') === 'Menú'), `${tag}: Escape closes the NEVORA menu`);
   }
   // ---------- Rondo opens in Spanish ----------
   await p.goto(base + '/pages/es-planes', { waitUntil: 'networkidle' });
   if (vp.m) { await p.evaluate(() => scrollTo(0, 900)); await sleep(500); }
   const launch = await p.evaluate(() => ({ t: document.getElementById('ast-launch-t').textContent, l: document.getElementById('ast-launch').getAttribute('aria-label') }));
   ok(launch.t === 'Pregúntale a Rondo' && /^Pregúntale a Rondo/.test(launch.l), `${tag}: launcher says "${launch.t}"`);
   await p.click('#ast-launch'); await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
   const ast = await p.evaluate(() => ({ lang: document.getElementById('ast').lang, hi: document.getElementById('ast-hi').textContent, ph: document.getElementById('ast-in').placeholder, es: document.querySelector('#ast-lang [data-locale=es]').getAttribute('aria-pressed'), contact: document.getElementById('ast-contact').getAttribute('href'), text: document.getElementById('ast').innerText, sugg: [...document.querySelectorAll('#ast-sugg button')].map(b => b.textContent) }));
   ok(ast.lang === 'es' && ast.hi === 'Hola, soy Rondo.' && ast.ph === 'Escribe tu pregunta para Rondo' && ast.es === 'true' && ast.contact === '/pages/es-contacto' && !DENY.test(ast.text) && ast.sugg[0] === '¿Cómo funciona el registro de tiempo?', `${tag}: Rondo opens in Spanish; its contact link is the Spanish contact page`);
   if (engine === 'chromium' && vp.w === 1440) dump('Rondo panel', ast.text);
   await p.fill('#ast-in', 'precio por favor'); await p.press('#ast-in', 'Enter'); await p.locator('.ast-msg.ai').waitFor();
   const act = await p.evaluate(() => { const a = document.querySelector('.ast-msg.ai .ast-acts a'); return { href: a?.getAttribute('href'), t: a?.textContent }; });
   ok(log.some(l => l.path === '/v1/sessions' && l.body?.locale === 'es') && act.href === '/pages/es-contacto?interest=nevora' && act.t === 'Pedir una cotización', `${tag}: the conversation starts in Spanish and Rondo's quote link opens the Spanish contact form`);
   if (vp.w === 1440 || vp.m) await p.screenshot({ path: `${out}/${engine}-${vp.w}-rondo-es.png` });
   await p.keyboard.press('Escape');
   ok(errs.length === 0, `${tag}: no page errors (${errs.join(' | ')})`);
   await ctx.close();
   // ---------- reduced motion: Spanish headings are whole and visible at once ----------
   const rc = await b.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce', isMobile: !!vp.m, hasTouch: !!vp.m }); const rp = await rc.newPage();
   for (const path of ['/pages/es', '/pages/es-nevora']) {
    await rp.goto(base + path, { waitUntil: 'networkidle' });
    const m = await rp.evaluate(() => { const h = document.querySelector('main h1'); return { vis: getComputedStyle(h).visibility, op: +getComputedStyle(h).opacity, dawn: document.documentElement.classList.contains('dawn'), text: h.innerText.replace(/\s+/g, ' ').trim() }; });
    ok(m.vis === 'visible' && m.op === 1 && !m.dawn && /[a-zá-ú]/.test(m.text), `${tag} reduced motion ${path}: heading shown at once ("${m.text}")`);
   }
   await rc.close();
  }
  await b.close();
 }
} finally {
 server.kill();
 await writeFile(out + '/results.txt', results.join('\n') + '\n');
 if (textDump.length) await writeFile(out + '/text-es.txt', textDump.join('\n'));
 console.log(`\n${results.length - fails} passed, ${fails} failed`); process.exitCode = fails ? 1 : 0;
}
