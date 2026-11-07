import {QueueClient} from '@vercel/queue';

export const hubQueue=new QueueClient({region:'iad1'});
export async function publishHubWakeup(keyHash:string):Promise<void>{
  if(!/^[a-f0-9]{64}$/.test(keyHash))throw Error('Invalid wake-up key.');
  // No publish deduplication: a previously rejected form may be accepted later.
  // Leased immutable outbox jobs provide processing/sending idempotency instead.
  const result=await hubQueue.send('velani-client-requests',{keyHash},{retentionSeconds:86400});
  if(!result.messageId)throw Error('Durable queue handoff is not yet confirmed.');
}
