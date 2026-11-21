// Share images (1200 × 630, og:image) in the Day design, English and Spanish, built from this repository: the site's own Day
// styles (src/day/day.css, devices.css), its drawn app screens (dayScreen in src/day.mjs) and the wording on each page.
//   node scripts/og/make-share-images.mjs            # writes public/assets/velani-social*.png
// Needs Chromium (Playwright) and the Inter and Inter Display fonts installed; it stops if they are missing, so an image is
// never written in a fallback font. (The Night-era generator, which read the live store's assets, was replaced on Nov 21.)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { dayScreen } from '../../src/day.mjs';
import { WORDMARK } from '../../src/shared.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const assets = path.join(root, 'public/assets');
const read = name => readFileSync(path.join(root, 'src/day', name), 'utf8');

/** The page skies (src/day/day.js): top, middle and bottom colour, then the glow and its height. */
const SKY = {
  dawn: [[217, 211, 230], [242, 210, 196], [251, 237, 228], [255, 196, 150, 0.6], 80],
  morning: [[188, 216, 242], [220, 235, 247], [247, 250, 253], [255, 238, 206, 0.5], 46],
  noon: [[207, 230, 248], [238, 246, 252], [255, 255, 255], [255, 255, 236, 0.5], 12],
  golden: [[242, 207, 158], [249, 227, 196], [255, 246, 234], [255, 186, 110, 0.55], 58],
};
const rgb = c => (c.length === 4 ? 'rgba(' : 'rgb(') + c.join(',') + ')';

/** The devices, as the pages draw them (src/day/*.body.html), scaled with zoom as the pages' fit() does. */
const phone = (screen, zoom) => `<div class="og-dev" style="zoom:${zoom}"><div class="iph"><div class="bz"><div class="sc"><span class="di"></span>${screen}<span class="hb"></span></div></div></div></div>`;
const mac = (screen, zoom) => `<div class="og-dev" style="zoom:${zoom}"><div class="mac"><div class="lid"><div class="sc"><div class="notch"></div>${screen}</div></div><div class="base"></div></div></div>`;
const kitchen = (screen, zoom) => `<div class="og-dev" style="zoom:${zoom}"><div class="kd"><div class="bz"><div class="sc">${screen}</div></div><div class="arm"></div></div></div>`;
const NV_INK = '<img class="og-nvwm" src="nevora-wm-ink.png" alt="">';

/** Each image: an optional line above the title (left out where it would repeat the wordmark), then the page's own words (English and Spanish exactly as on the pages) and the screens it shows. */
const IMAGES = [
  { file: 'velani-social', sky: 'dawn', mark: 'velani',
    en: { title: 'Open to close.', line: 'NEVORA plans the week, records every hour and calculates the pay. Rondo tells you what needs you today.', foot: 'Free for 30 days. No card. Rondo included.' },
    es: { title: 'De abrir a cerrar.', line: 'NEVORA planifica la semana, registra cada hora y calcula la paga. Rondo te dice qué necesita de ti hoy.', foot: 'Gratis por 30 días. Sin tarjeta. Rondo incluido.' },
    art: lang => `<div class="og-at" style="right:-150px;top:150px">${mac(dayScreen('SCR_OWNER', { lang }), 0.46)}</div><div class="og-at" style="right:250px;top:200px">${phone(dayScreen('SCR_EMP', { lang }), 0.56)}</div>` },
  { file: 'velani-social-nevora', sky: 'morning', mark: 'nevora',
    en: { title: 'The whole week, from schedule to pay.', line: 'NEVORA plans the shifts, records the hours and calculates the pay. Rondo answers the Owner’s questions.', foot: 'Free for 30 days. No card. Rondo included.' },
    es: { title: 'Toda la semana, del horario a la paga.', line: 'NEVORA planifica los turnos, registra las horas y calcula la paga. Rondo responde las preguntas del dueño.', foot: 'Gratis por 30 días. Sin tarjeta. Rondo incluido.' },
    art: lang => `<div class="og-at" style="right:-120px;top:120px">${mac(dayScreen('SCR_SCHED', { lang }), 0.44)}</div><div class="og-at" style="right:300px;top:190px">${phone(dayScreen('SCR_EMP_SCHED', { lang }), 0.56)}</div>` },
  { file: 'velani-social-plans', sky: 'dawn', mark: 'nevora',
    en: { eyebrow: 'Plans', title: 'Try NEVORA free for 30 days.', line: 'Your whole team gets the complete app, with no card. Then one monthly price for your business: $19 for up to 15 employees, $29 for 16 to 30.' },
    es: { eyebrow: 'Planes', title: 'Prueba NEVORA gratis por 30 días.', line: 'Todo tu equipo usa la app completa, sin tarjeta. Después pagas un solo precio mensual por tu negocio: $19 para hasta 15 empleados y $29 para 16 a 30.' },
    art: lang => `<div class="og-at" style="right:70px;top:70px">${phone(dayScreen('SCR_PAY', { lang }), 0.66)}</div>` },
  { file: 'velani-social-rondo', sky: 'noon', mark: 'velani',
    en: { eyebrow: 'Included in NEVORA', title: 'Rondo.', line: 'The assistant inside NEVORA for the business Owner. Ask in plain words, in English or Spanish.', foot: 'Nothing changes until you approve.' },
    es: { eyebrow: 'Incluido en NEVORA', title: 'Rondo.', line: 'El asistente dentro de NEVORA para el dueño del negocio. Pregunta como hablas, en español o en inglés.', foot: 'Nada cambia hasta que apruebes.' },
    art: lang => `<div class="og-at" style="right:80px;top:60px">${phone(dayScreen('SCR_RONDO', { lang }).replace('data-ro="0"', 'data-ro="3"'), 0.68)}</div>` },
  { file: 'velani-social-relay', sky: 'golden', mark: 'velani',
    en: { eyebrow: 'In design', title: 'Relay.', line: 'From the counter to the kitchen screen. Orders, the kitchen screen and inventory in one system.', foot: 'Relay is in design and has no release date yet.' },
    es: { eyebrow: 'En diseño', title: 'Relay.', line: 'Del mostrador a la pantalla de cocina. Pedidos, la pantalla de cocina e inventario en un solo sistema.', foot: 'Relay está en diseño y todavía no tiene fecha de lanzamiento.' },
    art: lang => `<div class="og-at" style="right:-260px;top:150px">${kitchen(dayScreen('SCR_KDS', { lang }), 0.6)}</div>` },
];

const CSS = `
:root{--display:"Inter Display","Inter",sans-serif;--text:"Inter",sans-serif}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#FBFBFD}
.og{position:relative;width:1200px;height:630px;overflow:hidden;font-family:var(--text);color:var(--ink);-webkit-font-smoothing:antialiased}
.og-sky{position:absolute;inset:0}
.og-sky::after{content:"";position:absolute;inset:0;background:radial-gradient(50% 44% at 70% var(--gy),var(--gl),transparent 72%)}
.og-at{position:absolute}
.og-dev{filter:drop-shadow(0 40px 60px rgba(16,24,40,.22))}
.og-copy{position:absolute;left:72px;top:76px;width:560px;z-index:2}
.og-mark{display:block;height:26px;color:var(--ink)}
.og-mark .wm-velani{height:26px;width:auto}
.og-nvwm{height:24px;width:auto;display:block}
.og-eye{margin:44px 0 0;font:600 17px/1 var(--text);color:var(--ink-2);letter-spacing:-.01em}
.og h1{margin:14px 0 0;font:600 76px/0.98 var(--display);letter-spacing:-.045em;text-wrap:balance;color:var(--ink)}
.og-line{margin:22px 0 0;font:400 23px/1.36 var(--text);color:#3F3F44;letter-spacing:-.015em;max-width:30ch;text-wrap:pretty}
.og-foot{position:absolute;left:72px;bottom:54px;z-index:2;font:500 17px/1.3 var(--text);color:var(--ink-2)}
.og-foot b{display:block;margin-top:6px;font-weight:600;color:var(--ink)}
.og-fade{position:absolute;left:0;top:0;bottom:0;width:700px;z-index:1;pointer-events:none}`;

function page({ sky, mark, art }, lang, t) {
  const [a, b, c, gl, gy] = SKY[sky];
  const brand = mark === 'nevora' ? NV_INK : `<span class="og-mark">${WORDMARK}</span>`;
  const screens = art(lang).replace(/(src|href)="\/assets\//g, '$1="');
  // A soft wash behind the words, in the sky's own colours, so the copy stays legible over a device
  const fade = `<div class="og-fade" style="background:linear-gradient(90deg,${rgb(b)} 0%,${rgb(b).replace('rgb(', 'rgba(').replace(')', ',.94)')} 52%,${rgb(b).replace('rgb(', 'rgba(').replace(')', ',0)')} 100%)"></div>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><base href="${pathToFileURL(assets).href}/"><style>${read('day.css')}\n${read('devices.css')}\n${CSS}</style></head>`
    + `<body><div class="og"><div class="og-sky" style="background:var(--grain),linear-gradient(180deg,${rgb(a)} 0%,${rgb(b)} 55%,${rgb(c)} 100%);--gl:${rgb(gl)};--gy:${gy}%"></div>${screens}${fade}`
    + `<div class="og-copy">${brand}${t.eyebrow ? `<p class="og-eye">${t.eyebrow}</p>` : '<p class="og-eye" aria-hidden="true"></p>'}<h1>${t.title}</h1><p class="og-line">${t.line}</p></div>`
    + `<p class="og-foot">${t.foot ? t.foot + '<b>thevelani.com</b>' : '<b>thevelani.com</b>'}</p></div></body></html>`;
}

const out = path.join(root, 'dist/og');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch(process.env.VELANI_CHROMIUM_EXECUTABLE ? { executablePath: process.env.VELANI_CHROMIUM_EXECUTABLE } : {});
const tab = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
const written = [];
for (const image of IMAGES) {
  for (const lang of ['en', 'es']) {
    const html = path.join(out, image.file + '-' + lang + '.html');
    writeFileSync(html, page(image, lang, image[lang]));
    await tab.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    // The fonts must be the real ones: Inter Display and Inter measure differently from the generic fallback
    const fonts = await tab.evaluate(() => {
      const w = f => { const c = document.createElement('canvas').getContext('2d'); c.font = '600 40px ' + f; return c.measureText('Open to close, Rondo 30').width; };
      return { display: w('"Inter Display"') !== w('monospace'), text: w('"Inter"') !== w('monospace') };
    });
    if (!fonts.display || !fonts.text) throw new Error('Inter Display and Inter must be installed to make the share images');
    const broken = await tab.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')));
    if (broken.length) throw new Error('Images did not load: ' + broken.join(', '));
    const name = image.file + (lang === 'es' ? '-es' : '') + '.png';
    await tab.screenshot({ path: path.join(assets, name), clip: { x: 0, y: 0, width: 1200, height: 630 } });
    written.push(name);
  }
}
await browser.close();
console.log(JSON.stringify({ written }));
