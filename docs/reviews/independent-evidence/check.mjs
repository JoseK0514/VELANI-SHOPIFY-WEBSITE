import {chromium} from '/workspace/work/velani-company-site-20261102/node_modules/@playwright/test/index.mjs';
import AxeBuilder from '/workspace/work/velani-company-site-20261102/node_modules/@axe-core/playwright/dist/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='/workspace/outputs/velani-independent-review', base='http://127.0.0.1:4173';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();
const events=[], checks=[];
page.on('console',m=>{if(m.type()==='error')events.push({type:'console',message:m.text()});});page.on('pageerror',e=>events.push({type:'pageerror',message:e.message}));
await context.route('**/*',route=>{const r=route.request();if(r.method()!=='GET'||!r.url().startsWith(base)){events.push({type:'blocked-request',url:r.url(),method:r.method()});return route.abort();}return route.continue();});
for(const width of [320,390,720,1440])for(const slug of ['custom-development','contact','privacy','security']){
 await page.setViewportSize({width,height:900});await page.goto(base+'/pages/'+slug);await page.evaluate(()=>document.fonts.ready);
 const data=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *,footer *')].filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(e=>e.tagName+'.'+e.className)}));
 const axe=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact}));
 checks.push({name:slug+' '+width,...data,axe});
 if([320,1440].includes(width))await page.screenshot({path:out+'/'+slug+'-'+width+'.png',fullPage:true});
}
await page.setViewportSize({width:320,height:568});await page.goto(base+'/pages/cookies');
const opener=page.getByRole('button',{name:'Open cookie choices'});await opener.focus();await page.keyboard.press('Enter');
let focus=[];for(let i=0;i<11;i++){focus.push(await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent.slice(0,35),inDialog:!!document.activeElement.closest('dialog')})));await page.keyboard.press('Tab');}
checks.push({name:'320 cookie keyboard cycle',focus});await page.screenshot({path:out+'/cookie-320.png'});await page.keyboard.press('Escape');checks.push({name:'cookie restore',focused:await opener.evaluate(e=>e===document.activeElement)});
await page.goto(base+'/pages/contact?interest=%3Cimg%20src=x%20onerror=alert(1)%3E');await page.locator('[data-inquiry-submit]').click();checks.push({name:'invalid focus',id:await page.evaluate(()=>document.activeElement.id)});
await page.locator('#inquiry-name').fill('José مثال');await page.locator('#inquiry-email').fill('fictional@example.com');await page.locator('#inquiry-message').fill('<svg onload=alert(1)> 👋 文');
await page.locator('[data-inquiry-submit]').click({clickCount:3});checks.push({name:'repeat preview',status:await page.locator('.form-status').textContent(),storage:await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}})),injected:await page.locator('[onload],[onerror]').count()});
await context.setOffline(true);await page.locator('[data-inquiry-submit]').click();checks.push({name:'offline preview',status:await page.locator('.form-status').textContent()});await context.setOffline(false);
await page.goto(base);await page.locator('[data-menu-toggle]').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');checks.push({name:'mobile keyboard menu',focus:await page.evaluate(()=>document.activeElement.textContent)});await page.keyboard.press('Escape');checks.push({name:'menu restore',focused:await page.locator('[data-menu-toggle]').evaluate(e=>e===document.activeElement)});
await context.close();const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});const p=await nojs.newPage();await p.goto(base+'/pages/contact');checks.push({name:'no js',submitDisabled:await p.locator('[data-inquiry-submit]').isDisabled(),navVisible:await p.getByRole('link',{name:'Products',exact:true}).isVisible()});await nojs.close();
await browser.close();await writeFile(out+'/results.json',JSON.stringify({checks,events},null,2));console.log(JSON.stringify({checks:checks.length,geometryFailures:checks.filter(c=>c.scroll>c.viewport),axe:checks.filter(c=>c.axe?.length),events,interaction:checks.filter(c=>!c.viewport)},null,2));
