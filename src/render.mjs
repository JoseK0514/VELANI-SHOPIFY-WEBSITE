import { company, routes, services, legalLinks } from './content.mjs';
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
const e = escapeHtml;
const asset = (name, target) => target === 'shopify' ? "{{ '" + name + "' | asset_url }}" : '/assets/' + name;
const icon = (name, target, className = '') => '<img class="icon ' + e(className) + '" src="' + asset(name + '.svg', target) + '" width="24" height="24" alt="" aria-hidden="true">';
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
function link(text, href, target, className = 'text-link') {
  return '<a class="' + e(className) + '" href="' + e(href) + '">' + e(text) + icon('arrow-right', target) + '</a>';
}
function header(page, target) {
  return '<header class="site-header"><div class="container header-inner"><a class="wordmark" href="/" aria-label="The Velani home">The Velani</a><button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation" hidden>' + icon('list', target) + '<span>Menu</span></button><nav class="site-nav" id="primary-nav" aria-label="Main navigation"><a' + (page.nav === 'products' ? ' aria-current="page"' : '') + ' href="/pages/products">Products</a><a' + (page.nav === 'services' ? ' aria-current="page"' : '') + ' href="/pages/custom-development">Custom Development</a><a' + (page.nav === 'about' ? ' aria-current="page"' : '') + ' href="/pages/about">About</a>' + link('Discuss a project', '/pages/contact', target, 'button button-small header-cta') + '</nav></div></header>';
}
function footer(target) {
  return '<footer class="site-footer"><div class="container footer-inner"><div class="footer-company"><a class="wordmark" href="/">The Velani</a><span class="company-label">VELANI LLC</span><a class="footer-email" href="mailto:' + company.email + '">' + company.email + '</a></div><nav class="footer-links" aria-label="Company and legal">' + legalLinks.map(([text, href]) => '<a href="' + href + '">' + text + '</a>').join('') + '<button class="link-button" type="button" data-cookie-open>Cookie choices</button></nav></div></footer>';
}
function workflow(target) {
  const nodes = [['calendar-blank', 'Schedule'], ['clock', 'Time'], ['file-text', 'Review']];
  return '<div class="workflow"><p class="workflow-caption">Workflow illustration</p><ol class="workflow-steps" aria-label="Schedule, time and review">' + nodes.map(([name, text], index) => '<li><span class="workflow-node">' + icon(name, target) + '</span><span>' + text + '</span>' + (index < nodes.length - 1 ? icon('arrow-right', target, 'workflow-arrow') : '') + '</li>').join('') + '</ol></div>';
}
function productBand(target, heading = 'h2') {
  return '<section class="product-band" aria-labelledby="product-name"><div class="container product-band-inner"><div><p class="eyebrow">A product of our own</p><div class="product-title"><' + heading + ' id="product-name">NEVORA</' + heading + '><span class="status-tag">In development</span></div><p class="product-copy">Scheduling, recorded time, employee requests<br class="wide-only"> and payroll review workflows, connected.</p>' + link('Explore NEVORA', '/pages/nevora', target) + '</div>' + workflow(target) + '</div></section>';
}
function invitation(target) {
  return '<section class="invitation"><div class="container"><h2>Start with the problem.</h2><p>Tell us what needs to work better, who needs to use it, and what you want to build.</p>' + link('Discuss a project', '/pages/contact', target, 'button') + '</div></section>';
}
function home(target) {
  return '<section class="home-hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">Software products + custom development</p><h1>Your business.<br>In working software.</h1><p class="hero-intro">' + e(routes['/'].intro) + '</p><div class="hero-actions">' + link('Discuss a project', '/pages/contact', target, 'button') + link('Explore our products', '/pages/products', target) + '</div></div><nav class="service-index" aria-label="Explore custom development">' + services.map(s => '<a href="/pages/custom-development#' + s.id + '"><span>' + e(s.title) + '</span>' + icon('arrow-right', target) + '</a>').join('') + '</nav></div></section>' + productBand(target) + invitation(target);
}
function pageHero(page) {
  return '<section class="page-hero"><div class="container"><p class="eyebrow">' + e(page.eyebrow) + '</p><h1>' + e(page.title) + '</h1><p class="page-intro">' + e(page.intro) + '</p></div></section>';
}
function sectionsBody(page) {
  return '<div class="reading-sections">' + page.sections.map((s, index) => '<section id="section-' + index + '"><h2>' + e(s.heading) + '</h2><p>' + e(s.text) + '</p></section>').join('') + '</div>';
}
function fields(target, live = false) {
  return '<fieldset' + (live ? '' : ' disabled') + '><legend class="visually-hidden">Project inquiry</legend><div class="form-row"><div class="field"><label for="inquiry-name">Name <span aria-hidden="true">*</span></label><input id="inquiry-name" name="contact[name]" autocomplete="name" maxlength="120" required aria-describedby="error-name"><p class="field-error" id="error-name"></p></div><div class="field"><label for="inquiry-email">Email <span aria-hidden="true">*</span></label><input id="inquiry-email" type="email" name="contact[email]" autocomplete="email" maxlength="254" required aria-describedby="error-email"><p class="field-error" id="error-email"></p></div></div><div class="form-row"><div class="field"><label for="inquiry-company">Company <span class="optional">optional</span></label><input id="inquiry-company" name="contact[company]" autocomplete="organization" maxlength="160" aria-describedby="error-company"><p class="field-error" id="error-company"></p></div><div class="field"><label for="inquiry-interest">What is this about? <span class="optional">optional</span></label><select id="inquiry-interest" name="contact[interest]"><option value="">Choose a topic</option><option value="custom-software">Custom software</option><option value="nevora">NEVORA</option><option value="other">Something else</option></select></div></div><div class="field"><label for="inquiry-message">Your message <span aria-hidden="true">*</span></label><textarea id="inquiry-message" name="contact[body]" rows="6" maxlength="4000" required aria-describedby="message-help error-message"></textarea><p class="field-help" id="message-help">Describe the work. Please do not include passwords, payment details or sensitive records.</p><p class="field-error" id="error-message"></p></div><p class="form-privacy">An inquiry does not subscribe you to marketing. Read our <a href="/pages/privacy">Privacy notice</a>.</p><button class="button button-ink" type="submit" data-inquiry-submit>' + (live ? 'Send inquiry' : 'Check draft inquiry') + icon('arrow-right', target) + '</button></fieldset>';
}
function contact(target) {
  const preview = '<form id="project-inquiry" class="inquiry-form" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate><p class="preview-note"><strong>Website preview</strong> — this form checks your draft without sending it.</p>' + fields(target) + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><noscript><p>The preview form needs JavaScript. No messages are sent from this preview.</p></noscript></form>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form' %}<div data-inquiry-mode=\"live\">" + fields(target, true) + "</div>{% if form.posted_successfully? %}<p class=\"form-status\" role=\"status\">Your inquiry was submitted.</p>{% elsif form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}{% endform %}{% else %}" + preview + '{% endif %}';
  return '<section class="contact-body paper"><div class="container contact-grid"><div class="contact-aside"><h2>A useful first conversation.</h2><p>What happens today? Where does it break down? Who needs to use the result?</p><p>You can bring an early idea or an existing process.</p><a href="mailto:' + company.email + '">' + company.email + '</a><p class="contact-address">VELANI LLC<br>' + e(company.address) + '</p></div><div>' + (target === 'shopify' ? native : preview) + '</div></div></section>';
}
function consent(target) {
  return '<dialog class="cookie-dialog" id="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-summary"><div class="dialog-heading"><h2 id="cookie-title">Cookie choices</h2><button type="button" class="icon-button" data-cookie-close aria-label="Close cookie choices">' + icon('x', target) + '</button></div><p id="cookie-summary">Choose which optional processing you allow. Necessary platform features are explained in our <a href="/pages/cookies">Cookie notice</a>.</p><div class="cookie-option"><div><strong>Necessary</strong><p>Site operation, security and remembering choices.</p></div><span class="always-on">Always on</span></div><label class="cookie-option"><span><strong>Preferences</strong><span>Optional settings that personalize a visit.</span></span><input type="checkbox" data-consent="preferences"></label><label class="cookie-option"><span><strong>Analytics</strong><span>Optional measurement of website use.</span></span><input type="checkbox" data-consent="analytics"></label><label class="cookie-option"><span><strong>Marketing</strong><span>Optional advertising-related processing.</span></span><input type="checkbox" data-consent="marketing"></label><p class="cookie-context" data-cookie-context></p><div class="consent-status" role="status" aria-live="polite"></div><div class="cookie-actions"><button class="button button-ink" type="button" data-cookie-reject>Reject optional</button><button class="button button-ink" type="button" data-cookie-accept>Accept optional</button><button class="button button-outline" type="button" data-cookie-save>Save choices</button></div></dialog>';
}
function genericBody(page, target) {
  if (page.kind === 'contact') return contact(target);
  if (page.kind === 'products') return productBand(target) + invitation(target);
  if (page.kind === 'services') {
    return '<div class="paper"><div class="container service-detail-list">' + services.map(s => '<section class="service-detail" id="' + s.id + '"><h2>' + e(s.title) + '</h2><div><h3>' + e(s.intro) + '</h3><p>' + e(s.text) + '</p><p>' + e(s.detail) + '</p>' + link('Discuss a project', '/pages/contact?interest=custom-software', target) + '</div></section>').join('') + '<section class="process"><p class="eyebrow">How the work takes shape</p><h2>Scope before commitments.</h2><ol><li><strong>Understand the work.</strong><span>People, problems, constraints and what success means.</span></li><li><strong>Agree on the scope.</strong><span>Deliverables, responsibilities, fees and milestones in writing.</span></li><li><strong>Design and build.</strong><span>Review progress against the agreed outcomes.</span></li><li><strong>Plan the handover.</strong><span>Delivery, ownership and ongoing support as agreed.</span></li></ol></section></div></div>' + invitation(target);
  }
  if (page.kind === 'legal-index') {
    return '<section class="paper"><div class="container legal-directory">' + legalLinks.filter(([, href]) => href !== '/pages/contact' && href !== '/pages/help').map(([text, href]) => link(text, href, target, 'directory-link')).join('') + '<p class="legal-draft-note">Website preview. Product and paid-engagement terms are separate. The final notices must match the published configuration.</p></div></section>';
  }
  if (page.kind === 'faq') {
    return '<section class="paper"><div class="container faq-list">' + page.sections.map(s => '<details><summary>' + e(s.heading) + icon('plus', target) + '</summary><p>' + e(s.text) + '</p></details>').join('') + '</div></section>' + invitation(target);
  }
  return '<section class="paper"><div class="container reading-layout">' + (page.legal ? '<aside class="reading-aside"><span class="eyebrow">On this page</span><nav aria-label="Page contents">' + page.sections.map((s, index) => '<a href="#section-' + index + '">' + e(s.heading) + '</a>').join('') + '</nav><a href="/pages/legal">All legal information</a></aside>' : '') + '<div class="reading-content">' + (page.legal ? '<p class="legal-draft-note">Website preview · information prepared for review</p>' : '') + sectionsBody(page) + (page.cookieAction ? '<button class="button button-ink" type="button" data-cookie-open>Open cookie choices</button>' : '') + (page.cta ? link(page.cta, '/pages/contact?interest=' + e(page.interest || 'other'), target, 'button button-ink') : '') + '</div></div></section>' + (page.legal ? '' : invitation(target));
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return '<section class="page-hero"><div class="container"><p class="eyebrow">Page not found</p><h1>We could not find that page.</h1><p class="page-intro">Explore our products or return to the company homepage.</p><div class="hero-actions">' + link('Go to Home', '/', target, 'button') + link('Contact Velani', '/pages/contact', target) + '</div></div></section>';
  return page.kind === 'home' ? home(target) : pageHero(page) + genericBody(page, target);
}
export function renderBody(path, { target = 'preview' } = {}) {
  const html = renderRawBody(path, target);
  return target === 'shopify' ? draftLinks(html) : html;
}
export function renderPage(path, { target = 'preview' } = {}) {
  const page = routes[path] || { title: 'Page not found', intro: 'We could not find that page.' };
  const title = page.title + ' · The Velani';
  const html = '<!doctype html><html lang="en" data-platform="' + (target === 'shopify' ? 'shopify' : 'local') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light"><meta name="theme-color" content="#152637"><title>' + e(title) + '</title><meta name="description" content="' + e(page.intro) + '"><link rel="icon" href="' + asset('favicon.svg', target) + '" type="image/svg+xml"><link rel="preload" href="' + asset('dm-sans-latin-400-normal.woff2', target) + '" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="' + asset('velani.css', target) + '"><script type="module" src="' + asset('velani.js', target) + '"></script></head><body><a class="skip-link" href="#main">Skip to content</a>' + header(page, target) + '<main id="main" tabindex="-1">' + renderBody(path, { target }) + '</main>' + footer(target) + consent(target) + '</body></html>';
  return { html, status: routes[path] ? 200 : 404 };
}
export function renderShopifyLayout() {
  const page = { title: 'The Velani' };
  const assignments = (page) => `{% assign velani_page_title = ${JSON.stringify(page.title)} %}{% assign velani_page_description = ${JSON.stringify(page.intro)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% if template.name == 'index' and template.suffix == blank %}${assignments(routes['/'])}{% endif %}{% case template.suffix %}` + Object.entries(routes).filter(([path]) => path !== '/').map(([path, page]) => `{% when 'velani-${path.split('/').at(-1)}' or '${path.split('/').at(-1)}' %}${assignments(page)}`).join('') + '{% endcase %}';
  const html = `<!doctype html><html lang="{{ request.locale.iso_code }}" data-platform="shopify"><head>${metadata}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light"><meta name="theme-color" content="#152637"><title>{{ velani_page_title | escape }} · The Velani</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ canonical_url | escape }}"><meta property="og:site_name" content="The Velani"><meta property="og:type" content="website"><meta property="og:title" content="{{ velani_page_title | escape }} · The Velani"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ canonical_url | escape }}"><meta property="og:image" content="{{ 'velani-social.webp' | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1730"><meta property="og:image:height" content="909"><meta property="og:image:alt" content="The Velani — software products and custom development"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg','shopify')}" type="image/svg+xml">{{ 'dm-sans-latin-400-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}<link rel="stylesheet" href="${asset('velani.css','shopify')}"><script type="module" src="${asset('velani.js','shopify')}"></script>{{ content_for_header }}</head><body><a class="skip-link" href="#main">Skip to content</a>${header(page,'shopify')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}<section class="page-hero"><div class="container"><p class="eyebrow">Company website preview</p><h1>Legal and trust information.</h1><p class="page-intro">Review the company website notices and project information.</p>${link('Legal information','/pages/legal','shopify','button')}</div></section>{% else %}{{ content_for_layout }}{% endif %}</main>${footer('shopify')}${consent('shopify')}</body></html>`;
  return draftLinks(html);
}
