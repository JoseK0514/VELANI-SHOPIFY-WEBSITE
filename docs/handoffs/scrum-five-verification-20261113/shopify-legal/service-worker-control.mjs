import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire('/workspace/VELANI-SHOPIFY-WEBSITE/package.json');
const {chromium}=require('@playwright/test');const browser=await chromium.launch({headless:true});
const result=[];
try{for(const mode of['block','allow']){
 const context=await browser.newContext({serviceWorkers:mode,reducedMotion:'reduce'});
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));
 const response=await page.goto('https://www.thevelani.com/?preview_theme_id=193401127226&view=velani-es-privacy',{waitUntil:'networkidle'});
 result.push({mode,status:response.status(),theme:await page.evaluate(()=>window.Shopify.theme.id),title:await page.locator('main h1').innerText(),errors});
 await context.close();
}}finally{await browser.close();}
await writeFile('/workspace/scratch/scrum-five-evidence/shopify-legal/service-worker-control.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
