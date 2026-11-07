import { EmailDeliveryError, type EmailSender } from './email.js';
import type { HubRepository } from './types.js';

export async function dispatchClientHubEmails(repository: HubRepository, sender: EmailSender, options: {
  requestId?: string; maximum: number; pause?: () => Promise<void>;
}): Promise<{ submitted: number; failed: number }> {
  const counts = { submitted: 0, failed: 0 };
  for (let index = 0; index < options.maximum; index++) {
    const claim = await repository.claimDelivery(options.requestId);
    if (!claim) break;
    let providerId: string | undefined;
    let failure: EmailDeliveryError | undefined;
    let ambiguous=false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try { providerId = await sender.send(claim.email, `velani-client-hub/${claim.id}`); break; }
      catch (error) {
        failure = error instanceof EmailDeliveryError ? error : new EmailDeliveryError('submission_unconfirmed', true, true);
        ambiguous ||= failure.ambiguous;
        if (!failure.retryable || attempt === 1) break;
        await (options.pause ?? (() => new Promise(resolve => setTimeout(resolve, 500))))();
      }
    }
    if (providerId) {
      // If this write fails, leave the lease for recovery using the same immutable
      // email and provider key. Do not reinterpret an accepted send as a failure.
      await repository.completeDelivery(claim.id, claim.leaseToken, providerId);
      counts.submitted++;
    } else {
      await repository.failDelivery(claim.id, claim.leaseToken, {code:failure!.code,retryable:failure!.retryable,ambiguous});
      counts.failed++;
    }
  }
  return counts;
}
