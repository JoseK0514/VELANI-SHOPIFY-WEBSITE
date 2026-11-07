export interface ClientRequest {
  type: 'new_work' | 'project_support'; name: string; email: string; company: string;
  project: string; description: string; urgency: 'normal' | 'high' | 'urgent' | null; language: 'en' | 'es';
}
export interface Receipt { id: string; reference: string; requestHash: string }
export type Acceptance = { kind: 'created' | 'replay'; receipt: Receipt } | { kind: 'conflict' } | { kind: 'limited' };
export interface TransactionalEmail { from: string; to: string; reply_to: string; subject: string; text: string; html: string }
export interface DeliveryClaim { id: string; requestId: string; reference: string; kind: 'support' | 'confirmation'; leaseToken: string; email: TransactionalEmail }
export interface DeliveryFailure { code: string; retryable: boolean; ambiguous: boolean }
export interface HubRepository {
  find(keyHash: string): Promise<Receipt | null>;
  accept(input: ClientRequest, keyHash: string, requestHash: string, emailQuotaKey: string): Promise<Acceptance>;
  consumeLimit(key: string, limit: number, seconds: number): Promise<boolean>;
  confirmationState(requestId: string): Promise<'submitted' | 'pending'>;
  claimDelivery(requestId?: string): Promise<DeliveryClaim | null>;
  completeDelivery(id: string, leaseToken: string, providerId: string): Promise<void>;
  failDelivery(id: string, leaseToken: string, failure: DeliveryFailure): Promise<void>;
  hasPendingDeliveries(requestId: string): Promise<boolean>;
  pendingKeys(): Promise<string[]>;
  purge(): Promise<{ requests: number; quotaKeys: number }>;
  close(): Promise<void>;
}
