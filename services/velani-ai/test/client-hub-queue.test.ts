import {expect,it,vi} from 'vitest';
import {processHubWakeup} from '../src/client-hub/queue-work.js';
import type {HubRepository} from '../src/client-hub/types.js';
const keyHash='a'.repeat(64);
it('retries a pre-commit wake-up but safely acknowledges an orphan without sending email',async()=>{
  const repository={find:vi.fn(async()=>null)} as unknown as HubRepository;const sender={send:vi.fn()};
  const now=Date.now();await expect(processHubWakeup(repository,sender,{keyHash},new Date(now),now)).rejects.toThrow('not committed');
  await expect(processHubWakeup(repository,sender,{keyHash},new Date(now-600000),now)).resolves.toBeUndefined();expect(sender.send).not.toHaveBeenCalled();
});
it('retries pending jobs instead of acknowledging a partial delivery',async()=>{
  const repository={find:vi.fn(async()=>({id:'request',reference:'VEL-2611-0007',requestHash:'hash'})),claimDelivery:vi.fn(async()=>null),hasPendingDeliveries:vi.fn(async()=>true)} as unknown as HubRepository;
  await expect(processHubWakeup(repository,{send:vi.fn()},{keyHash},new Date())).rejects.toThrow('remains pending');
});
it('rejects malformed wake-ups without touching storage',async()=>{
  const find=vi.fn();const repository={find} as unknown as HubRepository;
  await expect(processHubWakeup(repository,{send:vi.fn()},{keyHash,description:'unwanted payload'},new Date())).rejects.toThrow('Invalid');expect(find).not.toHaveBeenCalled();
});
