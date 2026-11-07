import {expect,it,vi} from 'vitest';
import {runClientHubMaintenance} from '../src/client-hub/maintenance.js';
import type {HubRepository} from '../src/client-hub/types.js';
it('purges independently when publication of recovery work fails',async()=>{
  const purge=vi.fn(async()=>({requests:2,quotaKeys:3}));
  const repository={purge,pendingKeys:vi.fn(async()=>['opaque-key'])} as unknown as HubRepository;
  const result=await runClientHubMaintenance(repository,async()=>{throw Error('queue unavailable')});
  expect(purge).toHaveBeenCalledTimes(1);expect(result).toMatchObject({requests:2,quotaKeys:3,retentionSucceeded:true,recoverySucceeded:false});
});
it('still republishes pending work when retention fails and reports the failed phase',async()=>{
  const repository={purge:vi.fn(async()=>{throw Error('delete unavailable')}),pendingKeys:vi.fn(async()=>['opaque-key'])} as unknown as HubRepository;
  const publish=vi.fn(async()=>undefined);const result=await runClientHubMaintenance(repository,publish);
  expect(result).toMatchObject({retentionSucceeded:false,recoverySucceeded:true,recoveryPublished:1});expect(publish).toHaveBeenCalledWith('opaque-key');
});
