// Builds the Phase 2 mockup pages (static HTML, design only). Run: node docs/design/2026-11-07-phase2/build.mjs
// Copy comes from copy.md in this folder. Nothing here is wired: forms post nowhere.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const root = new URL('../../../', import.meta.url);
const ph = name => readFileSync(new URL('node_modules/@phosphor-icons/core/assets/regular/' + name + '.svg', root), 'utf8')
  .replace('<svg ', '<svg class="icon" aria-hidden="true" focusable="false" ');
const A = f => '../../../public/assets/' + f;
const I = { caret: ph('caret-down'), arrow: ph('arrow-right'), list: ph('list'), hub: ph('squares-four'), signin: ph('sign-in'), plus: ph('plus-circle'), help: ph('lifebuoy'), check: ph('check'), clock: ph('clock'), cal: ph('calendar-blank'), money: ph('receipt'), globe: ph('browser'), phone: ph('device-mobile'), store: ph('storefront'), code: ph('code'), users: ph('users-three'), mail: ph('envelope-simple'), warn: ph('warning-circle'), ext: ph('arrow-square-out'), map: ph('map-pin') };

const page = (title, note, body, { active = '', open = '' } = {}) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Velani mockup</title><link rel="stylesheet" href="board.css"></head><body>
<p class="note"><b>Mockup · ${title}</b> · ${note}</p>
${header(active, open)}
<main>${body}</main>
${footer()}
</body></html>`;

function header(active, open) {
  const dd = (key, label, items) => `<li class="dd"><button type="button" aria-expanded="${open === key}"${active === key ? ' aria-current="page"' : ''}>${label}${I.caret}</button>${open === key ? `<div class="ddmenu">${items}</div>` : ''}</li>`;
  const nevora = `<a href="#"><b>NEVORA Workforce <span class="chip ok">Available now</span></b><span>Scheduling, time clock and payroll calculation</span></a><a href="#"><b>Rondo in NEVORA <span class="chip">In development</span></b><span>The AI assistant coming to NEVORA</span></a><a href="#"><b>NEVORA Relay <span class="chip">Coming soon</span></b><span>Orders, kitchen display and inventory</span></a><hr><a href="#"><b>Plans</b><span>Free for 30 days, then one price per business</span></a>`;
  const custom = `<a href="#"><b>Websites</b><span>Built to bring in calls and bookings</span></a><a href="#"><b>Apps and booking</b><span>Booking, reminders and rewards</span></a><a href="#"><b>Online stores</b><span>Products, delivery and payment</span></a><hr><a href="#"><b>Case study: Tool Box LLC</b><span>Equipment rental website and store</span></a><a href="#"><b>Case study: Yavi Barber</b><span>Booking and rewards app</span></a>`;
  const company = `<a href="#"><b>About us</b><span>Who we are, from San Juan</span></a><a href="#"><b>How we work</b><span>Proposal first, then milestones</span></a><a href="#"><b>Support</b><span>Monday to Friday, 8 am to 9 pm ET</span></a><a href="#"><b>Contact</b><span>Tell us what you need</span></a>`;
  return `<header class="gnav"><nav class="wrap gnav-in" aria-label="Main"><a class="wm" href="index.html">VELANI</a><ul class="nav-links">${dd('nevora', 'NEVORA', nevora)}${dd('custom', 'Custom software', custom)}${dd('company', 'Company', company)}</ul><span class="lang"><b>EN</b>&nbsp;|&nbsp;ES</span><a class="hubpill" href="hub.html">${I.hub}Client hub</a><a class="trial" href="#">Request free trial</a><a class="mhub" href="hub.html">${I.hub}Hub</a><a class="burger" href="nav.html" aria-label="Menu">${I.list}</a></nav></header>`;
}
function footer() {
  return `<footer class="foot"><div class="wrap foot-in"><div><p style="letter-spacing:.32em;color:var(--text);margin-bottom:12px">VELANI</p><p>Software products and custom development, from San Juan.</p><p class="fine">VELANI LLC · 1654 Calle Tulipan, Suite 100, San Juan, PR 00927</p></div><div><h4>NEVORA</h4><a href="#">NEVORA Workforce</a><a href="#">Rondo in NEVORA</a><a href="#">NEVORA Relay</a><a href="#">Plans</a></div><div><h4>Custom software</h4><a href="#">Websites</a><a href="#">Apps and booking</a><a href="#">Online stores</a><a href="case-study.html">Case studies</a></div><div><h4>Company</h4><a href="hub.html">Client hub</a><a href="#">About us</a><a href="#">Support</a><a href="#">Contact</a></div></div></footer>`;
}
const btn = (t, fill = false, href = '#') => `<a class="hb${fill ? ' fill' : ''}" href="${href}">${t}${I.arrow}</a>`;

// ---------- Home ----------
const home = page('Home in the new order', 'What Velani does → NEVORA → custom software with two case studies → Relay → how we work / who we are → contact. Real screens, no decorative scenes.', `
<section class="sec first"><div class="wrap">
  <p class="k">Velani · Software company · San Juan</p>
  <h1 style="max-width:16ch">Software that runs your shifts. Software built for your business.</h1>
  <p class="lede" style="max-width:52ch">We make NEVORA, the app for scheduling, time clock and payroll calculation. And we design and build websites and apps for businesses like yours.</p>
  <div class="acts">${btn('Request free NEVORA trial', true)}${btn('Start a project')}<a class="tlink" href="hub.html">Already a client? Client hub ${I.arrow}</a></div>
</div></section>

<section class="sec" id="nevora"><div class="wrap split">
  <div>
    <p class="k"><span class="dot"></span>NEVORA Workforce</p>
    <h2>Schedule. Clock in. Calculate pay.</h2>
    <p class="lede">Plan the week on the web. Your team checks shifts on their phones and clocks in at a shared tablet with a PIN. Approved hours become pay statements.</p>
    <ul class="facts" style="margin-bottom:28px"><li>${I.check}Free for 30 days</li><li>${I.check}No card</li><li>${I.check}English and Spanish</li></ul>
    <div class="acts">${btn('Request free trial', true)}${btn('See NEVORA')}</div>
    <p class="fine" style="margin-top:24px"><span class="chip ok">Web and Android</span> &nbsp;<span class="chip blue">Coming to the App Store</span></p>
  </div>
  <div class="duo"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><img src="${A('night-owner.webp')}" alt="NEVORA on the web: the owner's Today screen" width="3000" height="2010"></div>
    <div class="phone"><div class="crop"><img src="${A('night-phone-long.webp')}" alt="NEVORA on a phone: an employee's shift for today" width="1170" height="3936"></div></div></div>
</div><div class="wrap"><p class="cap" style="margin-top:56px">Screens from the NEVORA app, with a fictional workplace.</p></div></section>

<section class="sec" id="custom"><div class="wrap">
  <p class="k">Custom software</p>
  <h2>Built for how your business works.</h2>
  <p class="lede" style="max-width:56ch">Websites, booking and loyalty apps, online stores and business tools. You get a written proposal before any paid work.</p>
  <div class="grid2" style="margin-top:40px">
    <a class="card" href="case-study.html" style="padding:0;overflow:hidden"><img src="${A('night-tb-home.webp')}" alt="Tool Box LLC website, built by Velani" width="2000" height="1250"><div style="padding:24px 28px 28px"><p class="k" style="margin-bottom:8px">Case study · Tool Box LLC</p><h3>Equipment rental, online.</h3><p class="muted">Customers find the tool, see the price with delivery by distance, and reserve it online.</p><span class="tlink">Read the case study ${I.arrow}</span></div></a>
    <a class="card" href="case-study.html" style="padding:0;overflow:hidden;display:grid"><div style="display:flex;gap:16px;justify-content:center;padding:32px 24px 0;background:var(--panel-2)"><div class="phone" style="width:150px;padding:6px;border-radius:24px"><img src="${A('night-yavi-book.webp')}" alt="Yavi Barber booking on a phone" width="780" height="1688" style="border-radius:19px"></div><div class="phone" style="width:150px;padding:6px;border-radius:24px;margin-top:28px"><img src="${A('night-yavi-rewards.webp')}" alt="Yavi Barber rewards card" width="780" height="1688" style="border-radius:19px"></div></div><div style="padding:24px 28px 28px"><p class="k" style="margin-bottom:8px">Case study · Yavi Barber</p><h3>Booking and rewards in one app.</h3><p class="muted">Clients book from their phone, get reminders, and fill a rewards card.</p><span class="tlink">Read the case study ${I.arrow}</span></div></a>
  </div>
  <div class="acts" style="margin-top:32px">${btn('Start a project', true)}</div>
</div></section>

<section class="sec" id="relay"><div class="wrap split">
  <div><p class="k"><span class="chip">Coming soon</span>&nbsp; NEVORA Relay · In design · No dates yet</p><h2>Orders, the kitchen screen and inventory, in sync.</h2><p class="lede">For restaurants and counters. Works on its own and with NEVORA Workforce.</p></div>
  <div class="card" style="padding:32px"><p class="k" style="margin-bottom:10px">Early access</p><h3 style="margin-bottom:18px">Hear first when Relay opens.</h3><label class="f"><span>Name</span><input value=""></label><label class="f"><span>Email</span><input value=""></label><a class="hb fill" href="#" style="width:100%;justify-content:center">Get early access</a><p class="fine" style="margin-top:12px">Only a name and email. Same contact topic as today (relay).</p></div>
</div></section>

<section class="sec" id="us"><div class="wrap">
  <p class="k">How we work · Who we are</p>
  <h2 style="max-width:20ch">A small team in San Juan. Clear from the first call.</h2>
  <ol class="steps" style="margin-top:40px"><li><i>01</i><b>We talk about the work</b><span>You show us how it gets done today and who does it.</span></li><li><i>02</i><b>You get a written proposal</b><span>What we build, what it costs, the milestones. Paid work starts when you agree.</span></li><li><i>03</i><b>We build in milestones</b><span>You try working software at each one.</span></li><li><i>04</i><b>We hand it over and stay</b><span>Ownership and support after launch are in the agreement.</span></li></ol>
  <div class="split" style="margin-top:56px;grid-template-columns:auto 1fr;align-items:center;gap:28px"><div style="width:120px;height:120px;border-radius:50%;background:var(--panel-2);border:1px dashed var(--soon);display:grid;place-items:center;color:var(--soon);font-size:.75rem;text-align:center;padding:10px">Jose's photo<br>(needed)</div><div><h3>Jose [surname], founder</h3><p class="muted" style="max-width:60ch">[Two lines in Jose's words: background and why Velani builds NEVORA and custom software. Needed from Jose.]</p><p class="fine">VELANI LLC · San Juan, Puerto Rico · English and Spanish</p></div></div>
</div></section>

<section class="sec" id="contact"><div class="wrap">
  <h2>Tell us what you need.</h2>
  <div class="grid3" style="margin-top:32px">
    <a class="card" href="#">${I.clock.replace('class="icon"', 'class="icon big"')}<h3>Try NEVORA</h3><p class="muted">30 days free, no card.</p><span class="tlink">Request free trial ${I.arrow}</span></a>
    <a class="card" href="#">${I.code.replace('class="icon"', 'class="icon big"')}<h3>New project</h3><p class="muted">A website, an app or a store.</p><span class="tlink">Start a project ${I.arrow}</span></a>
    <a class="card" href="hub.html">${I.hub.replace('class="icon"', 'class="icon big"')}<h3>Existing client</h3><p class="muted">Sign in, ask for work or get help.</p><span class="tlink">Client hub ${I.arrow}</span></a>
  </div>
  <p class="fine" style="margin-top:24px">support@thevelani.com · 787-925-2000 · Monday to Friday, 8 am to 9 pm ET</p>
</div></section>`, { active: '' });

// ---------- Navigation board ----------
const nav = page('Navigation', 'Three paths (NEVORA · Custom software · Company) plus a persistent Client hub. Menus open only on click, Enter or Space; one open at a time; Escape or a click outside closes. Shown: NEVORA menu open. On phones, Client hub sits in the header and first in the menu sheet.', `
<section class="sec first" style="min-height:420px"><div class="wrap"><p class="k">Desktop · NEVORA open</p><p class="muted" style="max-width:60ch">The open menu above shows status chips so "available now", "in development" and "coming soon" are never confused. "Request free trial" stays the one filled button.</p></div></section>
<section class="sec"><div class="wrap split">
 <div><p class="k">Phone · menu sheet</p><h3>Client hub first, then the three paths.</h3><p class="muted">Each path opens in place (an accordion), so one tap shows what is inside without leaving the page.</p></div>
 <div style="width:min(390px,100%);border:1px solid var(--line-2);border-radius:28px;overflow:hidden;background:var(--bg)">
  <div style="display:flex;align-items:center;min-height:56px;padding:0 16px;border-bottom:1px solid var(--line)"><span class="wm">VELANI</span><span class="mhub" style="display:inline-flex">${I.hub}Hub</span><span class="burger" style="display:inline-flex">${ph('x')}</span></div>
  <div style="padding:8px 16px 24px">
   <a class="hb" href="hub.html" style="width:100%;justify-content:space-between;margin:12px 0 8px"><span style="display:inline-flex;gap:10px;align-items:center">${I.hub}Client hub</span>${I.arrow}</a>
   ${['NEVORA', 'Custom software', 'Company'].map((t, i) => `<div style="border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;align-items:center;min-height:60px;font-size:1rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase">${t}${i === 0 ? ph('caret-up') : I.caret}</div>${i === 0 ? '<div style="padding:0 0 14px;display:grid;gap:2px"><a style="min-height:44px;display:flex;align-items:center;gap:8px">NEVORA Workforce <span class="chip ok">Now</span></a><a style="min-height:44px;display:flex;align-items:center;gap:8px">Rondo in NEVORA <span class="chip">In development</span></a><a style="min-height:44px;display:flex;align-items:center;gap:8px">NEVORA Relay <span class="chip">Soon</span></a><a style="min-height:44px;display:flex;align-items:center">Plans</a></div>' : ''}</div>`).join('')}
   <div class="acts" style="margin-top:20px"><a class="hb fill" href="#" style="width:100%;justify-content:center">Request free NEVORA trial</a></div>
   <p class="fine" style="margin-top:16px"><b style="color:var(--text)">EN</b> | ES · support@thevelani.com · 787-925-2000</p>
  </div></div>
</div></section>`, { open: 'nevora' });

// ---------- Products ----------
const products = page('Products', 'Split into Available now · Coming soon · Built for you. One primary action per group.', `
<section class="sec first"><div class="wrap"><p class="k">Velani</p><h1>What we make.</h1><p class="lede">Our own software, what is coming next, and software we build for your business.</p></div></section>
<section class="sec"><div class="wrap split">
  <div><p class="k"><span class="chip ok">Available now</span></p><h2>NEVORA Workforce</h2><p class="lede">Scheduling, time clock and payroll calculation for teams that work in shifts. Free for 30 days for up to 30 employees.</p><div class="acts">${btn('Request free trial', true)}${btn('Learn more')}</div></div>
  <div class="frame"><div class="bar"><i></i><i></i><i></i></div><img src="${A('night-desk.webp')}" alt="NEVORA on the web: today's shift, items to review and a swap request" width="3600" height="2250"></div>
</div></section>
<section class="sec"><div class="wrap"><p class="k"><span class="chip">Coming soon</span></p><h2>Next from Velani.</h2><div class="grid2" style="margin-top:28px">
  <div class="card"><p class="k" style="margin-bottom:8px">In development</p><h3>Rondo in NEVORA</h3><p class="muted">An AI assistant inside NEVORA: finds the gaps, lines up the fix and waits for your OK. No release date.</p><a class="tlink" href="#">How Rondo will work ${I.arrow}</a></div>
  <div class="card"><p class="k" style="margin-bottom:8px">In design · No dates yet</p><h3>NEVORA Relay</h3><p class="muted">Orders, the kitchen screen and inventory in one system, for restaurants and counters.</p><a class="hb" href="#" style="margin-top:8px">Get early access${I.arrow}</a></div>
</div></div></section>
<section class="sec"><div class="wrap"><p class="k"><span class="chip blue">Built for you</span></p><h2>Custom software, quoted per project.</h2><div class="grid3" style="margin-top:28px">
  <div class="card">${I.globe.replace('class="icon"', 'class="icon big"')}<h3>Websites</h3><p class="muted">Fast on every phone, built to bring in calls and bookings.</p></div>
  <div class="card">${I.phone.replace('class="icon"', 'class="icon big"')}<h3>Apps and booking</h3><p class="muted">Booking, reminders and rewards cards.</p></div>
  <div class="card">${I.store.replace('class="icon"', 'class="icon big"')}<h3>Online stores</h3><p class="muted">Products, delivery priced by distance, payment.</p></div>
 </div><p style="margin-top:24px" class="muted">Case studies: <a class="tlink" href="case-study.html">Tool Box LLC</a> · <a class="tlink" href="case-study.html">Yavi Barber</a></p><div class="acts" style="margin-top:12px">${btn('Start a project', true)}</div></div></section>`, { active: 'nevora' });

// ---------- Client hub ----------
const door = (icon, title, text, inner) => `<div class="card" style="display:flex;flex-direction:column">${icon.replace('class="icon"', 'class="icon big"')}<h3>${title}</h3><p class="muted">${text}</p>${inner}</div>`;
const hub = page('Client hub (v1)', 'Three doors. Door 1 goes to nevora.team. Doors 2 and 3 are forms designed for Codex\'s hub endpoint on velani-ai, which does not exist yet: NOT WIRED. Requests are meant for support@thevelani.com.', `
<section class="sec first"><div class="wrap"><p class="k">Client hub</p><h1>What do you need today?</h1><p class="lede">For businesses that already work with Velani.</p></div></section>
<section class="sec" style="padding-top:0;border-top:0"><div class="wrap grid3" style="align-items:start">
 ${door(I.signin, 'Sign in to NEVORA', 'For owners, managers and employees. Your workplace gives you your account.', `<a class="hb fill" href="#" style="margin-top:auto">Open nevora.team${I.ext}</a><p class="fine" style="margin-top:12px">Forgot your sign-in? Ask your manager or use “Forgot access” on the sign-in page.</p>`)}
 ${door(I.plus, 'Request new work', 'A new page, a feature, a change or a new project.', `<div class="notwired">${I.warn}<span>Design only · not wired. Waiting for the hub endpoint (Codex).</span></div>
   <label class="f"><span>Your name</span><input></label><label class="f"><span>Business</span><input></label><label class="f"><span>Email</span><input></label>
   <label class="f"><span>Which project</span><select><option>Website</option><option>App</option><option>Online store</option><option>NEVORA</option><option>Other</option></select></label>
   <label class="f"><span>What do you need?</span><textarea></textarea></label>
   <fieldset class="seg"><legend>When do you need it?</legend><label class="on">No rush</label><label>This month</label><label>This week</label></fieldset>
   <a class="hb fill" href="#" style="justify-content:center">Send request</a>`)}
 ${door(I.help, 'Get help with a project', 'Something isn’t working, or you have a question.', `<div class="notwired">${I.warn}<span>Design only · not wired. Waiting for the hub endpoint (Codex).</span></div>
   <label class="f"><span>Your name</span><input></label><label class="f"><span>Business</span><input></label><label class="f"><span>Email</span><input></label>
   <label class="f"><span>Which project</span><select><option>Website</option><option>App</option><option>Online store</option><option>NEVORA</option><option>Other</option></select></label>
   <label class="f"><span>What happened?</span><textarea></textarea></label>
   <fieldset class="seg"><legend>How urgent?</legend><label class="on">It can wait</label><label>It’s slowing us down</label><label>We can’t work</label></fieldset>
   <a class="hb fill" href="#" style="justify-content:center">Send to support</a>`)}
</div><div class="wrap"><p class="fine" style="margin-top:20px">Requests go to support@thevelani.com. We reply within two business days, Monday to Friday, 8 am to 9 pm ET. Don’t send passwords or payment details. Urgent? Call 787-925-2000.</p></div></section>
<section class="sec"><div class="wrap split"><div><p class="k">After sending</p><h3>Request received.</h3><p class="muted">We’ll reply from support@thevelani.com within two business days. Your reference: <b style="color:var(--text)">VR-1042</b> (fictional).</p></div><div class="card"><p class="k">States to build</p><p class="muted" style="margin:0">Empty · field errors under each field · sending · sent (above) · endpoint down (“Couldn’t send. Email support@thevelani.com”) · spam check (Turnstile, same as Rondo on this site).</p></div></div></section>`, { active: 'company' });

// ---------- Case study template ----------
const cs = page('Case-study template (filled with Tool Box LLC)', 'Order: business · problem · what we built · decisions · screens · outcome · support. Outcome lines are placeholders until the client confirms facts; no invented numbers.', `
<section class="sec first"><div class="wrap"><p class="k">Case study · Tool Box LLC · Website and online store</p><h1 style="max-width:18ch">Equipment rental that books itself.</h1><ul class="facts"><li>${I.map}Puerto Rico</li><li>${I.globe}Website + online store</li><li>${I.cal}[Year, from Jose]</li><li>${I.ext}[Live link]</li></ul></div></section>
<section class="sec" style="padding-top:0;border-top:0"><div class="wrap"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><img src="${A('night-tb-home.webp')}" alt="Tool Box LLC home page" width="2000" height="1250"></div><p class="cap">Tool Box LLC · designed and built by Velani.</p></div></section>
<section class="sec"><div class="wrap split" style="align-items:start">
 <div><p class="k">01 · The business</p><p class="lede">[Two lines from Jose: who Tool Box is and who rents from them.]</p><p class="k" style="margin-top:32px">02 · The problem</p><p class="lede">[What was slow, lost or manual before: phone calls for prices? delivery quotes by hand?]</p></div>
 <div><p class="k">03 · What we built</p><ul class="facts" style="display:grid;gap:12px;font-size:1rem;color:var(--text)"><li>${I.check}Equipment catalogue with real availability</li><li>${I.check}Delivery priced by distance to the job site</li><li>${I.check}Online reservation and payment</li><li>${I.check}A rental guide that helps customers choose</li></ul><p class="k" style="margin-top:32px">04 · Decisions</p><p class="muted">[2–3 choices and why, e.g. clear prices on every item instead of “call for a quote”.]</p></div>
</div></section>
<section class="sec"><div class="wrap"><p class="k">05 · Screens</p><div class="grid2"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><img src="${A('night-store.webp')}" alt="Tool Box LLC online store with prices and Reserve buttons" width="1600" height="1000"></div><div class="frame"><div class="bar"><i></i><i></i><i></i></div><img src="${A('night-tb-home.webp')}" alt="Tool Box LLC home page" width="2000" height="1250"></div></div></div></section>
<section class="sec"><div class="wrap split" style="align-items:start"><div><p class="k">06 · Outcome</p><p class="lede">[Only facts the client confirms, e.g. “Most reservations now come in online.” No invented numbers.]</p></div><div><p class="k">07 · After launch</p><p class="muted">[What Velani maintains and how the client asks for changes: through the Client hub.]</p><div class="acts" style="margin-top:20px">${btn('Start a project like this', true)}</div></div></div></section>`, { active: 'custom' });

for (const [f, html] of Object.entries({ 'index.html': home, 'nav.html': nav, 'products.html': products, 'hub.html': hub, 'case-study.html': cs })) writeFileSync(new URL(f, here), html);
console.log('built 5 mockup pages');
