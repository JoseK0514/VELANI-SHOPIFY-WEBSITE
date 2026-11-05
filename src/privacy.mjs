// Every purpose Shopify's Customer Privacy API controls. sale_of_data is the opt-out of sale or sharing under US state laws:
// true allows it, false opts out. A caller that leaves it out opts out (the privacy-preserving default).
const keys = ['analytics', 'marketing', 'preferences', 'sale_of_data'];
const off = () => ({ analytics: false, marketing: false, preferences: false, sale_of_data: false });
const valid = choices => choices && keys.every(key => typeof choices[key] === 'boolean' || (key === 'sale_of_data' && choices[key] === undefined));
export function createPrivacyAdapter(host = globalThis, { platform = host.document?.documentElement?.dataset.platform || 'shopify', timeoutMs = 5000 } = {}) {
  let local = off(), loaded;
  const toChoices = input => Object.fromEntries(keys.map(key => [key, input?.[key] === true || input?.[key] === 'yes']));
  async function resolveApi() {
    const current = host.Shopify?.customerPrivacy;
    if (current?.currentVisitorConsent && current?.setTrackingConsent) return current;
    if (!host.Shopify?.loadFeatures) return null;
    if (!loaded) loaded = new Promise(resolve => {
      let finished = false;
      const timer = setTimeout(() => { finished = true; resolve(null); }, timeoutMs);
      try {
        host.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], error => {
          if (finished) return;
          finished = true; clearTimeout(timer);
          resolve(error ? null : host.Shopify?.customerPrivacy || null);
        });
      } catch { finished = true; clearTimeout(timer); resolve(null); }
    });
    return loaded;
  }
  async function read() {
    if (platform === 'local') return { available: true, mode: 'local', choices: { ...local } };
    try {
      const api = await resolveApi();
      if (!api?.currentVisitorConsent || !api?.setTrackingConsent) return { available: false, mode: 'shopify', choices: off() };
      return { available: true, mode: 'shopify', choices: toChoices(api.currentVisitorConsent()) };
    } catch { return { available: false, mode: 'shopify', choices: off() }; }
  }
  async function save(choices) {
    if (!valid(choices)) return { ok: false, error: 'Invalid privacy choices.' };
    const clean = Object.fromEntries(keys.map(key => [key, choices[key] === true]));
    if (platform === 'local') { local = clean; return { ok: true, mode: 'local' }; }
    try {
      const api = await resolveApi();
      if (!api?.setTrackingConsent) return { ok: false, error: 'The platform privacy service is unavailable. Choices have not been saved.' };
      return await new Promise(resolve => {
        let finished = false;
        const timer = setTimeout(() => { finished = true; resolve({ ok: false, error: 'We could not confirm the privacy change. Try again later.' }); }, timeoutMs);
        try {
          api.setTrackingConsent(clean, error => {
            if (finished) return;
            finished = true; clearTimeout(timer);
            resolve(error ? { ok: false, error: 'The platform did not accept the privacy change.' } : { ok: true, mode: 'shopify' });
          });
        } catch { finished = true; clearTimeout(timer); resolve({ ok: false, error: 'The platform did not accept the privacy change.' }); }
      });
    } catch { return { ok: false, error: 'Privacy choices could not be saved.' }; }
  }
  return { read, save };
}

