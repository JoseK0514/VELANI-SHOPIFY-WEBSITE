const limits = { name: 120, email: 254, company: 160, message: 4000, locations: 120 };
const interests = new Set(['', 'website', 'custom-software', 'nevora', 'nevora-demo', 'relay', 'other']);
export function validateInquiry(fields = {}) {
  const errors = {}, values = {};
  for (const key of Object.keys(limits)) {
    const input = fields?.[key];
    if (input !== undefined && typeof input !== 'string') { values[key] = ''; errors[key] = 'Enter text in this field.'; continue; }
    values[key] = (input || '').normalize('NFC').replace(/\r\n?/g, '\n').trim();
    if (values[key].length > limits[key]) errors[key] = 'Use ' + limits[key] + ' characters or fewer.';
  }
  if (!values.name && !errors.name) errors.name = 'Enter your name.';
  if ((!values.email || !/^[^\s@<>"\\,;]+@[^\s@<>"\\,;]+\.[^\s@<>"\\,;]+$/u.test(values.email)) && !errors.email) errors.email = 'Enter an email address we can reply to.';
  // A NEVORA enquiry asks about the team instead, and Relay early access needs only a name and email, so their message is optional
  if (!values.message && !errors.message && !/^(nevora|relay)/.test(fields?.interest || '')) errors.message = 'Tell us what you want to discuss.';
  // Locations is a count: blank, or a whole number from 1 to 9999
  if (values.locations && !errors.locations && !/^[1-9]\d{0,3}$/.test(values.locations)) errors.locations = 'Enter the number of locations, for example 2.';
  values.interest = typeof fields?.interest === 'string' && interests.has(fields.interest) ? fields.interest : '';
  return { valid: Object.keys(errors).length === 0, errors, values };
}
export function createInquiryController({ mode = 'preview', transport, onState = () => {}, timeoutMs = 12000 } = {}) {
  if (!['preview', 'live'].includes(mode)) throw new TypeError('Unsupported inquiry mode');
  let state = Object.freeze({ status: 'idle' }), pending = null;
  const update = next => { state = Object.freeze(next); onState(state); return state; };
  function submit(fields) {
    if (pending) return pending;
    if (state.status === 'uncertain') return Promise.resolve(state);
    const checked = validateInquiry(fields);
    if (!checked.valid) return Promise.resolve(update({ status: 'invalid', errors: checked.errors }));
    if (mode === 'preview') {
      update({ status: 'checking' });
      pending = Promise.resolve().then(() => update({ status: 'preview' })).finally(() => { pending = null; });
      return pending;
    }
    if (typeof transport !== 'function') return Promise.resolve(update({ status: 'unavailable' }));
    update({ status: 'sending' });
    const abort = new AbortController();
    let timer;
    pending = (async () => {
      try {
        const timeout = new Promise((_, reject) => { timer = setTimeout(() => { abort.abort(); reject(new Error('Inquiry response deadline')); }, timeoutMs); });
        const result = await Promise.race([transport(checked.values, { signal: abort.signal }), timeout]);
        return update({ status: result?.accepted === true ? 'accepted' : 'failed' });
      } catch { return update({ status: 'uncertain' }); }
      finally { clearTimeout(timer); pending = null; }
    })();
    return pending;
  }
  return { submit, get state() { return state; }, reset() { if (pending) return state; return update({ status: 'idle' }); } };
}

