import { company, routes, services, legalUpdated, langOf, counterpart } from './content.mjs';
import { CONSENT_ES, CONTACT_ES, PLANS_ES, HOURS_ES, ABOUT_ES, FAQ_ES, ES_NEAREST, IN_ENGLISH, WORK_ES, SIGNIN_ES } from './content.es.mjs';
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
  return '<section class="phero"><div class="wrap"><p class="kicker">' + e(page.eyebrow) + '</p><h1 class="t1 rise">' + e(page.title) + '</h1>' + (page.lede || page.intro ? '<p class="lede fade">' + e(page.lede || page.intro) + '</p>' : '') + meta + '</div></section>';
}
/* Full-screen panels (the home page language): a square outlined button, a label, a title, one paragraph and one or two actions */
const hb = (text, href, fill = false, attrs = '') => '<a class="hb' + (fill ? ' fill' : '') + '" href="' + e(href) + '"' + attrs + '>' + e(text) + icon('arrow-right') + '</a>';
const tel = () => 'tel:+1' + company.phone.replace(/-/g, '');
function panel(target, { id, cls = '', img, flip = false, kick, kickHtml, title, tag = 'h2', html = '', text, acts = '', after = '', extra = '', first = false }) {
  const tid = id + '-t';
  const photo = img ? '<img class="hph' + (flip ? ' flip' : '') + '" src="' + asset('night-' + img + '.webp', target) + '" alt="" width="1920" height="1080"' + (first ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>' : '';
  return '<section class="hpanel ' + cls + '" id="' + id + '" aria-labelledby="' + tid + '">' + photo + '<div class="hshade"></div><div class="hcopy">' + (kick || kickHtml ? '<p class="hkick">' + (kickHtml || e(kick)) + '</p>' : '') + '<' + tag + ' class="rise" id="' + tid + '">' + (html || e(title)) + '</' + tag + '>' + (text ? '<p class="fade">' + e(text) + '</p>' : '') + (acts ? '<div class="hacts fade">' + acts + '</div>' : '') + after + '</div>' + extra + '</section>';
}
/** The closing panel on every company page: the wordmark, client support and the two ways in. */
function closing(target, { project = '/pages/contact', lang = 'en', support = hb(CHROME[lang].support, '/pages/help') } = {}) {
  return '<section class="hpanel end" id="velani" aria-label="Velani"><img class="hph flip" src="' + asset('night-ai-light.webp', target) + '" alt="" width="1920" height="1080" loading="lazy"><div class="hshade"></div><div class="hcopy"><p class="hwm">' + WORDMARK + '</p><p class="fade">' + e(CHROME[lang].closingLine) + '</p><div class="hacts fade">' + hb(CHROME[lang].project, project, true) + support + '</div></div></section>';
}
const rail = (steps, cls = '') => '<ol class="rail' + cls + '" data-in>' + steps.map(([b, t], i) => '<li data-in><i>0' + (i + 1) + '</i><b>' + e(b) + '</b><span>' + e(t) + '</span></li>').join('') + '</ol>';
/** Custom software page words (Spanish added with its own page). Case studies lead; the client's name is the heading. */
const WORK = {
  en: {
    jump: [['Tool Box LLC', '#web-applications'], ['Yavi Barber', '#booking'], ['What you get', '#how']], jumpLabel: 'On this page', shotsLabel: 'Tool Box LLC screens', moreLabel: 'Business tools',
    toolbox: { kind: 'Equipment rental website and online store', text: 'Tool Box rents lifts and other equipment. On any phone, customers find the machine they need, pick the dates and check delivery to their job site. Every machine has its price and a Reserve button, and the store prices delivery by the distance to the job site.', credit: 'We designed and built Tool Box LLC’s website and online store.', shots: [['tb-home', 'The Tool Box LLC website, built by Velani: equipment rental with job-site delivery and dates', 2000, 1250], ['store', 'The Tool Box LLC online store, built by Velani: rental equipment with prices and a Reserve button on each item', 1600, 1000]] },
    yavi: { kind: 'Booking and rewards app', text: 'Yavi Barber’s clients pick a service and a time on their phone, get a reminder before the visit and collect each visit on a rewards card.', credit: 'We designed and built Yavi Barber’s booking and rewards app.', shots: [['yavi-book', 'Yavi Barber booking on a phone: the next open times and services with prices'], ['yavi-rewards', 'Yavi Barber rewards card on a phone: ten visits and two rewards']] },
    more: ['We also build internal tools for your team, like request forms, approvals and dashboards. For an example, see ', 'NEVORA', ', the workforce app we make.'],
    getT: 'What you get', get: ['Every project includes the design, the build and the hosting setup. If you want English and Spanish, we build both. After launch, we keep supporting it.', 'Before any paid work starts, you get a fixed quote in writing. The price depends on what the project needs.'],
    howT: 'How a project works', how: ['You show us how the work gets done today and who does it. You then get the written proposal with what we’ll build, the fixed price and the milestones. Paid work starts only after you agree to it.', 'We build in milestones, and you try working software at each one. The agreement says who owns the code, what you receive and how support works after launch.'],
    project: 'Start a project',
  },
  es: WORK_ES,
};
function services_(page, target, lang = 'en') {
  const t = WORK[lang];
  const jump = '<nav class="jump fade" aria-label="' + t.jumpLabel + '">' + t.jump.map(([n, h]) => '<a href="' + h + '">' + e(n) + '</a>').join('') + '</nav>';
  const hero = panel(target, { id: 'top', cls: 'dim long', img: 'ai-glow', title: page.title, tag: 'h1', text: page.intro, acts: hb(t.project, '/pages/contact?interest=custom-software', true), after: jump, first: true });
  const shot = ([n, alt, w, h]) => '<figure class="shot slab"><img src="' + asset('night-' + n + '.webp', target) + '" alt="' + e(alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"></figure>';
  const phone = ([n, alt]) => '<figure class="shot slab phone"><img src="' + asset('night-' + n + '.webp', target) + '" alt="' + e(alt) + '" width="780" height="1688" loading="lazy" decoding="async"></figure>';
  const head = (id, name, c) => '<div class="case-head"><h2 class="t1 rise" id="' + id + '-t">' + e(name) + '</h2><p class="case-kind fade">' + e(c.kind) + '</p><p class="lede fade">' + e(c.text) + '</p></div>';
  const toolbox = '<section class="chap case" id="web-applications" aria-labelledby="web-applications-t"><span class="anchor" id="online-stores"></span><div class="wrap">' + head('web-applications', 'Tool Box LLC', t.toolbox) + '<div class="case-shots two" data-scroll-x aria-label="' + t.shotsLabel + '">' + t.toolbox.shots.map(shot).join('') + '</div><p class="case-credit">' + e(t.toolbox.credit) + '</p></div></section>';
  const yavi = '<section class="chap case" id="booking" aria-labelledby="booking-t"><div class="wrap case-split">' + head('booking', 'Yavi Barber', t.yavi).replace(/<\/div>$/, '<p class="case-credit">' + e(t.yavi.credit) + '</p></div>') + '<div class="case-phones">' + t.yavi.shots.map(phone).join('') + '</div></div></section>';
  const more = '<section class="chap case-more" id="business-systems" aria-label="' + t.moreLabel + '"><div class="wrap"><p class="lede">' + e(t.more[0]) + '<a class="ul" href="/pages/nevora">' + e(t.more[1]) + '</a>' + e(t.more[2]) + '</p></div></section>';
  const how = '<section class="chap how-page" id="how" aria-labelledby="how-t"><div class="wrap"><div class="case-cols"><div><h2 class="t2 rise" id="how-t">' + e(t.getT) + '</h2>' + t.get.map(x => '<p class="lede fade how-text">' + e(x) + '</p>').join('') + '</div><div><h3 class="t2 rise">' + e(t.howT) + '</h3>' + t.how.map(x => '<p class="lede fade how-text">' + e(x) + '</p>').join('') + '</div></div><div class="acts fade">' + hb(t.project, '/pages/contact?interest=custom-software', true) + '</div></div></section>';
  return localize(hero + toolbox + yavi + more + how + closing(target, { lang, project: '/pages/contact?interest=custom-software' }), lang) + '\n' + (t.zoom || []).reduce((z, [a, b]) => z.split(a).join(b), zoomScript(target));
}
/** The contact page's words (Spanish in src/content.es.mjs). Topic values never change, so the email Velani receives is the same. */
const CONTACT = {
  en: { kicker: ['NEVORA for your team', 'Free 30-day NEVORA trial', 'NEVORA Relay'], h1: ['Ask for a NEVORA quote.', 'Request your free NEVORA trial.', 'Join the NEVORA Relay waitlist.'], fact: ['Websites, custom apps, NEVORA or something else.', 'One price per business, quoted for your number of employees, your business and the features you use. No commitment.', 'Up to 30 employees&nbsp;· 30 days&nbsp;· No card&nbsp;· No&nbsp;automatic&nbsp;charge', 'In design&nbsp;· No dates yet. We’ll email you when early access opens.'],
    previewNote: 'Website preview&nbsp;· checks your draft, sends nothing', noscript: 'The preview form needs JavaScript. No messages are sent from this preview.', legend: 'Inquiry',
    name: 'Name', email: 'Email', company: 'Company', optional: 'optional', topic: 'Topic', topics: [['website', 'Website'], ['custom-software', 'Custom app'], ['nevora', 'NEVORA quote'], ['nevora-demo', 'Free NEVORA trial'], ['relay', 'NEVORA Relay waitlist'], ['other', 'Something else']],
    team: 'Team size', bigTeam: 'More than 30 (by quote)', locations: 'Number of locations', message: 'What needs to work better', messageOptional: 'Anything else',
    send: ['Send inquiry', 'Ask for a quote', 'Send trial request'], check: 'Check draft inquiry', sendNote: 'We aim to reply by email within two business days.', privacy: 'Privacy notice',
    fine: 'On day 30 you continue by quote or close the workplace. Export your data first: a closed workplace and its data are deleted within 3&nbsp;days, timecards and pay statements included. To close it, email support@thevelani.com. NEVORA calculates pay statements; it does not pay employees or file payroll taxes.',
    sentPreview: 'Website preview&nbsp;· this is what visitors see after sending. Nothing was sent.', sentH: 'Message sent.', sentP: 'Thanks for writing. We aim to reply by email within two business days.', sentFrom: ['Replies come from ', '. If it isn’t in your inbox, check spam or junk.'], back: 'Back to home',
    writeTitle: 'Write to us', writeText: 'What needs to work better, who will use it, and how it works today. We reply from ', writeButton: 'Email ', noSensitive: 'No passwords, payment details or sensitive records by email.' },
  es: CONTACT_ES,
};
/** Links to pages that exist only in English say so to browsers and assistive technology on Spanish pages. */
const enOnly = lang => lang === 'es' ? ' hreflang="en"' : '';
/** A plain form in one column: the label sits inside the field and lifts when the field is used; errors sit under their field. */
function fields(live = false, lang = 'en') {
  const t = CONTACT[lang], opt = ' <span class="opt">' + t.optional + '</span>';
  const ff = (id, name, label, extra = '', value = '') => '<div class="ff"><input id="inquiry-' + id + '" name="contact[' + name + ']" placeholder=" " ' + extra + (value ? ' value="' + value + '"' : '') + '><label for="inquiry-' + id + '">' + label + '</label><p class="field-error" id="error-' + id + '"></p></div>';
  const name = ff('name', 'name', t.name, 'autocomplete="name" maxlength="120" required aria-describedby="error-name"', live ? '{{ form.name | escape }}' : '');
  const email = ff('email', 'email', t.email, 'type="email" autocomplete="email" maxlength="254" required aria-describedby="error-email"', live ? '{{ form.email | escape }}' : '');
  const company = ff('company', 'company', t.company + opt, 'autocomplete="organization" maxlength="160" aria-describedby="error-company"');
  const topic = '<div class="ff sel field-topic"><select id="inquiry-interest" name="contact[interest]"><option value=""></option>' + t.topics.map(([value, label]) => '<option value="' + value + '">' + label + '</option>').join('') + '</select><label for="inquiry-interest">' + t.topic + '</label></div>';
  // The submitted team size stays in English ("More than 30 (by quote)") so every inquiry email reads the same
  const big = CONTACT.en.bigTeam, bigOption = t.bigTeam === big ? '<option>' + big + '</option>' : '<option value="' + big + '">' + t.bigTeam + '</option>';
  const team = '<div class="frow" data-nevora-fields hidden><div class="ff sel"><select id="inquiry-team" name="contact[team_size]"><option value=""></option><option>1–10</option><option>11–20</option><option>21–30</option>' + bigOption + '</select><label for="inquiry-team">' + t.team + '</label></div>' + ff('locations', 'locations', t.locations, 'maxlength="120" aria-describedby="error-locations" inputmode="numeric"') + '</div>';
  const message = '<div class="ff area"><textarea id="inquiry-message" name="contact[body]" placeholder=" " rows="4" maxlength="4000" required aria-describedby="error-message" data-min="140">' + (live ? '{{ form.body | escape }}' : '') + '</textarea><label for="inquiry-message">' + v(t.message, t.messageOptional + opt) + '</label><p class="field-error" id="error-message"></p></div>';
  const send = '<button class="pill" type="submit" data-inquiry-submit>' + (live ? v(...t.send) : t.check) + '</button><p class="send-note">' + t.sendNote + ' <a href="/pages/privacy"' + enOnly(lang) + '>' + t.privacy + '</a></p><p class="fine v-m">' + t.fine + '</p>';
  return '<fieldset' + (live ? '' : ' disabled') + '><legend class="sr">' + t.legend + '</legend>' + name + email + company + topic + team + message + send + '</fieldset>';
}
/** The contact page carries the general, the NEVORA quote and the demo wording; the boot script marks the document before paint and CSS shows one. */
const v = (general, nevora, demo, relay) => '<span class="v-d">' + general + '</span><span class="v-n' + (demo ? '' : ' v-nm') + '">' + nevora + '</span>' + (demo ? '<span class="v-m">' + demo + '</span>' : '') + (relay ? '<span class="v-r">' + relay + '</span>' : '');
/** After a successful send the form is replaced by this confirmation; velani.js adapts its wording to the topic (and shows it after a preview check). */
const SENT_ICON = '<svg class="sent-i" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>';
const sentPanel = (hidden = false, lang = 'en') => { const t = CONTACT[lang]; return '<div class="sent" id="inquiry-sent" tabindex="-1"' + (hidden ? ' hidden' : '') + '>' + SENT_ICON + '<p class="note" data-sent-preview hidden>' + t.sentPreview + '</p><h1 class="t2 sent-h" data-sent-h>' + t.sentH + '</h1><p class="sent-p" data-sent-p>' + t.sentP + '</p><p class="sent-from">' + t.sentFrom[0] + '<a href="mailto:' + company.email + '">' + company.email + '</a>' + t.sentFrom[1] + '</p><a class="pill" href="/">' + t.back + '</a></div>'; };
function contactHero(page, lang = 'en') {
  const t = CONTACT[lang];
  return '<section class="phero cform-hero"><div class="wrap"><p class="kicker">' + v(e(page.eyebrow), ...t.kicker) + '</p><h1 class="t1 rise">' + v(e(page.title), ...t.h1) + '</h1><p class="hfact fade">' + v(...t.fact) + '</p></div></section>';
}
function contact(target, lang = 'en') {
  const t = CONTACT[lang];
  const preview = '<form id="project-inquiry" class="inquiry-form" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate><p class="note">' + t.previewNote + '</p>' + fields(false, lang) + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><noscript><p>' + t.noscript + '</p></noscript></form>';
  const email = '<div class="panel"><h2 class="t3">' + t.writeTitle + '</h2><p>' + t.writeText + company.email + '.</p><div class="acts"><a class="pill" href="mailto:' + company.email + '">' + t.writeButton + company.email + '</a></div><p class="field-help mail">' + t.noSensitive + '</p></div>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form', novalidate: 'novalidate' %}{% if form.posted_successfully? %}{{ velani_sent }}{% else %}<div data-inquiry-mode=\"live\">" + fields(true, lang) + "</div>{% if form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}<div class=\"form-legal\">{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}</div>{% endif %}{% endform %}{% elsif theme.role == 'main' %}" + email + '{% else %}' + preview + "{{ velani_sent | replace: 'id=\"inquiry-sent\" tabindex=\"-1\"', 'id=\"inquiry-sent\" tabindex=\"-1\" hidden' }}{% endif %}";
  const aside = '<p class="contact-aside"><a href="mailto:' + company.email + '">' + company.email + '</a><br><a href="' + tel() + '">' + e(company.phone) + '</a>&nbsp;· ' + e(lang === 'es' ? HOURS_ES : company.hours) + '<br>' + e(company.operator) + ', ' + keepAddress(e(company.address)) + '</p>';
  return '<section class="contact"><div class="wrap cform">' + (target === 'shopify' ? native : preview + sentPanel(true, lang)) + aside + '</div></section>';
}
/** Sign in (Nov 7 flow map): NEVORA's own sign-in first, then one form for Velani clients with two kinds of request.
 * The form is the contact form (same ids, validation, preview check and confirmation in velani.js), with the topic set by the
 * two choices: client-work or client-help. Timing and urgency values stay in English so every request email reads the same. */
const NEVORA_APP = 'https://nevora.team';
const SIGNIN = {
  en: { h1: 'Sign in to NEVORA.', appText: 'Owners, managers and employees sign in with the email their workplace invited.', open: 'Open NEVORA', support: 'NEVORA support',
    appFact: 'Can’t sign in? Ask your manager to resend your invite.',
    webAlt: 'NEVORA on the web for an owner: one thing that needs an answer, five of five clocked in and the next payday', phoneAlt: 'NEVORA on an employee’s phone: her shift today and her next shifts',
    clientT: 'Need something on your site or app?', clientText: 'Ask for a new page, a feature or a change, or tell us what stopped working. We reply by email within two business days.',
    callK: 'If you can’t work, call us.',
    need: 'What do you need?', kinds: [['New work', 'A new page, a feature or a change.'], ['Help', 'Something on your site or app stopped working.']],
    business: 'Business', message: ['What do you need?', 'What happened?'],
    timing: ['When do you need it?', [['No rush', 'No rush'], ['This month', 'This month'], ['This week', 'This week']]],
    urgency: ['How urgent is it?', [['It can wait', 'It can wait'], ["It's slowing us down", 'It’s slowing us down'], ["We can't work", 'We can’t work']]],
    send: ['Send request', 'Send to support'], check: 'Check draft request', note: 'Don’t send passwords or payment details.',
    preview: 'Preview. This form checks your draft and sends nothing.',
    writeT: 'Write to us', writeText: 'Tell us what you need or what happened, and which website or app it is about. We reply from ' },
  es: SIGNIN_ES,
};
function clientFields(live, lang) {
  const t = SIGNIN[lang], c = CONTACT[lang], opt = ' <span class="opt">' + c.optional + '</span>';
  const k = (work, help) => '<span data-k="work">' + work + '</span><span data-k="help" hidden>' + help + '</span>';
  const ff = (id, name, label, extra, value = '') => '<div class="ff"><input id="inquiry-' + id + '" name="contact[' + name + ']" placeholder=" " ' + extra + (value ? ' value="' + value + '"' : '') + '><label for="inquiry-' + id + '">' + label + '</label><p class="field-error" id="error-' + id + '"></p></div>';
  const kinds = '<fieldset class="kinds"><legend class="sr">' + t.need + '</legend>' + ['client-work', 'client-help'].map((value, i) => '<label class="kind"><input type="radio" name="client_kind" value="' + value + '"' + (i ? '' : ' checked') + '><b>' + t.kinds[i][0] + '</b></label>').join('') + '</fieldset><input type="hidden" id="inquiry-interest" name="contact[interest]" value="client-work">';
  const select = (key, id, [label, options], hidden) => '<div class="ff sel" data-k="' + key + '"' + (hidden ? ' hidden' : '') + '><select id="inquiry-' + id + '" name="contact[' + id + ']"' + (hidden ? ' disabled' : '') + '><option value=""></option>' + options.map(([value, text]) => '<option value="' + e(value) + '">' + text + '</option>').join('') + '</select><label for="inquiry-' + id + '">' + label + '</label></div>';
  const message = '<div class="ff area"><textarea id="inquiry-message" name="contact[body]" placeholder=" " rows="4" maxlength="4000" required aria-describedby="error-message" data-min="140">' + (live ? '{{ form.body | escape }}' : '') + '</textarea><label for="inquiry-message">' + k(...t.message) + '</label><p class="field-error" id="error-message"></p></div>';
  const send = '<div class="client-send"><button class="pill" type="submit" data-inquiry-submit>' + (live ? k(...t.send) : t.check) + '</button><p class="client-note">' + t.note + ' <a href="/pages/privacy"' + enOnly(lang) + '>' + c.privacy + '</a></p></div>';
  return '<fieldset' + (live ? '' : ' disabled') + '><legend class="sr">' + t.clientT + '</legend>' + kinds
    + '<div class="frow">' + ff('name', 'name', c.name, 'autocomplete="name" maxlength="120" required aria-describedby="error-name"', live ? '{{ form.name | escape }}' : '')
    + ff('email', 'email', c.email, 'type="email" autocomplete="email" maxlength="254" required aria-describedby="error-email"', live ? '{{ form.email | escape }}' : '') + '</div>'
    + '<div class="frow">' + ff('company', 'company', t.business + opt, 'autocomplete="organization" maxlength="160" aria-describedby="error-company"') + select('work', 'timing', t.timing, false) + select('help', 'urgency', t.urgency, true) + '</div>'
    + message + send + '</fieldset>';
}
function signin(page, target, lang = 'en') {
  const t = SIGNIN[lang], c = CONTACT[lang];
  const shots = '<div class="hweb fade"><img src="' + asset('night-r1-owner-today.webp', target) + '" alt="' + e(t.webAlt) + '" width="1800" height="750" decoding="async"></div><div class="hshot fade"><img src="' + asset('night-r1-ph-home.webp', target) + '" alt="' + e(t.phoneAlt) + '" width="780" height="1688" decoding="async"></div>';
  const hero = panel(target, { id: 'top', cls: 'live shots-hero signin-top', img: 'ai-devices', title: t.h1, tag: 'h1', text: t.appText, acts: hb(t.open, NEVORA_APP, true) + hb(t.support, '/pages/nevora-support', false, enOnly(lang)), after: '<p class="hfact fade">' + e(t.appFact) + '</p>', extra: shots, first: true });
  const preview = '<form id="project-inquiry" class="inquiry-form" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate>' + clientFields(false, lang) + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><p class="client-preview">' + t.preview + '</p><noscript><p>' + c.noscript + '</p></noscript></form>';
  const email = '<div class="client-write"><h3 class="t3">' + t.writeT + '</h3><p>' + t.writeText + company.email + '.</p><div class="acts"><a class="pill" href="mailto:' + company.email + '">' + c.writeButton + company.email + '</a></div></div>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form', novalidate: 'novalidate' %}{% if form.posted_successfully? %}{{ velani_sent }}{% else %}<div data-inquiry-mode=\"live\">" + clientFields(true, lang) + "</div>{% if form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}<div class=\"form-legal\">{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}</div>{% endif %}{% endform %}{% elsif theme.role == 'main' %}" + email + '{% else %}' + preview + "{{ velani_sent | replace: 'id=\"inquiry-sent\" tabindex=\"-1\"', 'id=\"inquiry-sent\" tabindex=\"-1\" hidden' }}{% endif %}";
  const side = '<div class="client-side"><h2 class="t2 rise" id="client-t">' + e(t.clientT) + '</h2><p class="lede fade">' + e(t.clientText) + '</p><div class="client-call fade"><p>' + e(t.callK) + '</p><a class="client-tel" href="' + tel() + '">' + e(company.phone) + '</a><p>' + e(lang === 'es' ? HOURS_ES : company.hours) + '<br><a href="mailto:' + company.email + '">' + company.email + '</a></p></div></div>';
  const client = '<section class="chap client" id="client" aria-labelledby="client-t"><div class="wrap client-grid">' + side + '<div class="client-form">' + (target === 'shopify' ? native : preview + sentPanel(true, lang)) + '</div></div></section>';
  return localize((target === 'shopify' ? '{% capture velani_sent %}' + sentPanel(false, lang) + '{% endcapture %}' : '') + hero + client + closing(target, { lang }), lang);
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
const docEnd = () => '<div class="doc-end"><p class="hkick">Questions</p><p>Write to <a href="mailto:' + company.email + '">' + company.email + '</a>, or to ' + e(company.operator) + ', ' + e(company.address) + '.</p><div class="acts"><a class="pill line" href="/pages/contact">Contact</a></div></div>';
function legalDoc(page) {
  const toc = page.sections.map((s, i) => '<a href="#section-' + i + '">' + e(s.heading) + '</a>').join('');
  const body = page.sections.map((s, i) => '<section id="section-' + i + '">' + num(i) + '<h2>' + e(s.heading) + '</h2><p>' + linkEmail(e(s.text)) + '</p></section>').join('');
  const cookie = page.cookieAction ? '<button class="pill line" type="button" data-cookie-open disabled>Open cookie choices</button><noscript><p class="cookie-nojs-note">Cookie controls need JavaScript. Write to ' + company.email + ' about privacy choices.</p></noscript>' : '';
  return pageHero(page, { meta: '<p class="doc-meta">Last updated ' + e(legalUpdated) + '</p>' }) + '<section class="doc"><div class="wrap doc-grid"><div class="doc-aside"><details class="doc-toc" open><summary class="doc-aside-t">On this page</summary><nav aria-label="Page contents">' + toc + '</nav></details><p class="doc-aside-t">More</p><nav aria-label="Legal"><a href="/pages/legal">All legal information</a><a href="/pages/nevora-privacy">NEVORA privacy policy</a></nav></div><div class="doc-body">' + body + cookie + docEnd() + '</div></div></section>';
}
function legalIndex() {
  const tile = ([text, href, note]) => '<a class="tile" href="' + href + '"><span class="t3">' + e(text) + '</span><p>' + e(note) + '</p>' + icon('arrow-right') + '</a>';
  const site = [['Website privacy notice', '/pages/privacy', 'How this website handles information, including when you write to us.'], ['Cookies and preferences', '/pages/cookies', 'Storage on this website and your optional choices.'], ['Website terms', '/pages/website-terms', 'The rules for using this website.'], ['Software and project terms', '/pages/software-project-terms', 'What applies before paid work or software access begins.'], ['Accessibility', '/pages/accessibility', 'Our accessibility target and how to report a barrier.'], ['Security', '/pages/security', 'How to report a security concern privately.']];
  const nevora = [['NEVORA privacy policy', '/pages/nevora-privacy', 'How the NEVORA app handles workplace information.'], ['NEVORA terms of use', '/pages/nevora-terms', 'The rules for using NEVORA.'], ['NEVORA support', '/pages/nevora-support', 'Signing in, your account and getting help.'], ['Delete your NEVORA account', '/pages/nevora-account-deletion', 'How to ask us to delete your account.']];
  return '<section class="dir"><div class="wrap"><p class="hkick">This website</p><h2 class="t2">Website notices</h2><div class="tiles">' + site.map(tile).join('') + '</div><p class="hkick">NEVORA app</p><h2 class="t2">For people who use NEVORA</h2><div class="tiles">' + nevora.map(tile).join('') + '</div></div></section>';
}
/** The plans page's words (Spanish in src/content.es.mjs). */
/** Plans (Nov 7 flow map): the trial in the first screen with the real schedule and pay screens, the four terms set large,
 * what the plan includes beside the timecards screen, the two ways day 30 can go as two equal panels, one line for custom work. */
const PLANS = {
  en: { h1: 'Try NEVORA free for 30 days.', text: 'Teams of up to 30 people get the whole app with no card. After day 30 you pay one price for the business, quoted for your team.',
    fact: 'No card. Nothing is charged on day 30.', trial: 'Request free trial', quote: 'Ask for a quote',
    webAlt: 'NEVORA schedule for the week: eight people, their shifts each day and the week published', phoneAlt: 'NEVORA pay on an employee’s phone: the next payday, the last paycheck and its statement',
    termsT: 'How the trial works',
    terms: [['30 days', 'Free from the day we set up your workplace.'], ['30 people', 'The trial covers teams of up to 30. Larger teams get a quote from day one.'], ['No card', 'We charge nothing when the trial ends.'], ['One price', 'For the whole business, quoted for your number of employees and the features you use.']],
    includedT: 'Everything in the trial stays in the plan.',
    included: ['Scheduling and shift swaps', 'Time clock on a shared tablet, with PINs', 'Time off requests and approvals', 'Timecards ready for review', 'Payroll calculated from approved hours', 'Pay statements for every employee', 'Roles for owners, managers and employees', 'English and Spanish for everyone'],
    fine: 'NEVORA calculates pay statements. It does not pay employees or file payroll taxes.',
    shotAlt: 'NEVORA timecards for last week: eight of nine approved, each person’s recorded hours and status',
    dayT: 'On day 30, you choose.',
    day: [['Continue by quote', 'We price NEVORA for your business, and your team keeps working without a break.'], ['Close the workplace', 'Export your schedules, timecards and pay statements first, then email support@thevelani.com. We delete the workplace and its data within 3 days.']],
    custom: ['Websites and custom apps get a fixed written quote for each project. ', 'See custom software', '.'] },
  es: PLANS_ES,
};
function plans(page, target, lang = 'en') {
  const t = PLANS[lang];
  const trial = hb(t.trial, '/pages/contact?interest=nevora-demo', true), quote = hb(t.quote, '/pages/contact?interest=nevora');
  const shots = '<div class="hweb fade"><img src="' + asset('night-r1-schedule.webp', target) + '" alt="' + e(t.webAlt) + '" width="2000" height="1181" decoding="async"></div><div class="hshot fade"><img src="' + asset('night-r1-ph-pay.webp', target) + '" alt="' + e(t.phoneAlt) + '" width="780" height="1688" decoding="async"></div>';
  const hero = panel(target, { id: 'top', cls: 'live long shots-hero', img: 'ai-devices', flip: true, title: t.h1, tag: 'h1', text: t.text, acts: trial + quote, after: '<p class="hfact fade">' + e(t.fact) + '</p>', extra: shots, first: true });
  const terms = '<section class="chap terms" aria-labelledby="terms-t"><div class="wrap"><h2 class="t2 rise" id="terms-t">' + e(t.termsT) + '</h2><dl class="terms-list">' + t.terms.map(([dt, dd]) => '<div class="fade"><dt>' + e(dt) + '</dt><dd>' + e(dd) + '</dd></div>').join('') + '</dl></div></section>';
  const included = '<section class="chap included" aria-labelledby="inc-t"><div class="wrap included-grid"><div><h2 class="t2 rise" id="inc-t">' + e(t.includedT) + '</h2><ul class="inc-list fade">' + t.included.map(x => '<li>' + icon('check') + '<span>' + e(x) + '</span></li>').join('') + '</ul><p class="inc-fine">' + e(t.fine) + '</p></div><figure class="shot slab fade"><img src="' + asset('night-r1-timecards.webp', target) + '" alt="' + e(t.shotAlt) + '" width="1500" height="1000" loading="lazy" decoding="async"></figure></div></section>';
  const day = '<section class="chap day30" aria-labelledby="day-t"><div class="wrap"><h2 class="t2 rise" id="day-t">' + e(t.dayT) + '</h2><div class="day-opts">' + t.day.map(([h, x]) => '<div class="day-opt fade"><h3 class="t3">' + e(h) + '</h3><p>' + linkEmail(e(x)) + '</p></div>').join('') + '</div><div class="hacts day-acts fade">' + trial + quote + '</div></div></section>';
  const custom = '<section class="chap case-more plans-custom" aria-label="' + e(t.custom[1]) + '"><div class="wrap"><p class="lede">' + e(t.custom[0]) + '<a class="ul" href="/pages/custom-development">' + e(t.custom[1]) + '</a>' + e(t.custom[2]) + '</p></div></section>';
  return hero + terms + included + day + custom + closing(target, { lang });
}
/** The Support page's words (Spanish in src/content.es.mjs). */
const FAQ = {
  en: { supportKick: 'Client support', supportTitle: 'For our clients.', email: 'Email', reply: 'We aim to reply within two business days', phone: 'Phone', hours: company.hours, post: 'Postal address', contactPage: 'Contact page', kick: 'Questions', title: 'Before we start', nevoraQ: 'NEVORA questions', appTitle: 'Do you use NEVORA at work?',
    app: [['NEVORA support', '/pages/nevora-support'], ['NEVORA privacy policy', '/pages/nevora-privacy'], ['Delete your NEVORA account', '/pages/nevora-account-deletion'], ['NEVORA terms of use', '/pages/nevora-terms']] },
  es: FAQ_ES,
};
function faq(page, target, lang = 'en') {
  const t = FAQ[lang];
  // NEVORA's policy pages are English only for now: on Spanish pages their links say so
  const appLink = ([text, href]) => lang === 'es' ? '<a class="more" href="' + e(href) + '" hreflang="en"><span>' + e(text) + ' ' + IN_ENGLISH + '</span>' + icon('caret-right') + '</a>' : more(text, href);
  const support = '<section class="support" aria-labelledby="sup-t"><div class="wrap"><p class="hkick">' + t.supportKick + '</p><h2 class="t2 rise" id="sup-t">' + t.supportTitle + '</h2><dl class="spec big"><div><dt>' + t.email + '</dt><dd><a href="mailto:' + company.email + '">' + company.email + '</a><small>' + t.reply + '</small></dd></div><div><dt>' + t.phone + '</dt><dd><a href="' + tel() + '">' + e(company.phone) + '</a><small>' + e(t.hours) + '</small></dd></div><div><dt>' + t.post + '</dt><dd>' + e(company.operator) + '<small>' + keepAddress(e(company.address)) + '</small></dd></div></dl><div class="acts"><a class="pill" href="/pages/contact">' + t.contactPage + '</a></div></div></section>';
  const questions = '<section class="faq" aria-labelledby="faq-t"><div class="wrap"><div class="qa"><div class="head"><p class="hkick">' + t.kick + '</p><h2 class="t2 rise" id="faq-t">' + t.title + '</h2></div><div class="faq-list">' + page.sections.map(s => '<details><summary>' + e(s.heading) + icon('plus') + '</summary><p>' + linkEmail(e(s.text)).split(company.phone).join('<a href="' + tel() + '">' + e(company.phone) + '</a>') + '</p></details>').join('') + '<div class="acts">' + more(t.nevoraQ, '/pages/nevora#faq') + '</div></div></div></div></section>';
  const app = '<section class="band help" aria-labelledby="help-t"><div class="wrap band-in"><h2 class="t3" id="help-t">' + t.appTitle + '</h2><p class="band-links">' + t.app.map(appLink).join('') + '</p></div></section>';
  return localize(pageHero(page) + support + questions + app + closing(target, { lang, support: hb(t.contactPage, '/pages/contact') }), lang);
}
const ABOUT = { en: { project: 'Start a project', see: 'See NEVORA', label: 'About Velani' }, es: ABOUT_ES };
function about(page, target, lang = 'en') {
  const t = ABOUT[lang];
  const hero = panel(target, { id: 'top', cls: 'dim long', img: 'ai-glow', flip: true, kick: page.eyebrow, title: page.title, tag: 'h1', text: page.intro, acts: hb(t.project, '/pages/contact', true) + hb(t.see, '/pages/nevora'), first: true });
  return localize(hero + '<section class="split" aria-label="' + t.label + '"><div class="wrap">' + page.sections.map(s => '<div class="draw"><h2 class="t3">' + e(s.heading) + '</h2><div><p>' + keepAddress(linkEmail(e(s.text))) + '</p></div></div>').join('') + '</div></section>' + closing(target, { lang }), lang);
}
function notFound() {
  return '<section class="phero"><div class="wrap"><p class="kicker">Page not found</p><h1 class="t1">We could not find that page.</h1><p class="lede">The link may be out of date, or the address may be misspelled.</p><div class="acts"><a class="pill" href="/">Go to the home page</a><a class="pill line" href="/pages/nevora">See NEVORA</a></div></div></section>';
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return notFound();
  const lang = langOf(path);
  switch (page.kind) {
    case 'home': return homeMain(target, lang);
    case 'nevora': return nevoraMain(target, lang);
    case 'products': return productsMain(target, lang);
    case 'policy': return policyMain(page.slug);
    case 'services': return services_(page, target, lang);
    case 'contact': return localize((target === 'shopify' ? '{% capture velani_sent %}' + sentPanel(false, lang) + '{% endcapture %}' : '') + contactHero(page, lang) + contact(target, lang), lang);
    case 'signin': return signin(page, target, lang);
    case 'faq': return faq(page, target, lang);
    case 'plans': return localize(plans(page, target, lang), lang);
    case 'legal-index': return pageHero(page) + legalIndex();
    default: return page.legal ? legalDoc(page) : about(page, target, lang);
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
  // Only the NEVORA page has a page script (the time clock and local nav); the home page needs its stylesheet only
  const js = (kind === 'nevora' ? '<script src="' + asset('velani-nevora.js', target) + '" defer></script>' : '') + '<script src="' + asset('velani-motion.js', target) + '" defer></script><script type="module" src="' + asset('velani.js', target) + '"></script>';
  return css + js;
}
export const BOOT_JS = "(function(d){d.className='js pre'+(/[?&]interest=nevora(-demo)?(&|$)/.test(location.search)?' ask-nevora':'')+(/[?&]interest=nevora-demo(&|$)/.test(location.search)?' ask-demo':'')+(/[?&]interest=relay(&|$)/.test(location.search)?' ask-relay':'');window.__pre=setTimeout(function(){d.classList.remove('pre');d.classList.add('still')},2500)})(document.documentElement)";
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
/** The first large image of each panel page, preloaded at high priority (it is the page's largest paint). */
const heroOf = path => ({ home: 'night-ai-light.webp', nevora: 'night-ai-devices.webp', products: 'night-ai-devices.webp', services: 'night-ai-glow.webp', signin: 'night-ai-devices.webp', plans: 'night-ai-devices.webp' })[routes[path]?.kind] || (path === '/pages/about' || path === '/pages/es-nosotros' ? 'night-ai-glow.webp' : '');
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
  const langAssign = path => { const { en, es } = langPaths(path); return `{% assign velani_en_path = '${en}' %}{% assign velani_en_view = '${view(en)}' %}{% assign velani_es_path = '${es}' %}{% assign velani_es_view = '${view(es)}' %}` + (langOf(path) === 'es' ? `{% assign velani_lang = 'es' %}{% assign velani_locale = 'es_PR' %}` : '') + (pairOf(path) ? `{% assign velani_alt_en = '${absolute(pairOf(path).en)}' %}{% assign velani_alt_es = '${absolute(pairOf(path).es)}' %}{% assign velani_locale_alt = '${langOf(path) === 'es' ? 'en_US' : 'es_PR'}' %}` : ''); };
  const assignments = page => `{% assign velani_page_title = ${liquidStr(page.title)} %}{% assign velani_page_description = ${liquidStr(page.intro)} %}` + pageHead(page.path) + langAssign(page.path) + (page.nav ? `{% assign velani_nav = '${page.nav}' %}` : '') + (page.og ? `{% assign velani_og = '${page.og[0]}' %}{% assign velani_og_alt = ${liquidStr(page.og[1])} %}` : '');
  // What a page adds to <head>, captured in its own case branch: the hero image preload, for Home and NEVORA their stylesheet
  // (NEVORA also its script), and for a page with two languages the absolute URLs of both versions (hreflang, set in the head below)
  const pageHead = path => { const hero = heroOf(path), kind = routes[path]?.kind; const css = kind === 'home' || kind === 'nevora' ? `<link rel="stylesheet" href="{{ 'velani-${kind}.css' | asset_url }}">` : ''; const js = kind === 'nevora' ? `<script src="{{ 'velani-nevora.js' | asset_url }}" defer></script>` : ''; return hero || css ? `{% capture velani_head %}${hero ? `<link rel="preload" as="image" href="{{ '${hero}' | asset_url }}" fetchpriority="high">` : ''}${css}${js}{% endcapture %}` : ''; };
  // Share image per page: velani-social.png by default; pages with their own image name it in content (og: [file, alt])
  const defaults = `{% assign velani_nav = '' %}{% assign velani_lang = 'en' %}{% assign velani_locale = 'en_US' %}{% assign velani_en_path = '/' %}{% assign velani_en_view = '' %}{% assign velani_es_path = '/pages/es' %}{% assign velani_es_view = '${view('/pages/es')}' %}{% assign velani_og = 'velani-social.png' %}{% assign velani_og_alt = ${liquidStr('Velani. ' + routes['/'].title)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% assign velani_page = template.suffix | remove_first: 'velani-' %}${defaults}{% if template.name == 'index' and template.suffix == blank %}{% assign velani_page = 'home' %}${pageHead('/')}${langAssign('/')}{% assign velani_page_title = ${liquidStr(pageTitle(routes['/']))} %}{% assign velani_page_description = ${liquidStr(routes['/'].intro)} %}{% endif %}{% case velani_page %}` + Object.entries(routes).filter(([path, page]) => path !== '/' && page.layoutMeta !== false).map(([path, page]) => `{% when '${slugOf(path)}' %}${assignments({ title: pageTitle(page), intro: page.desc || page.intro, path, nav: page.nav, og: page.og })}`).join('') + '{% endcase %}' + '{% if template.name == "collection" or template.name == "product" or template.name == "cart" or template.name == "search" or template.name == "list-collections" or template.name == "404" %}{% assign velani_page_title = "Page not found" %}{% assign velani_page_description = "This page is not available." %}{% assign velani_noindex = true %}{% endif %}{% assign velani_canonical = canonical_url %}{% if template.name == "index" and template.suffix != blank %}{% assign velani_noindex = true %}{% assign velani_canonical = shop.url | append: "/pages/" | append: velani_page %}{% endif %}';
  // The language switch: on the main theme the canonical path, on a draft the same draft with the other page's view
  const switchLinks = `{% if theme.role == 'main' %}{% assign velani_en_href = velani_en_path %}{% assign velani_es_href = velani_es_path %}{% else %}{% capture velani_en_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_en_view }}{% endcapture %}{% capture velani_es_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_es_view }}{% endcapture %}{% endif %}`;
  const chrome = part => `{% if velani_lang == 'es' %}{% render 'velani-${part}-es'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% else %}{% render 'velani-${part}-en'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% endif %}`;
  const kindCss = '{{ velani_head }}';
  const head = `<link rel="stylesheet" href="${asset('velani.css', 'shopify')}">${kindCss}<script src="${asset('velani-motion.js', 'shopify')}" defer></script><script type="module" src="${asset('velani.js', 'shopify')}"></script>`;
  const fontFace = '<style>' + [400, 500, 600].map(w => `@font-face{font-family:"DM Sans";font-weight:${w};font-display:swap;src:url({{ 'dm-sans-latin-${w}-normal.woff2' | asset_url }}) format("woff2")}`).join('') + '</style>';
  const policyFallback = `<section class="phero"><div class="wrap"><p class="kicker">Legal</p>{% if request.path contains 'privacy' %}<h1 class="t1">Privacy</h1><p class="lede">The privacy notice for this website and the NEVORA privacy policy are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/privacy">Privacy notice</a><a class="pill line" href="/pages/nevora-privacy">NEVORA privacy policy</a></div>{% elsif request.path contains 'terms' %}<h1 class="t1">Terms</h1><p class="lede">The website terms and the project terms are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/website-terms">Website terms</a><a class="pill line" href="/pages/software-project-terms">Project terms</a></div>{% elsif request.path contains 'refund' or request.path contains 'shipping' %}<h1 class="t1">No refund or shipping policy</h1><p class="lede">Velani sells software and services. This website takes no payments and ships no goods, so it has no refund or shipping policy. Fees and milestones are set out in the project terms.</p><div class="acts"><a class="pill" href="/pages/software-project-terms">Project terms</a><a class="pill line" href="/pages/legal">All legal information</a></div>{% else %}<h1 class="t1">Legal information</h1><p class="lede">Read the notices for this website and the NEVORA app.</p><div class="acts"><a class="pill" href="/pages/legal">All legal information</a></div>{% endif %}</div></section>`;
  const html = `${metadata}${switchLinks}<!doctype html><html lang="{{ velani_lang }}" class="no-js" data-platform="shopify"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BOOT}{% unless theme.role == 'main' %}<meta name="robots" content="noindex, nofollow">{% endunless %}{% if velani_noindex %}<meta name="robots" content="noindex">{% endif %}<meta name="color-scheme" content="dark"><meta name="theme-color" content="#05090e"><title>{% if velani_page_title contains 'Velani' %}{{ velani_page_title | escape }}{% else %}{{ velani_page_title | escape }} · Velani{% endif %}</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ velani_canonical | escape }}"><meta property="og:site_name" content="Velani"><meta property="og:type" content="website"><meta property="og:locale" content="{{ velani_locale }}">{% if velani_alt_es != blank %}<meta property="og:locale:alternate" content="{{ velani_locale_alt }}"><link rel="alternate" hreflang="en" href="{{ velani_alt_en }}"><link rel="alternate" hreflang="es" href="{{ velani_alt_es }}"><link rel="alternate" hreflang="x-default" href="{{ velani_alt_en }}">{% endif %}<meta property="og:title" content="{{ velani_page_title | escape }}"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ velani_canonical | escape }}"><meta property="og:image" content="{{ velani_og | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{{ velani_og_alt | escape }}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg', 'shopify')}" type="image/svg+xml"><link rel="icon" href="${asset('favicon-32.png', 'shopify')}" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="${asset('apple-touch-icon.png', 'shopify')}">{{ 'dm-sans-latin-400-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}{{ 'dm-sans-latin-600-normal.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}${head}${fontFace}${ORG_LD}{{ content_for_header }}</head><body>${chrome('header')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}${policyFallback}{% else %}{{ content_for_layout }}{% endif %}</main>${chrome('footer')}${assistantBlock('shopify')}</body></html>`;
  return draftLinks(html);
}
