import { constants } from 'node:fs';
import { lstat, mkdir, open, rename, unlink } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { WatchdogSample } from './rondo-watchdog.js';

const policySchema = z.object({
  id: z.uuid(), scope: z.literal('development'), target: z.literal('velani_rondo_development'),
  approvalReference: z.string().trim().min(1).max(160),
  recipient: z.enum(['support@thevelani.com', 'josekarlo-@hotmail.com']),
  validFrom: z.iso.datetime(), validUntil: z.iso.datetime(),
  mailEnabled: z.boolean(), maxAttempts: z.number().int().min(0).max(100),
}).strict().refine(p => Date.parse(p.validUntil) > Date.parse(p.validFrom)
  && Date.parse(p.validUntil) - Date.parse(p.validFrom) <= 31 * 86_400_000);
export type WatchdogPolicy = z.infer<typeof policySchema>;
const noticeSchema = z.object({
  kind: z.enum(['outage', 'recovery']), id: z.uuid(),
  status: z.enum(['disabled', 'capped', 'sending', 'submitted', 'uncertain']),
  attempted: z.boolean(), providerId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/).optional(),
}).strict();
const stateSchema = z.object({
  version: z.literal(1), policy: policySchema, used: z.number().int().min(0).max(100),
  lastObservedAt: z.number().int().nonnegative(), state: z.enum(['unknown', 'ok', 'attention']),
  incidentId: z.uuid().nullable(), notices: z.array(noticeSchema).max(2),
}).strict().superRefine((state, context) => {
  if (state.used > state.policy.maxAttempts || state.used < state.notices.filter(n => n.attempted).length
    || new Set(state.notices.map(n => n.kind)).size !== state.notices.length
    || state.notices.some(n => n.attempted !== ['sending', 'submitted', 'uncertain'].includes(n.status)
      || (n.status === 'submitted' && !n.providerId))
    || (!state.incidentId && state.notices.length)) context.addIssue({ code: 'custom', message: 'invalid_journal' });
});
type Journal = z.infer<typeof stateSchema>;
type Kind = 'outage' | 'recovery';
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function directory(path: string) {
  if (!isAbsolute(path)) throw Error('watchdog_private_directory_required');
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077)
    || (process.getuid && stat.uid !== process.getuid())) throw Error('watchdog_private_directory_required');
}
async function readState(path: string): Promise<Journal> {
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.nlink !== 1 || stat.size > 32768 || (stat.mode & 0o077)
      || (process.getuid && stat.uid !== process.getuid())) throw Error('invalid_state');
    return stateSchema.parse(JSON.parse(await file.readFile('utf8')));
  } finally { await file.close(); }
}
async function syncDirectory(path: string) { const file = await open(path, constants.O_RDONLY); try { await file.sync(); } finally { await file.close(); } }
async function save(path: string, state: Journal) {
  stateSchema.parse(state);
  const temporary = join(path, '.watchdog-' + randomUUID() + '.tmp');
  const file = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { await file.writeFile(JSON.stringify(state) + '\n'); await file.sync(); }
  finally { await file.close(); }
  try { await rename(temporary, join(path, 'watchdog.json')); await syncDirectory(path); }
  catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
}

/** Explicit one-time initialization; the scheduled observer never recreates a
 * missing journal. Preserve this independent state and backups across releases. */
export async function initializeWatchdog(path: string, input: WatchdogPolicy) {
  const policy = policySchema.parse(input);
  await mkdir(path, { mode: 0o700, recursive: false });
  await directory(path);
  const state: Journal = { version: 1, policy, used: 0, lastObservedAt: 0, state: 'unknown', incidentId: null, notices: [] };
  const file = await open(join(path, 'watchdog.json'), constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { await file.writeFile(JSON.stringify(state) + '\n'); await file.sync(); } finally { await file.close(); }
  await syncDirectory(path);
}

/** Database failures are observed and journaled outside the database. The file
 * lock is never stolen by age/PID; unexplained crash custody needs operator
 * recovery and an independent dead-man alarm. No automatic notification retry. */
export async function observeWatchdog(
  path: string, input: WatchdogPolicy, sourceSha: string,
  sample: () => Promise<WatchdogSample>, notify: (kind: Kind, key: string) => Promise<{ id: string }>,
  options: { now?: () => number; deliveryTimeoutMs?: number } = {},
) {
  const policy = policySchema.parse(input), now = options.now ?? Date.now;
  const timeout = options.deliveryTimeoutMs ?? 5000;
  if (!/^[a-f0-9]{40}$/.test(sourceSha) || !Number.isInteger(timeout) || timeout < 10 || timeout > 5000) throw Error('watchdog_configuration_invalid');
  await directory(path);
  const lock = await open(join(path, 'watchdog.lock'), constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  let observation: WatchdogSample;
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, sourceSha }) + '\n'); await lock.sync(); await syncDirectory(path);
    const state = await readState(join(path, 'watchdog.json'));
    if (!same(state.policy, policy)) throw Error('watchdog_policy_changed');
    try { observation = await sample(); }
    catch { observation = { status: 'unavailable', alerts: ['watchdog_probe_unavailable'] }; }
    if (!['ok', 'attention', 'unavailable'].includes(observation.status)) throw Error('watchdog_invalid_observation');
    const observedAt = now();
    if (!Number.isSafeInteger(observedAt) || observedAt < state.lastObservedAt) throw Error('watchdog_clock_reversed');
    const active = observedAt >= Date.parse(policy.validFrom) && observedAt < Date.parse(policy.validUntil);
    const next = observation.status === 'ok' ? 'ok' : 'attention';
    if (next === 'attention' && state.state !== 'attention') { state.incidentId = randomUUID(); state.notices = []; }
    state.state = next; state.lastObservedAt = observedAt;
    const kind: Kind = next === 'attention' ? 'outage' : 'recovery';
    let notice = state.notices.find(n => n.kind === kind), claimed = false;
    const outageAttempted = kind === 'outage' || state.notices.some(n => n.kind === 'outage' && n.attempted);
    if (state.incidentId && !notice) {
      notice = { id: randomUUID(), kind, status: 'disabled', attempted: false }; state.notices.push(notice);
    }
    if (notice && !notice.attempted && active && policy.mailEnabled && outageAttempted) {
      if (state.used >= policy.maxAttempts) notice.status = 'capped';
      else { notice.status = 'sending'; notice.attempted = true; state.used++; claimed = true; }
    }
    // Commit/fsync the intent before making any external request.
    await save(path, state);
    if (claimed && notice) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        if (now() >= Date.parse(policy.validUntil)) throw Error('approval_expired');
        const response = await Promise.race([notify(kind, 'rondo-watchdog/' + policy.id + '/' + notice.id),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error('delivery_unknown')), timeout); })]);
        if (!/^[a-zA-Z0-9_-]{1,200}$/.test(response.id)) throw Error('delivery_unknown');
        notice.status = 'submitted'; notice.providerId = response.id;
      } catch { notice.status = 'uncertain'; }
      finally { if (timer) clearTimeout(timer); }
      await save(path, state);
    }
    return { status: observation.status, notice: notice?.status === 'sending' ? 'uncertain' : notice?.status ?? 'none',
      attemptsUsed: state.used, approvalActive: active, sourceSha,
      deliveryStatus: !active ? 'approval_inactive' : !policy.mailEnabled ? 'disabled'
        : state.used >= policy.maxAttempts ? 'capped' : 'armed' };
  } finally {
    await lock.close();
    await unlink(join(path, 'watchdog.lock'));
    await syncDirectory(path);
  }
}
