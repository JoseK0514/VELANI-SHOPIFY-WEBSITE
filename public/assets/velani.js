import { validateInquiry, createInquiryController } from './inquiry.js';
import { createPrivacyAdapter } from './privacy.js';
document.documentElement.classList.add('js');
const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('#primary-nav');
if (menuButton && nav) {
  menuButton.hidden = false;
  const closeMenu = (restore = false) => { nav.removeAttribute('data-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); if (restore) menuButton.focus(); };
  menuButton.addEventListener('click', () => {
    if (nav.hasAttribute('data-open')) closeMenu();
    else { nav.setAttribute('data-open', ''); menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', 'Close navigation'); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.hasAttribute('data-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
}
const form = document.querySelector('#project-inquiry');
if (form) {
  const mode = form.dataset.inquiryMode || form.querySelector('[data-inquiry-mode]')?.dataset.inquiryMode || 'preview';
  const submitButton = form.querySelector('[data-inquiry-submit]');
  const fieldset = form.querySelector('fieldset');
  let status = form.querySelector('.form-status');
  if (!status) { status = document.createElement('div'); status.className = 'form-status'; status.setAttribute('role', 'status'); status.tabIndex = -1; form.append(status); }
  const fields = Object.fromEntries(['name', 'email', 'company', 'message', 'interest'].map(key => [key, form.querySelector('#inquiry-' + key)]));
  const topic = new URL(window.location.href).searchParams.get('interest');
  if (['custom-software', 'nevora', 'other'].includes(topic)) fields.interest.value = topic;
  const setBusy = busy => { submitButton.disabled = busy; form.setAttribute('aria-busy', String(busy)); };
  const messages = { checking: 'Checking your draft…', preview: 'Draft checked. Nothing was sent.', invalid: 'Check the highlighted fields.', sending: 'Sending inquiry…', accepted: 'Your inquiry was submitted.', failed: 'The inquiry was not accepted. Review the form before trying again.', uncertain: 'We could not confirm the submission. It may have been accepted. Check with support@thevelani.com before sending it again.', unavailable: 'Inquiry delivery is not available.' };
  const controller = createInquiryController({ mode: 'preview', onState: state => { status.dataset.state = state.status; status.textContent = messages[state.status] || ''; setBusy(['checking', 'sending'].includes(state.status)); } });
  function showErrors(errors) {
    for (const key of ['name', 'email', 'company', 'message']) {
      const message = form.querySelector('#error-' + key);
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
    if (mode === 'live') { setBusy(true); status.textContent = messages.sending; return; }
    await controller.submit(values);
  });
  fieldset.disabled = false;
  fields.message.addEventListener('input', () => { fields.message.style.height = 'auto'; fields.message.style.height = Math.min(600, Math.max(150, fields.message.scrollHeight)) + 'px'; });
  window.addEventListener('pageshow', event => { if (event.persisted && mode === 'live' && form.getAttribute('aria-busy') === 'true') { setBusy(false); status.dataset.state = 'uncertain'; status.textContent = messages.uncertain; } });
}
const dialog = document.querySelector('#cookie-dialog');
if (dialog) {
  const adapter = createPrivacyAdapter(window);
  const context = dialog.querySelector('[data-cookie-context]');
  const status = dialog.querySelector('.consent-status');
  const controls = [...dialog.querySelectorAll('[data-cookie-reject], [data-cookie-accept], [data-cookie-save]')];
  const inputs = [...dialog.querySelectorAll('[data-consent]')];
  let opener;
  const setBusy = busy => { controls.forEach(button => { button.disabled = busy; }); dialog.setAttribute('aria-busy', String(busy)); };
  async function open(event) {
    opener = event.currentTarget;
    status.textContent = ''; context.textContent = 'Loading available choices…';
    setBusy(true); dialog.showModal();
    const state = await adapter.read();
    for (const input of inputs) input.checked = state.choices[input.dataset.consent] === true;
    context.textContent = state.mode === 'local' ? 'Local website preview: these demonstration choices last only on this page. No analytics or marketing integration is added.' : state.available ? 'Choices are managed through Shopify. This website draft adds no new optional integration.' : 'The platform privacy service is unavailable. No optional Velani integration will be started.';
    setBusy(false);
  }
  document.querySelectorAll('[data-cookie-open]').forEach(button => button.addEventListener('click', open));
  dialog.querySelector('[data-cookie-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  for (const button of controls) button.addEventListener('click', async () => {
    const choices = Object.fromEntries(inputs.map(input => [input.dataset.consent, button.hasAttribute('data-cookie-accept') ? true : button.hasAttribute('data-cookie-reject') ? false : input.checked]));
    setBusy(true); status.textContent = 'Saving your choices…';
    const result = await adapter.save(choices);
    setBusy(false);
    if (result.ok) {
      inputs.forEach(input => { input.checked = choices[input.dataset.consent]; });
      status.textContent = result.mode === 'local' ? 'Preview choices updated for this page.' : 'Cookie choices saved.';
    } else status.textContent = result.error;
  });
}

