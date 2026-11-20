import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire('/workspace/VELANI-SHOPIFY-WEBSITE/package.json');
const {chromium,webkit}=require('@playwright/test');
const {default:AxeBuilder}=require('@axe-core/playwright');
const origin='https://www.thevelani.com',themeId='193401127226';
const out=process.env.SHOPIFY_LEGAL_EVIDENCE_DIR||'/workspace/scratch/scrum-five-evidence/shopify-legal/browser';await mkdir(out,{recursive:true});
const pairs=[['privacy','es-privacy'],['nevora-privacy','es-nevora-privacy'],['nevora-terms','es-nevora-terms'],['nevora-support','es-nevora-support'],['nevora-account-deletion','es-nevora-account-deletion']];
const settleLoads=process.env.SHOPIFY_LEGAL_SETTLE_LOADS==='1';
const url=slug=>origin+'/?preview_theme_id='+themeId+'&view=velani-'+slug;
const report={themeId,role:'UNPUBLISHED',waitForDocumentLoad:process.env.SHOPIFY_LEGAL_SETTLE_LOADS==='1',source:'4dde3c8f476b68e8ecbf345ee6308dedee1a6e08',checks:[],errors:[],pageErrors:[],failedRequests:[],blockedWrites:[],screenshots:[],limits:['Unpublished theme alternate views only. No global Shopify Page creation or publication, business/legal approval or production acceptance.','All non-GET/HEAD browser requests are aborted; no inquiry, payment, email or AI submission is exercised.','200% check enlarges root text, not physical-device or native browser zoom certification.']};
const checkpoint=()=>writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
for(const [engine,type]of[['chromium',chromium],['webkit',webkit]]){
 let browser;
 try{
  browser=await type.launch({headless:true});
  // Controlled same-source run: blocking service workers injects two errors in opaque Shopify frames; ordinary browser behavior has none.
  const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'allow'});
  await context.route('**/*',route=>{
   const r=route.request();if(!['GET','HEAD'].includes(r.method())){const u=new URL(r.url());report.blockedWrites.push({engine,method:r.method(),host:u.hostname,path:u.pathname});return route.abort();}return route.continue();
  });
  const page=await context.newPage();page.setDefaultTimeout(20000);const checkedLinks=new Set();
  page.on('pageerror',e=>report.pageErrors.push({engine,message:e.message,stack:e.stack,at:new Date().toISOString(),url:page.url()}));
  context.on('requestfailed',r=>{const u=new URL(r.url());report.failedRequests.push({engine,method:r.method(),host:u.hostname,path:u.pathname,resourceType:r.resourceType(),error:r.failure()?.errorText,at:new Date().toISOString()});});
  for(const width of[390,1440])for(const[en,es]of pairs){
   const cell={engine,width,path:es};
   try{
    await page.setViewportSize({width,height:900});
    const response=await page.goto(url(es),{waitUntil:settleLoads?'load':'domcontentloaded'});assert.equal(response.status(),200);
    await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(id=>String(window.Shopify?.theme?.id)===id,themeId);
    const actual=await page.evaluate(()=>({id:String(window.Shopify.theme.id),role:window.Shopify.theme.role,lang:document.documentElement.lang}));
    assert.deepEqual(actual,{id:themeId,role:'unpublished',lang:'es'});
    assert.equal(await page.locator('main').count(),1);assert.equal(await page.locator('main h1').count(),1);
    assert((await page.locator('main').innerText()).length>700);
    const geometry=()=>page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));
    let g=await geometry();assert(g.s<=g.w+1,'Normal text overflow');
    const violations=(await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations;
    assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.length})),[],'Legal content accessibility');
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');g=await geometry();assert(g.s<=g.w+1,'Enlarged text overflow');
    await page.evaluate(()=>document.documentElement.style.removeProperty('font-size'));
    const links=await page.locator('main a[href^="/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    for(const href of new Set(links)){const dest=new URL(href,origin);assert.equal(dest.searchParams.get('preview_theme_id'),themeId,'Link left the draft');if(!checkedLinks.has(dest.href)){const probe=await context.newPage();try{const response=await probe.goto(dest.href,{waitUntil:settleLoads?'load':'domcontentloaded'});assert.equal(response.status(),200,'Internal draft destination');assert.equal(await probe.evaluate(()=>String(window.Shopify.theme.id)),themeId,'Internal link changed theme');checkedLinks.add(dest.href);}finally{await probe.close();}}}
    await page.locator('.foot-lang a[hreflang="en"]').click();await page.waitForFunction(id=>document.documentElement.lang==='en'&&String(window.Shopify?.theme?.id)===id,themeId);
    if(settleLoads)await page.waitForLoadState('load');
    assert.equal(new URL(page.url()).searchParams.get('view'),'velani-'+en);
    assert.equal(await page.evaluate(()=>String(window.Shopify.theme.id)),themeId);
    await page.locator('.foot-lang a[hreflang="es"]').click();await page.waitForFunction(id=>document.documentElement.lang==='es'&&String(window.Shopify?.theme?.id)===id,themeId);
    if(settleLoads)await page.waitForLoadState('load');
    assert.equal(new URL(page.url()).searchParams.get('view'),'velani-'+es);
    assert.equal(await page.evaluate(()=>String(window.Shopify.theme.id)),themeId);
    report.checks.push({...cell,themeVerified:true,languageRoundTrip:true,mainAxeViolations:0,enlargedText:200,internalLinks:links.length});
    if(es==='es-nevora-privacy'){const file=out+'/'+engine+'-'+width+'-privacy.png';await page.screenshot({path:file,fullPage:true,caret:'initial'});report.screenshots.push(file);}
    await checkpoint();
   }catch(e){report.errors.push({...cell,error:String(e.stack).replace(/(cookie|authorization|set-cookie):[^\r\n]*/ig,'$1: [redacted]')});try{await page.screenshot({path:out+'/'+engine+'-'+width+'-'+es+'-failure.png',fullPage:true,timeout:1500,caret:'initial'});}catch{}throw e;}
  }
  await context.close();
 }catch(e){process.exitCode=1;if(!report.errors.length)report.errors.push({engine,error:String(e.stack).replace(/(cookie|authorization|set-cookie):[^\r\n]*/ig,'$1: [redacted]')});break;}
 finally{if(browser)await browser.close();await checkpoint();}
}
if(report.pageErrors.length)process.exitCode=1;
await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checks:report.checks.length,errors:report.errors,pageErrors:report.pageErrors,blockedWrites:report.blockedWrites.length}));
