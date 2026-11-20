// Real browser recovery with an owned API fixture; no provider calls or mail.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import {renderPage} from '../../src/render.mjs';
const base=process.env.VELANI_PREVIEW_URL||'http://127.0.0.1:4275';
assert.equal(new URL(base).hostname,'127.0.0.1');
const out=process.argv[2]||'evidence/rondo-recovery';await mkdir(out,{recursive:true});
process.env.VELANI_ASSISTANT_API=base+'/__rondo_fixture__';
const results=[],external=[];
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']}:{headless:true});
 try{for(const lang of ['en','es'])for(const status of [422,503]){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),posts=[],errors=[];
  const path=lang==='es'?'/pages/es-contacto':'/pages/contact';
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!==base){external.push(url.hostname);return route.abort();}
   if(url.pathname===path){const response=await route.fetch();return route.fulfill({response,body:renderPage(path).html});}
   if(url.pathname==='/__rondo_fixture__/v1/config')return route.fulfill({json:{assistantName:'Rondo',turnstileSiteKey:null}});
   if(url.pathname==='/__rondo_fixture__/v1/sessions')return route.fulfill({json:{sessionToken:'fictional-session',sessionId:'fictional',expiresAt:'2099-01-01T00:00:00Z'}});
   if(url.pathname==='/__rondo_fixture__/v1/chat'){
    posts.push(req.postDataJSON());const fail=posts.length<=(status===503?2:1);
    return route.fulfill({status:fail?status:200,json:fail?{error:{code:status===422?'provider_request_rejected':'unavailable'}}:{message:'Fictional recovered answer',sources:[]}});
   }
   if(!['GET','HEAD'].includes(req.method()))throw Error('Unexpected non-fixture delivery');
   return route.continue();
  });
  try{
   await page.goto(base+path);await page.locator('#ast-launch').click();await page.locator('#ast-in:not([disabled])').waitFor();
   await page.locator('#ast-in').fill('Fictional original question');await page.locator('#ast-send').click();await page.locator('#ast-status:not([hidden])').waitFor();
   assert.equal(posts.length,1);await page.waitForTimeout(300);assert.equal(posts.length,1,'No automatic resend');
   const message=await page.locator('#ast-status-t').innerText();
   assert.match(message,status===422?(lang==='es'?/No se pudo responder/:/could not be answered/):(lang==='es'?/disponible temporalmente/:/temporarily unavailable/));
   assert.equal(await page.locator('#ast-contact').isVisible(),true,'Human help remains available');
   if(status===422){assert.equal(await page.locator('#ast-retry').isHidden(),true);await page.locator('#ast-discard').click();assert.equal(await page.locator('#ast-in').inputValue(),'Fictional original question');}
   else{await page.locator('#ast-retry').click();await page.waitForFunction(()=>document.querySelector('#ast-status')?.hidden===false);assert.equal(posts.length,2);assert.equal(posts[0].requestId,posts[1].requestId,'Manual retry preserves identity');await page.locator('#ast-discard').click();}
   await page.locator('#ast-in').fill('Fictional edited question');await page.locator('#ast-send').click();await page.getByText('Fictional recovered answer',{exact:true}).waitFor();
   assert.notEqual(posts.at(-1).requestId,posts[0].requestId,'Edited question has a new identity');assert.deepEqual(errors,[]);
   await page.screenshot({path:out+'/'+engine+'-'+lang+'-'+status+'.png'});results.push({engine,lang,status,result:'PASS',requests:posts.length});
  }catch(error){results.push({engine,lang,status,result:'FAIL',error:error.message});}
  finally{await context.close();}
 }}finally{await browser.close();}
}
const report={passed:results.filter(r=>r.result==='PASS').length,failed:results.filter(r=>r.result==='FAIL').length,externalRequests:external,results};
await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.failed||external.length)process.exitCode=1;
