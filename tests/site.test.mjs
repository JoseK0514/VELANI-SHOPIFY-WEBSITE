import test from 'node:test';
import assert from 'node:assert/strict';
import { routes, company } from '../src/content.mjs';
import { renderPage, escapeHtml } from '../src/render.mjs';

test('both business paths and every required company/legal destination exist', () => {
  for (const path of ['/', '/pages/nevora', '/pages/custom-development', '/pages/about', '/pages/contact', '/pages/help', '/pages/plans', '/pages/legal', '/pages/privacy', '/pages/cookies', '/pages/website-terms', '/pages/software-project-terms', '/pages/accessibility', '/pages/security']) assert.ok(routes[path], path);
  assert.equal(company.name, 'Velani');
  assert.equal(company.operator, 'VELANI LLC');
  assert.equal(company.email, 'support@thevelani.com');
});
test('unknown routes have a real missing-resource result', () => {
  assert.equal(renderPage('/missing-private-page', { target: 'preview' }).status, 404);
  assert.equal(renderPage('/pages/contact', { target: 'preview' }).status, 200);
});
test('all public routes have a document title, one main, one h1 and working legal navigation', () => {
  for (const path of Object.keys(routes)) {
    const { html, status } = renderPage(path, { target: 'preview' });
    assert.equal(status, 200, path);
    assert.match(html, /<title>[^<]+<\/title>/, path);
    assert.equal((html.match(/<main\b/g) || []).length, 1, path);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    for (const key of ['privacy', 'cookies', 'website-terms', 'accessibility']) assert.ok(html.includes('/pages/' + key), path + ':' + key);
    assert.doesNotMatch(html, /Fuel Coffee Drive|Coffee Bags|Sample Product|CONFIRM_|\[LEGAL_COMPANY_NAME\]/, path);
  }
});
test('product pages state availability without a checkout claim', () => {
  for (const path of ['/', '/pages/nevora']) {
    const { html } = renderPage(path, { target: 'preview' });
    assert.match(html, /Available now/);
    assert.doesNotMatch(html, /href=["'][^"']*(?:\/cart|\/checkout|\/account\/register)/);
  }
});
test('preview inquiry cannot point at the real contact transport', () => {
  const { html } = renderPage('/pages/contact', { target: 'preview' });
  assert.match(html, /preview/i);
  assert.match(html, /data-inquiry-mode="preview"/);
  assert.doesNotMatch(html, /action=["']\/contact(?:["'#?])/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /type=["']file["']/);
});
test('untrusted strings are encoded as text, including attribute-breaking input', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)"> & \'text\''), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;text&#39;');
});
test('local previews do not advertise themselves as public indexed pages', () => {
  const { html } = renderPage('/', { target: 'preview' });
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /application\/ld\+json[^]*AggregateRating/);
});
test('NEVORA policy pages are public and published pages carry no preview wording', () => {
  for (const path of ['/pages/nevora-support', '/pages/nevora-privacy', '/pages/nevora-terms', '/pages/nevora-account-deletion']) assert.ok(routes[path], path);
  for (const path of Object.keys(routes)) {
    if (path === '/pages/contact') continue;
    const { html } = renderPage(path, { target: 'preview' });
    const text = html.replace(/<script[^]*?<\/script>|<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /\bpreview\b|\bdraft\b|unpublished|must (?:be )?verif/i, path);
    assert.doesNotMatch(html, /Prototype|proto-toast/, path);
  }
});
test('NEVORA payroll is described as calculation, never payment or tax filing', () => {
  const { html } = renderPage('/pages/nevora', { target: 'preview' });
  assert.match(html, /calculates payroll/);
  assert.doesNotMatch(html, /NEVORA (?:pays|runs payroll|files)/);
});
