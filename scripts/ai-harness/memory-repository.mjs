// In-memory implementation of the backend's Repository interface, for local widget testing only.
// Mirrors the Postgres rules that matter to the client: hashed sessions, idempotent turns with a
// lease, one pending turn per session, rate-limit windows and idempotent leads. Nothing persists.
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function memoryRepository(knowledgePath) {
  const docs = JSON.parse(readFileSync(knowledgePath, 'utf8'))
    .map(d => ({ ...d, reviewedAt: String(d.reviewedAt).slice(0, 10), validUntil: String(d.validUntil).slice(0, 10) }));
  const sessions = new Map(); // tokenHash -> session
  const turns = new Map();    // sessionId -> Map(requestId -> turn)
  const messages = new Map(); // sessionId -> [{role, content}]
  const leads = new Map();    // sessionId:requestId -> {hash, id}
  const limits = new Map();   // key -> {hits, expires}
  const pending = id => [...(turns.get(id)?.values() ?? [])].some(t => t.status === 'pending' && t.leaseExpires > Date.now());
  return {
    docs, sessions, leads, messages,
    async ping() {},
    async createSession(tokenHash, locale, expiresAt) { const s = { id: randomUUID(), locale, expiresAt }; sessions.set(tokenHash, s); return s; },
    async findSession(tokenHash) { return sessions.get(tokenHash) ?? null; },
    async history(sessionId, limit) { return (messages.get(sessionId) ?? []).slice(-limit); },
    async knowledge(_query, locale) {
      return [...docs].sort((a, b) => Number(Boolean(b.isCore)) - Number(Boolean(a.isCore)) || Number(b.locale === locale) - Number(a.locale === locale) || a.id.localeCompare(b.id));
    },
    async claimTurn(sessionId, requestId, requestHash) {
      const t = turns.get(sessionId) ?? new Map(); turns.set(sessionId, t);
      const prior = t.get(requestId);
      if (prior) {
        if (prior.hash !== requestHash) return { state: 'conflict' };
        if (prior.status === 'completed') return { state: 'completed', answer: prior.answer };
        if (prior.status === 'pending' && prior.leaseExpires > Date.now()) return { state: 'busy' };
      }
      if (pending(sessionId)) return { state: 'busy' };
      const leaseToken = randomUUID();
      t.set(requestId, { hash: requestHash, status: 'pending', leaseToken, leaseExpires: Date.now() + 90_000 });
      return { state: 'new', leaseToken };
    },
    async completeTurn(sessionId, requestId, userMessage, answer, leaseToken) {
      const t = turns.get(sessionId)?.get(requestId);
      if (!t || t.leaseToken !== leaseToken) throw new Error('stale turn');
      t.status = 'completed'; t.answer = answer;
      const m = messages.get(sessionId) ?? []; m.push({ role: 'user', content: userMessage }, { role: 'assistant', content: answer.message }); messages.set(sessionId, m);
    },
    async failTurn(sessionId, requestId, leaseToken) { const t = turns.get(sessionId)?.get(requestId); if (t && t.leaseToken === leaseToken) t.status = 'failed'; },
    async consumeRateLimit(key, limit, windowSeconds) {
      const now = Date.now(); const e = limits.get(key);
      if (!e || e.expires <= now) { limits.set(key, { hits: 1, expires: now + windowSeconds * 1000 }); return true; }
      if (e.hits >= limit) return false; e.hits += 1; return true;
    },
    async saveLead(sessionId, requestId, requestHash) {
      const key = sessionId + ':' + requestId; const prior = leads.get(key);
      if (prior) return prior.hash === requestHash ? { id: prior.id, duplicate: true } : 'conflict';
      const record = { hash: requestHash, id: randomUUID() }; leads.set(key, record); return { id: record.id, duplicate: false };
    },
    async findLeadRequest(sessionId, requestId, requestHash) {
      const prior = leads.get(sessionId + ':' + requestId); if (!prior) return null;
      return prior.hash === requestHash ? { id: prior.id, duplicate: true } : 'conflict';
    },
    async deleteSession(sessionId) {
      for (const [hash, s] of sessions) if (s.id === sessionId) sessions.delete(hash);
      turns.delete(sessionId); messages.delete(sessionId);
    },
    async close() {},
  };
}
