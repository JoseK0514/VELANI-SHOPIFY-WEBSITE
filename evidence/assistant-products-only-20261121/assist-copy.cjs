// The assistant's greeting and suggested questions, English and Spanish (no assistant service runs locally; the panel is opened by hand).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const out = [];
  for (const path of ['/', '/pages/es']) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    await p.goto('http://127.0.0.1:4199' + path); await p.waitForTimeout(1200);
    await p.evaluate(() => { document.getElementById('ast-root').hidden = false; });
    await p.click('#ast-launch'); await p.waitForTimeout(800);
    const lede = (await p.textContent('#ast-lede')).trim(), sugg = await p.$$eval('#ast-sugg button', x => x.map(e => e.textContent.trim()));
    const bad = /websites? and apps|website or app|sitios web|a la medida/i.test(lede + sugg.join(' '));
    out.push((bad ? 'FAIL ' : 'PASS ') + path + ' greeting: ' + lede + ' | suggestions: ' + sugg.join(' / '));
    await p.close();
  }
  console.log(out.join('\n')); await b.close();
})();
