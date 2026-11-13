import { afterEach, expect, it, vi } from 'vitest';
import { watchdogHostSettings, watchdogHostTick } from '../scripts/watchdog-host.js';

const now = Date.parse('2026-11-13T14:00:00Z');
const environment = () => ({
  RONDO_WATCHDOG_ENABLED: 'true', RONDO_WATCHDOG_SOURCE_SHA: 'a'.repeat(40),
  RENDER_GIT_COMMIT: 'a'.repeat(40),
  RONDO_WATCHDOG_HEARTBEAT_URL: 'https://hc-ping.com/00000000-0000-4000-8000-000000000001',
  RONDO_WATCHDOG_HEARTBEAT_UNTIL: '2026-11-14T14:00:00.000Z',
  RONDO_WATCHDOG_HEARTBEAT_APPROVAL: 'fictional finite test approval',
});
afterEach(() => vi.useRealTimers());

it('starts disabled without opening a database or contacting a receiver', async () => {
  const observe = vi.fn(), fetcher = vi.fn();
  expect(watchdogHostSettings({})).toEqual({ enabled: false });
  expect(await watchdogHostTick({ enabled: false }, observe, fetcher)).toEqual({ status: 'disabled' });
  expect(observe).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
});

it('requires exact source, a finite live approval and only a private canonical ping URL', () => {
  for (const over of [
    { RENDER_GIT_COMMIT: 'b'.repeat(40) }, { RONDO_WATCHDOG_ENABLED: 'yes' },
    { RONDO_WATCHDOG_HEARTBEAT_URL: 'https://hc-ping.com/00000000-0000-4000-8000-000000000001?secret=x' },
    { RONDO_WATCHDOG_HEARTBEAT_URL: 'https://example.invalid/' },
    { RONDO_WATCHDOG_HEARTBEAT_APPROVAL: '' },
    { RONDO_WATCHDOG_HEARTBEAT_UNTIL: '2026-11-13T13:59:00Z' },
    { RONDO_WATCHDOG_HEARTBEAT_UNTIL: '2027-11-13T14:00:00Z' },
  ]) expect(() => watchdogHostSettings({ ...environment(), ...over }, now)).toThrow();
});

it('sends an empty bounded success only after a healthy armed observation', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  const result = await watchdogHostTick(watchdogHostSettings(environment(), now), async () => ({ status: 'ok', deliveryStatus: 'armed' }), fetcher, () => now);
  expect(result).toEqual({ status: 'ok' });
  expect(fetcher).toHaveBeenCalledWith(environment().RONDO_WATCHDOG_HEARTBEAT_URL,
    expect.objectContaining({ method: 'POST', redirect: 'error', credentials: 'omit', body: '', signal: expect.any(AbortSignal) }));
});

it('reports unhealthy and unarmed observations as failures, never healthy coverage', async () => {
  for (const result of [{ status: 'attention', deliveryStatus: 'armed' }, { status: 'ok', deliveryStatus: 'disabled' }]) {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    expect(await watchdogHostTick(watchdogHostSettings(environment(), now), async () => result, fetcher, () => now)).toEqual({ status: 'attention' });
    expect(fetcher.mock.calls[0][0]).toBe(environment().RONDO_WATCHDOG_HEARTBEAT_URL + '/fail');
  }
});

it('closes without another observation or ping once finite approval expires', async () => {
  const observe = vi.fn(), fetcher = vi.fn();
  expect(await watchdogHostTick(watchdogHostSettings(environment(), now), observe, fetcher, () => now + 86_400_000)).toEqual({ status: 'expired' });
  expect(observe).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
});

it('bounds a hung observation and fails closed without swallowing the error', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  const tick = watchdogHostTick(watchdogHostSettings(environment(), now), () => new Promise(() => {}), fetcher, () => now);
  const assertion = expect(tick).rejects.toThrow('watchdog_observation_unavailable');
  await Promise.all([assertion, vi.advanceTimersByTimeAsync(30_000)]);
  expect(fetcher.mock.calls[0][0]).toBe(environment().RONDO_WATCHDOG_HEARTBEAT_URL + '/fail');
});

it('does not leak receiver URLs/errors or count an HTTP response as alert delivery', async () => {
  const settings = watchdogHostSettings(environment(), now);
  for (const fetcher of [vi.fn().mockRejectedValue(Error('private-check-secret')), vi.fn().mockResolvedValue(new Response(null, { status: 503 }))]) {
    await expect(watchdogHostTick(settings, async () => ({ status: 'ok', deliveryStatus: 'armed' }), fetcher, () => now)).rejects.toThrow(/^watchdog_heartbeat_unavailable$/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
});

it('bounds a hung heartbeat and never retries an unknown outcome', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn(() => new Promise<Response>(() => {}));
  const tick = watchdogHostTick(watchdogHostSettings(environment(), now), async () => ({ status: 'ok', deliveryStatus: 'armed' }), fetcher, () => now);
  const assertion = expect(tick).rejects.toThrow('watchdog_heartbeat_unavailable');
  await Promise.all([assertion, vi.advanceTimersByTimeAsync(2000)]);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('still terminates a timed-out observation when approval expires in flight', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn();
  let current = now;
  const tick = watchdogHostTick(watchdogHostSettings(environment(), now), () => new Promise(() => {}), fetcher, () => current);
  current = now + 86_400_000;
  const assertion = expect(tick).rejects.toThrow('watchdog_observation_unavailable');
  await Promise.all([assertion, vi.advanceTimersByTimeAsync(30_000)]);
  expect(fetcher).not.toHaveBeenCalled();
});
