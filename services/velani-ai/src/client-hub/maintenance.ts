import type {HubRepository} from './types.js';

/** Retention and queue recovery must not suppress each other on partial failure. */
export async function runClientHubMaintenance(repository:HubRepository,publish?: (keyHash:string)=>Promise<void>){
  const result={requests:0,quotaKeys:0,recoveryPublished:0,retentionSucceeded:false,recoverySucceeded:true};
  try{Object.assign(result,await repository.purge());result.retentionSucceeded=true;}catch{/* Report aggregate phase failure below. */}
  if(publish)try{for(const key of await repository.pendingKeys()){await publish(key);result.recoveryPublished++;}}catch{result.recoverySucceeded=false;}
  return result;
}
