import { expect, it } from 'vitest';
import { parseClientHubRequest, ClientHubValidationError } from '../src/client-hub/validation.js';

const key = 'b740ac04-6509-4118-a9aa-28671121ec93';
const valid = { type: 'new_work', name: ' Example Client ', email: ' CLIENT@example.com ', company: '', description: 'Please build a website for our company.', language: 'en', turnstileToken: 'test-token' };
it('normalizes both types and separates verification from stored business fields', () => {
  expect(parseClientHubRequest(valid, key)).toEqual({ key, turnstileToken: 'test-token', input: { type: 'new_work', name: 'Example Client', email: 'client@example.com', company: '', project: '', description: valid.description, language: 'en', urgency: null } });
  expect(parseClientHubRequest({ ...valid, type: 'project_support', project: 'Our shop', language: 'es' }, key).input).toMatchObject({ language: 'es', urgency: 'normal', project: 'Our shop' });
});
it.each([
  [{ ...valid, email: 'bad', name: '' }, key, ['email', 'name']],
  [{ ...valid, type: 'project_support' }, key, ['project']],
  [{ ...valid, urgency: 'urgent' }, key, ['urgency']],
  [{ ...valid, description: 'short' }, key, ['description']],
  [{ ...valid, name: 'Header\r\nInjected: bad' }, key, ['name']],
  [{ ...valid, password: 'never-store-this' }, key, ['_form']],
  [{ ...valid, turnstileToken: '' }, key, ['turnstileToken']],
  [valid, 'not-a-uuid', ['idempotencyKey']],
  [null, key, ['_form']],
])('returns per-field codes without echoing invalid values', (body, header, fields) => {
  try { parseClientHubRequest(body, header); throw new Error('Expected validation failure'); }
  catch (error) {
    expect(error).toBeInstanceOf(ClientHubValidationError);
    expect(Object.keys((error as ClientHubValidationError).fields)).toEqual(expect.arrayContaining(fields));
    expect(JSON.stringify(error)).not.toContain('never-store-this');
  }
});
it.each(['\u0085','\u2028','\u2029','\u0000'])('rejects a Unicode/control line break in names: %s', separator => {
  expect(()=>parseClientHubRequest({...valid,name:`First${separator}Second`},key)).toThrow(ClientHubValidationError);
});
it('reports required enum fields and missing support project alongside independent errors',()=> {
  try {parseClientHubRequest({...valid,type:'project_support',language:undefined},key);throw Error('Expected failure');}
  catch(error){expect((error as ClientHubValidationError).fields).toMatchObject({project:['required'],language:['required']});}
  try {parseClientHubRequest({...valid,type:undefined},key);throw Error('Expected failure');}
  catch(error){expect((error as ClientHubValidationError).fields.type).toEqual(['required']);}
});
