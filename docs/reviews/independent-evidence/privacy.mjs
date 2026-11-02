import {chromium} from '/workspace/work/velani-company-site-20261102/node_modules/@playwright/test/index.mjs';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
for(const scenario of ['absent','failed','slow']){
 const c=await b.newContext({viewport:{width:320,height:568}});
 await c.route('**/pages/cookies',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('data-platform="local"','data-platform="shopify"')});});
 await c.addInitScript(scenario=>{if(scenario==='failed')window.Shopify={customerPrivacy:{currentVisitorConsent:()=>({analytics:'yes',marketing:'no',preferences:'no'}),setTrackingConsent:(choices,callback)=>setTimeout(()=>callback(new Error('rejected')),100)}};if(scenario==='slow')window.Shopify={loadFeatures:(_,callback)=>setTimeout(()=>{window.Shopify.customerPrivacy={currentVisitorConsent:()=>({analytics:'no',marketing:'no',preferences:'no'}),setTrackingConsent:(_,cb)=>cb()};callback()},1000)};},scenario);
 const p=await c.newPage();await p.goto('http://127.0.0.1:4173/pages/cookies');await p.getByRole('button',{name:'Open cookie choices'}).click();
 if(scenario==='slow'){await p.locator('[data-consent="analytics"]').check();results.push({scenario,checkedDuringLoad:await p.locator('[data-consent="analytics"]').isChecked()});await p.waitForTimeout(1300);results.at(-1).checkedAfterLoad=await p.locator('[data-consent="analytics"]').isChecked();}
 else{await p.getByRole('button',{name:'Reject optional',exact:true}).click();await p.waitForTimeout(200);results.push({scenario,context:await p.locator('[data-cookie-context]').textContent(),status:await p.locator('.consent-status').textContent(),analytics:await p.locator('[data-consent="analytics"]').isChecked(),focus:await p.evaluate(()=>document.activeElement.tagName)});}
 await c.close();
}
await b.close();await writeFile('/workspace/outputs/velani-independent-review/privacy.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
