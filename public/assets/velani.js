import { validateInquiry, createInquiryController } from './inquiry.js';
import { createPrivacyAdapter } from './privacy.js';
// Every word this script shows, in the page's language (<html lang>): English, or Spanish on the Spanish pages
const STRINGS = {
  en: {
    sent: { 'nevora-demo': ['Trial request sent.', 'Jose from Velani will email you within two business days to set up your workplace. Your 30 days start the day it’s ready.'], nevora: ['Request sent.', 'We’ll email you within two business days about your team and locations. Teams that qualify get the same 30 days free, starting the day the workplace is set up.'], relay: ['You’re on the Relay list.', 'We’ll email you when NEVORA Relay opens for early access. No dates yet.'], 'client-work': ['Request sent.', 'We reply by email within two business days. Paid work starts only after you approve a written quote.'], 'client-help': ['Sent to support.', 'We reply by email within two business days. If you can’t work, write to support@thevelani.com, Monday to Friday, 8 am to 9 pm ET.'] },
    sentTitle: 'Message sent', trialTitle: 'Free NEVORA trial', quoteTitle: 'NEVORA for your team', relayTitle: 'NEVORA Relay waitlist',
    quoteNote: 'Teams of more than 30 start with assisted setup instead of signing up online. Teams that qualify get the same 30 days free. What you typed is kept.',
    optional: 'Anything else <span class="opt">optional</span>',
    status: { checking: 'Checking your draft…', preview: 'Draft checked. Nothing was sent.', invalid: 'We couldn’t send your inquiry. Check the highlighted fields and try again.', sending: 'Sending inquiry…', accepted: 'Your inquiry was submitted.', failed: 'The inquiry was not accepted. Review the form before trying again.', uncertain: 'We could not confirm the submission. It may have been accepted. Check with support@thevelani.com before sending it again.', unavailable: 'We could not send your inquiry. Write to support@thevelani.com, Monday to Friday, 8 am to 9 pm ET.' },
    errors: {}, tooLong: n => 'Use ' + n + ' characters or fewer.',
    consent: { loading: 'Loading available choices…', local: 'Local website preview: these demonstration choices last only on this page. No analytics or marketing integration is added.', shopify: 'Choices are managed through Shopify. Shopify collects visit information for analytics, and Mailchimp, our email tool, can receive it for analytics and marketing.', unavailable: 'The platform privacy service is unavailable. No optional Velani integration will be started.', nothing: ' Nothing can be saved right now. Close this window and try again later.', saving: 'Saving your choices…', savedLocal: 'Preview choices updated for this page.', saved: 'Cookie choices saved.' },
    privacyErrors: {},
  },
  es: {
    sent: { 'nevora-demo': ['Solicitud de prueba enviada.', 'Jose de Velani te escribirá en un plazo de dos días laborables para configurar tu lugar de trabajo. Tus 30 días empiezan el día en que esté listo.'], nevora: ['Solicitud enviada.', 'Te escribiremos en un plazo de dos días laborables sobre tu equipo y tus ubicaciones. Los equipos que califican reciben los mismos 30 días gratis, desde el día en que el lugar de trabajo queda configurado.'], relay: ['Ya estás en la lista de Relay.', 'Te escribiremos cuando NEVORA Relay abra el acceso anticipado. Aún sin fechas.'], 'client-work': ['Solicitud enviada.', 'Te respondemos por correo en un plazo de dos días laborables. El trabajo pagado empieza solo después de que apruebes una cotización por escrito.'], 'client-help': ['Enviado a soporte.', 'Te respondemos por correo en un plazo de dos días laborables. Si no pueden trabajar, escribe a support@thevelani.com, lunes a viernes, 8\u00a0a.\u00a0m. a 9\u00a0p.\u00a0m. ET.'] },
    sentTitle: 'Mensaje enviado', trialTitle: 'Prueba gratis de NEVORA', quoteTitle: 'NEVORA para tu equipo', relayTitle: 'Lista de espera de NEVORA Relay',
    quoteNote: 'Los equipos de más de 30 empiezan con una configuración asistida en lugar del registro en línea. Los que califican reciben los mismos 30 días gratis. Lo que escribiste se conserva.',
    optional: 'Algo más <span class="opt">opcional</span>',
    status: { checking: 'Revisando tu borrador…', preview: 'Borrador revisado. No se envió nada.', invalid: 'No pudimos enviar tu consulta. Revisa los campos marcados e inténtalo de nuevo.', sending: 'Enviando consulta…', accepted: 'Tu consulta se envió.', failed: 'No se aceptó la consulta. Revisa el formulario antes de intentarlo de nuevo.', uncertain: 'No pudimos confirmar el envío. Es posible que se haya recibido. Consulta con support@thevelani.com antes de enviarla otra vez.', unavailable: 'No pudimos enviar tu consulta. Escribe a support@thevelani.com, lunes a viernes, 8\u00a0a.\u00a0m. a 9\u00a0p.\u00a0m. ET.' },
    // validateInquiry (inquiry.js) returns English; these are the same messages in Spanish
    errors: { 'Enter text in this field.': 'Escribe texto en este campo.', 'Enter your name.': 'Escribe tu nombre.', 'Enter an email address we can reply to.': 'Escribe un correo electrónico al que podamos responderte.', 'Tell us what you want to discuss.': 'Cuéntanos de qué quieres hablar.', 'Enter the number of locations, for example 2.': 'Escribe el número de ubicaciones, por ejemplo, 2.' },
    tooLong: n => 'Usa ' + n + ' caracteres o menos.',
    consent: { loading: 'Cargando las opciones disponibles…', local: 'Vista previa local del sitio web: estas opciones de demostración duran solo en esta página. No se añade ninguna integración de analítica ni de marketing.', shopify: 'Las opciones se gestionan a través de Shopify. Shopify recopila información de visitas para analítica, y Mailchimp, nuestra herramienta de correo, puede recibirla para analítica y marketing.', unavailable: 'El servicio de privacidad de la plataforma no está disponible. No se iniciará ninguna integración opcional de Velani.', nothing: ' Ahora no se puede guardar nada. Cierra esta ventana e inténtalo más tarde.', saving: 'Guardando tus opciones…', savedLocal: 'Opciones de vista previa actualizadas para esta página.', saved: 'Opciones de cookies guardadas.' },
    // privacy.js returns English errors; these are the same messages in Spanish
    privacyErrors: { 'Invalid privacy choices.': 'Opciones de privacidad no válidas.', 'The platform privacy service is unavailable. Choices have not been saved.': 'El servicio de privacidad de la plataforma no está disponible. Las opciones no se guardaron.', 'We could not confirm the privacy change. Try again later.': 'No pudimos confirmar el cambio de privacidad. Inténtalo más tarde.', 'The platform did not accept the privacy change.': 'La plataforma no aceptó el cambio de privacidad.', 'Privacy choices could not be saved.': 'No se pudieron guardar las opciones de privacidad.' },
  },
};
const L = STRINGS[/^es\b/i.test(document.documentElement.lang) ? 'es' : 'en'];
const errorText = message => L.errors[message] || (/^Use (\d+) characters or fewer\.$/.test(message) ? L.tooLong(message.match(/\d+/)[0]) : message);
const form = document.querySelector('#project-inquiry');
// After sending, the form is replaced by a confirmation that says what happens next (the topic is kept for this one page view)
const sent = document.querySelector('#inquiry-sent');
function showSent(topic, preview) {
  const copy = L.sent[topic];
  if (copy) { sent.querySelector('[data-sent-h]').textContent = copy[0]; sent.querySelector('[data-sent-p]').textContent = copy[1]; }
  document.title = (copy ? copy[0].replace(/\.$/, '') : L.sentTitle) + ' · Velani';
  const note = sent.querySelector('[data-sent-preview]'); if (note) note.hidden = !preview;
  // After a trial request the one filled action leads to the NEVORA page, and Home becomes a quiet text link
  const next = sent.querySelector('[data-sent-next]'), back = sent.querySelector('[data-sent-back]');
  if (next && back && topic === 'nevora-demo') { next.hidden = false; back.className = 'sent-back'; }
  sent.hidden = false;
  // On Support the form sits lower on the page: bring the confirmation into view there; on the request page go to the top
  if (sent.closest('.client')) sent.scrollIntoView({ block: 'center' }); else window.scrollTo(0, 0);
  sent.focus({ preventScroll: true });
}
const justSent = !!sent && !sent.hidden;
if (justSent) { let topic = ''; try { topic = sessionStorage.getItem('v-inquiry-topic') || ''; sessionStorage.removeItem('v-inquiry-topic'); sessionStorage.removeItem('v-inquiry-draft'); } catch {} showSent(topic, false); }
if (form && !justSent) {
  const mode = form.dataset.inquiryMode || form.querySelector('[data-inquiry-mode]')?.dataset.inquiryMode || 'preview';
  const submitButton = form.querySelector('[data-inquiry-submit]');
  const fieldset = form.querySelector('fieldset');
  let status = form.querySelector('.form-status');
  if (!status) { status = document.createElement('div'); status.className = 'form-status'; status.setAttribute('role', 'status'); status.tabIndex = -1; const submitNode = form.querySelector('[data-inquiry-submit]'); if (submitNode) submitNode.after(status); else form.append(status); }
  const fields = Object.fromEntries(['name', 'email', 'company', 'message', 'interest', 'locations', 'team'].map(key => [key, form.querySelector('#inquiry-' + key)]));
  const topic = new URL(window.location.href).searchParams.get('interest');
  if (['website', 'custom-software', 'nevora', 'nevora-demo', 'relay', 'other', 'client-work', 'client-help'].includes(topic)) fields.interest.value = topic;
  // Contact: the three topic choices set the hidden topic and announce the change, so the rest of the form adapts as it did with the menu;
  // syncTopics keeps them in step when the topic changes in code (a link's ?interest=, the team of more than 30, a restored draft)
  const topicRadios = [...form.querySelectorAll('input[name="topic_choice"]')];
  const syncTopics = () => { const v = fields.interest?.value || ''; topicRadios.forEach(r => { r.checked = r.value === v || (r.value === 'custom-software' && v === 'website') || (r.value === 'nevora' && /^(nevora|relay)/.test(v)); }); };
  topicRadios.forEach(r => r.addEventListener('change', () => { if (r.checked && fields.interest) { fields.interest.value = r.value; fields.interest.dispatchEvent(new Event('change')); } }));
  syncTopics();
  // Sign in page: two kinds of client request share one form. The choice sets the topic, the message label, the timing or
  // urgency field (the hidden one is disabled so it is not sent) and, on the live form, the button wording.
  const kinds = [...form.querySelectorAll('input[name="client_kind"]')];
  if (kinds.length && fields.interest) {
   const setKind = value => { const key = value === 'client-help' ? 'help' : 'work'; fields.interest.value = value; kinds.forEach(r => { r.checked = r.value === value; }); form.querySelectorAll('[data-k]').forEach(el => { el.hidden = el.dataset.k !== key; el.querySelectorAll('select').forEach(s => { s.disabled = el.hidden; }); }); };
   kinds.forEach(r => r.addEventListener('change', () => { if (r.checked) setKind(r.value); }));
   setKind(topic === 'client-help' ? 'client-help' : 'client-work');
  }
  // Arriving from a NEVORA action: talk about the team, keep NEVORA as the topic without asking again
  // The page already shows the right wording (chosen before paint); drop the unused variant so screen readers and the heading label see one text
  const nevora = document.documentElement.classList.contains('ask-nevora');
  const demo = document.documentElement.classList.contains('ask-demo');
  const relay = document.documentElement.classList.contains('ask-relay');
  // The trial page keeps its quote wording (hidden) so a team of more than 30 can switch to a quote without losing what was typed.
  // The Relay waitlist has its own hero wording only; its form keeps the general wording.
  document.querySelectorAll(demo ? '.v-d, .v-r' : nevora ? '.v-d, .v-m, .v-r' : relay ? '.cform-hero .v-d, [data-inquiry-submit] .v-d, .v-n, .v-m' : '.v-n, .v-m, .v-r').forEach(el => el.remove());
  const shown = el => [...el.childNodes].filter(n => n.nodeType === 3 || getComputedStyle(n).display !== 'none').map(n => n.textContent).join('');
  const relabel = () => document.querySelectorAll('.cform-hero h1.rise').forEach(h => h.setAttribute('aria-label', shown(h).replace(/\s+/g, ' ').trim()));
  relabel();
  if (topic === 'nevora' || topic === 'nevora-demo') {
    document.title = (topic === 'nevora-demo' ? L.trialTitle : L.quoteTitle) + ' · Velani';
    fields.message.required = false;
  }
  if (relay) document.title = L.relayTitle + ' · Velani';
  // Free trial with a team of more than 30 (the trial page, or the general form with "Free NEVORA trial" chosen): the trial does not
  // apply, so the request becomes a NEVORA quote (topic; on the trial page also heading and button). Back to 30 or fewer undoes it.
  let autoQuote = false, onTeam = () => {};
  if (fields.team && fields.interest) {
   const note = document.createElement('p'); note.className = 'send-note quote-note'; note.setAttribute('role', 'status'); note.hidden = true;
   note.textContent = L.quoteNote;
   submitButton.before(note);
   onTeam = () => {
    const big = /^More than 30/.test(fields.team.value);
    if (big && fields.interest.value === 'nevora-demo') { autoQuote = true; fields.interest.value = 'nevora'; }
    else if (!big && autoQuote && fields.interest.value === 'nevora') { autoQuote = false; fields.interest.value = 'nevora-demo'; }
    const quote = autoQuote && big;
    if (demo) { document.documentElement.classList.toggle('ask-demo', !quote); document.title = (quote ? L.quoteTitle : L.trialTitle) + ' · Velani'; }
    note.hidden = !quote; relabel(); syncTopics();
   };
   fields.team.addEventListener('change', onTeam);
  }
  const setBusy = busy => { submitButton.disabled = busy; form.setAttribute('aria-busy', String(busy)); };
  const messages = L.status;
  const controller = createInquiryController({ mode: 'preview', onState: state => { status.dataset.state = state.status; status.textContent = messages[state.status] || ''; setBusy(['checking', 'sending'].includes(state.status)); if (state.status === 'preview' && sent) { form.hidden = true; showSent(fields.interest?.value || '', true); } } });
  // After the first submit attempt each field is checked again as it changes, so an error clears the moment it is fixed.
  // The summary sits directly above the Send button and names the fields that still need attention.
  let tried = false;
  const isEs = /^es\b/i.test(document.documentElement.lang);
  const labelOf = key => { const l = fields[key] && form.querySelector('label[for="' + fields[key].id + '"]'); if (!l) return key; const c = l.cloneNode(true); c.querySelectorAll('[hidden]').forEach(n => n.remove()); c.querySelectorAll('.opt,.v-n,.v-m,.v-r').forEach(n => { if (n.classList.contains('opt') || getComputedStyle(l.querySelector('.' + n.className.split(' ')[0]) || l).display === 'none') n.remove(); }); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const summarize = errors => { const keys = Object.keys(errors).filter(k => fields[k]); if (!keys.length) { status.textContent = ''; status.dataset.state = ''; status.setAttribute('role', 'status'); return; }
    const names = keys.map(labelOf).join(', '); const end = /[?!.]$/.test(names) ? '' : '.'; status.dataset.state = 'invalid'; status.setAttribute('role', 'alert');
    status.textContent = isEs ? (keys.length === 1 ? '1 campo necesita atención: ' : keys.length + ' campos necesitan atención: ') + names + end : (keys.length === 1 ? '1 field needs attention: ' : keys.length + ' fields need attention: ') + names + end; };
  const recheck = () => { if (!tried) return; const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input?.value || ''])); const checked = validateInquiry(values); showErrors(checked.errors); summarize(checked.errors); };
  form.addEventListener('input', recheck); form.addEventListener('focusout', recheck);
  const sendRow = form.querySelector('.client-send'); if (sendRow && status.parentNode) sendRow.before(status);
  function showErrors(errors) {
    for (const key of ['name', 'email', 'company', 'message', 'locations']) {
      const message = form.querySelector('#error-' + key);
      if (!message || !fields[key]) continue;
      message.textContent = errors[key] ? errorText(errors[key]) : '';
      if (errors[key]) fields[key].setAttribute('aria-invalid', 'true'); else fields[key].removeAttribute('aria-invalid');
    }
  }
  form.addEventListener('submit', async event => {
    if (mode !== 'live') event.preventDefault();
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input?.value || '']));
    const checked = validateInquiry(values);
    showErrors(checked.errors);
    if (!checked.valid) {
      event.preventDefault();
      tried = true; summarize(checked.errors);
      fields[Object.keys(checked.errors)[0]]?.focus(); return;
    }
    if (mode === 'live') {
      // A NEVORA enquiry may have no message: send the team details as the message body so the email is never empty
      // (these lines stay in English in every language, like the topic values, so the email Velani receives reads the same)
      if (!values.message.trim() && fields.message) fields.message.value = [values.interest === 'relay' ? 'NEVORA Relay waitlist request.' : values.interest === 'nevora-demo' ? 'Free NEVORA trial request.' : 'NEVORA quote request.', values.team && 'Team size: ' + values.team, values.locations && 'Locations: ' + values.locations, values.company && 'Company: ' + values.company].filter(Boolean).join('\n');
      // Shopify re-renders the form after a server-side error with only name, email and message: keep the rest for this tab
      try { sessionStorage.setItem('v-inquiry-topic', values.interest || ''); sessionStorage.setItem('v-inquiry-draft', JSON.stringify({ company: values.company, interest: values.interest, team: values.team, locations: values.locations })); } catch {}
      setBusy(true); status.textContent = messages.sending; return;
    }
    await controller.submit(values);
  });
  // F08: choosing a NEVORA topic in the general form reveals the team fields and makes the message optional, like the dedicated inquiry
  const messageLabel = form.querySelector('label[for="inquiry-message"]'); const messageLabels = { general: messageLabel && messageLabel.innerHTML, nevora: L.optional };
  const onTopic = () => { const nev = /^nevora/.test(fields.interest.value); const optional = nev || fields.interest.value === 'relay'; const row = form.querySelector('[data-nevora-fields]'); if (row) row.hidden = !nev; if (fields.message) fields.message.required = !optional; if (messageLabel && !nevora && !demo) messageLabel.innerHTML = optional ? messageLabels.nevora : messageLabels.general;
   // A message that just became optional loses its old "required" error
   if (optional && fields.message && !fields.message.value.trim()) { const err = form.querySelector('#error-message'); if (err) err.textContent = ''; fields.message.removeAttribute('aria-invalid'); } };
  fields.interest?.addEventListener('change', () => { autoQuote = false; onTopic(); onTeam(); });
  if (topic === 'relay' && fields.interest) onTopic();
  // After a server-side error the live form comes back without company, topic, team size and locations: restore them
  if (mode === 'live' && form.querySelector('.form-status[role="alert"]')) {
   let draft = null; try { draft = JSON.parse(sessionStorage.getItem('v-inquiry-draft') || 'null'); } catch {}
   if (draft) {
    for (const key of ['company', 'interest', 'team', 'locations']) if (fields[key] && typeof draft[key] === 'string' && draft[key] && !fields[key].value) fields[key].value = draft[key];
    if (fields.interest) { onTopic(); onTeam(); syncTopics(); }
   }
  }
  fieldset.disabled = false;
  const minH = parseInt(fields.message.dataset.min || '150', 10);
  fields.message.addEventListener('input', () => { fields.message.style.height = 'auto'; fields.message.style.height = Math.min(600, Math.max(minH, fields.message.scrollHeight)) + 'px'; });
  // Blanks in the sentence grow with what is typed: measure the text in the same font and size the control to it
  const brief = form.querySelector('.brief');
  if (brief) {
    const ruler = document.createElement('span'); ruler.className = 'brief-ruler'; ruler.setAttribute('aria-hidden', 'true'); brief.append(ruler);
    const size = el => { const text = el.tagName === 'SELECT' ? (el.options[el.selectedIndex]?.text || '') : (el.value || el.placeholder || ''); ruler.textContent = text; const w = ruler.getBoundingClientRect().width; const cs = getComputedStyle(el); el.style.width = Math.max(el.tagName === 'SELECT' ? 0 : 3 * 16, w + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 2) + 'px'; };
    for (const el of brief.querySelectorAll('input, select')) { size(el); el.addEventListener('input', () => size(el)); el.addEventListener('change', () => size(el)); }
    if (document.fonts?.ready) document.fonts.ready.then(() => brief.querySelectorAll('input, select').forEach(size));
  }
  window.addEventListener('pageshow', event => { if (event.persisted && mode === 'live' && form.getAttribute('aria-busy') === 'true') { setBusy(false); status.dataset.state = 'uncertain'; status.textContent = messages.uncertain; } });
}
const dialog = document.querySelector('#cookie-dialog');
if (dialog) {
  const adapter = createPrivacyAdapter(window);
  const context = dialog.querySelector('[data-cookie-context]');
  const status = dialog.querySelector('.consent-status');
  const controls = [...dialog.querySelectorAll('[data-cookie-reject], [data-cookie-accept], [data-cookie-save]')];
  const inputs = [...dialog.querySelectorAll('[data-consent]')];
  let opener, busy = false;
  const setBusy = value => {
    busy = value;
    [...controls, ...inputs].forEach(control => { control.disabled = value; });
    dialog.setAttribute('aria-busy', String(value));
  };
  async function open(event) {
    opener = event.currentTarget;
    if (busy) { dialog.showModal(); return; }
    status.textContent = ''; context.textContent = L.consent.loading;
    setBusy(true); dialog.showModal();
    const state = await adapter.read();
    for (const input of inputs) input.checked = state.choices[input.dataset.consent] === true;
    context.textContent = state.mode === 'local' ? L.consent.local : state.available ? L.consent.shopify : L.consent.unavailable;
    setBusy(false);
    // F24: when the platform's privacy service is unavailable, nothing can be saved, so the saving controls stay off and the message says what to do
    if (state.mode !== 'local' && !state.available) { [...controls, ...inputs].forEach(control => { control.disabled = true; }); context.textContent += L.consent.nothing; }
  }
  document.querySelectorAll('[data-cookie-open]').forEach(button => { button.addEventListener('click', open); button.disabled = false; });
  dialog.querySelector('[data-cookie-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  for (const button of controls) button.addEventListener('click', async () => {
    if (busy) return;
    const choices = Object.fromEntries(inputs.map(input => [input.dataset.consent, button.hasAttribute('data-cookie-accept') ? true : button.hasAttribute('data-cookie-reject') ? false : input.checked]));
    status.textContent = L.consent.saving; status.tabIndex = -1; status.focus({ preventScroll: true }); setBusy(true);
    const result = await adapter.save(choices);
    setBusy(false);
    if (result.ok) {
      inputs.forEach(input => { input.checked = choices[input.dataset.consent]; });
      status.textContent = result.mode === 'local' ? L.consent.savedLocal : L.consent.saved;
      // Saved: close the dialog and return to the button that opened it (dialog.close() restores focus to it)
      setTimeout(() => { if (dialog.open) dialog.close(); }, 600); return;
    } else status.textContent = L.privacyErrors[result.error] || result.error;
    if (dialog.open && document.activeElement === status) button.focus({ preventScroll: true });
  });
}
// The language switch on the contact page keeps the topic the visitor arrived with (?interest=…), in both directions
{
  const interest = new URL(window.location.href).searchParams.get('interest');
  if (form && ['website', 'custom-software', 'nevora', 'nevora-demo', 'relay', 'other'].includes(interest)) document.querySelectorAll('.lang-sw a').forEach(a => { try { const u = new URL(a.href, window.location.href); u.searchParams.set('interest', interest); a.href = u.pathname + u.search + u.hash; } catch {} });
}
