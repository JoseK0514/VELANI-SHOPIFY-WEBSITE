// Spanish Day pages on the real local preview: visible English left (outside drawn screens and lang="en"), demos in Spanish.
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4180';
const PAGES = ['/pages/es', '/pages/es-nevora', '/pages/es-planes', '/pages/es-contacto', '/pages/es-ayuda', '/pages/es-entrar', '/pages/es-nosotros', '/pages/es-rondo', '/pages/es-relay', '/pages/es-productos', '/pages/es-configurar', '/pages/es-facturacion', '/pages/es-pago'];
// Words from the drawn app screens: on Spanish pages these screens are Spanish too (aria-hidden pictures are checked in a second pass)
const SCR = /\b(Home|Schedule|Payroll|Team|Requests|Search|Good (morning|afternoon|evening)|Saturday|Sunday|Clock|Late|Open shift|Approve|Bump|Pickup|Table|Ready|Running low|Kitchen|Next shift|This week|Payday|people|Continue|Clear|Enter your|AM|PM|Starts|Waiting|Approved|Time off|Swap|Calculat\w+)\b/;
const EN = /\b(the|and|your|with|for|you|request|free trial|learn more|see plans|join the|questions|approve|employees|month|schedule|timecards|payroll|sign in|support|contact|help|what|how|who|when|every|today|week)\b/i;
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 260) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [], posts = [];
  for (const path of PAGES) {
    const p = await c.newPage(); p.on('pageerror', e => errs.push(path + ': ' + e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errs.push(m.text()); });
    p.on('request', r => { if (r.method() !== 'GET') posts.push(r.method() + ' ' + r.url()); });
    await p.goto(B + path); await p.waitForTimeout(700);
    ok(path + ' lang=es and Day', (await p.getAttribute('html', 'lang')) === 'es' && await p.$('.gn') !== null);
    const leaks = await p.evaluate(src => {
      const re = new RegExp(src, 'i'), out = [];
      const walk = n => {
        if (n.nodeType === 1) { if (n.getAttribute('aria-hidden') === 'true' || n.closest('[lang="en"]') || /^(SCRIPT|STYLE|TEMPLATE|SVG)$/i.test(n.tagName) || n.hidden || n.classList.contains('sr') && false) return; for (const k of n.childNodes) walk(k); }
        else if (n.nodeType === 3) { const t = n.textContent.replace(/[\w.+-]+@[\w.-]+/g, '').trim(); if (t && re.test(t) && n.parentElement.checkVisibility()) out.push(t.slice(0, 90)); }
      };
      walk(document.querySelector('main')); return out;
    }, EN.source);
    ok(path + ' no visible English in the page body', leaks.length === 0, leaks.slice(0, 6).join(' | '));
    const scr = await p.evaluate(src => {
      const re = new RegExp(src), out = [];
      const walk = n => { if (n.nodeType === 1) { if (n.closest('[lang="en"]') || /^(SCRIPT|STYLE|TEMPLATE|svg)$/i.test(n.tagName)) return; for (const k of n.childNodes) walk(k); } else if (n.nodeType === 3) { const t = n.textContent.trim(); if (t && re.test(t)) out.push(t.slice(0, 60)); } };
      document.querySelectorAll('main [aria-hidden="true"], main [role="img"]').forEach(walk); return [...new Set(out)];
    }, SCR.source);
    ok(path + ' drawn screens in Spanish (after scripts ran)', scr.length === 0, scr.slice(0, 8).join(' | '));
    await p.close();
  }
  // Demos speak Spanish
  let p = await c.newPage(); await p.goto(B + '/pages/es-nevora'); await p.waitForTimeout(700);
  ok('es-nevora: kiosk starts in Spanish', (await p.textContent('.ckx-dev .kv-pin h3')).trim() === 'Ingresa tu PIN');
  await p.locator('#pub').scrollIntoViewIfNeeded(); await p.click('#pub'); await p.waitForTimeout(600);
  ok('es-nevora: publish demo in Spanish', /Publicado/.test(await p.textContent('#sd-chip')) && /notificadas/.test(await p.textContent('#sd-status')), await p.textContent('#sd-status'));
  await p.locator('[data-q="1"]').scrollIntoViewIfNeeded(); await p.click('[data-q="1"]'); await p.waitForTimeout(500);
  ok('es-nevora: Rondo answers in Spanish', /Dana Kim está libre/.test(await p.textContent('#ans')));
  await p.locator('#tc-ok').scrollIntoViewIfNeeded(); await p.click('#tc-ok'); await p.waitForTimeout(900);
  ok('es-nevora: timecards approve in Spanish', /Aprobado/.test(await p.textContent('#tc-st')), await p.textContent('#tc-st'));
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es'); await p.waitForTimeout(700);
  ok('es home: Rondo conversation starts in Spanish', (await p.textContent('#rondo h2')).trim() === 'Pregunta como hablas.' && (await p.getAttribute('#convo', 'lang')) === 'es');
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es-rondo'); await p.waitForTimeout(700);
  ok('es-rondo: first answer in Spanish', /Jordan Torres debía entrar/.test(await p.textContent('#ans')) && (await p.getAttribute('#ans .c-a', 'lang')) === 'es', await p.textContent('#ans'));
  await p.click('[data-q="1"]'); await p.waitForTimeout(400); await p.click('#ans-ok'); await p.waitForTimeout(300);
  ok('es-rondo: prepared change approves in Spanish', (await p.textContent('#ans-ok')).trim() === 'Aprobado' && /Solo es una muestra/.test(await p.textContent('#ans-m')));
  await p.click('[data-q="3"]'); await p.waitForTimeout(400);
  ok('es-rondo: an English question gets an English answer marked English', (await p.getAttribute('#ans .c-a', 'lang')) === 'en' && /Only Jordan Torres/.test(await p.textContent('#ans')));
  await p.locator('#ap-ok').scrollIntoViewIfNeeded(); await p.click('#ap-ok'); await p.waitForTimeout(2200);
  ok('es-rondo: approval demo in Spanish', (await p.textContent('#ap-ok')).trim() === 'Aprobado' && /Aplicado/.test(await p.textContent('#ap-chk')));
  ok('es-rondo: hero phone plays in Spanish', /Dana Kim está libre/.test(await p.textContent('#rh-scr')));
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es-relay'); await p.waitForTimeout(600);
  const join = p.locator('#waitlist a.pillbtn'); await join.scrollIntoViewIfNeeded(); await join.click(); await p.waitForURL('**/pages/es-contacto?interest=relay'); await p.waitForTimeout(500);
  ok('es-relay: the waitlist opens Spanish Contact on the Relay topic', (await p.$eval('input[name="topic_choice"]:checked', e => e.value)) === 'relay');
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es-ayuda'); await p.waitForTimeout(600);
  await p.fill('#q', 'pin'); ok('es-ayuda: search counts in Spanish', /respuesta/.test(await p.textContent('#ans-st')), await p.textContent('#ans-st'));
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es-planes'); await p.waitForTimeout(700);
  ok('es-planes: price per employee and calendar in Spanish', /por empleado/.test(await p.textContent('[data-per-emp]')) && /^[a-záéíóú]/i.test(await p.textContent('.cal[data-off="0"] small')) && !/^Day$/.test(await p.textContent('.cal[data-off="0"] small')), (await p.textContent('[data-per-emp]')) + ' / ' + await p.getAttribute('.cal[data-off="0"]', 'aria-label'));
  await p.close();
  p = await c.newPage(); await p.goto(B + '/pages/es-contacto?interest=relay'); await p.waitForTimeout(600);
  ok('es-contacto: Relay topic, Spanish button', (await p.$eval('input[name="topic_choice"]:checked', e => e.value)) === 'relay' && (await p.textContent('[data-inquiry-submit]')).trim() === 'Unirme a la lista', await p.textContent('[data-inquiry-submit]'));
  await p.click('[data-inquiry-submit]'); await p.waitForTimeout(300);
  ok('es-contacto: errors in Spanish', /campo/.test(await p.textContent('.form-status')), await p.textContent('.form-status'));
  await p.close();
  ok('no network sends', posts.length === 0, posts.join(' '));
  ok('no script errors or CSP reports', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
