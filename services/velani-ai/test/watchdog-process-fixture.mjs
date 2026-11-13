import { observeWatchdog } from '../src/watchdog-journal.ts';
const [directory, policyText, timestamp, status, endpoint, source] = process.argv.slice(2);
const url = new URL(endpoint);
if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') throw Error('Local synthetic fixture only');
const result = await observeWatchdog(directory, JSON.parse(policyText), source,
  async () => ({ status, alerts: [] }),
  async kind => {
    const response = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(1000), body: JSON.stringify({ kind }) });
    return await response.json();
  }, { now: () => Number(timestamp) });
console.log(JSON.stringify(result));
