import type { BusinessProfile, PlanRecord } from './experience-types.js';
export type Locale = 'en' | 'es';
export interface Source { id: string; title: string; url: string }
export interface KnowledgeDocument extends Source {
  content: string; locale: Locale; reviewedAt: string; validUntil: string; isCore?: boolean;
}
export interface Message { role: 'user' | 'assistant'; content: string }
export interface Answer {
  message: string;
  sources: Source[];
  action: 'none' | 'show_demo' | 'lead_form' | 'human_help';
  confidence: 'grounded' | 'needs_human';
  model: string;
}
export interface Session { id: string; locale: Locale; expiresAt: Date }
export interface LeadInput {
  name: string; email: string; company?: string; teamSize?: string;
  locations?: string; message?: string; consent: true; consentVersion: 'lead-v1';
  planSnapshot?: PlanRecord;
}
export type TurnClaim = { state: 'new'; leaseToken: string } | { state: 'completed'; answer: Answer }
  | { state: 'busy' } | { state: 'conflict' };
export interface Repository {
  ping(): Promise<void>;
  createSession(tokenHash: string, locale: Locale, expiresAt: Date): Promise<Session>;
  findSession(tokenHash: string): Promise<Session | null>;
  history(sessionId: string, limit: number): Promise<Message[]>;
  knowledge(query: string, locale: Locale): Promise<KnowledgeDocument[]>;
  claimTurn(sessionId: string, requestId: string, requestHash: string): Promise<TurnClaim>;
  completeTurn(sessionId: string, requestId: string, userMessage: string, answer: Answer, leaseToken: string): Promise<void>;
  failTurn(sessionId: string, requestId: string, leaseToken: string): Promise<void>;
  consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  saveLead(sessionId: string, requestId: string, requestHash: string, input: LeadInput): Promise<{ id: string; duplicate: boolean } | 'conflict'>;
  findLeadRequest?(sessionId: string, requestId: string, requestHash: string): Promise<{ id: string; duplicate: true } | 'conflict' | null>;
  deleteSession(sessionId: string): Promise<void>;
  close(): Promise<void>;
}
export interface AnswerEngine {
  answer(input: { message: string; locale: Locale; history: Message[]; knowledge: KnowledgeDocument[]; profile?: BusinessProfile; plan?: PlanRecord }): Promise<Answer>;
}
