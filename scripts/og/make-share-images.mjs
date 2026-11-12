import { createRequire } from 'node:module'; import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire('/Users/josek0514/Desktop/tool-box-pr/package.json'); const { chromium } = require('playwright');
const A='https://www.thevelani.com/cdn/shop/t/18/assets/';
const wm = readFileSync('og/wm.svg','utf8').replace('class="wm-velani"','class="wm"');
const base = `<style>
@font-face{font-family:"DM Sans";font-weight:400;src:url(${A}dm-sans-latin-400-normal.woff2)}
@font-face{font-family:"DM Sans";font-weight:500;src:url(${A}dm-sans-latin-500-normal.woff2)}
@font-face{font-family:"DM Sans";font-weight:600;src:url(${A}dm-sans-latin-600-normal.woff2)}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#000;font-family:"DM Sans",sans-serif;color:#f4f6f9;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.86) 0%,rgba(0,0,0,.62) 42%,rgba(0,0,0,.08) 72%,rgba(0,0,0,0) 100%)}
.copy{position:absolute;left:80px;top:150px;width:600px}
.wm{display:block;height:40px;width:auto;color:#f4f6f9}
.k{margin-top:40px;font-size:15px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#e6ecf5}
h1{margin-top:18px;font-size:64px;line-height:1.04;font-weight:600;letter-spacing:-.03em;text-wrap:balance}
p{margin-top:24px;font-size:23px;line-height:1.45;color:#dde3ee;max-width:540px}
</style>`;
const cards = {
 'velani-social-nevora': `<img class="bg" src="${A}night-ai-devices.webp"><div class="shade"></div>
  <div style="position:absolute;right:96px;top:70px;width:300px;padding:8px;border-radius:52px;background:#0b0d10;box-shadow:0 0 0 1.5px rgba(255,255,255,.16),0 60px 120px -20px rgba(0,0,0,.9);height:640px;overflow:hidden"><img src="${A}night-phone-long.webp" style="display:block;width:100%;border-radius:44px"></div>
  <div class="copy" style="top:120px"><img src="${A}night-nevora-wm-white.png" style="display:block;height:38px"><p class="k">Velani&nbsp;· Available now</p><h1 style="font-size:56px">Scheduling, time clock and payroll calculation.</h1><p>For shift teams. Free for 30 days, for teams of up to 30 employees.</p></div>`,
 'velani-social-custom': `<img class="bg" src="${A}night-ai-glow.webp"><div class="shade"></div>
  <div style="position:absolute;left:740px;top:150px;width:620px;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1.5px rgba(255,255,255,.14),0 60px 120px -30px rgba(0,0,0,.95)"><img src="${A}night-tb-home.webp" style="display:block;width:100%"></div>
  <div class="copy" style="top:130px;width:560px">${wm}<p class="k">Custom development</p><h1 style="font-size:58px">Software for the work your business needs to do.</h1><p>Websites, booking systems, online stores and business tools.</p></div>`,
 'velani-social-plans': `<img class="bg" src="${A}night-ai-light.webp" style="transform:scaleX(-1)"><div class="shade"></div>
  <div class="copy">${wm}<p class="k">NEVORA&nbsp;· Plans</p><h1>Free for 30 days. Then one price per business.</h1><p>No card and no automatic charge.</p></div>`,
};
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1200,height:630}});
for (const [name,html] of Object.entries(cards)) {
  await p.setContent(base+html,{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
  const fam = await p.evaluate(()=>document.fonts.check('600 64px "DM Sans"'));
  await p.screenshot({path:`og/${name}.png`}); console.log(name, 'font ok', fam);
}
await b.close();
