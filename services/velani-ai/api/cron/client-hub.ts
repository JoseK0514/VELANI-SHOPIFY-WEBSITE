import { createCronHandler } from '../../src/cron-handler.js';
import { clientHubRepository } from '../../src/client-hub/runtime.js';
import { readClientHubConfig } from '../../src/client-hub/config.js';
import {publishHubWakeup} from '../../src/client-hub/queue.js';
import {runClientHubMaintenance} from '../../src/client-hub/maintenance.js';

export default createCronHandler(process.env,async()=> {
  const config=readClientHubConfig(); const repository=clientHubRepository(config);
  if (!repository) return {configured:false,requests:0,quotaKeys:0,recoveryPublished:0};
  try {
    const result={configured:true,...await runClientHubMaintenance(repository,config.enabled?publishHubWakeup:undefined)};
    console.info(JSON.stringify({event:'client_hub_maintenance',...result,completedAt:new Date().toISOString()}));
    if(!result.retentionSucceeded||!result.recoverySucceeded)throw Error('Client hub maintenance phase failed.');
    return result;
  } finally { await repository.close(); }
},{notConfigured:'client_hub_not_configured',failed:'client_hub_maintenance_failed'});
