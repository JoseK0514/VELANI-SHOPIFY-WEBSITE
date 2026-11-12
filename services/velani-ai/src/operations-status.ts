import type { Pool } from 'pg';
import { readBudgetStatus } from './ai-budget.js';

/** Read-only combined check for an external operator/monitor. It never grants or
 * spends an allowance, purges data, sends an alert, or treats an operator run as
 * evidence that a scheduler executed. */
export async function readRondoOperationsStatus(pool: Pool, authorizationId?: string) {
  const [retention, budget] = await Promise.all([
    readOperationsStatus(pool), readBudgetStatus(pool, authorizationId),
  ]);
  const alerts = [...retention.alerts];
  if (budget.status !== 'ok') alerts.push('ai_budget_' + budget.status);
  return { ...retention, status: alerts.length ? 'attention' : 'ok', alerts, budget };
}

/** Aggregate-only operator check. A manual run never satisfies scheduler freshness. */
export async function readOperationsStatus(pool: Pool) {
  const result = await pool.query<{
    scheduled_completed_at: Date | null; scheduled_fresh: boolean;
    overdue_sessions: string; overdue_leads: string;
    published_documents: string; expired_documents: string; expiring_documents: string;
    earliest_knowledge_expiry: Date | null;
  }>(`SELECT
    (SELECT completed_at FROM retention_heartbeats WHERE trigger_source = 'scheduler') AS scheduled_completed_at,
    COALESCE((SELECT completed_at BETWEEN clock_timestamp() - interval '26 hours' AND clock_timestamp()
      FROM retention_heartbeats WHERE trigger_source = 'scheduler'), false) AS scheduled_fresh,
    (SELECT count(*) FROM sessions WHERE expires_at < clock_timestamp() - interval '26 hours'
      OR created_at < clock_timestamp() - interval '30 days') AS overdue_sessions,
    (SELECT count(*) FROM leads WHERE created_at < clock_timestamp() - interval '90 days') AS overdue_leads,
    (SELECT count(*) FROM knowledge_documents WHERE status = 'published') AS published_documents,
    (SELECT count(*) FROM knowledge_documents WHERE status = 'published' AND valid_until <= clock_timestamp()) AS expired_documents,
    (SELECT count(*) FROM knowledge_documents WHERE status = 'published' AND valid_until > clock_timestamp()
      AND valid_until <= clock_timestamp() + interval '7 days') AS expiring_documents,
    (SELECT min(valid_until) FROM knowledge_documents WHERE status = 'published') AS earliest_knowledge_expiry`);
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
