import { expect, it, vi } from 'vitest';
import { VelaniAssistant } from '../integration/velani-assistant.js';

function client(locale, status, code) {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: 'isolated-session', sessionToken: 'fixture-token', expiresAt: new Date(Date.now() + 60_000).toISOString() })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code } }), { status }));
  return { assistant: new VelaniAssistant({ apiBaseUrl: 'https://example.test', locale, fetch }), fetch };
}
it.each(['en', 'es'])('offers editing instead of resending a provider-rejected question in %s', async locale => {
  const { assistant, fetch } = client(locale, 503, 'provider_request_rejected');
  await expect(assistant.chat('Synthetic rejected question')).rejects.toMatchObject({ code: 'rejected', retryable: false, message: expect.stringContaining(locale === 'en' ? 'Edit' : 'Edítala') });
  await expect(assistant.retryLastRequest()).rejects.toMatchObject({ code: 'retry' });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(assistant.failedRequest?.retryable).toBe(false);
});
it.each(['en', 'es'])('explains a turn already in progress in %s and preserves its retry ID', async locale => {
  const { assistant, fetch } = client(locale, 409, 'turn_in_progress');
  await expect(assistant.chat('Synthetic pending question')).rejects.toMatchObject({ code: 'inprogress', retryable: true, message: expect.stringContaining(locale === 'en' ? 'previous' : 'anterior') });
  const failed = assistant.failedRequest;
  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Synthetic answer', sources: [], action: 'none' })));
  await expect(assistant.retryLastRequest()).resolves.toMatchObject({ message: 'Synthetic answer' });
  const retriedBody = JSON.parse(fetch.mock.calls[2][1].body);
  expect(retriedBody.requestId).toBe(failed.requestId);
  expect(assistant.failedRequest).toBeNull();
});
