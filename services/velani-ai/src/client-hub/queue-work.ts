import type {HubRepository} from './types.js';
import type {EmailSender} from './email.js';
import {dispatchClientHubEmails} from './delivery.js';

/** A queue contains only an opaque key hash. Customer fields stay in Velani DB. */
export async function processHubWakeup(repository:HubRepository,sender:EmailSender,message:unknown,createdAt:Date,now=Date.now()):Promise<void>{
  if(!message||typeof message!=='object'||Array.isArray(message)||Object.keys(message).length!==1||!('keyHash' in message)||typeof message.keyHash!=='string'||!/^[a-f0-9]{64}$/.test(message.keyHash)||!Number.isFinite(createdAt.getTime()))throw Error('Invalid client hub wake-up.');
  const receipt=await repository.find(message.keyHash);
  if(!receipt){
    if(now-createdAt.getTime()<300000)throw Error('Client request has not committed yet.');
    return; // An uncommitted/rejected submission has no customer notification.
  }
  await dispatchClientHubEmails(repository,sender,{requestId:receipt.id,maximum:2});
  if(await repository.hasPendingDeliveries(receipt.id))throw Error('Client hub delivery remains pending.');
}
