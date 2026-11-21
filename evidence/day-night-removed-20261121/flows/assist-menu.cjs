// The assistant launcher (shown only when an assistant address is set) keeps its look and steps aside while the Day phone menu is open.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:4199/'); await p.waitForTimeout(800);
  // No assistant service runs locally, so the root stays hidden; reveal it to test the CSS that hides the launcher under the menu
  await p.evaluate(() => { document.getElementById('ast-root').hidden = false; }); await p.waitForTimeout(3000); await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(600);
  const vis = () => p.isVisible('.ast-launch');
  const before = await vis(), bg = await p.$eval('.ast-launch', e => getComputedStyle(e).backgroundColor);
  await p.click('.gn .mb'); await p.waitForTimeout(300); const during = await vis();
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); const after = await vis();
  console.log((before && !during && after ? 'PASS' : 'FAIL') + ' launcher visible, hidden while the menu is open, back after  [' + [before, during, after, bg] + ']');
  console.log((errs.length ? 'FAIL' : 'PASS') + ' no script errors  [' + errs.join(' | ') + ']');
  await b.close();
})();
