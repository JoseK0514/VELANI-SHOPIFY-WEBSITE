import type { Pool } from 'pg';
import { readBudgetStatus } from './ai-budget.js';

/** Read-only combined check for an external operator/monitor. It never grants or
 * spends an allowance, purges data, sends an alert, or treats an operator run as
 * evidence that a scheduler executed. */
export async function readRondoOperationsStatus(pool: Pick<Pool, 'query'>, authorizationId?: string) {
  const [retention, budget] = await Promise.all([
    readOperationsStatus(pool), readBudgetStatus(pool, authorizationId),
  ]);
  const alerts = [...retention.alerts];
  if (budget.status !== 'ok') alerts.push('ai_budget_' + budget.status);
  return { ...retention, status: alerts.length ? 'attention' : 'ok', alerts, budget };
}

/** Aggregate-only operator check. A manual run never satisfies scheduler freshness. */
export async function readOperationsStatus(pool: Pick<Pool, 'query'>) {
  const result = await pool.query<{
    scheduled_completed_at: Date | null; scheduled_fresh: boolean;
    overdue_sessions: string; overdue_leads: string;
    published_documents: string; expired_documents: string; expiring_documents: string;
    earliest_knowledge_expiry: Date | null;
  }>('SELECT * FROM rondo_retention_status');
  const row = result.rows[0]!;
  const alerts: string[] = [];
  if (!row.scheduled_fresh) alerts.push(row.scheduled_completed_at ? 'retention_scheduler_stale' : 'retention_scheduler_unobserved');
  if (Number(row.overdue_sessions)) alerts.push('conversation_retention_overdue');
  if (Number(row.overdue_leads)) alerts.push('lead_retention_overdue');
  if (!Number(row.published_documents)) alerts.push('knowledge_missing');
  if (Number(row.expired_documents)) alerts.push('knowledge_expired');
  if (Number(row.expiring_documents)) alerts.push('knowledge_review_due');
  return {
    status: alerts.length ? 'attention' : 'ok', alerts,
    scheduledCompletedAt: row.scheduled_completed_at?.toISOString() ?? null,
    overdueSessions: Number(row.overdue_sessions), overdueLeads: Number(row.overdue_leads),
    publishedDocuments: Number(row.published_documents), expiredDocuments: Number(row.expired_documents),
    expiringDocuments: Number(row.expiring_documents),
    earliestKnowledgeExpiry: row.earliest_knowledge_expiry?.toISOString() ?? null,
  };
}
