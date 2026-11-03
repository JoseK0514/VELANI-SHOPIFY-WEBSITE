import { company, routes, services, legalUpdated } from './content.mjs';
import { header as nightHeader, footer as nightFooter, homeMain, nevoraMain, policyMain, assistant as nightAssistant, icon } from './night.mjs';
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
function doors() {
  return '<section class="band" aria-label="Contact"><div class="wrap band-in band-two"><div><h2 class="t3">Thinking about NEVORA for your team?</h2><a class="pill" href="/pages/contact?interest=nevora">Ask for a NEVORA quote</a></div><div><h2 class="t3">Have a project in mind?</h2><a class="pill line" href="/pages/contact?interest=custom-software">Tell us about your project</a><p class="mail">Or write to <a href="mailto:' + company.email + '">' + company.email + '</a></p></div></div></section>';
}
const HOW = [
  ['We discuss the work', 'You show us how the work gets done today and who does it.'],
  ['You receive a written proposal', 'What we’ll build, what it costs, the milestones and who is responsible for what. Paid work starts only after you agree to it.'],
  ['We build in milestones', 'You review working software at each milestone.'],
  ['We hand it over', 'Who owns the code, what you receive and how support works after launch are all set in the written agreement.'],
];
function services_() {
  return '<section class="split" aria-label="What we build"><div class="wrap">' + services.map(s => '<div class="draw" id="' + s.id + '"><h2 class="t2">' + e(s.title) + '</h2><div><h3>' + e(s.intro) + '</h3><p>' + e(s.text) + '</p><p>' + e(s.detail) + '</p></div></div>').join('') + '</div></section><section class="how-page"><div class="wrap"><div class="how"><h2 class="t2 rise">How a custom project works</h2><ol class="rail" data-in>' + HOW.map(([b, t]) => '<li data-in><b>' + e(b) + '</b><span>' + e(t) + '</span></li>').join('') + '</ol></div></div></section>' + doors();
}
function products() {
  return '<section class="doors" aria-label="What we make"><div class="wrap"><div class="doors-grid"><div class="door fade"><div><img class="wm" src="{{wm}}" alt="NEVORA" width="907" height="122"><p class="status"><i aria-hidden="true"></i><span>In development · Offered to businesses <span class="nw">by quote</span></span></p><p>Scheduling, time clock and payroll calculation for teams that work in shifts, on the web, on phones and on a shared tablet at work.</p></div><div class="acts"><a class="pill" href="/pages/nevora">See how NEVORA works</a>' + more('Ask for a quote', '/pages/contact?interest=nevora') + '</div></div><div class="door fade"><div><h2 class="t2">Custom software</h2><p>Web and mobile applications, business systems and integrations, built for how your business works.</p></div><div class="acts"><a class="pill line" href="/pages/custom-development">Explore custom development</a>' + more('Tell us about your project', '/pages/contact?interest=custom-software') + '</div></div></div></div></section>';
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
function legalDoc(page) {
  const toc = page.sections.map((s, i) => '<a href="#section-' + i + '">' + e(s.heading) + '</a>').join('');
  const body = page.sections.map((s, i) => '<section id="section-' + i + '"><h2>' + e(s.heading) + '</h2><p>' + linkEmail(e(s.text)) + '</p></section>').join('');
  const cookie = page.cookieAction ? '<button class="pill line" type="button" data-cookie-open disabled>Open cookie choices</button><noscript><p class="cookie-nojs-note">Cookie controls need JavaScript. Write to ' + company.email + ' about privacy choices.</p></noscript>' : '';
  return pageHero(page, { meta: '<p class="doc-meta">Last updated ' + e(legalUpdated) + '</p>' }) + '<section class="doc"><div class="wrap doc-grid"><aside class="doc-aside"><p class="doc-aside-t">On this page</p><nav aria-label="Page contents">' + toc + '</nav><p class="doc-aside-t">More</p><nav aria-label="Legal"><a href="/pages/legal">All legal information</a><a href="/pages/nevora-privacy">NEVORA privacy policy</a></nav></aside><div class="doc-body">' + body + cookie + '<p class="doc-contact">Questions? Write to <a href="mailto:' + company.email + '">' + company.email + '</a>, or to ' + e(company.operator) + ', ' + e(company.address) + '.</p></div></div></section>';
}
function legalIndex() {
  const row = ([text, href, note]) => '<a class="draw" href="' + href + '"><span class="t3">' + e(text) + '</span><p>' + e(note) + '</p>' + icon('arrow-right') + '</a>';
  const site = [['Website privacy notice', '/pages/privacy', 'How this website handles information, including when you write to us.'], ['Cookies and preferences', '/pages/cookies', 'Storage on this website and your optional choices.'], ['Website terms', '/pages/website-terms', 'The rules for using this website.'], ['Software and project terms', '/pages/software-project-terms', 'What applies before paid work or software access begins.'], ['Accessibility', '/pages/accessibility', 'Our accessibility target and how to report a barrier.'], ['Security', '/pages/security', 'How to report a security concern privately.']];
  const nevora = [['NEVORA privacy policy', '/pages/nevora-privacy', 'How the NEVORA app handles workplace information.'], ['NEVORA terms of use', '/pages/nevora-terms', 'The rules for using NEVORA.'], ['NEVORA support', '/pages/nevora-support', 'Signing in, your account and getting help.'], ['Delete your NEVORA account', '/pages/nevora-account-deletion', 'How to ask us to delete your account.']];
  return '<section class="dir"><div class="wrap"><h2 class="t2">This website</h2><div class="rows">' + site.map(row).join('') + '</div><h2 class="t2">NEVORA app</h2><div class="rows">' + nevora.map(row).join('') + '</div></div></section>';
}
function faq(page) {
  return '<section class="faq"><div class="wrap">' + page.sections.map(s => '<details><summary>' + e(s.heading) + icon('plus') + '</summary><p>' + linkEmail(e(s.text)) + '</p></details>').join('') + '<div class="acts">' + more('NEVORA questions', '/pages/nevora#faq') + more('NEVORA support', '/pages/nevora-support') + '</div></div></section>' + doors();
}
function about(page) {
  return '<section class="split"><div class="wrap">' + page.sections.map(s => '<div class="draw"><h2 class="t3">' + e(s.heading) + '</h2><div><p>' + linkEmail(e(s.text)) + '</p></div></div>').join('') + '</div></section>' + doors();
}
function notFound() {
  return '<section class="phero"><div class="wrap"><p class="kicker">Page not found</p><h1 class="t1">We could not find that page.</h1><p class="lede">The link may be out of date, or the address may be misspelled.</p><div class="acts"><a class="pill" href="/">Go to the home page</a>' + more('See how NEVORA works', '/pages/nevora') + '</div></div></section>';
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return notFound();
  switch (page.kind) {
    case 'home': return homeMain(target);
    case 'nevora': return nevoraMain(target);
    case 'policy': return policyMain(page.slug);
    case 'products': return pageHero(page) + products().replace('{{wm}}', asset('night-nevora-wm-white.png', target));
    case 'services': return pageHero(page) + services_();
    case 'contact': return contactHero(page) + contact(target);
    case 'faq': return pageHero(page) + faq(page);
    case 'legal-index': return pageHero(page) + legalIndex();
    default: return page.legal ? legalDoc(page) : pageHero(page) + about(page);
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
  const html = '<!doctype html><html lang="en" class="no-js" data-platform="' + (target === 'shopify' ? 'shopify' : 'local') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + BOOT + '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>' + e(title) + '</title><meta name="description" content="' + e(page.intro) + '"><link rel="icon" href="' + asset('favicon.svg', target) + '" type="image/svg+xml">' + preload(target) + headAssets(kind, target) + '</head><body>' + nightHeader(page.nav, target, { nevora: kind === 'nevora' }) + '<main id="main" tabindex="-1">' + renderBody(path, { target }) + '</main>' + nightFooter(target) + consent() + assistantBlock(target) + '</body></html>';
  return { html, status: routes[path] ? 200 : 404 };
}
export function renderShopifyLayout() {
  // Liquid string literals have no escapes, so a quote or backslash in a title would break the layout: refuse it at build time
  const liquidStr = text => { if (/["\\]/.test(text)) throw new Error('Liquid string cannot contain quotes or backslashes: ' + text); return '"' + text + '"'; };
  const assignments = page => `{% assign velani_page_title = ${liquidStr(page.title)} %}{% assign velani_page_description = ${liquidStr(page.intro)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% assign velani_page = template.suffix | remove_first: 'velani-' %}{% if template.name == 'index' and template.suffix == blank %}{% assign velani_page = 'home' %}{% assign velani_page_title = ${liquidStr(pageTitle(routes['/']))} %}{% assign velani_page_description = ${liquidStr(routes['/'].intro)} %}{% endif %}{% case velani_page %}` + Object.entries(routes).filter(([path]) => path !== '/').map(([, page]) => `{% when '${slugOf(Object.keys(routes).find(p => routes[p] === page))}' %}${assignments({ title: pageTitle(page), intro: page.intro })}`).join('') + '{% endcase %}';
  const navMap = Object.entries(routes).filter(([, page]) => page.nav).map(([path, page]) => `{% when '${slugOf(path)}' %}{% assign velani_nav = '${page.nav}' %}`).join('');
  const nav = `{% assign velani_nav = '' %}{% case velani_page %}${navMap}{% endcase %}`;
  const kindCss = `{% if velani_page == 'home' or velani_page == 'nevora' %}<link rel="stylesheet" href="{{ 'velani-' | append: velani_page | append: '.css' | asset_url }}"><script src="{{ 'velani-' | append: velani_page | append: '.js' | asset_url }}" defer></script>{% endif %}`;
  const head = `<link rel="stylesheet" href="${asset('velani.css', 'shopify')}">${kindCss}<script src="${asset('velani-motion.js', 'shopify')}" defer></script><script type="module" src="${asset('velani.js', 'shopify')}"></script>`;
  const fontFace = '<style>' + [400, 500, 600].map(w => `@font-face{font-family:"DM Sans";font-weight:${w};font-display:swap;src:url({{ 'dm-sans-latin-${w}-normal.woff2' | asset_url }}) format("woff2")}`).join('') + '</style>';
  const policyFallback = `<section class="phero"><div class="wrap"><p class="kicker">Legal</p><h1 class="t1">Legal information</h1><p class="lede">Read the notices for this website and the NEVORA app.</p><div class="acts"><a class="pill" href="/pages/legal">All legal information</a></div></div></section>`;
  const html = `<!doctype html><html lang="{{ request.locale.iso_code }}" class="no-js" data-platform="shopify"><head>${metadata}${nav}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BOOT}{% unless theme.role == 'main' %}<meta name="robots" content="noindex, nofollow">{% endunless %}<meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>{% if velani_page_title contains 'Velani' %}{{ velani_page_title | escape }}{% else %}{{ velani_page_title | escape }} · Velani{% endif %}</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ canonical_url | escape }}"><meta property="og:site_name" content="Velani"><meta property="og:type" content="website"><meta property="og:title" content="{{ velani_page_title | escape }}"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ canonical_url | escape }}"><meta property="og:image" content="{{ 'velani-social.png' | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Velani"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg', 'shopify')}" type="image/svg+xml">{{ 'dm-sans-latin-400-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}{{ 'dm-sans-latin-600-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}${head}${fontFace}{{ content_for_header }}</head><body>${nightHeader(null, 'shopify')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}${policyFallback}{% else %}{{ content_for_layout }}{% endif %}</main>${nightFooter('shopify')}${consent()}${assistantBlock('shopify')}</body></html>`;
  return draftLinks(html);
}
