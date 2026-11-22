import { company, routes, legalUpdated, langOf, counterpart } from './content.mjs';
import { HUB_API } from './client-hub.mjs';
import { CONSENT_ES, CONTACT_ES, ES_PATHS, ES_NEAREST, SIGNIN_ES } from './content.es.mjs';
import { dayHeader, dayFooter, dayMain, dayIcon, DAY_PAGE_ASSETS } from './day.mjs';
import { policyMain, assistant, icon, localize } from './shared.mjs';
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
const linkEmail = html => html.split(company.email).join('<a href="mailto:' + company.email + '">' + company.email + '</a>');
function pageHero(page, { meta = '' } = {}) {
  return '<section class="phero"><div class="wrap"><h1 class="t1 rise">' + e(page.legal || page.kind === 'legal-index' ? (page.name || page.title) : page.title) + '</h1>' + (page.lede || page.intro ? '<p class="lede fade">' + e(page.lede || page.intro) + '</p>' : '') + meta + '</div></section>';
}
/* Full-screen panels (the home page language): a square outlined button, a label, a title, one paragraph and one or two actions */
const hb = (text, href, fill = false, attrs = '') => '<a class="hb' + (fill ? ' fill' : '') + '" href="' + e(href) + '"' + attrs + '>' + e(text) + icon('arrow-right') + '</a>';
/** The contact page's words (Spanish in src/content.es.mjs). Topic values never change, so the email Velani receives is the same. */
const CONTACT = {
  en: { topicQ: 'What is it about?', preview: 'Preview. This form checks your draft and sends nothing.',
    noscript: 'The preview form needs JavaScript. No messages are sent from this preview.', legend: 'Inquiry',
    name: 'Name', email: 'Email', company: 'Company', optional: 'optional', team: 'Team size', bigTeam: 'More than 30 (assisted setup)', locations: 'Number of locations', message: 'What needs to work better', messageOptional: 'Anything else',
    send: ['Send inquiry', 'Request assisted setup', 'Send trial request', 'Join the waitlist'], sendNote: 'Don’t send passwords or payment details.', privacy: 'Privacy notice',
    fine: 'On day 30, the Owner picks a plan in NEVORA. Nothing is charged until you do. NEVORA calculates pay statements; it does not pay employees or file payroll taxes.',
    sentPreview: 'Website preview&nbsp;· this is what visitors see after sending. Nothing was sent.', sentH: 'Message sent.', sentP: 'Thanks for writing. We reply by email within two business days.', sentFrom: ['Replies come from ', '. If it isn’t in your inbox, check spam or junk.'], back: 'Back to home', sentNext: 'See how NEVORA works',
    writeTitle: 'Write to us', writeText: 'What needs to work better, who will use it, and how it works today. We reply from ', writeButton: 'Email ', noSensitive: 'No passwords, payment details or sensitive records by email.' },
  es: CONTACT_ES,
};
/** Links to pages that exist only in English say so to browsers and assistive technology on Spanish pages. */
const enOnly = (lang, href) => lang === 'es' && !ES_PATHS[href] ? ' hreflang="en"' : '';
/** A plain form in one column: the label sits inside the field and lifts when the field is used; errors sit under their field. */
function fields(live, lang, tiles) {
  const t = CONTACT[lang], opt = ' <span class="opt">' + t.optional + '</span>';
  const ff = (id, name, label, extra = '', value = '') => '<div class="ff"><input id="inquiry-' + id + '" name="contact[' + name + ']" placeholder=" " ' + extra + (value ? ' value="' + value + '"' : '') + '><label for="inquiry-' + id + '">' + label + '</label><p class="field-error" id="error-' + id + '"></p></div>';
  const name = ff('name', 'name', t.name, 'autocomplete="name" maxlength="120" required aria-describedby="error-name"', live ? '{{ form.name | escape }}' : '');
  const email = ff('email', 'email', t.email, 'type="email" autocomplete="email" maxlength="254" required aria-describedby="error-email"', live ? '{{ form.email | escape }}' : '');
  const company = ff('company', 'company', t.company + opt, 'autocomplete="organization" maxlength="160" aria-describedby="error-company"');
  // Topic: three choices of one size in place of a menu (radios set the hidden contact[interest]; velani.js keeps them in step)
  const topic = '<p class="kinds-q field-topic" aria-hidden="true">' + t.topicQ + '</p><fieldset class="kinds topics field-topic"><legend class="sr">' + t.topicQ + '</legend>' + tiles.map(([value, label, sub]) => '<label class="kind"><input type="radio" name="topic_choice" value="' + value + '"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</label>').join('') + '</fieldset><input type="hidden" id="inquiry-interest" name="contact[interest]" value="">';
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
/** Contact on the Day design (Nov 20): four topics instead of custom work; the side follows the topic (the boot script's ask-*
 * classes, kept in step by velani-day-contact.js); the form is Jose's form, with the same live/preview/email safeguards. */
const DAY_HELP = { en: { client: ['Already a Velani client?', 'Get help with your website or app, or ask for a change to it.'] }, es: { client: ['¿Ya eres cliente de Velani?', 'Pide ayuda con tu sitio web o tu app, o pide un cambio.'] } };
const DAY_CONTACT = {
  en: {
    tiles: [['nevora-demo', 'Free trial', 'Up to 30 employees'], ['nevora', 'More than 30', 'Assisted setup'], ['relay', 'Relay waitlist', 'In design'], ['other', 'Something else', 'Any question']],
    topics: {
      trial: ['Free 30-day trial', 'Request your free trial.', 'Tell us about your team. Jose from Velani replies within two business days and sets up your workplace with you. Your 30 free days start when your workplace is created in NEVORA, with no card.',
        [['Jose replies', 'Within two business days, by email.'], ['We set up your workplace together', 'Jose sets it up with you, in English or Spanish.'], ['Your 30 days start', 'When your workplace is created in NEVORA. No card.'], ['Day 30: pick a plan', '$19 or $29 a month. Nothing is charged until you do.']]],
      big: ['More than 30 employees', 'Set up NEVORA for a larger team.', 'For teams of more than 30 employees. We check what you need and set up your workplace with you. Teams that qualify get the same 30 days free.',
        [['We reply', 'Within two business days, by email.'], ['We check what you need', 'We review your team and give you a quote.'], ['30 days free', 'For teams that qualify, from the day the workplace is created.']]],
      relay: ['Relay waitlist', 'Join the NEVORA Relay waitlist.', 'NEVORA Relay is in design, with no dates yet. We’ll email you when early access opens.', [['You’re on the list', 'With the name and email you give us.'], ['Early access opens', 'We email you. No date yet.']]],
      other: ['Contact', 'Tell us what you need.', 'A question about NEVORA, Rondo, Relay or Velani. We reply by email within two business days.', []],
    },
    steps: 'What happens next', prefer: 'Prefer email?', hours: 'Monday to Friday, 8 am to 9 pm ET, in English or Spanish.',
    work: ['Can’t sign in at work?', 'Your account comes from your workplace, not from this website. Help has the answers for your team.', 'Sign-in help'],
  },
  es: {
    tiles: [['nevora-demo', 'Prueba gratis', 'Hasta 30 empleados'], ['nevora', 'Más de 30', 'Configuración asistida'], ['relay', 'Lista de Relay', 'En diseño'], ['other', 'Otra cosa', 'Cualquier pregunta']],
    topics: {
      trial: ['Prueba gratis por 30 días', 'Pide tu prueba gratis de NEVORA.', 'Cuéntanos sobre tu equipo. Jose, de Velani, te responde en un plazo de dos días laborables y configura tu lugar de trabajo contigo. Tus 30 días gratis comienzan cuando se crea tu lugar de trabajo en NEVORA, sin tarjeta.',
        [['Jose te responde', 'En dos días laborables, por correo.'], ['Configuramos tu lugar de trabajo juntos', 'Jose lo configura contigo, en español o en inglés.'], ['Empiezan tus 30 días', 'Cuando se crea tu lugar de trabajo en NEVORA. Sin tarjeta.'], ['Día 30: elige un plan', '$19 o $29 al mes. No se cobra nada hasta que lo elijas.']]],
      big: ['Más de 30 empleados', 'Configura NEVORA para un equipo grande.', 'Para equipos de más de 30 empleados. Revisamos lo que necesitas y configuramos tu lugar de trabajo contigo. Los equipos que califican reciben los mismos 30 días gratis.',
        [['Te respondemos', 'En dos días laborables, por correo.'], ['Revisamos lo que necesitas', 'Revisamos tu equipo y te damos una cotización.'], ['30 días gratis', 'Para los equipos que califican, desde el día en que se crea el lugar de trabajo.']]],
      relay: ['Lista de espera de Relay', 'Únete a la lista de NEVORA Relay.', 'NEVORA Relay está en diseño y aún no tiene fechas. Te escribiremos cuando abra el acceso anticipado.', [['Ya estás en la lista', 'Con el nombre y el correo que nos des.'], ['Abre el acceso anticipado', 'Te escribimos. Aún sin fecha.']]],
      other: ['Contacto', 'Cuéntanos qué necesitas.', 'Una pregunta sobre NEVORA, Rondo, Relay o Velani. Te respondemos por correo en un plazo de dos días laborables.', []],
    },
    steps: 'Lo que sigue', prefer: '¿Prefieres escribir?', hours: 'De lunes a viernes, 8 a. m. a 9 p. m. ET, en español o en inglés.',
    work: ['¿No puedes entrar en el trabajo?', 'Tu cuenta viene de tu lugar de trabajo, no de este sitio web. La ayuda tiene las respuestas para tu equipo.', 'Ayuda para entrar'],
  },
};
function dayContact(page, target, lang = 'en') {
  const t = CONTACT[lang], d = DAY_CONTACT[lang];
  const pick = i => Object.entries(d.topics).map(([k, v]) => '<span class="tp-' + k + '">' + e(v[i]) + '</span>').join('');
  const steps = Object.entries(d.topics).filter(([, v]) => v[3].length).map(([k, v]) => '<ol class="nxt tp-' + k + '" aria-label="' + e(d.steps) + '">' + v[3].map(([b, s]) => '<li><b>' + e(b) + '</b><span>' + e(s) + '</span></li>').join('') + '</ol>').join('');
  const head = '<div class="ct-side ct-head rise"><p class="eyebrow">' + pick(0) + '</p><h1 id="ct-t" tabindex="-1">' + pick(1) + '</h1><p class="lead">' + pick(2) + '</p></div>';
  const more = '<div class="ct-side ct-more">' + steps + '<p class="ct-mail">' + e(d.prefer) + ' <a href="mailto:' + company.email + '">' + company.email + '</a><br>' + e(d.hours) + '</p></div>';
  const preview = '<form id="project-inquiry" class="inquiry-form" method="post" action="/?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate>' + fields(false, lang, d.tiles) + '<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><p class="client-preview">' + t.preview + '</p><noscript><p>' + t.noscript + '</p></noscript></form>';
  const email = '<div class="client-write"><h2>' + t.writeTitle + '</h2><p>' + t.writeText + company.email + '.</p><div class="acts"><a class="pillbtn" href="mailto:' + company.email + '">' + t.writeButton + company.email + '</a></div><p class="field-help mail">' + t.noSensitive + '</p></div>';
  const native = "{% if settings.inquiries_enabled and theme.role == 'main' %}{% form 'contact', id: 'project-inquiry', class: 'inquiry-form', novalidate: 'novalidate' %}{% if form.posted_successfully? %}{{ velani_sent }}{% else %}<div data-inquiry-mode=\"live\">" + fields(true, lang, d.tiles) + "</div>{% if form.errors %}<div class=\"form-status\" role=\"alert\">{{ form.errors | default_errors }}</div>{% endif %}<div class=\"form-legal\">{{ 'shopify.online_store.spam_detection.disclaimer_html' | t }}</div>{% endif %}{% endform %}{% elsif theme.role == 'main' %}" + email + '{% else %}' + preview + "{{ velani_sent | replace: 'id=\"inquiry-sent\" tabindex=\"-1\"', 'id=\"inquiry-sent\" tabindex=\"-1\" hidden' }}{% endif %}";
  const card = '<div class="ct-card client-form">' + (target === 'shopify' ? native : preview + sentPanel(true, lang)) + '</div>';
  const work = '<section class="sec ct-work" aria-label="' + e(d.work[0]) + '" data-sky="morning"><div class="wrap"><div class="work glass" data-rv><p><b>' + e(d.work[0]) + '</b> ' + e(d.work[1]) + '</p><a class="more" href="/pages/sign-in">' + e(d.work[2]) + '</a></div></div></section>';
  return '<div class="atmo" id="atmo" aria-hidden="true"></div><section class="ct" aria-labelledby="ct-t" data-sky="morning"><div class="wrap ct-g">' + head + card + more + '</div></section>' + work;
}
/** Contact (Nov 7): one split like the Sign in page. The heading and its line change with the topic the visitor came for (the
 * boot script marks the document before paint; velani.js removes the unused wording), the phone sits under them, the form beside. */
const SIGNIN = {
  en: { clientT: 'Need something on your site or app?', clientText: 'Ask for a new page, a feature or a change, or tell us what stopped working. We reply by email within two business days.',
    need: 'Type of request', kinds: [['New work', 'A new page, a feature or a change.'], ['Help', 'Something on your site or app stopped working.']],
    business: 'Business', message: ['What do you need?', 'What happened?'],
    timing: ['Timing', [['No rush', 'No rush'], ['This month', 'This month'], ['This week', 'This week']]],
    urgency: ['Urgency', [['It can wait', 'It can wait'], ["It's slowing us down", 'It’s slowing us down'], ["We can't work", 'We can’t work']]],
    send: ['Send request', 'Send to support'], note: 'Don’t send passwords or payment details.',
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
  const site = [['Website privacy notice', '/pages/privacy', 'How this website handles information, including when you write to us.'], ['Cookies and preferences', '/pages/cookies', 'Storage on this website and your optional choices.'], ['Website terms', '/pages/website-terms', 'The rules for using this website.'], ['Accessibility', '/pages/accessibility', 'Our accessibility target and how to report a barrier.'], ['Security', '/pages/security', 'How to report a security concern privately.']];
  const nevora = [['NEVORA privacy policy', '/pages/nevora-privacy', 'How the NEVORA app handles workplace information.'], ['NEVORA terms of use', '/pages/nevora-terms', 'The rules for using NEVORA.'], ['NEVORA support', '/pages/nevora-support', 'Signing in, your account and getting help.'], ['Delete your NEVORA account', '/pages/nevora-account-deletion', 'How to ask us to delete your account.']];
  return '<section class="dir"><div class="wrap"><h2 class="t2">Website notices</h2><div class="tiles">' + site.map(tile).join('') + '</div><h2 class="t2">For people who use NEVORA</h2><div class="tiles">' + nevora.map(tile).join('') + '</div></div></section>';
}
/** The plans page's words (Spanish in src/content.es.mjs). */
/** Plans (Nov 7 flow map, v2; Nov 10 inspection: prices before the calendar, no visit-date promise): the 30 days as a calendar beside what
 * happens in them (the plan's features, as things your team does), one NEVORA screen large, the two ways the trial can end as
 * two equal panels, and custom work in the closing. Dates come from the visitor's clock (motion.js); without it the page says
 * "Day 1" and "Day 30". */
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
const DAY_ACCOUNT = { en: { help: 'Questions about your plan or a charge? Write to', hoursLabel: 'Monday to Friday, 8 am to 9 pm ET.' },
  es: { help: '¿Preguntas sobre tu plan o un cobro? Escribe a', hoursLabel: 'Lunes a viernes, 8 a. m. a 9 p. m. ET.' } };
function dayCommerce(page, target, lang = 'en') {
  const off = COMMERCE_OFF[lang], d = DAY_ACCOUNT[lang];
  const script = commerceBlock(target) + '<script type="module" src="' + asset('velani-commerce.js', target) + '"></script>';
  const trial = '<a class="pillbtn" href="/pages/contact?interest=nevora-demo">' + e(off.act) + '</a>';
  const iconImg = '<img class="acct-ic" src="' + asset('day-nevora-icon.png', target) + '" alt="" width="120" height="120">';
  const mail = '<a href="mailto:' + company.email + '">' + company.email + '</a>';
  const frame = (attrs, inner) => '<div class="atmo" id="atmo" aria-hidden="true"></div><section class="acct"' + attrs + ' data-sky="dawn"><div class="wrap acct-w rise">' + iconImg + inner + '</div></section>';
  if (page.step === 'start') {
    const t = START[lang];
    return startRedirect(target, lang) + frame(' id="top" aria-labelledby="top-t"', '<h1 id="top-t">' + e(page.title) + '</h1><p class="lead">' + e(page.intro) + '</p><p class="acct-off" data-off>' + e(off.text) + '</p><div class="acts" data-off>' + trial + '</div><p class="acct-note">' + e(t.fact[0]) + '<a href="/pages/sign-in">' + e(t.fact[1]) + '</a>' + e(t.fact[2]) + '</p>');
  }
  if (page.step === 'verify') {
    return frame(' id="top" aria-labelledby="top-t" data-verify-retired', '<h1 id="top-t">' + e(page.title) + '</h1><p class="lead">' + e(page.intro) + '</p><div class="acct-card"><p>' + e(SETUP_RETIRED[lang].line) + '</p><div class="acts">' + trial + '</div></div>') + script;
  }
  const b = BILLING[lang];
  const mailBtn = '<a class="hb fill" href="mailto:' + company.email + '?subject=' + encodeURIComponent(b.subject) + '">' + e(b.act) + icon('arrow-right') + '</a>';
  return frame(' id="setup" aria-labelledby="setup-t" data-account-page="' + e(page.step) + '"', '<h1 id="setup-t" tabindex="-1">' + e(page.title) + '</h1><p class="lead" data-setup-lede' + (page.intro ? '' : ' hidden') + '>' + e(page.intro) + '</p><p class="acct-off" data-off>' + e(b.off) + '</p><div class="acts" data-setup-acts><span data-off>' + mailBtn + '</span></div><div class="setup-card acct-card" data-setup-card hidden></div><p class="sr" role="status" data-announce></p><p class="acct-note">' + e(d.help) + ' ' + mail + '. ' + e(d.hoursLabel) + '</p>') + script;
}
/** The NEVORA billing API's address for the commerce pages: the theme setting on Shopify, VELANI_COMMERCE_API locally. Empty
 * means billing isn't available yet; the pages say so instead of guessing an endpoint. */
function commerceBlock(target) {
  const api = target === 'shopify' ? "{% if theme.role == 'unpublished' or theme.role == 'development' %}{{ settings.commerce_api_url | strip | escape }}{% endif %}" : e((process.env.VELANI_COMMERCE_API || '').trim());
  return '<template id="velani-commerce" data-api="' + api + '"></template>';
}
function notFound() {
  return '<section class="phero"><div class="wrap"><h1 class="t1">We could not find that page.</h1><p class="lede">The link may be out of date, or the address may be misspelled.</p><div class="acts"><a class="hb fill" href="/">Go to the home page' + icon('arrow-right') + '</a><a class="hb" href="/pages/nevora">See NEVORA' + icon('arrow-right') + '</a></div></div></section>';
}
function renderRawBody(path, target) {
  const page = routes[path];
  if (!page) return notFound();
  const lang = langOf(path);
  // Help keeps Jose's client request section, folded into one quiet line for existing clients
  if (page.day === 'help') return dayMain(page.day, lang, target).replace('<!--client-->', () => '<details class="clientd" id="client-d"><summary><span>' + e(DAY_HELP[lang].client[0]) + '<span>' + e(DAY_HELP[lang].client[1]) + '</span></span>' + dayIcon('caret-down') + '</summary>' + localize(clientSection(target, lang), lang) + '</details>');
  // Contact keeps Jose's form (live on the main theme with inquiries on, email otherwise, the preview elsewhere)
  if (page.day === 'contact') return localize((target === 'shopify' ? '{% capture velani_sent %}' + sentPanel(false, lang) + '{% endcapture %}' : '') + dayContact(page, target, lang), lang);
  // The trial and billing pages keep every hook velani-commerce.js reads
  if (page.day === 'account') return localize(dayCommerce(page, target, lang), lang);
  // The legal and NEVORA policy pages keep Jose's documents in the Day chrome
  if (page.day === 'doc') return page.kind === 'policy' ? policyMain(page.slug, lang) : page.kind === 'legal-index' ? pageHero(page) + legalIndex() : legalDoc(page, lang);
  // Plans keeps Jose's billing pieces: the commerce settings template and velani-commerce.js (team-size card, Owner handoff)
  return dayMain(page.day, lang, target) + (page.day === 'plans' ? commerceBlock(target) + '<script type="module" src="' + asset('velani-commerce.js', target) + '"></script>' : '');
}
export function renderBody(path, { target = 'preview' } = {}) {
  const html = renderRawBody(path, target);
  return target === 'shopify' ? draftLinks(html) : html;
}
/** Day pages: one stylesheet and one script, plus the shared site script (forms, cookie choices). No web font: system fonts. */
const dayHeadAssets = target => '<link rel="stylesheet" href="' + asset('velani-day.css', target) + '"><script src="' + asset('velani-day.js', target) + '" defer></script><script type="module" src="' + asset('velani.js', target) + '"></script>';
/** A Day page with its own stylesheet and script (Home) adds them after the shared ones. */
const dayPageAssets = (day, target) => (DAY_PAGE_ASSETS[day] || []).map(name => name.endsWith('.css') ? '<link rel="stylesheet" href="' + asset(name, target) + '">' : '<script src="' + asset(name, target) + '" defer></script>').join('');
export const BOOT_JS = "(function(d){d.className='js pre'+(/[?&]interest=nevora(-demo)?(&|$)/.test(location.search)?' ask-nevora':'')+(/[?&]interest=nevora-demo(&|$)/.test(location.search)?' ask-demo':'')+(/[?&]interest=relay(&|$)/.test(location.search)?' ask-relay':'')+(/^#handoff=/.test(location.hash)&&/plan(s|es)/.test(location.pathname+location.search)?' owner-loading':'');setTimeout(function(){d.classList.remove('owner-loading')},6000);window.__pre=setTimeout(function(){d.classList.remove('pre');d.classList.add('still')},2500)})(document.documentElement)";
const BOOT = '<script>' + BOOT_JS + '</script>';
/** Organization data for brand search results; no ratings, no invented facts. */
const ORG_LD = '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: company.name, legalName: company.operator, url: 'https://' + company.domain + '/', email: company.email, ...(company.phone ? { telephone: '+1-' + company.phone } : {}), address: { '@type': 'PostalAddress', streetAddress: '1654 Calle Tulipan, Suite 100', addressLocality: 'San Juan', addressRegion: 'PR', postalCode: '00927', addressCountry: 'US' }, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: company.email, ...(company.phone ? { telephone: '+1-' + company.phone } : {}), description: 'Monday to Friday, 8 am to 9 pm Eastern Time (New York)', availableLanguage: ['English', 'Spanish'] } }).replace(/</g, '\\u003c') + '</script>';
/** The assistant appears only when an API address is configured: the theme setting on Shopify, VELANI_ASSISTANT_API for the local preview. */
function assistantBlock(target) {
  if (target === 'shopify') return "{% if settings.assistant_api_url != blank %}" + assistant('shopify', '{{ settings.assistant_api_url | strip | escape }}') + '<script type="module" src="' + asset('velani-assist.js', 'shopify') + '"></script>{% endif %}';
  const api = (process.env.VELANI_ASSISTANT_API || '').trim();
  return api ? assistant(target, e(api)) + '<script type="module" src="' + asset('velani-assist.js', target) + '"></script>' : '';
}
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
  const lang = routes[path] ? langOf(path) : 'en', hrefs = langPaths(path), dayKey = routes[path] ? routes[path].day : 'doc'; // the not-found page uses the legal look
  const html = '<!doctype html><html lang="' + lang + '" class="no-js" data-platform="' + (target === 'shopify' ? 'shopify' : 'local') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + BOOT + '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="light"><meta name="theme-color" content="#FBFBFD"><title>' + e(title) + '</title><meta name="description" content="' + e(page.desc || page.intro) + '">' + alternates(path) + '<link rel="icon" href="' + asset('favicon.svg', target) + '" type="image/svg+xml"><link rel="icon" href="' + asset('favicon-32.png', target) + '" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="' + asset('apple-touch-icon.png', target) + '">' + dayHeadAssets(target) + dayPageAssets(dayKey, target) + ORG_LD + '</head><body>' + dayHeader(page.nav, target, { lang, hrefs }) + '<main id="main" tabindex="-1">' + renderBody(path, { target }) + '</main>' + dayFooter(target, { lang, hrefs }) + consent(lang) + assistantBlock(target) + '</body></html>';
  return { html, status: routes[path] ? 200 : 404 };
}
/** The site chrome per language as theme snippets (header and phone menu; footer and cookie dialog). Each is its own Liquid file,
 * so the layout stays simple: it picks the snippet for the page's language and passes the page's nav key and switch links. */
export function renderShopifySnippets() {
  const out = {};
  for (const lang of ['en', 'es']) {
    out['velani-day-header-' + lang] = draftLinks(dayHeader(null, 'shopify', { lang }));
    out['velani-day-footer-' + lang] = draftLinks(dayFooter('shopify', { lang }) + consent(lang));
  }
  return out;
}
export function renderShopifyLayout() {
  // Liquid string literals have no escapes, so a quote or backslash in a title would break the layout: refuse it at build time
  const liquidStr = text => { if (/["\\]/.test(text)) throw new Error('Liquid string cannot contain quotes or backslashes: ' + text); return '"' + text + '"'; };
  // Each page's case branch sets everything it needs (no extra conditions in the layout): title, description, nav key, share image,
  // language and the two language destinations (path on the main theme, view on a draft)
  const view = path => path === '/' ? '' : '&amp;view=velani-' + slugOf(path);
  const langAssign = path => { const { en, es } = langPaths(path); return `{% assign velani_en_path = '${en}' %}{% assign velani_en_view = '${view(en)}' %}{% assign velani_es_path = '${es}' %}{% assign velani_es_view = '${view(es)}' %}` + (langOf(path) === 'es' ? `{% assign velani_lang = 'es' %}{% assign velani_locale = 'es_US' %}{% assign velani_og = 'velani-social-es.png' %}{% assign velani_og_alt = ${liquidStr('Velani. ' + routes['/pages/es'].title)} %}` : '') + (pairOf(path) ? `{% assign velani_alt_en = '${absolute(pairOf(path).en)}' %}{% assign velani_alt_es = '${absolute(pairOf(path).es)}' %}{% assign velani_locale_alt = '${langOf(path) === 'es' ? 'en_US' : 'es_US'}' %}` : ''); };
  const assignments = page => `{% assign velani_page_title = ${liquidStr(page.title)} %}{% assign velani_page_description = ${liquidStr(page.intro)} %}` + pageHead(page.path) + langAssign(page.path) + (page.nav ? `{% assign velani_nav = '${page.nav}' %}` : '') + (page.og ? `{% assign velani_og = '${page.og[0]}' %}{% assign velani_og_alt = ${liquidStr(page.og[1])} %}` : '') + (page.noindex ? '{% assign velani_noindex = true %}' : '');
  // What a page adds to <head>, captured in its own case branch: the page's own Day stylesheet and script
  const pageHead = path => { const extra = dayPageAssets(routes[path].day, 'shopify'); return extra ? `{% capture velani_head %}${extra}{% endcapture %}` : ''; };
  // Share image per page: velani-social.png by default; pages with their own image name it in content (og: [file, alt])
  const defaults = `{% assign velani_nav = '' %}{% assign velani_lang = 'en' %}{% assign velani_locale = 'en_US' %}{% assign velani_en_path = '/' %}{% assign velani_en_view = '' %}{% assign velani_es_path = '/pages/es' %}{% assign velani_es_view = '${view('/pages/es')}' %}{% assign velani_og = 'velani-social.png' %}{% assign velani_og_alt = ${liquidStr('Velani. ' + routes['/'].title)} %}`;
  const metadata = `{% assign velani_page_title = page_title %}{% assign velani_page_description = page_description %}{% assign velani_page = template.suffix | remove_first: 'velani-' %}${defaults}{% if template.name == 'index' and template.suffix == blank %}{% assign velani_page = 'home' %}${pageHead('/')}${langAssign('/')}{% assign velani_page_title = ${liquidStr(pageTitle(routes['/']))} %}{% assign velani_page_description = ${liquidStr(routes['/'].intro)} %}{% endif %}{% case velani_page %}` + Object.entries(routes).filter(([path, page]) => path !== '/' && page.layoutMeta !== false).map(([path, page]) => `{% when '${slugOf(path)}' %}${assignments({ title: pageTitle(page), intro: page.desc || page.intro, path, nav: page.nav, og: page.og, noindex: page.noindex, day: page.day })}`).join('') + '{% endcase %}' + '{% if template.name == "collection" or template.name == "product" or template.name == "cart" or template.name == "search" or template.name == "list-collections" or template.name == "404" or request.page_type == "policy" %}{% capture velani_head %}' + dayPageAssets('doc', 'shopify') + '{% endcapture %}{% endif %}{% if template.name == "collection" or template.name == "product" or template.name == "cart" or template.name == "search" or template.name == "list-collections" or template.name == "404" %}{% assign velani_page_title = "Page not found" %}{% assign velani_page_description = "The page you asked for is not on the Velani website. Go to the home page or see NEVORA and plans." %}{% assign velani_noindex = true %}{% endif %}{% assign velani_canonical = canonical_url %}{% if template.name == "index" and template.suffix != blank %}{% assign velani_noindex = true %}{% assign velani_canonical = shop.url | append: "/pages/" | append: velani_page %}{% endif %}';
  // The language switch: on the main theme the canonical path, on a draft the same draft with the other page's view
  const switchLinks = `{% if theme.role == 'main' %}{% assign velani_en_href = velani_en_path %}{% assign velani_es_href = velani_es_path %}{% else %}{% capture velani_en_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_en_view }}{% endcapture %}{% capture velani_es_href %}{{ routes.root_url }}?preview_theme_id={{ theme.id }}{{ velani_es_view }}{% endcapture %}{% endif %}`;
  const chromeOf = (part, design) => `{% if velani_lang == 'es' %}{% render 'velani-${design}${part}-es'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% else %}{% render 'velani-${design}${part}-en'${part === 'header' ? ', velani_nav: velani_nav, velani_page: velani_page' : ''}, velani_en_href: velani_en_href, velani_es_href: velani_es_href %}{% endif %}`;
  const chrome = part => chromeOf(part, 'day-');
  const policyFallback = `<section class="phero"><div class="wrap">{% if request.path contains 'privacy' %}<h1 class="t1">Privacy</h1><p class="lede">The privacy notice for this website and the NEVORA privacy policy are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/privacy">Privacy notice</a><a class="pill line" href="/pages/nevora-privacy">NEVORA privacy policy</a></div>{% elsif request.path contains 'terms' %}<h1 class="t1">Terms</h1><p class="lede">The website terms and the NEVORA terms of use are published on their own pages.</p><div class="acts"><a class="pill" href="/pages/website-terms">Website terms</a><a class="pill line" href="/pages/nevora-terms">NEVORA terms</a></div>{% elsif request.path contains 'refund' or request.path contains 'shipping' %}<h1 class="t1">No refund or shipping policy</h1><p class="lede">Velani sells software. This website takes no payments and ships no goods, so it has no refund or shipping policy. NEVORA billing follows the NEVORA terms of use.</p><div class="acts"><a class="pill" href="/pages/nevora-terms">NEVORA terms</a><a class="pill line" href="/pages/legal">All legal information</a></div>{% else %}<h1 class="t1">Legal information</h1><p class="lede">Read the notices for this website and the NEVORA app.</p><div class="acts"><a class="pill" href="/pages/legal">All legal information</a></div>{% endif %}</div></section>`;
  const html = `${metadata}${switchLinks}<!doctype html><html lang="{{ velani_lang }}" class="no-js" data-platform="shopify"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${BOOT}{% unless theme.role == 'main' %}<meta name="robots" content="noindex, nofollow">{% endunless %}{% if velani_noindex %}<meta name="robots" content="noindex">{% endif %}<meta name="color-scheme" content="light"><meta name="theme-color" content="#FBFBFD"><title>{% if velani_page_title contains 'Velani' %}{{ velani_page_title | escape }}{% else %}{{ velani_page_title | escape }} · Velani{% endif %}</title><meta name="description" content="{{ velani_page_description | escape }}"><link rel="canonical" href="{{ velani_canonical | escape }}"><meta property="og:site_name" content="Velani"><meta property="og:type" content="website"><meta property="og:locale" content="{{ velani_locale }}">{% if velani_alt_es != blank %}<meta property="og:locale:alternate" content="{{ velani_locale_alt }}"><link rel="alternate" hreflang="en" href="{{ velani_alt_en }}"><link rel="alternate" hreflang="es" href="{{ velani_alt_es }}"><link rel="alternate" hreflang="x-default" href="{{ velani_alt_en }}">{% endif %}<meta property="og:title" content="{{ velani_page_title | escape }}"><meta property="og:description" content="{{ velani_page_description | escape }}"><meta property="og:url" content="{{ velani_canonical | escape }}"><meta property="og:image" content="{{ velani_og | asset_url | prepend: 'https:' }}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{{ velani_og_alt | escape }}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${asset('favicon.svg', 'shopify')}" type="image/svg+xml"><link rel="icon" href="${asset('favicon-32.png', 'shopify')}" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="${asset('apple-touch-icon.png', 'shopify')}">${dayHeadAssets('shopify')}{{ velani_head }}${ORG_LD}{{ content_for_header }}</head><body>${chrome('header')}<main id="main" tabindex="-1">{% if request.page_type == 'policy' %}${policyFallback}{% else %}{{ content_for_layout }}{% endif %}</main>${chrome('footer')}${assistantBlock('shopify')}</body></html>`;
  return draftLinks(html);
}
