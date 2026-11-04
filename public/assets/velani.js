import { validateInquiry, createInquiryController } from './inquiry.js';
import { createPrivacyAdapter } from './privacy.js';
const form = document.querySelector('#project-inquiry');
if (form) {
  const mode = form.dataset.inquiryMode || form.querySelector('[data-inquiry-mode]')?.dataset.inquiryMode || 'preview';
  const submitButton = form.querySelector('[data-inquiry-submit]');
  const fieldset = form.querySelector('fieldset');
  let status = form.querySelector('.form-status');
  if (!status) { status = document.createElement('div'); status.className = 'form-status'; status.setAttribute('role', 'status'); status.tabIndex = -1; const submitNode = form.querySelector('[data-inquiry-submit]'); if (submitNode) submitNode.after(status); else form.append(status); }
  const fields = Object.fromEntries(['name', 'email', 'company', 'message', 'interest', 'locations', 'team'].map(key => [key, form.querySelector('#inquiry-' + key)]));
  const topic = new URL(window.location.href).searchParams.get('interest');
  if (['website', 'custom-software', 'nevora', 'nevora-demo', 'other'].includes(topic)) fields.interest.value = topic;
  // Arriving from a NEVORA action: talk about the team, keep NEVORA as the topic without asking again
  // The page already shows the right wording (chosen before paint); drop the unused variant so screen readers and the heading label see one text
  const nevora = document.documentElement.classList.contains('ask-nevora');
  const demo = document.documentElement.classList.contains('ask-demo');
  document.querySelectorAll(demo ? '.v-d, .v-n:not(.v-nm)' : nevora ? '.v-d, .v-m' : '.v-n, .v-m').forEach(el => el.remove());
  document.querySelectorAll('.phero .rise[aria-label]').forEach(h => h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()));
  if (topic === 'nevora' || topic === 'nevora-demo') {
    document.title = (topic === 'nevora-demo' ? 'Free NEVORA demo' : 'NEVORA for your team') + ' · Velani';
    fields.message.required = false;
  }
  const setBusy = busy => { submitButton.disabled = busy; form.setAttribute('aria-busy', String(busy)); };
  const messages = { checking: 'Checking your draft…', preview: 'Draft checked. Nothing was sent.', invalid: 'Check the highlighted fields.', sending: 'Sending inquiry…', accepted: 'Your inquiry was submitted.', failed: 'The inquiry was not accepted. Review the form before trying again.', uncertain: 'We could not confirm the submission. It may have been accepted. Check with support@thevelani.com before sending it again.', unavailable: 'Inquiry delivery is not available.' };
  const controller = createInquiryController({ mode: 'preview', onState: state => { status.dataset.state = state.status; status.textContent = messages[state.status] || ''; setBusy(['checking', 'sending'].includes(state.status)); } });
  function showErrors(errors) {
    for (const key of ['name', 'email', 'company', 'message', 'locations']) {
      const message = form.querySelector('#error-' + key);
      if (!message || !fields[key]) continue;
      message.textContent = errors[key] || '';
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
      status.dataset.state = 'invalid'; status.textContent = messages.invalid;
      fields[Object.keys(checked.errors)[0]]?.focus(); return;
    }
    if (mode === 'live') {
      // A NEVORA enquiry may have no message: send the team details as the message body so the email is never empty
      if (!values.message.trim() && fields.message) fields.message.value = ['NEVORA quote request.', values.team && 'Team size: ' + values.team, values.locations && 'Locations: ' + values.locations, values.company && 'Company: ' + values.company].filter(Boolean).join('\n');
      setBusy(true); status.textContent = messages.sending; return;
    }
    await controller.submit(values);
  });
  // F08: choosing a NEVORA topic in the general form reveals the team fields and makes the message optional, like the dedicated inquiry
  const messageLabel = form.querySelector('label[for="inquiry-message"]'); const messageLabels = { general: messageLabel && messageLabel.innerHTML, nevora: 'Anything else <span class="opt">optional</span>' };
  fields.interest?.addEventListener('change', () => { const nev = /^nevora/.test(fields.interest.value); const row = form.querySelector('[data-nevora-fields]'); if (row) row.hidden = !nev; if (fields.message) fields.message.required = !nev; if (messageLabel && !nevora && !demo) messageLabel.innerHTML = nev ? messageLabels.nevora : messageLabels.general; });
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
    status.textContent = ''; context.textContent = 'Loading available choices…';
    setBusy(true); dialog.showModal();
    const state = await adapter.read();
    for (const input of inputs) input.checked = state.choices[input.dataset.consent] === true;
    context.textContent = state.mode === 'local' ? 'Local website preview: these demonstration choices last only on this page. No analytics or marketing integration is added.' : state.available ? 'Choices are managed through Shopify. Velani has not added analytics or marketing tools to this website.' : 'The platform privacy service is unavailable. No optional Velani integration will be started.';
    setBusy(false);
    // F24: when the platform's privacy service is unavailable, nothing can be saved, so the saving controls stay off and the message says what to do
    if (state.mode !== 'local' && !state.available) { [...controls, ...inputs].forEach(control => { control.disabled = true; }); context.textContent += ' Nothing can be saved right now. Close this window and try again later.'; }
  }
  document.querySelectorAll('[data-cookie-open]').forEach(button => { button.addEventListener('click', open); button.disabled = false; });
  dialog.querySelector('[data-cookie-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  for (const button of controls) button.addEventListener('click', async () => {
    if (busy) return;
    const choices = Object.fromEntries(inputs.map(input => [input.dataset.consent, button.hasAttribute('data-cookie-accept') ? true : button.hasAttribute('data-cookie-reject') ? false : input.checked]));
    status.textContent = 'Saving your choices…'; status.tabIndex = -1; status.focus({ preventScroll: true }); setBusy(true);
    const result = await adapter.save(choices);
    setBusy(false);
    if (result.ok) {
      inputs.forEach(input => { input.checked = choices[input.dataset.consent]; });
      status.textContent = result.mode === 'local' ? 'Preview choices updated for this page.' : 'Cookie choices saved.';
    } else status.textContent = result.error;
    if (dialog.open && document.activeElement === status) button.focus({ preventScroll: true });
  });
}

