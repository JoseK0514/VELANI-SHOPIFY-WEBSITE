import {Readable} from 'node:stream';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {beforeEach,expect,it,vi} from 'vitest';

const {consume}=vi.hoisted(()=>({consume:vi.fn(async(_request:{body?:unknown},response:{status:(code:number)=>{json:(value:unknown)=>void}})=>response.status(200).json({status:'success'}))}));
vi.mock('../src/client-hub/queue.js',()=>({hubQueue:{handleNodeCallback:()=>consume},publishHubWakeup:vi.fn()}));
import handler from '../api/client-hub-email.js';

beforeEach(()=>{consume.mockClear();});
function response(){
  const headers=new Map<string,string>();const result={statusCode:0,headers,body:'',setHeader:(name:string,value:string)=>{headers.set(name,value);},end:(value?:string)=>{result.body=value??'';}};
  return result;
}
const notificationHeaders={'ce-type':'com.vercel.queue.v2beta','ce-vqsqueuename':'velani-client-requests','ce-vqsconsumergroup':'fixture','ce-vqsmessageid':'fixture-message'};
async function request(body:string,parsed?:unknown){
  const req=Readable.from(body?[Buffer.from(body)]:[]) as IncomingMessage &{body?:unknown};Object.assign(req,{method:'POST',headers:notificationHeaders});
  if(parsed!==undefined)req.body=parsed;
  const res=response();await handler(req,res as unknown as ServerResponse);return res;
}
it('passes a bodyless binary notification to the SDK so it can fetch the message by ID',async()=>{
  const res=await request('');expect(res.statusCode).toBe(200);expect(consume).toHaveBeenCalledOnce();
  expect(consume.mock.calls[0]![0]).toMatchObject({headers:notificationHeaders,body:undefined});
});
it('preserves parsed and streamed JSON deliveries for SDK validation',async()=>{
  const payload={keyHash:'a'.repeat(64)};
  expect((await request(JSON.stringify(payload))).statusCode).toBe(200);
  expect((await request('',payload)).statusCode).toBe(200);
  expect(consume.mock.calls.map(call=>call[0].body)).toEqual([payload,payload]);
});
it('rejects malformed and oversized raw or already-parsed bodies before SDK handling',async()=>{
  expect((await request('{')).statusCode).toBe(400);
  const raw=await request(JSON.stringify({padding:'x'.repeat(9000)}));expect(raw.statusCode).toBe(413);
  const parsed=await request('',{padding:'x'.repeat(9000)});expect(parsed.statusCode).toBe(413);
  expect(consume).not.toHaveBeenCalled();
});
