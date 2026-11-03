import { company, routes, services, legalUpdated } from './content.mjs';
import { header as nightHeader, footer as nightFooter, homeMain, nevoraMain, policyMain, assistant as nightAssistant, icon, WORDMARK } from './night.mjs';
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
const e = escapeHtml;
const asset = (name, target) => target === 'shopify' ? "{{ '" + name + "' | asset_url }}" : '/assets/' + name;
const slugOf = path => path === '/' ? 'home' : path.split('/').at(-1);
function draftLinks(html) {
  return html.replace(/href="(\/[^"\s]*)"/g, (attribute, href) => {
    const path = href.split(/[?#]/)[0];
    if (!routes[path]) return attribute;
    const tail = href.slice(path.length);
    const suffix = path === '/' ? '' : '&amp;view=velani-' + path.split('/').at(-1);
    const query = tail.startsWith('?') ? '&amp;' + tail.slice(1) : tail;
    const canonical = path === '/' ? '{{ routes.root_url }}' + tail : href;
    return 'href="{% if theme.role == \'main\' %}' + canonical + '{% else %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}' + suffix + query + '{% endif %}"';
  });
}
/** Document title: "<page name> · Velani", unless the name already carries the brand (the home page). */
export const pageTitle = page => { const name = page.name || page.title; return name.includes('Velani') ? name : name + ' · Velani'; };
/** Plain text in email addresses becomes a mailto link; the input is already HTML-escaped. */
const linkEmail = html => html.split(company.email).join('<a href="mailto:' + company.email + '">' + company.email + '</a>');
const more = (text, href) => '<a class="more" href="' + e(href) + '"><span>' + e(text) + '</span>' + icon('caret-right') + '</a>';

function pageHero(page, { meta = '' } = {}) {
  return '<section class="phero"><div class="wrap"><p class="kicker">' + e(page.eyebrow) + '</p><h1 class="t1 rise">' + e(page.title) + '</h1>' + (page.intro ? '<p class="lede fade">' + e(page.intro) + '</p>' : '') + meta + '</div></section>';
}
/* Full-screen panels (the home page language): a square outlined button, a label, a title, one paragraph and one or two actions */
const hb = (text, href, fill = false) => '<a class="hb' + (fill ? ' fill' : '') + '" href="' + e(href) + '">' + e(text) + icon('arrow-right') + '</a>';
const tel = () => 'tel:+1' + company.phone.replace(/-/g, '');
function panel(target, { id, cls = '', img, flip = false, kick, title, tag = 'h2', html = '', text, acts = '', extra = '', first = false }) {
  const tid = id + '-t';
  const photo = img ? '<img class="hph' + (flip ? ' flip' : '') + '" src="' + asset('night-' + img + '.webp', target) + '" alt="" width="1920" height="1080"' + (first ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>' : '';
  return '<section class="hpanel ' + cls + '" id="' + id + '" aria-labelledby="' + tid + '">' + photo + '<div class="hshade"></div><div class="hcopy">' + (kick ? '<p class="hkick">' + e(kick) + '</p>' : '') + '<' + tag + ' class="rise" id="' + tid + '">' + (html || e(title)) + '</' + tag + '>' + (text ? '<p class="fade">' + e(text) + '</p>' : '') + (acts ? '<div class="hacts fade">' + acts + '</div>' : '') + '</div>' + extra + '</section>';
}
/** The closing panel on every company page: the wordmark, client support and the two ways in. */
function closing(target) {
  return '<section class="hpanel end" id="velani" aria-label="Velani"><img class="hph flip" src="' + asset('night-ai-light.webp', target) + '" alt="" width="1920" height="1080" loading="lazy"><div class="hshade"></div><div class="hcopy"><p class="hwm">' + WORDMARK + '</p><p class="fade">Software products and custom development. Client support ' + e(company.hours) + ' at <a class="ul" href="' + tel() + '">' + e(company.phone) + '</a>.</p><div class="hacts fade">' + hb('Start a project', '/pages/contact', true) + hb('Client support', '/pages/help') + '</div></div></section>';
}
const HOW = [
  ['We discuss the work', 'You show us how the work gets done today and who does it.'],
  ['You receive a written proposal', 'What we’ll build, what it costs, the milestones and who is responsible for what. Paid work starts only after you agree to it.'],
  ['We build in milestones', 'You review working software at each milestone.'],
  ['We hand it over', 'Who owns the code, what you receive and how support works after launch are all set in the written agreement.'],
];
const rail = (steps, cls = '') => '<ol class="rail' + cls + '" data-in>' + steps.map(([b, t], i) => '<li data-in><i>0' + (i + 1) + '</i><b>' + e(b) + '</b><span>' + e(t) + '</span></li>').join('') + '</ol>';
function services_(page, target) {
  const hero = panel(target, { id: 'top', cls: 'dim long', img: 'ai-glow', kick: page.eyebrow, title: page.title, tag: 'h1', text: page.intro, acts: hb('Start a project', '/pages/contact?interest=custom-software', true), first: true });
  const panels = services.map((s, i) => panel(target, { id: s.id, cls: s.side === 'right' ? 'right' : '', img: s.img, kick: '0' + (i + 1) + ' · Custom development', title: s.title, text: s.text, acts: hb('Start a project', '/pages/contact?interest=custom-software') })).join('');
  const how = '<section class="how-page" aria-labelledby="how-t"><div class="wrap"><div class="how"><p class="hkick">How it works</p><h2 class="t2 rise" id="how-t">How a custom project works</h2>' + rail(HOW) + '</div></div></section>';
  return hero + panels + how + closing(target);
}
function fields(live = false) {
  return '<fieldset' + (live ? '' : ' disabled') + '><legend class="sr">Project inquiry</legend><div class="form-row"><div class="field"><label for="inquiry-name">Name <span aria-hidden="true">*</span></label><input id="inquiry-name" name="contact[name]" autocomplete="name" maxlength="120" required aria-describedby="error-name"' + (live ? ' value="{{ form.name | escape }}"' : '') + '><p class="field-error" id="error-name"></p></div><div class="field"><label for="inquiry-email">Email <span aria-hidden="true">*</span></label><input id="inquiry-email" type="email" name="contact[email]" autocomplete="email" maxlength="254" required aria-describedby="error-email"' + (live ? ' value="{{ form.email | escape }}"' : '') + '><p class="field-error" id="error-email"></p></div></div><div class="form-row row-topic"><div class="field"><label for="inquiry-company">Company <span class="optional">optional</span></label><input id="inquiry-company" name="contact[company]" autocomplete="organization" maxlength="160" aria-describedby="error-company"><p class="field-error" id="error-company"></p></div><div class="field field-topic"><label for="inquiry-interest">Topic <span class="optional">optional</span></label><select id="inquiry-interest" name="contact[interest]"><option value="">Choose a topic</option><option value="custom-software">Custom software</option><option value="nevora">NEVORA quote</option><option value="nevora-demo">Free NEVORA demo</option><option value="other">Other</option></select></div></div><div class="form-row" data-nevora-fields hidden><div class="field"><label for="inquiry-team">Team size <span class="optional">optional</span></label><select id="inquiry-team" name="contact[team_size]"><option value="">Choose a size</option><option>1–9</option><option>10–24</option><option>25–49</option><option>50–99</option><option>100+</option><option>Not sure</option></select></div><div class="field"><label for="inquiry-locations">Locations <span class="optional">optional</span></label><input id="inquiry-locations" name="contact[locations]" maxlength="120" aria-describedby="locations-help error-locations"><p class="field-help" id="locations-help">How many locations, or where they are.</p><p class="field-error" id="error-locations"></p></div></div><div class="field"><label for="inquiry-message">' + v('Your message <span aria-hidden="true">*</span>', 'Anything else we should know? <span class="optional">optional</span>') + '</label><textarea id="inquiry-message" name="contact[body]" rows="6" maxlength="4000" required aria-describedby="message-help error-message">' + (live ? '{{ form.body | escape }}' : '') + '</textarea><p class="field-help" id="message-help">' + v('Describe the work. Please do not include passwords, payment details or sensitive records.', 'For example, what you use today for schedules, time and payroll. Please do not include passwords, payment details or sensitive records.') + '</p><p class="field-error" id="error-message"></p></div><p class="form-privacy">An inquiry does not subscribe you to marketing. Read our <a href="/pages/privacy">Privacy notice</a>.</p><button class="pill" type="submit" data-inquiry-submit>' + (live ? 'Send inquiry' : 'Check draft inquiry') + '</button></fieldset>';
}
/** The contact hero carries both the general and the NEVORA enquiry wording; the boot script marks the document before paint and CSS shows one. */
const v = (general, nevora, demo) => '<span class="v-d">' + general + '</span><span class="v-n">' + nevora + '</span>' + (demo ? '<span class="v-m">' + demo + '</span>' : '');
function contactHero(page) {
  return '<section class="phero"><div class="wrap"><p class="kicker">' + v(e(page.eyebrow), 'NEVORA for your team', 'Free 30-day NEVORA demo') + '</p><h1 class="t1 rise">' + v(e(page.title), 'Tell us about your shift team.', 'Start your free NEVORA demo.') + '</h1><p class="lede fade">' + v(e(page.intro), 'A few details about your business are enough to start. We’ll discuss what you need and NEVORA’s availability.', 'Tell us about your team and we set up your workplace with you. Up to 30 employees, 30 days from setup, no card and no automatic charge. On day 30 you continue by quote, export your data or we delete it within 3 days. NEVORA calculates pay statements; it does not pay employees or file taxes.') + '</p></div></section>';
}
function contact(target) {
  const preview = '<form id="project-inquiry" class="inquiry-form panel" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate><p class="note"><strong>Website preview.</strong> This form checks your draft without sending it.</p>' + fields() + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><noscript><p>The preview form needs JavaScript. No messages are sent from this preview.</p></noscript></form>';
  const email = '<div class="panel"><h2 class="t3">Write to us</h2><p>Tell us what needs to work better, who will use it and how it works today. We reply from ' + company.email + '.</p><div class="acts"><a class="pill" href="mailto:' + company.email + '">Email ' + company.email + '</a></div><p class="field-help mail">Please do not send passwords, payment details or sensitive records by email.</p></div>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form panel' %}<div data-inquiry-mode=\"live\">" + fields(true) + "</div>{% if form.posted_successfully? %}<p class=\"form-status\" role=\"status\">Thank you. Your inquiry was sent, and we will reply by email.</p>{% elsif form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}<div class=\"form-legal\">{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}</div>{% endform %}{% elsif theme.role == 'main' %}" + email + '{% else %}' + preview + '{% endif %}';
  const aside = '<div class="contact-aside"><h2 class="t3">A useful first conversation.</h2><p>' + v('What happens today? Where does it break down? Who needs to use the result?', 'How many people work shifts? How many locations? What do you use today for schedules, time and payroll?') + '</p><p>' + v('You can bring an early idea or an existing process. For NEVORA, tell us about your team and how many people work shifts.', 'A quote does not commit you to anything. We reply by email.') + '</p><p><a href="mailto:' + company.email + '">' + company.email + '</a><br><a href="tel:+1' + company.phone.replace(/-/g, '') + '">' + company.phone + '</a> · ' + company.hours + '</p><p class="contact-address">VELANI LLC<br>' + e(company.address) + '</p></div>';
  return '<section class="contact"><div class="wrap contact-grid"><div>' + (target === 'shopify' ? native : preview) + '</div>' + aside + '</div></section>';
}
function consent() {
  return '<dialog class="cookie-dialog" id="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-summary"><div class="dialog-heading"><h2 id="cookie-title">Cookie choices</h2><button type="button" class="icon-button" data-cookie-close aria-label="Close cookie choices">' + icon('x') + '</button></div><p id="cookie-summary">Choose which optional processing you allow. Necessary platform features are explained on our <a href="/pages/cookies">Cookies and preferences</a> page.</p><div class="cookie-option"><div><strong>Necessary</strong><p>Website operation, security and remembering choices.</p></div><span class="always-on">Always on</span></div><label class="cookie-option"><span><strong>Preferences</strong><span>Optional settings that personalize a visit.</span></span><input type="checkbox" data-consent="preferences"></label><label class="cookie-option"><span><strong>Analytics</strong><span>Optional measurement of website use.</span></span><input type="checkbox" data-consent="analytics"></label><label class="cookie-option"><span><strong>Marketing</strong><span>Optional advertising-related processing.</span></span><input type="checkbox" data-consent="marketing"></label><p class="cookie-context" data-cookie-context></p><div class="consent-status" role="status" aria-live="polite"></div><div class="cookie-actions"><button class="pill line" type="button" data-cookie-reject>Reject all optional</button><button class="pill line" type="button" data-cookie-accept>Accept all optional</button><button class="pill" type="button" data-cookie-save>Save choices</button></div></dialog>';
}
const num = i => '<i>0' + (i + 1) + '</i>';
const docEnd = () => '<div class="doc-end"><p class="hkick">Questions</p><p>Write to <a href="mailto:' + company.email + '">' + company.email + '</a>, or to ' + e(company.operator) + ', ' + e(company.address) + '.</p><div class="acts"><a class="pill line" href="/pages/contact">Contact</a></div></div>';
function legalDoc(page) {
  const toc = page.sections.map((s, i) => '<a href="#section-' + i + '">' + e(s.heading) + '</a>').join('');
  const body = page.sections.map((s, i) => '<section id="section-' + i + '">' + num(i) + '<h2>' + e(s.heading) + '</h2><p>' + linkEmail(e(s.text)) + '</p></section>').join('');
  const cookie = page.cookieAction ? '<button class="pill line" type="button" data-cookie-open disabled>Open cookie choices</button><noscript><p class="cookie-nojs-note">Cookie controls need JavaScript. Write to ' + company.email + ' about privacy choices.</p></noscript>' : '';
  return pageHero(page, { meta: '<p class="doc-meta">Last updated ' + e(legalUpdated) + '</p>' }) + '<section class="doc"><div class="wrap doc-grid"><aside class="doc-aside"><p class="doc-aside-t">On this page</p><nav aria-label="Page contents">' + toc + '</nav><p class="doc-aside-t">More</p><nav aria-label="Legal"><a href="/pages/legal">All legal information</a><a href="/pages/nevora-privacy">NEVORA privacy policy</a></nav></aside><div class="doc-body">' + body + cookie + docEnd() + '</div></div></section>';
}
function legalIndex() {
  const tile = ([text, href, note]) => '<a class="tile" href="' + href + '"><span class="t3">' + e(text) + '</span><p>' + e(note) + '</p>' + icon('arrow-right') + '</a>';
  const site = [['Website privacy notice', '/pages/privacy', 'How this website handles information, including when you write to us.'], ['Cookies and preferences', '/pages/cookies', 'Storage on this website and your optional choices.'], ['Website terms', '/pages/website-terms', 'The rules for using this website.'], ['Software and project terms', '/pages/software-project-terms', 'What applies before paid work or software access begins.'], ['Accessibility', '/pages/accessibility', 'Our accessibility target and how to report a barrier.'], ['Security', '/pages/security', 'How to report a security concern privately.']];
  const nevora = [['NEVORA privacy policy', '/pages/nevora-privacy', 'How the NEVORA app handles workplace information.'], ['NEVORA terms of use', '/pages/nevora-terms', 'The rules for using NEVORA.'], ['NEVORA support', '/pages/nevora-support', 'Signing in, your account and getting help.'], ['Delete your NEVORA account', '/pages/nevora-account-deletion', 'How to ask us to delete your account.']];
  return '<section class="dir"><div class="wrap"><p class="hkick">This website</p><h2 class="t2">Website notices</h2><div class="tiles">' + site.map(tile).join('') + '</div><p class="hkick">NEVORA app</p><h2 class="t2">For people who use NEVORA</h2><div class="tiles">' + nevora.map(tile).join('') + '</div></div></section>';
}
function plans(page, target) {
  const facts = '<dl class="spec big"><div><dt>Free demo</dt><dd>30 days<small>From the day we set up your workplace</small></dd></div><div><dt>Team size</dt><dd>Up to 30 employees<small>Larger teams by quote</small></dd></div><div><dt>Card</dt><dd>None<small>No automatic charge on day 30</small></dd></div><div><dt>After the demo</dt><dd>One price per business<small>Set by quote for your team and locations</small></dd></div></dl>';
  const included = ['Scheduling and shift swaps', 'Time clock on a shared tablet, with PINs', 'Time off requests and approvals', 'Timecards ready for review', 'Payroll calculated from approved hours', 'Pay statements for every employee', 'Roles for owners, managers and employees', 'English and Spanish at the time clock'];
  const inc = '<div class="inc"><p class="hkick">Included</p><h2 class="t2 rise">Everything in the demo stays in the plan.</h2><dl class="spec">' + included.map((t, i) => '<div><dt>0' + (i + 1) + '</dt><dd>' + e(t) + '</dd></div>').join('') + '</dl><p class="fine">NEVORA calculates pay statements; it does not pay employees or file payroll taxes. NEVORA is in development, and features can change.</p></div>';
  const day30 = '<div class="inc"><p class="hkick">Day 30</p><h2 class="t2 rise">Three ways the demo can end.</h2>' + rail([['Continue by quote', 'We price NEVORA for your business and your team keeps working without interruption.'], ['Export your data', 'Schedules, timecards and pay statements, yours to keep.'], ['We delete it', 'Your workplace and its records are deleted within 3 days.']], ' r3') + '<div class="acts"><a class="pill" href="/pages/contact?interest=nevora-demo">Start free demo</a><a class="pill line" href="/pages/contact?interest=nevora">Ask for a quote</a></div><p class="hfact">No card required · No automatic charge</p></div>';
  const custom = '<div class="inc"><p class="hkick">Websites and custom apps</p><h2 class="t2 rise">Quoted per project.</h2><p class="lede">A written proposal after a first conversation: what we build, what it costs and the milestones. Paid work starts only after you agree to it.</p><div class="acts"><a class="pill line" href="/pages/contact?interest=custom-software">Start a project</a></div></div>';
  return pageHero(page) + '<section class="plans"><div class="wrap">' + facts + inc + day30 + custom + '</div></section>' + closing(target);
}
function faq(page, target) {
  const support = '<section class="support" aria-labelledby="sup-t"><div class="wrap"><p class="hkick">Client support</p><h2 class="t2 rise" id="sup-t">For our clients.</h2><dl class="spec big"><div><dt>Email</dt><dd><a href="mailto:' + company.email + '">' + company.email + '</a></dd></div><div><dt>Phone</dt><dd><a href="' + tel() + '">' + e(company.phone) + '</a><small>' + e(company.hours) + '</small></dd></div><div><dt>Write to us</dt><dd>' + e(company.operator) + '<small>' + e(company.address) + '</small></dd></div></dl><div class="acts"><a class="pill" href="/pages/contact">Contact page</a></div></div></section>';
  const questions = '<section class="faq" aria-labelledby="faq-t"><div class="wrap"><div class="qa"><div class="head"><p class="hkick">Questions</p><h2 class="t2 rise" id="faq-t">Before we start</h2></div><div class="faq-list">' + page.sections.map(s => '<details><summary>' + e(s.heading) + icon('plus') + '</summary><p>' + linkEmail(e(s.text)) + '</p></details>').join('') + '<div class="acts">' + more('NEVORA questions', '/pages/nevora#faq') + '</div></div></div></div></section>';
  const app = '<section class="band help" aria-labelledby="help-t"><div class="wrap band-in"><h2 class="t3" id="help-t">Do you use NEVORA at work?</h2><p class="band-links">' + more('NEVORA support', '/pages/nevora-support') + more('NEVORA privacy policy', '/pages/nevora-privacy') + more('Delete your NEVORA account', '/pages/nevora-account-deletion') + more('NEVORA terms of use', '/pages/nevora-terms') + '</p></div></section>';
  return pageHero(page) + support + questions + app + closing(target);
}
function about(page, target) {
  const hero = panel(target, { id: 'top', cls: 'dim long', img: 'ai-glow', flip: true, kick: page.eyebrow, title: page.title, tag: 'h1', text: page.intro, acts: hb('Start a project', '/pages/contact', true) + hb('See NEVORA', '/pages/nevora'), first: true });
  return hero + '<section class="split" aria-label="About Velani"><div class="wrap">' + page.sections.map(s => '<div class="draw"><h2 class="t3">' + e(s.heading) + '</h2><div><p>' + linkEmail(e(s.text)) + '</p></div></div>').join('') + '</div></section>' + closing(target);
}
function notFound() {
  return '<section class="phero"><div class="wrap"><p class="kicker">Page not found</p><h1 class="t1">We could not find that page.</h1><p class="lede">The link may be out of date, or the address may be misspelled.</p><div class="acts"><a class="pill" href="/">Go to the home page</a><a class="pill line" href="/pages/nevora">See NEVORA</a></div></div></section>';
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return notFound();
  switch (page.kind) {
    case 'home': return homeMain(target);
    case 'nevora': return nevoraMain(target);
    case 'policy': return policyMain(page.slug);
    case 'services': return services_(page, target);
    case 'contact': return contactHero(page) + contact(target);
    case 'faq': return faq(page, target);
    case 'plans': return plans(page, target);
    case 'legal-index': return pageHero(page) + legalIndex();
    default: return page.legal ? legalDoc(page) : about(page, target);
  }
}
export function renderBody(path, { target = 'preview' } = {}) {
  const html = renderRawBody(path, target);
  return target === 'shopify' ? draftLinks(html) : html;
}
/** Which stylesheet and script a page needs beyond the shared ones. */
const pageKind = path => routes[path]?.kind === 'home' ? 'home' : routes[path]?.kind === 'nevora' ? 'nevora' : null;
function headAssets(kind, target) {
  const css = '<link rel="stylesheet" href="' + asset('velani.css', target) + '">' + (kind ? '<link rel="stylesheet" href="' + asset('velani-' + kind + '.css', target) + '">' : '');
  const js = (kind ? '<script src="' + asset('velani-' + kind + '.js', target) + '" defer></script>' : '') + '<script src="' + asset('velani-motion.js', target) + '" defer></script><script type="module" src="' + asset('velani.js', target) + '"></script>';
  return css + js;
}
export const BOOT_JS = "(function(d){d.className='js pre'+(/[?&]interest=nevora(-demo)?(&|$)/.test(location.search)?' ask-nevora':'')+(/[?&]interest=nevora-demo(&|$)/.test(location.search)?' ask-demo':'');window.__pre=setTimeout(function(){d.classList.remove('pre');d.classList.add('still')},2500)})(document.documentElement)";
const BOOT = '<script>' + BOOT_JS + '</script>';
/** Organization data for brand search results; no ratings, no invented facts. */
const ORG_LD = '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: company.name, legalName: company.operator, url: 'https://' + company.domain + '/', email: company.email, telephone: '+1-' + company.phone, address: { '@type': 'PostalAddress', streetAddress: '1654 Calle Tulipan, Suite 100', addressLocality: 'San Juan', addressRegion: 'PR', postalCode: '00927', addressCountry: 'US' }, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: company.email, telephone: '+1-' + company.phone, hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '21:00' } } }).replace(/</g, '\\u003c') + '</script>';
/** The assistant appears only when an API address is configured: the theme setting on Shopify, VELANI_ASSISTANT_API for the local preview. */
function assistantBlock(target) {
  if (target === 'shopify') return "{% if settings.assistant_api_url != blank %}" + nightAssistant('shopify', '{{ settings.assistant_api_url | strip | escape }}') + '<script type="module" src="' + asset('velani-assist.js', 'shopify') + '"></script>{% endif %}';
  const api = (process.env.VELANI_ASSISTANT_API || '').trim();
  return api ? nightAssistant(target, e(api)) + '<script type="module" src="' + asset('velani-assist.js', target) + '"></script>' : '';
}
const preload = (target, extra = '') => '<link rel="preload" href="' + asset('dm-sans-latin-400-normal.woff2', target) + '" as="font" type="font/woff2" crossorigin><link rel="preload" href="' + asset('dm-sans-latin-600-normal.woff2', target) + '" as="font" type="font/woff2" crossorigin>' + extra;
export function renderPage(path, { target = 'preview' } = {}) {
  const page = routes[path] || { title: 'Page not found', intro: 'We could not find that page.' };
  const title = pageTitle(page);
  const kind = pageKind(path);
  const hero = kind === 'home' ? 'night-ai-light.webp' : kind === 'nevora' ? 'night-ai-devices.webp' : '';
  const html = '<!doctype html><html lang="en" class="no-js" data-platform="' + (target === 'shopify' ? 'shopify' : 'local') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + BOOT + '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>' + e(title) + '</title><meta name="description" content="' + e(page.intro) + '"><link rel="icon" href="' + asset('favicon.svg', target) + '" type="image/svg+xml">' + preload(target, hero ? '<link rel="preload" as="image" href="' + asset(hero, target) + '" fetchpriority="high">' : '') + headAssets(kind, target) + ORG_LD + '</head><body>' + nightHeader(page.nav, target, { nevora: kind === 'nevora' }) + '<main id="main" tabindex="-1">' + renderBody(path, { target }) + '</main>' + nightFooter(target) + consent() + assistantBlock(target) + '</body></html>';
  return { html, status: routes[path] ? 200 : 404 };
}
export function renderShopifyLayout() {
  // Liquid string literals have no escapes, so a quote or backslash in a title would break the layout: refuse it at build time
  const liquidStr = text => { if (/["\\]/.test(text)) throw new Error('Liquid string cannot contain quotes or backslashes: ' + text); return '"' + text + '"'; };
  const assignments = page => `{% assign velani_page_title = ${liquidStr(page.title)} %}{% assign velani_page_description = ${liquidStr(page.intro)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% assign velani_page = template.suffix | remove_first: 'velani-' %}{% if template.name == 'index' and template.suffix == blank %}{% assign velani_page = 'home' %}{% assign velani_page_title = ${liquidStr(pageTitle(routes['/']))} %}{% assign velani_page_description = ${liquidStr(routes['/'].intro)} %}{% endif %}{% case velani_page %}` + Object.entries(routes).filter(([path]) => path !== '/').map(([, page]) => `{% when '${slugOf(Object.keys(routes).find(p => routes[p] === page))}' %}${assignments({ title: pageTitle(page), intro: page.intro })}`).join('') + '{% endcase %}';
  const navMap = Object.entries(routes).filter(([, page]) => page.nav).map(([path, page]) => `{% when '${slugOf(path)}' %}{% assign velani_nav = '${page.nav}' %}`).join('');
  const nav = `{% assign velani_nav = '' %}{% case velani_page %}${navMap}{% endcase %}`;
  const kindCss = `{% if velani_page == 'home' %}<link rel="preload" as="image" href="{{ 'night-ai-light.webp' | asset_url }}" fetchpriority="high">{% elsif velani_page == 'nevora' %}<link rel="preload" as="image" href="{{ 'night-ai-devices.webp' | asset_url }}" fetchpriority="high">{% endif %}{% if velani_page == 'home' or velani_page == 'nevora' %}<link rel="stylesheet" href="{{ 'velani-' | append: velani_page | append: '.css' | asset_url }}"><script src="{{ 'velani-' | append: velani_page | append: '.js' | asset_url }}" defer></script>{% endif %}`;
  const head = `<link rel="stylesheet" href="${asset('velani.css', 'shopify')}">${kindCss}<script src="${asset('velani-motion.js', 'shopify')}" defer></script><script type="module" src="${asset('velani.js', 'shopify')}"></script>`;
  const fontFace = '<style>' + [400, 500, 600].map(w => `@font-face{font-family:"DM Sans";font-weight:${w};font-display:swap;src:url({{ 'dm-sans-latin-${w}-normal.woff2' | asset_url }}) format("woff2")}`).join('') + '</style>';
  const policyFallback = `<section class="phero"><div class="wrap"><p class="kicker">Legal</p><h1 class="t1">Legal information</h1><p class="lede">Read the notices for this website and the NEVORA app.</p><div class="acts"><a class="pill" href="/pages/legal">All legal information</a></div></div></section>`;
  const html = `<!doctype html><html lang="{{ request.locale.iso_code }}" class="no-js" data-platform="shopify"><head>${metadata}${nav}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BOOT}{% unless theme.role == 'main' %}<meta name="robots" content="noindex, nofollow">{% endunless %}<meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>{% if velani_page_title contains 'Velani' %}{{ velani_page_title | escape }}{% else %}{{ velani_page_title | escape }} · Velani{% endif %}</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ canonical_url | escape }}"><meta property="og:site_name" content="Velani"><meta property="og:type" content="website"><meta property="og:title" content="{{ velani_page_title | escape }}"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ canonical_url | escape }}"><meta property="og:image" content="{{ 'velani-social.png' | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Velani"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg', 'shopify')}" type="image/svg+xml">{{ 'dm-sans-latin-400-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}{{ 'dm-sans-latin-600-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}${head}${fontFace}${ORG_LD}{{ content_for_header }}</head><body>${nightHeader(null, 'shopify')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}${policyFallback}{% else %}{{ content_for_layout }}{% endif %}</main>${nightFooter('shopify')}${consent()}${assistantBlock('shopify')}</body></html>`;
  return draftLinks(html);
}
