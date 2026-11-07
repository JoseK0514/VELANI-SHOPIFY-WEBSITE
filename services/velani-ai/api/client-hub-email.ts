import type {IncomingMessage,ServerResponse} from 'node:http';
import {hubQueue} from '../src/client-hub/queue.js';
import {processHubWakeup} from '../src/client-hub/queue-work.js';
import {readClientHubConfig} from '../src/client-hub/config.js';
import {clientHubRepository} from '../src/client-hub/runtime.js';
import {ResendSender} from '../src/client-hub/email.js';

const consume=hubQueue.handleNodeCallback(async(message,metadata)=>{
  if(process.env.VERCEL_ENV!=='production')throw Error('Production queue only.');
  const config=readClientHubConfig();
  if(!config.enabled||!config.emailApiKey)throw Error('Client hub delivery is disabled.');
  const repository=clientHubRepository(config);if(!repository)throw Error('Client hub database is not configured.');
  try{await processHubWakeup(repository,new ResendSender(config.emailApiKey),message,metadata.createdAt);}
  finally{await repository.close();}
},{retry:(_error,metadata)=>({afterSeconds:Math.min(300,30*2**Math.min(metadata.deliveryCount,4))})});

/** Preserve the SDK's broker validation; this adapter only bounds JSON parsing. */
export default async function handler(request:IncomingMessage & {body?:unknown},response:ServerResponse){
  response.setHeader('Cache-Control','no-store');
  if(request.method!=='POST'){response.setHeader('Allow','POST');response.statusCode=405;response.end();return;}
  let body=request.body;
  if(body===undefined){
    try{
      const chunks:Buffer[]=[];let bytes=0;
      for await(const chunk of request){
        const value=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);bytes+=value.length;
        if(bytes>8192){response.statusCode=413;response.end();return;}
        chunks.push(value);
      }
      // Headers-only v2 notifications let the SDK fetch the payload by message ID.
      body=bytes===0?undefined:JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }catch{response.statusCode=400;response.end();return;}
  }else{
    try{
      const serialized=JSON.stringify(body);
      if(serialized!==undefined&&Buffer.byteLength(serialized)>8192){response.statusCode=413;response.end();return;}
    }catch{response.statusCode=400;response.end();return;}
  }
  await consume({method:request.method,headers:request.headers,body},{
    status(code:number){response.statusCode=code;return{json(value:unknown){response.setHeader('Content-Type','application/json');response.end(JSON.stringify(value));},end(){response.end();}};},
    end(){response.end();},
  });
}
