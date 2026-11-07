import { expect, it, vi } from 'vitest';
import { dispatchClientHubEmails } from '../src/client-hub/delivery.js';
import { EmailDeliveryError, type EmailSender } from '../src/client-hub/email.js';
import type { HubRepository } from '../src/client-hub/types.js';

const email = { from:'Velani <requests@thevelani.com>',to:'client@example.com',reply_to:'support@thevelani.com',subject:'Synthetic reference',text:'Synthetic',html:'<p>Synthetic</p>' };
function setup() {
  const claims = ['support','confirmation'].map(kind => ({ id:kind,requestId:'fixture-request',reference:'VEL-2611-0007',kind,leaseToken:`lease-${kind}`,email }));
  const repository = { claimDelivery:vi.fn(async () => claims.shift() ?? null),completeDelivery:vi.fn(),failDelivery:vi.fn() };
  return { repository,repo:repository as unknown as HubRepository };
}
it('submits both jobs with stable separate keys and records provider acceptance', async () => {
  const {repository,repo}=setup(); const sender={send:vi.fn<EmailSender['send']>(async()=> 'provider-id')};
  expect(await dispatchClientHubEmails(repo,sender,{requestId:'fixture-request',maximum:2})).toEqual({submitted:2,failed:0});
  expect(sender.send.mock.calls.map(call=>call[1])).toEqual(['velani-client-hub/support','velani-client-hub/confirmation']);
  expect(repository.completeDelivery).toHaveBeenCalledWith('confirmation','lease-confirmation','provider-id');
});
it('keeps partial failure independent and retries a transient call with exactly the same key and payload', async () => {
  const {repository,repo}=setup(); const sender={send:vi.fn().mockRejectedValueOnce(new EmailDeliveryError('provider_503',true,true)).mockResolvedValueOnce('support-id').mockRejectedValueOnce(new EmailDeliveryError('provider_403',false,false))};
  expect(await dispatchClientHubEmails(repo,sender,{maximum:2,pause:async()=>undefined})).toEqual({submitted:1,failed:1});
  expect(sender.send.mock.calls[0]).toEqual(sender.send.mock.calls[1]);
  expect(repository.failDelivery).toHaveBeenCalledWith('confirmation','lease-confirmation',expect.objectContaining({code:'provider_403',retryable:false}));
});
it('leaves an unacknowledged accepted send for lease recovery instead of marking it as a confirmed failure', async () => {
  const {repository,repo}=setup(); repository.completeDelivery.mockRejectedValueOnce(new Error('database connection lost'));
  const sender={send:vi.fn(async()=> 'provider-id')};
  await expect(dispatchClientHubEmails(repo,sender,{maximum:1})).rejects.toThrow('database connection lost');
  expect(repository.failDelivery).not.toHaveBeenCalled();
});
it('preserves uncertainty when a timeout is followed by a definite rejection',async()=>{
  const {repository,repo}=setup();const sender={send:vi.fn().mockRejectedValueOnce(new EmailDeliveryError('network_unconfirmed',true,true)).mockRejectedValueOnce(new EmailDeliveryError('provider_429',true,false))};
  await dispatchClientHubEmails(repo,sender,{maximum:1,pause:async()=>undefined});
  expect(repository.failDelivery).toHaveBeenCalledWith('support','lease-support',{code:'provider_429',retryable:true,ambiguous:true});
});
