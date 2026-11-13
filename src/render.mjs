import { company, routes, services, legalUpdated, langOf, counterpart } from './content.mjs';
import { HUB_API } from './client-hub.mjs';
import { CONSENT_ES, CONTACT_ES, PLANS_ES, HOURS_ES, ABOUT_ES, FAQ_ES, ES_PATHS, ES_NEAREST, IN_ENGLISH, WORK_ES, SIGNIN_ES } from './content.es.mjs';
import { header as nightHeader, footer as nightFooter, homeMain, nevoraMain, productsMain, policyMain, zoomScript, assistant as nightAssistant, icon, WORDMARK, CHROME, localize } from './night.mjs';
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
/** The city and postcode never break across lines where the address is set in running text (about, support, contact). */
const keepAddress = html => html.replace('San Juan, PR 00927', 'San&nbsp;Juan, PR&nbsp;00927');
const linkEmail = html => html.split(company.email).join('<a href="mailto:' + company.email + '">' + company.email + '</a>');
const more = (text, href) => '<a class="more" href="' + e(href) + '"><span>' + e(text) + '</span>' + icon('caret-right') + '</a>';

function pageHero(page, { meta = '' } = {}) {
  return '<section class="phero"><div class="wrap"><h1 class="t1 rise">' + e(page.legal || page.kind === 'legal-index' ? (page.name || page.title) : page.title) + '</h1>' + (page.lede || page.intro ? '<p class="lede fade">' + e(page.lede || page.intro) + '</p>' : '') + meta + '</div></section>';
}
/* Full-screen panels (the home page language): a square outlined button, a label, a title, one paragraph and one or two actions */
const hb = (text, href, fill = false, attrs = '') => '<a class="hb' + (fill ? ' fill' : '') + '" href="' + e(href) + '"' + attrs + '>' + e(text) + icon('arrow-right') + '</a>';
const tel = () => 'tel:+1' + company.phone.replace(/-/g, '');
/* Support block beside forms. With a phone: the label, the number large, then hours and email. Without one (phone off since Nov 9): email takes the large line. */
const MAIL_K = { 'Prefer to talk? Call us.': 'Prefer email? Write to us.', 'If you can’t work, call us.': 'If NEVORA is down and your team can’t clock in, email us.',
  '¿Prefieres hablar? Llámanos.': '¿Prefieres el correo? Escríbenos.', 'Si tu equipo no puede trabajar, llámanos.': 'Si NEVORA no funciona y tu equipo no puede registrar su entrada, escríbenos.' };
const callBlock = (label, hours) => company.phone
  ? '<div class="client-call fade"><p>' + e(label) + '</p><a class="client-tel" href="' + tel() + '">' + e(company.phone) + '</a><p>' + (hours ? e(hours) + '<br>' : '') + '<a href="mailto:' + company.email + '">' + company.email + '</a></p></div>'
  : '<div class="client-call fade"><p>' + e(MAIL_K[label] || label) + '</p><a class="client-tel client-mail" href="mailto:' + company.email + '">' + company.email + '</a>' + (hours ? '<p>' + e(hours) + '</p>' : '') + '</div>';
function panel(target, { id, cls = '', img, flip = false, kick, kickHtml, title, tag = 'h2', html = '', text, acts = '', after = '', extra = '', first = false }) {
  const tid = id + '-t';
  const photo = img ? '<img class="hph' + (flip ? ' flip' : '') + '" src="' + asset('night-' + img + '.webp', target) + '" alt="" width="1920" height="1080"' + (first ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>' : '';
  return '<section class="hpanel ' + cls + '" id="' + id + '" aria-labelledby="' + tid + '">' + photo + '<div class="hshade"></div><div class="hcopy">' + (kick || kickHtml ? '<p class="hkick">' + (kickHtml || e(kick)) + '</p>' : '') + '<' + tag + ' class="rise" id="' + tid + '">' + (html || e(title)) + '</' + tag + '>' + (text ? '<p class="fade">' + e(text) + '</p>' : '') + (acts ? '<div class="hacts fade">' + acts + '</div>' : '') + after + '</div>' + extra + '</section>';
}
/** The closing panel on every company page: the wordmark, client support and the two ways in. */
function closing(target, { project = '/pages/contact', lang = 'en', support = hb(CHROME[lang].support, '/pages/help'), line = CHROME[lang].closingLine, also = null } = {}) {
  return '<section class="hpanel end" id="velani" aria-label="Velani"><img class="hph flip" src="' + asset('night-ai-light.webp', target) + '" alt="" width="1920" height="1080" loading="lazy"><div class="hshade"></div><div class="hcopy"><p class="hwm">' + WORDMARK + '</p><p class="fade">' + e(line) + '</p><div class="hacts fade">' + (also ? hb(CHROME[lang].trial, '/pages/contact?interest=nevora-demo', true) : line === CHROME[lang].closingLine ? hb(CHROME[lang].trial, '/pages/contact?interest=nevora-demo', true) + hb(CHROME[lang].project, project) : hb(CHROME[lang].project, project, true) + support) + '</div>' + (also ? '<p class="hfact halso fade">' + e(also[0]) + ' <a class="ul" href="' + also[2] + '">' + e(also[1]) + '</a>.</p>' : '') + '</div></section>';
}
/** The end of a help or access page: one line and the next step for that task, in the site's link band (no product or project offer). */
const helpEnd = (title, links) => '<section class="band help help-end" aria-labelledby="end-t"><div class="wrap band-in"><h2 class="t3" id="end-t">' + e(title) + '</h2><p class="band-links">' + links.map(([text, href, attrs = '']) => '<a class="more" href="' + e(href) + '"' + attrs + '><span>' + e(text) + '</span>' + icon('caret-right') + '</a>').join('') + '</p></div></section>';
const rail = (steps, cls = '') => '<ol class="rail' + cls + '" data-in>' + steps.map(([b, t], i) => '<li data-in><i>0' + (i + 1) + '</i><b>' + e(b) + '</b><span>' + e(t) + '</span></li>').join('') + '</ol>';
/** Custom software page words (Spanish added with its own page). Case studies lead; the client's name is the heading. */
const WORK = {
  en: {
    shotsLabel: 'Tool Box LLC screens',
    toolbox: { kind: 'Equipment rental website and online store', story: [['What they needed', 'Tool Box rents lifts and other equipment. Before renting, a customer needs three answers: which machine, which dates and what delivery to the job site costs.'], ['What we decided', 'All three answers go on each machine’s page, so a customer can get them on a phone and reserve.'], ['What we delivered', 'A website and an online store. The store prices delivery by the distance to the job site, takes the payment and sends the order to the Tool Box team.']], shots: [['tb-home', 'The Tool Box LLC website, built by Velani: equipment rental with job-site delivery and dates', 2000, 1250], ['store', 'The Tool Box LLC online store, built by Velani: rental equipment with prices and a Reserve button on each item', 1600, 1000]] },
    yavi: { kind: 'Booking and rewards app', story: [['What they needed', 'A barbershop runs on appointments and regular clients.'], ['What we decided', 'Booking and the rewards card live in one app.'], ['What we delivered', 'Clients pick a service and a time, get a reminder before the visit, and each visit adds to their rewards card.']], shots: [['yavi-book', 'Yavi Barber booking on a phone: the next open times and services with prices'], ['yavi-rewards', 'Yavi Barber rewards card on a phone: ten visits and two rewards']] },
    more: ['We also build internal tools for your team, like request forms, approvals and dashboards. For an example, see ', 'NEVORA', ', the workforce app we make.'],
    getT: 'What you get', get: ['Every project includes the design, the build and the hosting setup. If you want English and Spanish, we build both. After launch, we keep supporting it.', 'Before any paid work starts, you get a fixed quote in writing. The price depends on what the project needs.'],
    howT: 'How a project works', how: ['You show us how the work gets done today and who does it. You then get the written proposal with what we’ll build, the fixed price and the milestones. Paid work starts only after you agree to it.', 'We build in milestones, and you try working software at each one. The agreement says who owns the code, what you receive and how support works after launch.'],
    project: 'Start a project', endLine: 'Tell us what needs to work better. You get a fixed quote in writing first.',
  },
  es: WORK_ES,
};
function services_(page, target, lang = 'en') {
  const t = WORK[lang], to = '/pages/contact?interest=custom-software';
  const hero = panel(target, { id: 'top', cls: 'dim long work-top', img: 'ai-light', title: page.title, tag: 'h1', text: page.intro, acts: hb(t.project, to, true), first: true });
  const shot = ([n, alt, w, h]) => '<figure class="shot slab"><img src="' + asset('night-' + n + '.webp', target) + '" alt="' + e(alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"></figure>';
  const phone = ([n, alt]) => '<figure class="shot slab phone"><img src="' + asset('night-' + n + '.webp', target) + '" alt="' + e(alt) + '" width="780" height="1688" loading="lazy" decoding="async"></figure>';
  // Each story is told the same way: what the client needed, what was decided, what was delivered
  const story = c => '<dl class="case-story">' + c.story.map(([k, x]) => '<div class="fade"><dt>' + e(k) + '</dt><dd>' + e(x) + '</dd></div>').join('') + '</dl>';
  const head = (id, name, c) => '<div class="case-head"><h2 class="t1 rise" id="' + id + '-t">' + e(name) + '</h2><p class="case-kind fade">' + e(c.kind) + '</p></div>';
  const toolbox = '<section class="chap case case-web" id="web-applications" aria-labelledby="web-applications-t"><span class="anchor" id="online-stores"></span><div class="wrap">' + head('web-applications', 'Tool Box LLC', t.toolbox) + story(t.toolbox) + '<div class="case-shots two" data-scroll-x aria-label="' + t.shotsLabel + '">' + t.toolbox.shots.map(shot).join('') + '</div></div></section>';
  const yavi = '<section class="chap case case-app" id="booking" aria-labelledby="booking-t"><div class="wrap case-split"><div>' + head('booking', 'Yavi Barber', t.yavi) + story(t.yavi) + '</div><div class="case-phones">' + t.yavi.shots.map(phone).join('') + '</div></div></section>';
  const how = '<section class="chap how-page" id="how" aria-labelledby="how-t"><span class="anchor" id="business-systems"></span><div class="wrap"><div class="case-cols"><div><h2 class="t2 rise" id="how-t">' + e(t.howT) + '</h2>' + t.how.map(x => '<p class="lede fade how-text">' + e(x) + '</p>').join('') + '</div><div><h3 class="t2 rise">' + e(t.getT) + '</h3>' + t.get.map(x => '<p class="lede fade how-text">' + e(x) + '</p>').join('') + '<p class="lede fade how-text">' + e(t.more[0]) + '<a class="ul" href="' + (lang === 'es' ? '/pages/es-nevora' : '/pages/nevora') + '">' + e(t.more[1]) + '</a>' + e(t.more[2]) + '</p></div></div></div></section>';
  return localize(hero + toolbox + yavi + how + closing(target, { lang, project: to, line: t.endLine, support: '' }), lang) + '\n' + (t.zoom || []).reduce((z, [a, b]) => z.split(a).join(b), zoomScript(target));
}
/** The contact page's words (Spanish in src/content.es.mjs). Topic values never change, so the email Velani receives is the same. */
const CONTACT = {
  en: { kicker: ['NEVORA for your team', 'Free 30-day NEVORA trial', 'NEVORA Relay'], h1: ['Set up NEVORA for a larger team.', 'Request your free NEVORA trial.', 'Join the NEVORA Relay waitlist.'], fact: ['A website, an app, NEVORA or something else. We reply by email within two business days.', 'For teams of more than 30 employees. We check what you need and set up your workplace with you. Teams that qualify get the same 30 days free. We reply within two business days.', 'Tell us about your team. Jose from Velani replies within two business days and sets up your workplace with you. Your 30 free days start when your workplace is provisioned (created in NEVORA), with no card.', 'NEVORA Relay is in design, with no dates yet. We’ll email you when early access opens.'],
    callK: 'Prefer to talk? Call us.', topicQ: 'What is it about?', preview: 'Preview. This form checks your draft and sends nothing.',
    tiles: [['custom-software', 'Web or app'], ['nevora', 'NEVORA'], ['other', 'Other']],
    previewNote: 'Website preview&nbsp;· checks your draft, sends nothing', noscript: 'The preview form needs JavaScript. No messages are sent from this preview.', legend: 'Inquiry',
    name: 'Name', email: 'Email', company: 'Company', optional: 'optional', topic: 'Topic', topics: [['website', 'Website'], ['custom-software', 'Custom app'], ['nevora', 'NEVORA for 30+ employees'], ['nevora-demo', 'Free NEVORA trial'], ['relay', 'NEVORA Relay waitlist'], ['other', 'Other']],
    team: 'Team size', bigTeam: 'More than 30 (assisted setup)', locations: 'Number of locations', message: 'What needs to work better', messageOptional: 'Anything else',
    send: ['Send inquiry', 'Request assisted setup', 'Send trial request', 'Join the waitlist'], check: 'Check draft inquiry', sendNote: 'Don’t send passwords or payment details.', privacy: 'Privacy notice',
    fine: 'On day 30, the Owner picks a plan in NEVORA. Nothing is charged until you do. NEVORA calculates pay statements; it does not pay employees or file payroll taxes.',
    sentPreview: 'Website preview&nbsp;· this is what visitors see after sending. Nothing was sent.', sentH: 'Message sent.', sentP: 'Thanks for writing. We reply by email within two business days.', sentFrom: ['Replies come from ', '. If it isn’t in your inbox, check spam or junk.'], back: 'Back to home', sentNext: 'See how NEVORA works',
    writeTitle: 'Write to us', writeText: 'What needs to work better, who will use it, and how it works today. We reply from ', writeButton: 'Email ', noSensitive: 'No passwords, payment details or sensitive records by email.' },
  es: CONTACT_ES,
};
/** Links to pages that exist only in English say so to browsers and assistive technology on Spanish pages. */
const enOnly = (lang, href) => lang === 'es' && !ES_PATHS[href] ? ' hreflang="en"' : '';
/** A plain form in one column: the label sits inside the field and lifts when the field is used; errors sit under their field. */
function fields(live = false, lang = 'en') {
  const t = CONTACT[lang], opt = ' <span class="opt">' + t.optional + '</span>';
  const ff = (id, name, label, extra = '', value = '') => '<div class="ff"><input id="inquiry-' + id + '" name="contact[' + name + ']" placeholder=" " ' + extra + (value ? ' value="' + value + '"' : '') + '><label for="inquiry-' + id + '">' + label + '</label><p class="field-error" id="error-' + id + '"></p></div>';
  const name = ff('name', 'name', t.name, 'autocomplete="name" maxlength="120" required aria-describedby="error-name"', live ? '{{ form.name | escape }}' : '');
  const email = ff('email', 'email', t.email, 'type="email" autocomplete="email" maxlength="254" required aria-describedby="error-email"', live ? '{{ form.email | escape }}' : '');
  const company = ff('company', 'company', t.company + opt, 'autocomplete="organization" maxlength="160" aria-describedby="error-company"');
  // Topic: three choices of one size in place of a menu (radios set the hidden contact[interest]; velani.js keeps them in step)
  const topic = '<p class="kinds-q field-topic" aria-hidden="true">' + t.topicQ + '</p><fieldset class="kinds topics field-topic"><legend class="sr">' + t.topicQ + '</legend>' + t.tiles.map(([value, label]) => '<label class="kind"><input type="radio" name="topic_choice" value="' + value + '"><b>' + label + '</b></label>').join('') + '</fieldset><input type="hidden" id="inquiry-interest" name="contact[interest]" value="">';
  // The submitted team size stays in English ("More than 30 (assisted setup)") so every inquiry email reads the same
  const big = CONTACT.en.bigTeam, bigOption = t.bigTeam === big ? '<option>' + big + '</option>' : '<option value="' + big + '">' + t.bigTeam + '</option>';
  const team = '<div class="frow" data-nevora-fields hidden><div class="ff sel"><select id="inquiry-team" name="contact[team_size]"><option value=""></option><option>1–10</option><option>11–20</option><option>21–30</option>' + bigOption + '</select><label for="inquiry-team">' + t.team + '</label></div>' + ff('locations', 'locations', t.locations, 'maxlength="120" aria-describedby="error-locations" inputmode="numeric"') + '</div>';
  const message = '<div class="ff area"><textarea id="inquiry-message" name="contact[body]" placeholder=" " rows="4" maxlength="4000" required aria-describedby="error-message" data-min="140">' + (live ? '{{ form.body | escape }}' : '') + '</textarea><label for="inquiry-message">' + v(t.message, t.messageOptional + opt) + '</label><p class="field-error" id="error-message"></p></div>';
  const send = '<div class="client-send"><button class="pill" type="submit" data-inquiry-submit>' + v(...t.send) + '</button><p class="send-note">' + t.sendNote + ' <a href="/pages/privacy"' + enOnly(lang, '/pages/privacy') + '>' + t.privacy + '</a></p></div><p class="fine v-m">' + t.fine + '</p>';
  return '<fieldset' + (live ? '' : ' disabled') + '><legend class="sr">' + t.legend + '</legend>' + topic + '<div class="frow">' + name + email + '</div>' + company + team + message + send + '</fieldset>';
}
/** The contact page carries the general, the NEVORA quote and the demo wording; the boot script marks the document before paint and CSS shows one. */
const v = (general, nevora, demo, relay) => '<span class="v-d">' + general + '</span><span class="v-n' + (demo ? '' : ' v-nm') + '">' + nevora + '</span>' + (demo ? '<span class="v-m">' + demo + '</span>' : '') + (relay ? '<span class="v-r">' + relay + '</span>' : '');
/** After a successful send the form is replaced by this confirmation; velani.js adapts its wording to the topic (and shows it after a preview check). */
const SENT_ICON = '<svg class="sent-i" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>';
const sentPanel = (hidden = false, lang = 'en') => { const t = CONTACT[lang]; return '<div class="sent" id="inquiry-sent" tabindex="-1"' + (hidden ? ' hidden' : '') + '>' + SENT_ICON + '<p class="note" data-sent-preview hidden>' + t.sentPreview + '</p><h2 class="t2 sent-h" data-sent-h>' + t.sentH + '</h2><p class="sent-p" data-sent-p>' + t.sentP + '</p><p class="sent-from">' + t.sentFrom[0] + '<a href="mailto:' + company.email + '">' + company.email + '</a>' + t.sentFrom[1] + '</p><div class="sent-acts"><a class="hb fill" data-sent-next hidden href="' + (lang === 'es' ? '/pages/es-nevora' : '/pages/nevora') + '">' + t.sentNext + icon('arrow-right') + '</a><a class="pill" data-sent-back href="' + (lang === 'es' ? '/pages/es' : '/') + '">' + t.back + '</a></div></div>'; };
/** Contact (Nov 7): one split like the Sign in page. The heading and its line change with the topic the visitor came for (the
 * boot script marks the document before paint; velani.js removes the unused wording), the phone sits under them, the form beside. */
function contact(page, target, lang = 'en') {
  const t = CONTACT[lang];
  const side = '<div class="cform-hero contact-side"><h1 class="t1 rise">' + v(e(page.title), ...t.h1) + '</h1><p class="lede fade">' + v(...t.fact) + '</p></div>';
  const call = callBlock(t.callK, (lang === 'es' ? HOURS_ES : company.hours));
  const preview = '<form id="project-inquiry" class="inquiry-form" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate>' + fields(false, lang) + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><p class="client-preview">' + t.preview + '</p><noscript><p>' + t.noscript + '</p></noscript></form>';
  const email = '<div class="client-write"><h2 class="t3">' + t.writeTitle + '</h2><p>' + t.writeText + company.email + '.</p><div class="acts"><a class="pill" href="mailto:' + company.email + '">' + t.writeButton + company.email + '</a></div><p class="field-help mail">' + t.noSensitive + '</p></div>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form', novalidate: 'novalidate' %}{% if form.posted_successfully? %}{{ velani_sent }}{% else %}<div data-inquiry-mode=\"live\">" + fields(true, lang) + "</div>{% if form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}<div class=\"form-legal\">{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}</div>{% endif %}{% endform %}{% elsif theme.role == 'main' %}" + email + '{% else %}' + preview + "{{ velani_sent | replace: 'id=\"inquiry-sent\" tabindex=\"-1\"', 'id=\"inquiry-sent\" tabindex=\"-1\" hidden' }}{% endif %}";
  return '<section class="contact contact-split"><div class="wrap client-grid">' + side + '<div class="client-form">' + (target === 'shopify' ? native : preview + sentPanel(true, lang)) + '</div>' + call + '</div></section>';
}
/** Sign in (Nov 7 flow map; Nov 9 contract): how NEVORA sign-in works, then one form for Velani clients with two kinds of
 * request. NEVORA has no public sign-in address yet, so there is no Open NEVORA link: each workplace signs in at its own
 * address with its Employee ID and password (docs/handoffs/2026-11-09-claude-website-backend-contract.md §1–2 in NEVORA).
 * The form is the contact form (same ids, validation, preview check and confirmation in velani.js), with the topic set by the
 * two choices: client-work or client-help. Timing and urgency values stay in English so every request email reads the same. */
const SIGNIN = {
  en: { h1: 'How to sign in to NEVORA.', appText: 'NEVORA has no shared sign-in page. Each workplace has its own address, and you sign in there with your Employee ID and password.', support: 'NEVORA support', factsLabel: 'Sign-in help',
    endT: 'Still can’t sign in?', endLinks: [['NEVORA support', '/pages/nevora-support'], ['Email support@thevelani.com', 'mailto:support@thevelani.com']],
    facts: [['Your address and ID', 'They’re in the invitation email from your workplace. Lost it? Ask your employer.'],
      ['Forgot your password?', 'Choose Forgot password? on your workplace’s sign-in page. You’ll need your Employee ID and the email your workplace has on file.'],
      ['Your 4-digit PIN', 'It’s only for clocking in on your workplace’s tablet, not for signing in. Forgot it? Ask the business Owner to set a new one.']],
    webAlt: 'NEVORA on the web for an owner: one thing that needs an answer, five of five clocked in and the next payday', phoneAlt: 'NEVORA on an employee’s phone: her shift today and her next shifts',
    clientT: 'Need something on your site or app?', clientText: 'Ask for a new page, a feature or a change, or tell us what stopped working. We reply by email within two business days.',
    callK: 'If you can’t work, call us.',
    need: 'Type of request', kinds: [['New work', 'A new page, a feature or a change.'], ['Help', 'Something on your site or app stopped working.']],
    business: 'Business', message: ['What do you need?', 'What happened?'],
    timing: ['Timing', [['No rush', 'No rush'], ['This month', 'This month'], ['This week', 'This week']]],
    urgency: ['Urgency', [['It can wait', 'It can wait'], ["It's slowing us down", 'It’s slowing us down'], ["We can't work", 'We can’t work']]],
    send: ['Send request', 'Send to support'], check: 'Check draft request', note: 'Don’t send passwords or payment details.',
    preview: 'Preview. This form checks your draft and sends nothing.',
    project: 'Website or app', refK: 'Your reference', refCopy: 'Copy reference',
    hubNote: 'We use this only to answer your request. Request records are kept up to 90 days; email copies can stay longer. No account is created.',
    hubOff: 'Requests can’t be sent from this page right now. Nothing you typed was sent. Please write to us instead:',
    hubTest: 'Acceptance test copy. Requests sent from this page are real and go to Velani support.',
    hubNoscript: 'This form needs JavaScript. You can also write to ' },
  es: SIGNIN_ES,
};
function clientFields(lang) {
  const t = SIGNIN[lang], c = CONTACT[lang], opt = ' <span class="opt">' + c.optional + '</span>';
  const k = (work, help) => '<span data-k="work">' + work + '</span><span data-k="help" hidden>' + help + '</span>';
  // No name attributes: this form is never posted by the browser. velani.js sends it to the client hub as JSON.
  const ff = (id, label, extra) => '<div class="ff"><input id="inquiry-' + id + '" placeholder=" " ' + extra + ' aria-describedby="error-' + id + '"><label for="inquiry-' + id + '">' + label + '</label><p class="field-error" id="error-' + id + '"></p></div>';
  const kinds = '<p class="kinds-q" aria-hidden="true">' + t.need + '</p><fieldset class="kinds"><legend class="sr">' + t.need + '</legend>' + ['client-work', 'client-help'].map((value, i) => '<label class="kind"><input type="radio" name="client_kind" value="' + value + '"' + (i ? '' : ' checked') + '><b>' + t.kinds[i][0] + '</b></label>').join('') + '</fieldset><input type="hidden" id="inquiry-interest" value="client-work">';
  const select = (key, id, [label, options], hidden) => '<div class="ff sel" data-k="' + key + '"' + (hidden ? ' hidden' : '') + '><select id="inquiry-' + id + '"' + (hidden ? ' disabled' : '') + '><option value=""></option>' + options.map(([value, text]) => '<option value="' + e(value) + '">' + text + '</option>').join('') + '</select><label for="inquiry-' + id + '">' + label + '</label></div>';
  const message = '<div class="ff area"><textarea id="inquiry-message" placeholder=" " rows="4" maxlength="4000" required aria-describedby="error-message" data-min="140"></textarea><label for="inquiry-message">' + k(...t.message) + '</label><p class="field-error" id="error-message"></p></div>';
  const send = '<div class="hub-verify" id="hub-turnstile"></div><div class="client-send"><button class="pill" type="submit" data-inquiry-submit>' + k(...t.send) + '</button><p class="client-note">' + t.hubNote + ' ' + t.note + ' <a href="/pages/privacy"' + enOnly(lang, '/pages/privacy') + '>' + c.privacy + '</a></p></div>';
  return '<fieldset disabled><legend class="sr">' + t.clientT + '</legend>' + kinds
    + '<div class="frow">' + ff('name', c.name, 'autocomplete="name" maxlength="120" required') + ff('email', c.email, 'type="email" autocomplete="email" maxlength="254" required') + '</div>'
    + '<div class="frow">' + ff('company', t.business + opt, 'autocomplete="organization" maxlength="200"') + ff('project', t.project + '<span data-k="work">' + opt + '</span>', 'autocomplete="off" maxlength="200"') + '</div>'
    + select('work', 'timing', t.timing, false) + select('help', 'urgency', t.urgency, true)
    + message + send + '</fieldset>';
}
/** The Velani client request form (new work or help). Shown on Support (#client). It sends to the client hub
 * (src/client-hub.mjs) and never through Shopify's contact form. On the published theme it is live; on an unpublished theme
 * and in the local preview it checks the draft and sends nothing (VELANI_CLIENT_HUB_API points the local preview at a local
 * fake so the live states can be tested). #hub-state=… shows each state for review, never on the published theme. */
function clientSection(target, lang) {
  const t = SIGNIN[lang], c = CONTACT[lang];
  const localApi = target === 'shopify' ? '' : (process.env.VELANI_CLIENT_HUB_API || '').trim();
  // Real sending: the published theme, or an unpublished acceptance copy whose theme setting client_hub_preview_submissions is on
  const real = "theme.role == 'main' or settings.client_hub_preview_submissions";
  const mode = target === 'shopify' ? '{% if ' + real + ' %}live{% else %}preview{% endif %}' : localApi ? 'live' : 'preview';
  const fixtures = target === 'shopify' ? '{% unless ' + real + ' %} data-hub-fixtures{% endunless %}' : localApi ? '' : ' data-hub-fixtures';
  const testNote = '<p class="hub-test" data-hub-test>' + t.hubTest + '</p>';
  const test = target === 'shopify' ? "{% if theme.role != 'main' and settings.client_hub_preview_submissions %}" + testNote + '{% endif %}' : localApi ? testNote : '';
  const previewNote = '<p class="client-preview">' + t.preview + '</p>';
  const off = '<div class="hub-off" data-hub-off hidden><p>' + t.hubOff + '</p><p class="hub-mail">' + company.email + '</p></div>';
  const form = '<form id="project-inquiry" class="inquiry-form" data-inquiry-mode="hub" data-hub="' + mode + '" data-hub-api="' + e(localApi || HUB_API) + '"' + fixtures + ' novalidate>' + test + off + clientFields(lang)
    + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>' + (target === 'shopify' ? '{% unless ' + real + ' %}' + previewNote + '{% endunless %}' : localApi ? '' : previewNote)
    + '<noscript><p>' + t.hubNoscript + company.email + '.</p></noscript></form>';
  const ref = '<div class="sent-ref" data-sent-ref hidden><p class="sent-ref-k">' + t.refK + '</p><p class="sent-ref-v" data-ref></p><button type="button" class="sent-copy" data-ref-copy>' + t.refCopy + '</button><p class="sr" role="status" data-ref-live></p></div>';
  const side = '<div class="client-side"><h2 class="t2 rise" id="client-t">' + e(t.clientT) + '</h2><p class="lede fade">' + e(t.clientText) + '</p></div>';
  return '<section class="chap client" id="client" aria-labelledby="client-t"><div class="wrap client-grid">' + side + '<div class="client-form">' + form + sentPanel(true, lang).replace('<p class="sent-p"', ref + '<p class="sent-p"') + '</div></div></section>';
}
/** Sign in (Nov 10 inspection): sign-in guidance in the Support layout. The title says it is guidance; the three facts sit where
 * Support has its doors; it ends on the next step for this task (NEVORA support), with no product or project offer. */
function signin(page, target, lang = 'en') {
  const t = SIGNIN[lang];
  const side = '<div class="cform-hero contact-side"><h1 class="t1 rise">' + e(t.h1) + '</h1><p class="lede fade">' + e(t.appText) + '</p><div class="hacts fade">' + hb(t.support, '/pages/nevora-support', true, enOnly(lang, '/pages/nevora-support')) + '</div></div>';
  const facts = '<div class="help-doors signin-doors" role="list" aria-label="' + e(t.factsLabel) + '">' + t.facts.map(([k, v]) => '<div class="day-opt help-door fade" role="listitem"><h2 class="t3">' + e(k) + '</h2><p>' + e(v) + '</p></div>').join('') + '</div>';
  const top = '<section class="contact contact-split help-top signin-top"><div class="wrap client-grid">' + side + '<div class="client-form">' + facts + '</div></div></section>';
  return localize(top + helpEnd(t.endT, t.endLinks.map(([x, href]) => [x, href, href.startsWith('/pages/nevora-support') ? enOnly(lang, href) : ''])), lang);
}
/** The cookie choices dialog's words (Spanish in src/content.es.mjs). */
const CONSENT = {
  en: { title: 'Cookie choices', close: 'Close cookie choices', summary: ['Choose which optional processing you allow. Necessary platform features are explained on our ', 'Cookies and preferences', ' page.'],
    necessary: ['Necessary', 'Website operation, security and remembering choices.'], alwaysOn: 'Always on', preferences: ['Preferences', 'Optional settings that personalize a visit.'], analytics: ['Analytics', 'Visit and page-view measurement by Shopify and Mailchimp.'],
    marketing: ['Marketing', 'Visit information Mailchimp, our email tool, can use for marketing.'], sale: ['Sale or sharing', 'Sharing with Mailchimp that some US state laws treat as a “sale” or “share”. Leave it off to opt out.'],
    reject: 'Reject all optional', accept: 'Accept all optional', save: 'Save choices' },
  es: CONSENT_ES,
};
function consent(lang = 'en') {
  const t = CONSENT[lang];
  const choice = (key, [name, text]) => '<label class="cookie-option"><span><strong>' + name + '</strong><span>' + e(text) + '</span></span><input type="checkbox" data-consent="' + key + '"></label>';
  return '<dialog class="cookie-dialog" id="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-summary"><div class="dialog-heading"><h2 id="cookie-title">' + t.title + '</h2><button type="button" class="icon-button" data-cookie-close aria-label="' + t.close + '">' + icon('x') + '</button></div><p id="cookie-summary">' + t.summary[0] + '<a href="/pages/cookies"' + enOnly(lang) + '>' + t.summary[1] + '</a>' + t.summary[2] + '</p><div class="cookie-option"><div><strong>' + t.necessary[0] + '</strong><p>' + t.necessary[1] + '</p></div><span class="always-on">' + t.alwaysOn + '</span></div>' + choice('preferences', t.preferences) + choice('analytics', t.analytics) + choice('marketing', t.marketing) + choice('sale_of_data', t.sale) + '<p class="cookie-context" data-cookie-context></p><div class="consent-status" role="status" aria-live="polite"></div><div class="cookie-actions"><button class="pill line" type="button" data-cookie-reject>' + t.reject + '</button><button class="pill line" type="button" data-cookie-accept>' + t.accept + '</button><button class="pill" type="button" data-cookie-save>' + t.save + '</button></div></dialog>';
}
const num = i => '<i>0' + (i + 1) + '</i>';
const docEnd = () => '<div class="doc-end"><h2 class="t3">Questions</h2><p>Write to <a href="mailto:' + company.email + '">' + company.email + '</a>, or to ' + e(company.operator) + ', ' + e(company.address) + '.</p><div class="acts"><a class="pill line" href="/pages/contact">Contact</a></div></div>';
function legalDoc(page, lang = 'en') {
  const t = lang === 'es'
    ? { updated: 'Actualizado el', toc: 'En esta página', contents: 'Contenido de la página', more: 'Más información', legal: 'Información legal', all: 'Toda la información legal (en inglés)', privacy: 'Política de privacidad de NEVORA', questions: 'Preguntas', write: 'Escribe a', postal: ', o por correo postal a ', contact: 'Contacto' }
    : { updated: 'Last updated', toc: 'On this page', contents: 'Page contents', more: 'More', legal: 'Legal', all: 'All legal information', privacy: 'NEVORA privacy policy', questions: 'Questions', write: 'Write to', postal: ', or to ', contact: 'Contact' };
  const toc = page.sections.map((s, i) => '<a href="#section-' + i + '">' + e(s.heading) + '</a>').join('');
  const body = page.sections.map((s, i) => '<section id="section-' + i + '"><h2>' + e(s.heading) + '</h2><p>' + linkEmail(e(s.text)) + '</p></section>').join('');
  const cookie = page.cookieAction ? '<button class="pill line" type="button" data-cookie-open disabled>Open cookie choices</button><noscript><p class="cookie-nojs-note">Cookie controls need JavaScript. Write to ' + company.email + ' about privacy choices.</p></noscript>' : '';
  const end = '<div class="doc-end"><h2 class="t3">' + t.questions + '</h2><p>' + t.write + ' <a href="mailto:' + company.email + '">' + company.email + '</a>' + t.postal + e(company.operator) + ', ' + e(company.address) + '.</p><div class="acts"><a class="pill line" href="/pages/contact">' + t.contact + '</a></div></div>';
  return localize(pageHero(page, { meta: '<p class="doc-meta">' + t.updated + ' ' + e(page.updated || legalUpdated) + '</p>' }) + '<section class="doc"><div class="wrap doc-grid"><div class="doc-aside"><details class="doc-toc" open><summary class="doc-aside-t">' + t.toc + '</summary><nav aria-label="' + t.contents + '">' + toc + '</nav></details><p class="doc-aside-t">' + t.more + '</p><nav aria-label="' + t.legal + '"><a href="/pages/legal"' + enOnly(lang) + '>' + t.all + '</a><a href="/pages/nevora-privacy">' + t.privacy + '</a></nav></div><div class="doc-body">' + body + cookie + end + '</div></div></section>', lang);
}
function legalIndex() {
  const tile = ([text, href, note]) => '<a class="tile" href="' + href + '"><span class="t3">' + e(text) + '</span><p>' + e(note) + '</p>' + icon('arrow-right') + '</a>';
  const site = [['Website privacy notice', '/pages/privacy', 'How this website handles information, including when you write to us.'], ['Cookies and preferences', '/pages/cookies', 'Storage on this website and your optional choices.'], ['Website terms', '/pages/website-terms', 'The rules for using this website.'], ['Software and project terms', '/pages/software-project-terms', 'What applies before paid work or software access begins.'], ['Accessibility', '/pages/accessibility', 'Our accessibility target and how to report a barrier.'], ['Security', '/pages/security', 'How to report a security concern privately.']];
  const nevora = [['NEVORA privacy policy', '/pages/nevora-privacy', 'How the NEVORA app handles workplace information.'], ['NEVORA terms of use', '/pages/nevora-terms', 'The rules for using NEVORA.'], ['NEVORA support', '/pages/nevora-support', 'Signing in, your account and getting help.'], ['Delete your NEVORA account', '/pages/nevora-account-deletion', 'How to ask us to delete your account.']];
  return '<section class="dir"><div class="wrap"><h2 class="t2">Website notices</h2><div class="tiles">' + site.map(tile).join('') + '</div><h2 class="t2">For people who use NEVORA</h2><div class="tiles">' + nevora.map(tile).join('') + '</div></div></section>';
}
/** The plans page's words (Spanish in src/content.es.mjs). */
/** Plans (Nov 7 flow map, v2; Nov 10 inspection: prices before the calendar, no visit-date promise): the 30 days as a calendar beside what
 * happens in them (the plan's features, as things your team does), one NEVORA screen large, the two ways the trial can end as
 * two equal panels, and custom work in the closing. Dates come from the visitor's clock (motion.js); without it the page says
 * "Day 1" and "Day 30". */
const PLANS = {
  en: { h1: 'Try NEVORA free for 30 days.', text: 'Your whole team gets the complete app, with no card. Then one monthly price for your business: $19 for up to 15 employees, $29 for 16 to 30.',
    date: 'Your 30 free days start when your workplace is provisioned (created in NEVORA). Ask for a trial and we reply within two business days to set it up with you.',
    trial: 'Request a free trial', quote: 'More than 30 employees?',
    bands: [['$19', 'a month', 'Up to 15 employees'], ['$29', 'a month', '16 to 30 employees']], bandsLabel: 'Prices',
    billingHelp: ['Already on NEVORA? The business Owner opens billing from NEVORA, in Settings. ', 'Billing help'],
    daysT: 'Your 30 days', calLabel: 'An example trial on a calendar',
    steps: [['Day 1', 'Your workplace is ready. You invite your team, and each person gets a PIN for the time clock tablet.'], ['First week', 'You publish the schedule. Your team sees their shifts on their phones, swaps shifts and asks for time off, in English or Spanish.'], ['Second week', 'You approve timecards. NEVORA calculates payroll from the approved hours and makes a pay statement for each employee.'], ['Day 30', 'On day 30, the Owner picks a plan in NEVORA. Nothing is charged until you do.']],
    fine: 'NEVORA calculates pay statements. It does not pay employees or file payroll taxes.',
    shotAlt: 'NEVORA schedule for the week: eight people, their shifts each day and the week published', shotCap: 'Carmen’s week at Northside Coffee, a sample workplace: eight people and every shift published.',
    priceT: 'After 30 days, one monthly price',
    includes: 'Every business gets the whole app: scheduling, the time clock, timecards and payroll calculation. The price depends only on how many employees you have, and owners aren’t counted.',
    card: { q: 'Your team', unit: 'employees', per: 'a month', small: '1 to 15 · $19', team: '16 to 30 · $29', less: 'One fewer employee', more: 'One more employee', note: 'Billed monthly, per business.', valueText: (n, p) => n + ' employees, ' + p + ' a month' },
    terms: 'Prices are in US dollars and may change before online billing opens. Cancel any time and NEVORA keeps working through the month you paid for. If you don’t subscribe after the trial, NEVORA pauses for your team; the Owner can still open billing and export available payroll records.',
    over: ['More than 30 employees? ', 'Write to us for assisted setup', '. We reply within two business days.'],
    closing: 'Websites and custom apps get a fixed written quote for each project.', project: 'Start a project', custom: 'See custom software' },
  es: PLANS_ES,
};
/** Plans (Nov 8, 2026: self-service subscriptions). The trial in the first screen with today's real end date, the 30 days as a
 * calendar, one NEVORA screen large, then the two prices as two equal boxes. Start free trial opens signup; Manage billing
 * opens billing recovery. An Owner sent from NEVORA arrives with #handoff=…: velani-commerce.js swaps the hero for their own
 * plan and marks the box they would be billed for. Dates come from the visitor's clock (motion.js). */
function plans(page, target, lang = 'en') {
  const t = PLANS[lang];
  const trial = hb(t.trial, '/pages/contact?interest=nevora-demo', true), quote = hb(t.quote, '/pages/contact?interest=nevora');
  const steps = '<ol class="days-list">' + t.steps.map(([k, x], i) => '<li class="fade"><p class="days-k"' + (i === 0 ? ' data-day="1"' : i === 3 ? ' data-day="30"' : '') + '>' + e(k) + '</p><p>' + e(x) + '</p></li>').join('') + '</ol><p class="days-fine">' + e(t.fine) + '</p>';
  const days = '<section class="chap days" aria-labelledby="days-t"><div class="wrap days-grid"><div><h2 class="t2 rise" id="days-t">' + e(t.daysT) + '</h2>' + steps + '</div><div class="cal fade" data-cal role="img" aria-label="' + e(t.calLabel) + '" hidden></div></div></section>';
  const shot = '<section class="chap plans-shot"><div class="wrap"><figure class="shot slab fade"><img src="' + asset('night-r1-schedule.webp', target) + '" alt="' + e(t.shotAlt) + '" width="2000" height="1181" loading="lazy" decoding="async"></figure><p class="shot-cap">' + e(t.shotCap) + '</p></div></section>';
  // The price as a team-size card beside the words, like the calendar beside the 30 days: 30 marks in the two bands, the
  // price for the chosen size, and − / + with a slider. Without the script it reads 8 employees at $19 and still shows both bands.
  const ticks = Array.from({ length: 30 }, (_, i) => '<i' + (i < 8 ? ' class="pc-on"' : i < 15 ? ' class="pc-in"' : '') + '></i>').join('');
  const card = '<div class="pcard fade" data-pcard data-n="8"><div class="pc-top"><label class="pc-q" for="pc-n">' + e(t.card.q) + '</label><p class="pc-n"><output id="pc-out" for="pc-n" data-count>8</output> <span data-unit>' + e(t.card.unit) + '</span></p></div>'
    + '<p class="pc-amt"><b data-amt>$19</b> <span data-per>' + e(t.card.per) + '</span></p>'
    + '<div class="pc-meter" aria-hidden="true"><span class="pc-g">' + ticks.split('</i>').slice(0, 15).join('</i>') + '</i></span><span class="pc-g">' + ticks.split('</i>').slice(15, 30).join('</i>') + '</i></span></div>'
    + '<div class="pc-scale" aria-hidden="true"><span>' + e(t.card.small) + '</span><span>' + e(t.card.team) + '</span></div>'
    + '<div class="pc-ctl"><button class="pc-step" type="button" data-step="-1" aria-label="' + e(t.card.less) + '" aria-controls="pc-n" hidden>' + icon('minus') + '</button><input class="pc-range" id="pc-n" type="range" min="1" max="31" value="8" step="1" aria-valuetext="' + e(t.card.valueText(8, '$19')) + '" disabled><button class="pc-step" type="button" data-step="1" aria-label="' + e(t.card.more) + '" aria-controls="pc-n" hidden>' + icon('plus') + '</button></div>'
    + '<p class="pc-note" data-note>' + e(t.card.note) + '</p><p class="sr" role="status" data-pc-live></p></div>';
  const hero = panel(target, { id: 'top', cls: 'dim long plans-top', img: 'ai-light', title: t.h1, tag: 'h1', text: t.text, acts: trial, after: '<p class="hfact fade">' + e(t.date) + '</p>', extra: card, first: true });
  const price = '<section class="chap day30" id="price" aria-labelledby="price-t"><div class="wrap days-grid price-grid"><div><h2 class="t2 rise" id="price-t">' + e(t.priceT) + '</h2><p class="price-mine" data-price-mine hidden></p><ul class="price-bands fade" aria-label="' + e(t.bandsLabel) + '">' + t.bands.map(([amt, per, who]) => '<li><b>' + e(amt) + ' <span>' + e(per) + '</span></b><span>' + e(who) + '</span></li>').join('') + '</ul><p class="price-inc fade">' + e(t.includes) + '</p>' + '<p class="days-fine">' + e(t.terms) + '</p><div class="hacts day-acts fade">' + trial + quote + '</div><p class="price-help">' + e(t.billingHelp[0]) + '<a href="/pages/nevora-billing">' + e(t.billingHelp[1]) + '</a></p></div></div></section>';
  const commerce = commerceBlock(target) + '<script type="module" src="' + asset('velani-commerce.js', target) + '"></script>';
  // One ending, the trial (Nov 10): no schedule screenshot repeat and no custom-work offer on the money page
  const end = '<section class="hpanel end" id="velani" aria-label="Velani"><img class="hph flip" src="' + asset('night-ai-light.webp', target) + '" alt="" width="1920" height="1080" loading="lazy"><div class="hshade"></div><div class="hcopy"><p class="hwm">' + WORDMARK + '</p><p class="fade">' + e(lang === 'es' ? 'Prueba NEVORA gratis por 30 días, y Jose, de Velani, lo configura contigo.' : 'Try NEVORA free for 30 days, and Jose from Velani sets it up with you.') + '</p><div class="hacts fade">' + trial + '</div></div></section>';
  return hero + price + days + end + commerce + '\n' + (lang === 'es' ? WORK_ES.zoom || [] : []).reduce((z, [a, b]) => z.split(a).join(b), zoomScript(target));
}
/** The signup and billing pages share one frame: the page's panel with its title and one line, then the step's own card
 * (velani-commerce.js fills it). Without a configured API the card says online signup and billing aren't open yet. */
const COMMERCE_OFF = {
  en: { text: 'Online signup and billing aren’t open yet. Ask us for a trial and we’ll set up your workplace.', act: 'Request a free trial' },
  es: { text: 'El registro y la facturación en línea todavía no están abiertos. Pídenos una prueba y configuramos tu lugar de trabajo.', act: 'Pide la prueba gratis' },
};
/** Signup (nevora-start, es-prueba): one first screen with one real NEVORA phone screen. Self-service signup now lives in
 * NEVORA's own onboarding (POST /api/onboarding/registrations on the signup address); the legacy /v1/signup this page used
 * answers 409 use_onboarding. Until an approved signup address exists, the page asks for a trial request and Velani sets up
 * the workplace. */
const START = {
  en: { fact: ['Already use NEVORA? ', 'How to sign in', '.'],
    phoneAlt: 'NEVORA on a phone: an employee’s week with each shift and its hours' },
  es: { fact: ['¿Ya usas NEVORA? ', 'Cómo entrar', '.'],
    phoneAlt: 'NEVORA en un teléfono: la semana de un empleado con cada turno y sus horas' },
};
/** Nov 10 (Jose): while online signup is closed, old links to the trial page (emails, bookmarks, search results) land on the
 * trial request instead. Without a script the page itself still offers the same request button. */
function startRedirect(target, lang) {
  const to = lang === 'es' ? '/pages/es-contacto?interest=nevora-demo' : '/pages/contact?interest=nevora-demo';
  if (target === 'shopify') {
    // On an unpublished theme the request page lives at ?preview_theme_id=…&view=velani-<page>, like every draft link.
    const view = '{{ routes.root_url }}?preview_theme_id={{ theme.id }}&view=velani-' + to.split('?')[0].split('/').at(-1) + '&' + to.split('?')[1];
    return '{% if settings.commerce_api_url == blank %}<script>location.replace("{% if theme.role == \'main\' %}' + to + '{% else %}' + view + '{% endif %}")</script>{% endif %}';
  }
  return (process.env.VELANI_COMMERCE_API || '').trim() ? '' : '<script>location.replace(' + JSON.stringify(to) + ')</script>';
}
/** Setup (nevora-verify, es-configurar), retired Nov 9: workplace setup now happens in NEVORA's own onboarding, which the
 * verification email opens (/onboarding/verify on the signup address). The old #token= links went to the legacy /v1/verify,
 * which now answers 409 use_onboarding, so this page only scrubs any fragment and explains where setup lives. */
const SETUP_RETIRED = {
  en: { line: 'Here from an older email? That link no longer works. Ask us for a trial and we’ll set up your workplace with you.' },
  es: { line: '¿Llegaste desde un correo anterior? Ese enlace ya no funciona. Pídenos una prueba y configuramos tu lugar de trabajo contigo.' },
};
/** Plan and billing (nevora-billing, es-facturacion) and Confirming payment (nevora-billing-return, es-pago): the Contact
 * split. Billing opens only through the Owner's one-time handoff from NEVORA (#handoff=); there is no email sign-in (the
 * backend retired mailbox billing links, Nov 9). Until a handoff arrives, or while online billing is closed, the page gives
 * billing support, never the new-trial request: these visitors already have a workplace. */
const BILLING = {
  en: { off: 'Online billing isn’t open yet. If NEVORA already runs your workplace, write to us about your plan or a charge. We reply within two business days.',
    act: 'Email billing support', subject: 'NEVORA billing' },
  es: { off: 'La facturación en línea todavía no está abierta. Si NEVORA ya funciona en tu lugar de trabajo, escríbenos sobre tu plan o un cobro. Respondemos en un plazo de dos días laborables.',
    act: 'Escribe a facturación', subject: 'Facturación de NEVORA' },
};
function accountPage(page, target, lang) {
  const b = BILLING[lang], off = { text: b.off, act: b.act };
  const mail = '<a class="hb fill" href="mailto:' + company.email + '?subject=' + encodeURIComponent(b.subject) + '">' + e(b.act) + icon('arrow-right') + '</a>';
  const form = '';
  const card = '<div class="setup-card" data-setup-card hidden></div><p class="sr" role="status" data-announce></p>';
  const side = '<div class="cform-hero contact-side"><h1 class="t1 rise" id="setup-t" tabindex="-1">' + e(page.title) + '</h1><p class="lede fade" data-setup-lede' + (page.intro ? '' : ' hidden') + '>' + e(page.intro) + '</p><p class="lede fade" data-off>' + e(off.text) + '</p><div class="hacts setup-acts" data-setup-acts><span data-off>' + mail + '</span></div></div>';
  const call = callBlock(CONTACT[lang].callK, (lang === 'es' ? HOURS_ES : company.hours));
  return '<section class="contact contact-split setup" id="setup" aria-labelledby="setup-t" data-account-page="' + e(page.step) + '"><div class="wrap client-grid">' + side + '<div class="client-form">' + form + card + '</div>' + call + '</div></section>';
}
function commercePage(page, target, lang = 'en') {
  const off = COMMERCE_OFF[lang];
  const offActs = hb(off.act, '/pages/contact?interest=nevora-demo', true);
  const script = commerceBlock(target) + '<script type="module" src="' + asset('velani-commerce.js', target) + '"></script>';
  if (page.step === 'verify') {
    const hero = panel(target, { id: 'top', cls: 'dim', img: 'ai-light', title: page.title, tag: 'h1', text: page.intro, first: true });
    return hero + '<section class="chap cflow" id="flow" data-verify-retired><div class="wrap"><div class="cf-card"><p>' + e(SETUP_RETIRED[lang].line) + '</p><div class="hacts">' + offActs + '</div></div></div></section>' + script;
  }
  if (page.step === 'billing' || page.step === 'return') return accountPage(page, target, lang) + script;
  if (page.step === 'start') {
    const t = START[lang];
    const phone = '<div class="hshot fade"><img src="' + asset('night-r1-ph-schedule.webp', target) + '" alt="' + e(t.phoneAlt) + '" width="780" height="1688" decoding="async"></div>';
    const offBlock = '<div class="hacts fade" data-off>' + offActs + '</div>';
    const fact = '<p class="hfact fade">' + e(t.fact[0]) + '<a href="/pages/sign-in">' + e(t.fact[1]) + '</a>' + e(t.fact[2]) + '</p>';
    const offLine = '<p class="hfact fade" data-off>' + e(off.text) + '</p>';
    const hero = panel(target, { id: 'top', cls: 'live long signup-top', img: 'ai-light', title: page.title, tag: 'h1', text: page.intro, after: offLine + offBlock + fact, extra: phone, first: true });
    return startRedirect(target, lang) + hero;
  }
  const hero = panel(target, { id: 'top', cls: 'dim', img: 'ai-light', title: page.title, tag: 'h1', text: page.intro, first: true });
  const card = '<section class="chap cflow" id="flow" data-step="' + e(page.step) + '" aria-live="polite"><div class="wrap"><div class="cf-card" data-off><p>' + e(off.text) + '</p><div class="hacts">' + offActs + '</div></div></div></section>';
  return hero + card + script;
}
/** The NEVORA billing API's address for the commerce pages: the theme setting on Shopify, VELANI_COMMERCE_API locally. Empty
 * means billing isn't available yet; the pages say so instead of guessing an endpoint. */
function commerceBlock(target) {
  const api = target === 'shopify' ? "{% if theme.role == 'unpublished' or theme.role == 'development' %}{{ settings.commerce_api_url | strip | escape }}{% endif %}" : e((process.env.VELANI_COMMERCE_API || '').trim());
  return '<template id="velani-commerce" data-api="' + api + '"></template>';
}
/** The Support page's words (Spanish in src/content.es.mjs). */
const FAQ = {
  en: { h1: 'Get help from Velani.', text: 'Questions about a website or app we built, about NEVORA or about how we work. We read email Monday to Friday, 8 am to 9 pm ET, and reply within two business days.',
    endT: 'Still need help?', endLinks: [['Email support@thevelani.com', 'mailto:support@thevelani.com'], ['NEVORA support', '/pages/nevora-support']],
    callK: 'If you can’t work, call us.',
    doors: [['A website or app we built', 'Something stopped working, or you need a change.', 'Get help', '/pages/help?interest=client-help#client', true], ['NEVORA', 'Signing in, your account, your data and deleting your account.', 'NEVORA support', '/pages/nevora-support', false]],
    doorsLabel: 'Ways to get help', qT: 'Questions', contactPage: 'Contact page' },
  es: FAQ_ES,
};
/** Support (Nov 7): the Contact split with two equal doors (a project we built goes to the help form on Sign in; NEVORA to its support
 * page), then five questions in the site's list. No postal address and no policy band; the footer carries both. */
const FAQ_SKIP = /^(Does Velani build custom software|How do I reach client support|¿Velani desarrolla software|¿Cómo contacto al soporte)/;
function faq(page, target, lang = 'en') {
  const t = FAQ[lang];
  const side = '<div class="cform-hero contact-side"><h1 class="t1 rise">' + e(t.h1) + '</h1><p class="lede fade">' + e(t.text) + '</p></div>';
  const call = callBlock(t.callK, (lang === 'es' ? HOURS_ES : company.hours));
  const doors = '<div class="help-doors" role="list" aria-label="' + e(t.doorsLabel) + '">' + t.doors.map(([h, x, b, href, fill]) => '<div class="day-opt help-door fade" role="listitem"><h2 class="t3">' + e(h) + '</h2><p>' + e(x) + '</p><div class="hacts">' + hb(b, href, fill, href.includes('nevora-support') ? enOnly(lang, href) : '') + '</div></div>').join('') + '</div>';
  const top = '<section class="contact contact-split help-top"><div class="wrap client-grid">' + side + '<div class="client-form">' + doors + '</div>' + call + '</div></section>';
  const qs = page.sections.filter(x => !FAQ_SKIP.test(x.heading));
  const questions = '<section class="faq" aria-labelledby="faq-t"><div class="wrap"><div class="qa"><div class="head"><h2 class="t2 rise" id="faq-t">' + e(t.qT) + '</h2></div><div class="faq-list">' + qs.map(x => '<details><summary>' + e(x.heading) + icon('plus') + '</summary><p>' + (company.phone ? linkEmail(e(x.text)).split(company.phone).join('<a href="' + tel() + '">' + e(company.phone) + '</a>') : linkEmail(e(x.text))) + '</p></details>').join('') + '</div></div></div></section>';
  return localize(top + clientSection(target, lang) + questions + helpEnd(t.endT, t.endLinks.map(([x, href]) => [x, href, href.startsWith('/pages/nevora-support') ? enOnly(lang, href) : ''])), lang);
}
/** About (Nov 7, v2): who we are without names or photos. A short hero with Jose's reason for Velani set large, the three things we
 * have built (one size of picture each, the year), and the company: the phone beside three facts. Then the closing. */
const ABOUT = {
  en: { h1: 'Software for small businesses.', text: 'We started Velani in 2026 to build software for small businesses, with a fixed price in writing and everything in English and Spanish.', project: 'Start a project', see: 'See NEVORA',
    builtT: 'What we’ve built',
    built: [['NEVORA', 'Scheduling, time clock and payroll calculation for shift teams. Our own product, launched in 2026.', 'See NEVORA', '/pages/nevora', 'night-r1-owner.webp', 'NEVORA on the web for an owner: one thing that needs an answer, five of five clocked in, the next payday and this week’s hours', false],
      ['Tool Box LLC', 'An equipment rental website with an online store, built in 2026.', 'See the project', '/pages/custom-development#web-applications', 'night-tb-home.webp', 'The Tool Box LLC website, built by Velani: equipment rental with job-site delivery and dates', false],
      ['Yavi Barber', 'A booking and rewards app, built in 2026.', 'See the project', '/pages/custom-development#booking', 'night-yavi-book.webp', 'Yavi Barber booking on a phone: the next open times and services with prices', true]],
    coT: 'The company', callK: 'Prefer to talk? Call us.',
    endLine: 'Try NEVORA free for 30 days, and Jose from Velani sets it up with you.', also: ['We also build websites and apps for businesses.', 'See custom software', '/pages/custom-development'],
    facts: [['Founded in 2026', 'Velani is a brand of VELANI LLC.'], ['English and Spanish', 'We work, write and build in both languages.'], ['A reply within two business days', 'Client support answers ' + company.hours + '.']] },
  es: ABOUT_ES,
};
function about(page, target, lang = 'en') {
  const t = ABOUT[lang];
  const hero = panel(target, { id: 'top', cls: 'dim long short about-hero', img: 'ai-light', flip: true, title: t.h1, tag: 'h1', text: t.text, acts: hb(t.project, '/pages/contact?interest=custom-software', true), first: true });
  const item = ([h, x, link, href, img, alt, phone]) => '<div class="built-item fade"><figure class="shot built-shot' + (phone ? ' is-phone' : ' slab') + '"><img src="' + asset(img, target) + '" alt="' + e(alt) + '" width="' + (phone ? 780 : 2000) + '" height="' + (phone ? 1688 : 1250) + '" loading="lazy" decoding="async"></figure><h3 class="t3">' + e(h) + '</h3><p>' + e(x) + '</p>' + more(link, href) + '</div>';
  const built = '<section class="chap about-built" aria-labelledby="built-t"><div class="wrap"><h2 class="t2 rise" id="built-t">' + e(t.builtT) + '</h2><div class="built-row">' + t.built.map(item).join('') + '</div></div></section>';
  const call = callBlock(t.callK, '');
  const co = '<section class="chap days about-how" aria-labelledby="co-t"><div class="wrap days-grid"><div><h2 class="t2 rise" id="co-t">' + e(t.coT) + '</h2>' + call + '</div><div><ul class="days-list">' + t.facts.map(([k, x]) => '<li class="fade"><p class="days-k">' + e(k) + '</p><p>' + e(x) + '</p></li>').join('') + '</ul></div></div></section>';
  return localize(hero + built + co + closing(target, { lang, line: t.endLine, also: t.also }), lang);
}
function notFound() {
  return '<section class="phero"><div class="wrap"><h1 class="t1">We could not find that page.</h1><p class="lede">The link may be out of date, or the address may be misspelled.</p><div class="acts"><a class="hb fill" href="/">Go to the home page' + icon('arrow-right') + '</a><a class="hb" href="/pages/nevora">See NEVORA' + icon('arrow-right') + '</a></div></div></section>';
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return notFound();
  const lang = langOf(path);
  switch (page.kind) {
    case 'home': return homeMain(target, lang);
    case 'nevora': return nevoraMain(target, lang);
    case 'products': return productsMain(target, lang);
    case 'policy': return policyMain(page.slug, lang);
    case 'services': return services_(page, target, lang);
    case 'contact': return localize((target === 'shopify' ? '{% capture velani_sent %}' + sentPanel(false, lang) + '{% endcapture %}' : '') + contact(page, target, lang), lang);
    case 'signin': return signin(page, target, lang);
    case 'commerce': return localize(commercePage(page, target, lang), lang);
    case 'faq': return faq(page, target, lang);
    case 'plans': return localize(plans(page, target, lang), lang);
    case 'legal-index': return pageHero(page) + legalIndex();
    default: return page.legal ? legalDoc(page, lang) : about(page, target, lang);
  }
}
/** Large screenshots also ship a 1000px copy (night-NAME-1000.webp): phones pick it through srcset, desktops keep the full size. */
const SRCSET = { 'r1-owner': 2000, 'r1-owner-today': 1800, 'r1-schedule': 2000, 'r1-timecards': 1500, 'r1-payroll': 1500, 'r1-clocker': 1600, 'tb-home': 2000, store: 1600 };
function srcsets(html) {
  return html.replace(/<img([^>]*?) src="(\/assets\/night-|\{\{ 'night-)([a-z0-9-]+)\.webp((?:' \| asset_url \}\})?)"/g, (m, pre, head, name, tail) => {
    if (!SRCSET[name] || /srcset=/.test(m)) return m;
    const small = head + name + '-1000.webp' + tail;
    return '<img' + pre + ' src="' + head + name + '.webp' + tail + '" srcset="' + small + ' 1000w, ' + head + name + '.webp' + tail + ' ' + SRCSET[name] + 'w" sizes="(max-width: 833px) 92vw, 1240px"';
  });
}
export function renderBody(path, { target = 'preview' } = {}) {
  const html = srcsets(renderRawBody(path, target));
  return target === 'shopify' ? draftLinks(html) : html;
}
/** Which stylesheet and script a page needs beyond the shared ones. */
const pageKind = path => routes[path]?.kind === 'home' ? 'home' : routes[path]?.kind === 'nevora' ? 'nevora' : null;
function headAssets(kind, target) {
  const css = '<link rel="stylesheet" href="' + asset('velani.css', target) + '">' + (kind ? '<link rel="stylesheet" href="' + asset('velani-' + kind + '.css', target) + '">' : '');
  // Only the NEVORA page has a page script (the time clock and local nav); the home page needs its stylesheet only
  const js = (kind === 'nevora' ? '<script src="' + asset('velani-nevora.js', target) + '" defer></script>' : '') + '<script src="' + asset('velani-motion.js', target) + '" defer></script><script type="module" src="' + asset('velani.js', target) + '"></script>';
  return css + js;
}
export const BOOT_JS = "(function(d){d.className='js pre'+(/[?&]interest=nevora(-demo)?(&|$)/.test(location.search)?' ask-nevora':'')+(/[?&]interest=nevora-demo(&|$)/.test(location.search)?' ask-demo':'')+(/[?&]interest=relay(&|$)/.test(location.search)?' ask-relay':'')+(/^#handoff=/.test(location.hash)&&/plan(s|es)/.test(location.pathname+location.search)?' owner-loading':'');setTimeout(function(){d.classList.remove('owner-loading')},6000);window.__pre=setTimeout(function(){d.classList.remove('pre');d.classList.add('still')},2500)})(document.documentElement)";
const BOOT = '<script>' + BOOT_JS + '</script>';
/** Organization data for brand search results; no ratings, no invented facts. */
const ORG_LD = '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: company.name, legalName: company.operator, url: 'https://' + company.domain + '/', email: company.email, ...(company.phone ? { telephone: '+1-' + company.phone } : {}), address: { '@type': 'PostalAddress', streetAddress: '1654 Calle Tulipan, Suite 100', addressLocality: 'San Juan', addressRegion: 'PR', postalCode: '00927', addressCountry: 'US' }, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: company.email, ...(company.phone ? { telephone: '+1-' + company.phone } : {}), description: 'Monday to Friday, 8 am to 9 pm Eastern Time (New York)', availableLanguage: ['English', 'Spanish'] } }).replace(/</g, '\\u003c') + '</script>';
/** The assistant appears only when an API address is configured: the theme setting on Shopify, VELANI_ASSISTANT_API for the local preview. */
function assistantBlock(target) {
  if (target === 'shopify') return "{% if settings.assistant_api_url != blank %}" + nightAssistant('shopify', '{{ settings.assistant_api_url | strip | escape }}') + '<script type="module" src="' + asset('velani-assist.js', 'shopify') + '"></script>{% endif %}';
  const api = (process.env.VELANI_ASSISTANT_API || '').trim();
  return api ? nightAssistant(target, e(api)) + '<script type="module" src="' + asset('velani-assist.js', target) + '"></script>' : '';
}
const preload = (target, extra = '') => '<link rel="preload" href="' + asset('dm-sans-latin-400-normal.woff2', target) + '" as="font" type="font/woff2" crossorigin><link rel="preload" href="' + asset('dm-sans-latin-600-normal.woff2', target) + '" as="font" type="font/woff2" crossorigin>' + extra;
/** The first large image of each panel page, preloaded at high priority (it is the page's largest paint). */
const heroOf = path => ({ home: 'night-ai-light.webp', nevora: 'night-ai-devices.webp', products: 'night-ai-devices.webp', services: 'night-ai-light.webp', signin: 'night-ai-devices.webp', plans: 'night-ai-light.webp' })[routes[path]?.kind] || (path === '/pages/about' || path === '/pages/es-nosotros' ? 'night-ai-light.webp' : '');
/** Language versions: the English and Spanish paths of a page that has both, absolute on the main domain (hreflang). */
const absolute = path => 'https://' + company.domain + path;
const pairOf = path => { const other = counterpart(path); if (!other) return null; return langOf(path) === 'es' ? { en: other, es: path } : { en: path, es: other }; };
function alternates(path) {
  const pair = pairOf(path);
  return pair ? '<link rel="alternate" hreflang="en" href="' + absolute(pair.en) + '"><link rel="alternate" hreflang="es" href="' + absolute(pair.es) + '"><link rel="alternate" hreflang="x-default" href="' + absolute(pair.en) + '">' : '';
}
/** Where the language switch goes: the page itself and its counterpart, or Spanish home / English home when there is none. */
export function langPaths(path) {
  const page = routes[path];
  if (!page) return { en: '/', es: '/pages/es' };
  return langOf(path) === 'es' ? { en: page.en || '/', es: path } : { en: path, es: page.es || ES_NEAREST[path] || '/pages/es' };
}
export function renderPage(path, { target = 'preview' } = {}) {
  const page = routes[path] || { title: 'Page not found', intro: 'We could not find that page.' };
  const title = pageTitle(page);
  const kind = pageKind(path);
  const hero = heroOf(path);
  const lang = routes[path] ? langOf(path) : 'en', hrefs = langPaths(path);
  const html = '<!doctype html><html lang="' + lang + '" class="no-js" data-platform="' + (target === 'shopify' ? 'shopify' : 'local') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + BOOT + '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>' + e(title) + '</title><meta name="description" content="' + e(page.desc || page.intro) + '">' + alternates(path) + '<link rel="icon" href="' + asset('favicon.svg', target) + '" type="image/svg+xml"><link rel="icon" href="' + asset('favicon-32.png', target) + '" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="' + asset('apple-touch-icon.png', target) + '">' + preload(target, hero ? '<link rel="preload" as="image" href="' + asset(hero, target) + '" fetchpriority="high">' : '') + headAssets(kind, target) + ORG_LD + '</head><body>' + nightHeader(page.nav, target, { nevora: kind === 'nevora', lang, hrefs }) + '<main id="main" tabindex="-1">' + renderBody(path, { target }) + '</main>' + nightFooter(target, { lang, hrefs }) + consent(lang) + assistantBlock(target) + '</body></html>';
  return { html, status: routes[path] ? 200 : 404 };
}
/** The site chrome per language as theme snippets (header and phone menu; footer and cookie dialog). Each is its own Liquid file,
 * so the layout stays simple: it picks the snippet for the page's language and passes the page's nav key and switch links. */
export function renderShopifySnippets() {
  const out = {};
  for (const lang of ['en', 'es']) {
    out['velani-header-' + lang] = draftLinks(nightHeader(null, 'shopify', { lang }));
    out['velani-footer-' + lang] = draftLinks(nightFooter('shopify', { lang }) + consent(lang));
  }
  return out;
}
export function renderShopifyLayout() {
  // Liquid string literals have no escapes, so a quote or backslash in a title would break the layout: refuse it at build time
  const liquidStr = text => { if (/["\\]/.test(text)) throw new Error('Liquid string cannot contain quotes or backslashes: ' + text); return '"' + text + '"'; };
  // Each page's case branch sets everything it needs (no extra conditions in the layout): title, description, nav key, share image,
  // language and the two language destinations (path on the main theme, view on a draft)
  const view = path => path === '/' ? '' : '&amp;view=velani-' + slugOf(path);
  const langAssign = path => { const { en, es } = langPaths(path); return `{% assign velani_en_path = '${en}' %}{% assign velani_en_view = '${view(en)}' %}{% assign velani_es_path = '${es}' %}{% assign velani_es_view = '${view(es)}' %}` + (langOf(path) === 'es' ? `{% assign velani_lang = 'es' %}{% assign velani_locale = 'es_US' %}` : '') + (pairOf(path) ? `{% assign velani_alt_en = '${absolute(pairOf(path).en)}' %}{% assign velani_alt_es = '${absolute(pairOf(path).es)}' %}{% assign velani_locale_alt = '${langOf(path) === 'es' ? 'en_US' : 'es_US'}' %}` : ''); };
  const assignments = page => `{% assign velani_page_title = ${liquidStr(page.title)} %}{% assign velani_page_description = ${liquidStr(page.intro)} %}` + pageHead(page.path) + langAssign(page.path) + (page.nav ? `{% assign velani_nav = '${page.nav}' %}` : '') + (page.og ? `{% assign velani_og = '${page.og[0]}' %}{% assign velani_og_alt = ${liquidStr(page.og[1])} %}` : '') + (page.noindex ? '{% assign velani_noindex = true %}' : '');
  // What a page adds to <head>, captured in its own case branch: the hero image preload, for Home and NEVORA their stylesheet
  // (NEVORA also its script), and for a page with two languages the absolute URLs of both versions (hreflang, set in the head below)
  const pageHead = path => { const hero = heroOf(path), kind = routes[path]?.kind; const css = kind === 'home' || kind === 'nevora' ? `<link rel="stylesheet" href="{{ 'velani-${kind}.css' | asset_url }}">` : ''; const js = kind === 'nevora' ? `<script src="{{ 'velani-nevora.js' | asset_url }}" defer></script>` : ''; return hero || css ? `{% capture velani_head %}${hero ? `<link rel="preload" as="image" href="{{ '${hero}' | asset_url }}" fetchpriority="high">` : ''}${css}${js}{% endcapture %}` : ''; };
  // Share image per page: velani-social.png by default; pages with their own image name it in content (og: [file, alt])
  const defaults = `{% assign velani_nav = '' %}{% assign velani_lang = 'en' %}{% assign velani_locale = 'en_US' %}{% assign velani_en_path = '/' %}{% assign velani_en_view = '' %}{% assign velani_es_path = '/pages/es' %}{% assign velani_es_view = '${view('/pages/es')}' %}{% assign velani_og = 'velani-social.png' %}{% assign velani_og_alt = ${liquidStr('Velani. ' + routes['/'].title)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% assign velani_page = template.suffix | remove_first: 'velani-' %}${defaults}{% if template.name == 'index' and template.suffix == blank %}{% assign velani_page = 'home' %}${pageHead('/')}${langAssign('/')}{% assign velani_page_title = ${liquidStr(pageTitle(routes['/']))} %}{% assign velani_page_description = ${liquidStr(routes['/'].intro)} %}{% endif %}{% case velani_page %}` + Object.entries(routes).filter(([path, page]) => path !== '/' && page.layoutMeta !== false).map(([path, page]) => `{% when '${slugOf(path)}' %}${assignments({ title: pageTitle(page), intro: page.desc || page.intro, path, nav: page.nav, og: page.og, noindex: page.noindex })}`).join('') + '{% endcase %}' + '{% if template.name == "collection" or template.name == "product" or template.name == "cart" or template.name == "search" or template.name == "list-collections" or template.name == "404" %}{% assign velani_page_title = "Page not found" %}{% assign velani_page_description = "The page you asked for is not on the Velani website. Go to the home page or see NEVORA, plans and custom software." %}{% assign velani_noindex = true %}{% endif %}{% assign velani_canonical = canonical_url %}{% if template.name == "index" and template.suffix != blank %}{% assign velani_noindex = true %}{% assign velani_canonical = shop.url | append: "/pages/" | append: velani_page %}{% endif %}';
  // The language switch: on the main theme the canonical path, on a draft the same draft with the other page's view
  const switchLinks = `{% if theme.role == 'main' %}{% assign velani_en_href = velani_en_path %}{% assign velani_es_href = velani_es_path %}{% else %}{% capture velani_en_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_en_view }}{% endcapture %}{% capture velani_es_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_es_view }}{% endcapture %}{% endif %}`;
  const chrome = part => `{% if velani_lang == 'es' %}{% render 'velani-${part}-es'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% else %}{% render 'velani-${part}-en'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% endif %}`;
  const kindCss = '{{ velani_head }}';
  const head = `<link rel="stylesheet" href="${asset('velani.css', 'shopify')}">${kindCss}<script src="${asset('velani-motion.js', 'shopify')}" defer></script><script type="module" src="${asset('velani.js', 'shopify')}"></script>`;
  const fontFace = '<style>' + [400, 500, 600].map(w => `@font-face{font-family:"DM Sans";font-weight:${w};font-display:swap;src:url({{ 'dm-sans-latin-${w}-normal.woff2' | asset_url }}) format("woff2")}`).join('') + '</style>';
  const policyFallback = `<section class="phero"><div class="wrap">{% if request.path contains 'privacy' %}<h1 class="t1">Privacy</h1><p class="lede">The privacy notice for this website and the NEVORA privacy policy are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/privacy">Privacy notice</a><a class="pill line" href="/pages/nevora-privacy">NEVORA privacy policy</a></div>{% elsif request.path contains 'terms' %}<h1 class="t1">Terms</h1><p class="lede">The website terms and the project terms are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/website-terms">Website terms</a><a class="pill line" href="/pages/software-project-terms">Project terms</a></div>{% elsif request.path contains 'refund' or request.path contains 'shipping' %}<h1 class="t1">No refund or shipping policy</h1><p class="lede">Velani sells software and services. This website takes no payments and ships no goods, so it has no refund or shipping policy. Fees and milestones are set out in the project terms.</p><div class="acts"><a class="pill" href="/pages/software-project-terms">Project terms</a><a class="pill line" href="/pages/legal">All legal information</a></div>{% else %}<h1 class="t1">Legal information</h1><p class="lede">Read the notices for this website and the NEVORA app.</p><div class="acts"><a class="pill" href="/pages/legal">All legal information</a></div>{% endif %}</div></section>`;
  const html = `${metadata}${switchLinks}<!doctype html><html lang="{{ velani_lang }}" class="no-js" data-platform="shopify"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BOOT}{% unless theme.role == 'main' %}<meta name="robots" content="noindex, nofollow">{% endunless %}{% if velani_noindex %}<meta name="robots" content="noindex">{% endif %}<meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>{% if velani_page_title contains 'Velani' %}{{ velani_page_title | escape }}{% else %}{{ velani_page_title | escape }} · Velani{% endif %}</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ velani_canonical | escape }}"><meta property="og:site_name" content="Velani"><meta property="og:type" content="website"><meta property="og:locale" content="{{ velani_locale }}">{% if velani_alt_es != blank %}<meta property="og:locale:alternate" content="{{ velani_locale_alt }}"><link rel="alternate" hreflang="en" href="{{ velani_alt_en }}"><link rel="alternate" hreflang="es" href="{{ velani_alt_es }}"><link rel="alternate" hreflang="x-default" href="{{ velani_alt_en }}">{% endif %}<meta property="og:title" content="{{ velani_page_title | escape }}"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ velani_canonical | escape }}"><meta property="og:image" content="{{ velani_og | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{{ velani_og_alt | escape }}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg', 'shopify')}" type="image/svg+xml"><link rel="icon" href="${asset('favicon-32.png', 'shopify')}" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="${asset('apple-touch-icon.png', 'shopify')}">{{ 'dm-sans-latin-400-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}{{ 'dm-sans-latin-600-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}${head}${fontFace}${ORG_LD}{{ content_for_header }}</head><body>${chrome('header')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}${policyFallback}{% else %}{{ content_for_layout }}{% endif %}</main>${chrome('footer')}${assistantBlock('shopify')}</body></html>`;
  return draftLinks(html);
}
