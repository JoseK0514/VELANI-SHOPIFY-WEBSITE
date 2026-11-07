import { expect, it, vi } from 'vitest';
import { requestEmail, ResendSender, EmailDeliveryError } from '../src/client-hub/email.js';

const input = { type: 'project_support' as const, name: 'Example <Client>', email: 'client@example.com', company: 'Shop & Company', project: 'Our website', description: 'The support form is not responding after submitting.', urgency: 'high' as const, language: 'en' as const };
it('sends the full request to support and directs replies to the client', () => {
  const email = requestEmail(input, 'VEL-2611-0007', 'support');
  expect(email.to).toBe('support@thevelani.com'); expect(email.reply_to).toBe(input.email);
  for (const value of Object.values(input)) expect(email.text).toContain(value);
  expect(email.html).toContain('Example &lt;Client&gt;'); expect(email.html).not.toContain('Example <Client>');
  expect(email.html).toContain('lang="en"'); expect(email.text).toContain('VEL-2611-0007');
});
it.each(['en', 'es'] as const)('acknowledges the reference in %s without promising completed work', language => {
  const email = requestEmail({ ...input, language }, 'VEL-2611-0007', 'confirmation');
  expect(email.to).toBe(input.email); expect(email.reply_to).toBe('support@thevelani.com');
  expect(email.subject).toContain('VEL-2611-0007');
  expect(email.text).toContain(language === 'es' ? 'Hemos recibido' : 'We have received');
  expect(email.html).toContain(`lang="${language}"`);
});
it('uses stable provider idempotency keys and never treats a malformed success as sent', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('{"id":"provider-fixture"}')).mockResolvedValueOnce(new Response('{}'));
  const sender = new ResendSender('fixture-key', fetcher);
  const email = requestEmail(input, 'VEL-2611-0007', 'support');
  expect(await sender.send(email, 'hub-fixture/support')).toBe('provider-fixture');
  expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe('hub-fixture/support');
  await expect(sender.send(email, 'hub-fixture/support')).rejects.toMatchObject({ ambiguous: true });
});
it.each([[429, true], [503, true], [403, false], [422, false]] as const)('classifies HTTP %s without exposing provider details', async (status, retryable) => {
  const sender = new ResendSender('fixture-key', vi.fn(async () => new Response('private provider error', { status })));
  await expect(sender.send(requestEmail(input, 'VEL-2611-0007', 'support'), 'same-key')).rejects.toMatchObject({ retryable });
  await sender.send(requestEmail(input, 'VEL-2611-0007', 'support'), 'same-key').catch(error => { expect(error).toBeInstanceOf(EmailDeliveryError); expect(error.message).not.toContain('private'); });
});
