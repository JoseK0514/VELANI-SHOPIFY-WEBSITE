// The Velani assistant widget against the local harness (real Velani AI app, in-memory store, scripted model).
// Needs: the harness on 127.0.0.1:3001 allowing http://127.0.0.1:4173, and the preview server started with
// VELANI_ASSISTANT_API=http://127.0.0.1:3001. The CAPTCHA path starts its own harness (port 3002) and preview (port 4174)
// when VELANI_AI_DIR points at a built services/velani-ai checkout.
// Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium VELANI_AI_DIR=/path/to/services/velani-ai node scripts/checks/assistant.mjs
// Start the harness fresh for each run: it keeps the service's real per-address limits (10 sessions an hour), and two runs in an hour exceed them.
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const run = process.env.VELANI_BROWSER_RUN || 'assistant-' + new Date().toISOString().replace(/[:.]/g, '-');
const out = 'evidence/' + run;
await mkdir(out, { recursive: true });
const results = [];
const ok = (condition, message) => { results.push({ status: condition ? 'passed' : 'failed', message }); console.log((condition ? 'PASS ' : 'FAIL ') + message); };
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitFor = async (page, selector, timeout = 15000) => page.locator(selector).first().waitFor({ state: 'visible', timeout });
const lastAnswer = page => page.locator('.ast-msg.ai').last();
const send = async (page, text) => { await page.fill('#ast-in', text); await page.press('#ast-in', 'Enter'); await page.locator('.ast-wait').waitFor({ state: 'detached', timeout: 20000 }); };
try {
  // ---------- Desktop: open, converse, sources, actions, failures, retry, delete, language, keyboard
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 503/.test(m.text())) errors.push(m.text()); });
    const hosts = new Set(); p.on('request', r => hosts.add(new URL(r.url()).host));
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    ok(await p.locator('#ast-launch').isVisible() && (await p.locator('#ast-launch').innerText()).trim() === 'Ask about NEVORA' && await p.locator('#ast').isHidden(), 'launcher shows "Ask about NEVORA"; panel closed');
    await p.click('#ast-launch'); await waitFor(p, '#ast');
    ok((await p.locator('#ast-launch').getAttribute('aria-expanded')) === 'true' && await p.evaluate(() => document.activeElement.id === 'ast-in'), 'panel opens and focus lands in the question field');
    ok((await p.locator('#ast-sugg button').count()) === 3 && /kept for up to 30 days/.test(await p.locator('#ast-note').innerText()) && await p.locator('#ast-note a[href$="/pages/privacy#section-4"]').isVisible(), 'intro offers three questions; retention notice links to the privacy notice');
    await p.waitForFunction(() => !document.getElementById('ast-in').disabled, null, { timeout: 10000 });
    ok(await p.locator('#ast-send').isDisabled(), 'send is disabled while the field is empty');
    await p.screenshot({ path: out + '/desktop-open.png' });
    await send(p, 'hello');
    ok((await p.locator('.ast-msg.you').innerText()) === 'hello' && /^Hello\./.test(await lastAnswer(p).innerText()) && await p.locator('#ast-intro').isHidden(), 'a question gets an answer; the intro steps aside');
    ok((await p.locator('.ast-src').count()) === 0 && await p.locator('#ast-clear').isVisible(), 'a greeting carries no sources; the delete control appears once the conversation exists');
    await send(p, 'Can I try the demo?');
    const src = lastAnswer(p).locator('.ast-src a');
    ok((await src.count()) === 1 && (await src.getAttribute('href')) === 'https://www.thevelani.com/pages/nevora' && (await src.getAttribute('target')) === '_blank' && /noopener/.test(await src.getAttribute('rel')), 'a cited answer links its source on thevelani.com in a new tab');
    const demo = lastAnswer(p).locator('.ast-acts a');
    ok((await demo.innerText()) === 'Try the time clock' && (await demo.getAttribute('href')) === '#try', 'show_demo offers the time clock on this page');
    await p.screenshot({ path: out + '/desktop-answer.png' });
    await demo.click(); await sleep(400);
    ok(await p.locator('#ast').isHidden() && p.url().endsWith('#try'), 'the demo action closes the panel and jumps to the demo');
    await p.click('#ast-launch'); await waitFor(p, '#ast');
    ok((await p.locator('.ast-msg').count()) === 4, 'reopening keeps the conversation');
    await send(p, 'What is the price?');
    const quote = lastAnswer(p).locator('.ast-acts a');
    ok((await quote.innerText()) === 'Ask for a quote' && (await quote.getAttribute('href')) === '/pages/contact?interest=nevora', 'lead_form offers the quote enquiry, never a form inside the chat');
    await send(p, 'I forgot my password');
    const help = lastAnswer(p).locator('.ast-acts a');
    ok((await help.innerText()) === 'NEVORA support' && (await help.getAttribute('href')) === '/pages/nevora-support', 'human_help with a support citation offers NEVORA support');
    await send(p, 'please give me the long version');
    ok((await lastAnswer(p).locator('p').count()) >= 3, 'paragraphs in an answer render as separate paragraphs');
    ok(await p.evaluate(() => !document.querySelector('.ast-log').innerHTML.includes('<b>') && document.querySelectorAll('.ast-log script, .ast-log iframe').length === 0), 'answers render as text, never as markup');
    // failure, retry, discard
    await send(p, 'fail');
    ok(await p.locator('#ast-status').isVisible() && /temporarily unavailable/.test(await p.locator('#ast-status-t').innerText()) && await p.locator('#ast-retry').isVisible() && await p.locator('#ast-discard').isVisible(), 'a provider failure shows a plain explanation with Retry and Discard');
    ok(await p.locator('.ast-msg.you[data-unsent]').isVisible() && await p.locator('#ast-send').isDisabled(), 'the unsent question is marked and sending waits for retry or discard');
    await p.click('#ast-retry'); await p.locator('.ast-wait').waitFor({ state: 'detached', timeout: 20000 });
    ok(await p.locator('#ast-retry').isVisible(), 'retry replays the same request (still failing in the harness)');
    await p.click('#ast-discard');
    ok(await p.locator('#ast-status').isHidden() && (await p.locator('.ast-msg.you[data-unsent]').count()) === 0 && !(await p.locator('#ast-in').isDisabled()), 'discard removes the unsent question and frees the composer');
    await p.screenshot({ path: out + '/desktop-after-discard.png' });
    // keyboard: Escape closes and returns focus
    await p.focus('#ast-in'); await p.keyboard.press('Escape');
    ok(await p.locator('#ast').isHidden() && await p.evaluate(() => document.activeElement.id === 'ast-launch'), 'Escape closes the panel and focus returns to the launcher');
    // delete the conversation on the server
    await p.click('#ast-launch'); await waitFor(p, '#ast'); await p.click('#ast-clear');
    ok(await p.locator('#ast-confirm').isVisible() && await p.evaluate(() => document.activeElement.id === 'ast-confirm-yes'), 'deleting asks for confirmation first');
    await p.click('#ast-confirm-yes'); await sleep(600);
    ok((await p.locator('.ast-msg').count()) === 0 && await p.locator('#ast-intro').isVisible() && /deleted/.test(await p.locator('#ast-status-t').innerText()) && await p.locator('#ast-clear').isHidden(), 'the conversation is deleted on the server and the intro returns');
    await send(p, 'hello');
    ok(/^Hello\./.test(await lastAnswer(p).innerText()), 'a new conversation starts after deletion');
    const ax = await new AxeBuilder({ page: p }).analyze(); ok(ax.violations.length === 0, 'axe with the panel open: ' + (ax.violations.map(v => v.id).join(',') || 'clean'));
    ok([...hosts].every(h => h.startsWith('127.0.0.1')), 'no request leaves the local hosts: ' + [...hosts].join(' '));
    ok(await p.evaluate(() => localStorage.length + sessionStorage.length) === 0 && (await ctx.cookies()).length === 0, 'nothing in storage or cookies');
    ok(errors.length === 0, 'no script errors ' + errors.join('|'));
    await ctx.close();
  }
  // ---------- Spanish: chosen before the first message
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
    await p.click('#ast-launch'); await waitFor(p, '#ast'); await p.click('#ast-lang button[data-locale="es"]');
    ok((await p.locator('#ast-t').innerText()) === 'Asistente de Velani' && (await p.locator('#ast').getAttribute('lang')) === 'es' && (await p.locator('#ast-launch').getAttribute('aria-label')) === 'Pregunta sobre NEVORA', 'Español switches the panel text and language attributes');
    await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
    await send(p, 'hola');
    ok(/^Hola\./.test(await lastAnswer(p).innerText()), 'the Spanish session answers in Spanish');
    ok(await p.locator('#ast-lang').isHidden() && (await p.locator('#ast-t').innerText()) === 'Asistente de Velani', 'the language choice steps aside once a conversation has started');
    await p.screenshot({ path: out + '/desktop-spanish.png' });
    await ctx.close();
  }
  // ---------- Phone: full-screen sheet, scroll lock, touch
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    const l = await p.locator('#ast-launch').boundingBox();
    ok(l.width >= 44 && l.height >= 44 && (await p.locator('#ast-launch span').isHidden()), 'phone launcher is a round icon button, at least 44px');
    await p.locator('#ast-launch').tap(); await waitFor(p, '#ast');
    const r = await p.locator('#ast').boundingBox();
    ok(Math.round(r.width) === 390 && Math.round(r.height) >= 660 && (await p.evaluate(() => getComputedStyle(document.body).overflow)) === 'hidden', 'the panel fills the phone screen and the page behind stops scrolling');
    ok(await p.evaluate(() => document.activeElement.id === 'ast-head-t'), 'on a touch screen focus goes to the heading, not the keyboard');
    await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
    await p.locator('#ast-sugg button').first().tap(); await p.locator('.ast-wait').waitFor({ state: 'detached', timeout: 20000 });
    ok((await p.locator('.ast-msg.ai').count()) === 1, 'a suggested question sends and answers');
    await p.screenshot({ path: out + '/phone-answer.png' });
    await p.locator('#ast-close').tap();
    ok(await p.locator('#ast').isHidden() && (await p.evaluate(() => getComputedStyle(document.body).overflow)) !== 'hidden', 'closing restores page scrolling');
    ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0, 'no sideways scroll with the launcher present');
    await ctx.close();
  }
  // ---------- Reduced motion and no JavaScript
  {
    const rm = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })).newPage();
    await rm.goto(base + '/', { waitUntil: 'networkidle' }); await rm.click('#ast-launch');
    ok(await rm.locator('#ast').isVisible() && (await rm.evaluate(() => getComputedStyle(document.getElementById('ast')).opacity)) === '1', 'reduced motion: the panel appears without animation');
    const nj = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false })).newPage();
    await nj.goto(base + '/');
    ok(await nj.locator('#ast-launch').isHidden(), 'without JavaScript the launcher stays hidden');
  }
  // ---------- Unavailable service: the panel explains and the composer stays disabled
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
    await p.route('http://127.0.0.1:3001/**', route => route.abort());
    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.click('#ast-launch'); await waitFor(p, '#ast-status');
    ok(/not available right now/.test(await p.locator('#ast-status-t').innerText()) && await p.locator('#ast-in').isDisabled(), 'an unreachable service is explained and the composer is disabled');
    await ctx.close();
  }
  // ---------- CAPTCHA path with a fake Turnstile (own harness and preview)
  if (process.env.VELANI_AI_DIR) {
    const procs = [];
    const up = async (url, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { try { const r = await fetch(url); if (r.ok || r.status === 404) return true; } catch {} await sleep(300); } return false; };
    procs.push(spawn('node', ['scripts/ai-harness/dev-server.mjs', process.env.VELANI_AI_DIR, '3002', 'http://127.0.0.1:4174', '1'], { stdio: 'ignore' }));
    procs.push(spawn('node', ['scripts/serve.mjs', '--port', '4174', '--host', '127.0.0.1'], { stdio: 'ignore', env: { ...process.env, VELANI_ASSISTANT_API: 'http://127.0.0.1:3002' } }));
    try {
      ok(await up('http://127.0.0.1:3002/v1/config') && await up('http://127.0.0.1:4174/'), 'captcha harness and preview start');
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
      let renders = 0;
      await p.route('https://challenges.cloudflare.com/**', route => route.fulfill({ contentType: 'text/javascript', body: 'window.turnstile={_o:null,render(el,o){this._o=o;window.__renders=(window.__renders||0)+1;setTimeout(()=>o.callback("harness-token"),40);return "w1"},reset(){setTimeout(()=>this._o.callback("harness-token"),40)},remove(){}};' }));
      await p.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' }); await p.click('#ast-launch'); await waitFor(p, '#ast');
      await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
      await send(p, 'hello');
      renders = await p.evaluate(() => window.__renders || 0);
      ok(/^Hello\./.test(await lastAnswer(p).innerText()) && renders === 1 && await p.locator('#ast-verify').isHidden(), 'with CAPTCHA required, the first message verifies once through Turnstile and then answers');
      await send(p, 'demo');
      ok((await p.evaluate(() => window.__renders)) === 1 && (await p.locator('.ast-msg.ai').count()) === 2, 'later messages reuse the session without a new challenge');
      await ctx.close();
    } finally { procs.forEach(proc => proc.kill()); }
  } else console.log('SKIP CAPTCHA path (set VELANI_AI_DIR to a built services/velani-ai checkout)');
} finally { await browser.close(); }
const summary = { status: results.some(r => r.status === 'failed') ? 'failed' : 'passed', passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, base, results };
await writeFile(out + '/assistant.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, results: undefined, evidence: out }));
process.exit(summary.failed ? 1 : 0);
