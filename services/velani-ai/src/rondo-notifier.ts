type Env = Readonly<Record<string, string | undefined>>;
export function createRondoNotifier(env: Env, fetcher: typeof fetch = fetch) {
  const enabled = env.RONDO_ALERT_MAIL_ENABLED === 'true';
  const recipient = env.RONDO_ALERT_RECIPIENT?.trim().toLowerCase();
  if (enabled && (!env.RONDO_ALERT_API_KEY?.trim() || !env.RONDO_ALERT_APPROVAL_REF?.trim()
    || !['support@thevelani.com','josekarlo-@hotmail.com'].includes(recipient ?? ''))) throw Error('rondo_alert_configuration_invalid');
  return async (kind: 'outage' | 'recovery', key: string): Promise<{ id: string }> => {
    if (!enabled || !/^[a-zA-Z0-9_/-]{1,200}$/.test(key)) throw Error('rondo_alert_disabled');
    const recovery = kind === 'recovery';
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5000),
      headers: { Authorization: 'Bearer ' + env.RONDO_ALERT_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({
        from: 'Velani operations <requests@thevelani.com>', to: [recipient],
        subject: '[Development] Rondo operations: ' + (recovery ? 'recovered' : 'attention required'),
        text: recovery ? 'Rondo development operations have recovered. Review SCRUM-155 and the saved aggregate operations receipt.'
          : 'Rondo development operations require attention. Review SCRUM-155 and the saved aggregate operations receipt.',
      }),
    });
    if (!response.ok) throw Error('rondo_alert_outcome_unknown');
    const result = await response.json() as { id?: unknown };
    if (typeof result.id !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(result.id)) throw Error('rondo_alert_outcome_unknown');
    return { id: result.id };
  };
}
