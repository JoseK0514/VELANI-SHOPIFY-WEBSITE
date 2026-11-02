import { mkdir, readdir, readFile, writeFile, cp, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { routes, company } from '../src/content.mjs';
import { renderPage, renderBody, renderShopifyLayout } from '../src/render.mjs';
import { nightAssets } from '../src/night.mjs';
export const root = path.resolve(import.meta.dirname, '..');
export async function build() {
  const out = path.join(root, 'dist');
  await rm(out, { recursive: true, force: true });
  await mkdir(path.join(out, 'preview/assets'), { recursive: true });
  await mkdir(path.join(out, 'theme/assets'), { recursive: true });
  await mkdir(path.join(root, 'public/assets'), { recursive: true });
  for (const weight of [400, 500, 600]) await copyFile(path.join(root, 'node_modules/@fontsource/dm-sans/files/dm-sans-latin-' + weight + '-normal.woff2'), path.join(root, 'public/assets/dm-sans-latin-' + weight + '-normal.woff2'));
  for (const name of ['arrow-right', 'calendar-blank', 'clock', 'file-text', 'list', 'x', 'plus', 'code-simple']) await copyFile(path.join(root, 'node_modules/@phosphor-icons/core/assets/regular/' + name + '.svg'), path.join(root, 'public/assets/' + name + '.svg'));
  await copyFile(path.join(root, 'public/assets/code-simple.svg'), path.join(root, 'public/assets/favicon.svg'));
  for (const name of ['inquiry', 'privacy']) {
    try { await copyFile(path.join(root, 'src/' + name + '.mjs'), path.join(root, 'public/assets/' + name + '.js')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const { css, js } = nightAssets;
  await writeFile(path.join(root, 'public/assets/velani.css'), css.base + '\n' + css.pages);
  await writeFile(path.join(root, 'public/assets/velani-home.css'), css.home);
  await writeFile(path.join(root, 'public/assets/velani-nevora.css'), css.nevora);
  await writeFile(path.join(root, 'public/assets/velani-motion.js'), js.motion);
  await writeFile(path.join(root, 'public/assets/velani-home.js'), js.home);
  await writeFile(path.join(root, 'public/assets/velani-nevora.js'), js.nevora);
  await cp(path.join(root, 'public/assets'), path.join(out, 'preview/assets'), { recursive: true });
  await cp(path.join(root, 'public/assets'), path.join(out, 'theme/assets'), { recursive: true });
  for (const dir of ['layout', 'sections', 'templates', 'config', 'locales']) await mkdir(path.join(out, 'theme', dir), { recursive: true });
  const manifest = {};
  for (const route of Object.keys(routes)) {
    const filename = route === '/' ? 'index.html' : route.slice(1) + '/index.html';
    const dest = path.join(out, 'preview', filename);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, renderPage(route).html);
    const slug = route === '/' ? 'home' : route.split('/').at(-1);
    const section = 'velani-' + slug;
    const template = route === '/' ? 'index' : 'page.' + slug;
    const schema = { name: 'Velani ' + slug.slice(0, 18), settings: [] };
    await writeFile(path.join(out, 'theme/sections', section + '.liquid'), renderBody(route, { target: 'shopify' }) + '\n{% schema %}\n' + JSON.stringify(schema, null, 2) + '\n{% endschema %}\n');
    await writeFile(path.join(out, 'theme/templates', template + '.json'), JSON.stringify({ sections: { main: { type: section } }, order: ['main'] }, null, 2) + '\n');
    if (route !== '/') await writeFile(path.join(out, 'theme/templates', 'index.velani-' + slug + '.json'), JSON.stringify({ sections: { main: { type: section } }, order: ['main'] }, null, 2) + '\n');
    manifest[route] = { title: routes[route].title, templateSuffix: slug, section, filename };
  }
  await writeFile(path.join(out, 'preview/404.html'), renderPage('/not-found').html);
  await writeFile(path.join(out, 'theme/sections/velani-not-found.liquid'), renderBody('/not-found', { target: 'shopify' }) + '\n{% schema %}{"name":"Velani fallback","settings":[]}{% endschema %}\n');
  for (const name of ['404', 'page', 'product', 'collection', 'list-collections', 'cart', 'search']) await writeFile(path.join(out, 'theme/templates', name + '.json'), JSON.stringify({ sections: { main: { type: 'velani-not-found' } }, order: ['main'] }, null, 2) + '\n');
  await writeFile(path.join(out, 'theme/layout/theme.liquid'), renderShopifyLayout());
  await writeFile(path.join(out, 'theme/config/settings_schema.json'), JSON.stringify([{ name: 'theme_info', theme_name: 'Velani Midnight', theme_version: '0.1.0', theme_author: company.operator, theme_documentation_url: 'https://www.thevelani.com', theme_support_url: 'https://www.thevelani.com/pages/contact' }, { name: 'Inquiry activation', settings: [{ type: 'paragraph', content: 'When on, the Contact page uses the Shopify contact form on the published theme, and inquiries are emailed to the store sender address. When off, the page shows the support email instead.' }, { type: 'checkbox', id: 'inquiries_enabled', label: 'Enable inquiries on a published MAIN theme only', default: false }] }], null, 2) + '\n');
  await writeFile(path.join(out, 'theme/config/settings_data.json'), JSON.stringify({ current: { inquiries_enabled: false }, presets: {} }, null, 2) + '\n');
  await writeFile(path.join(out, 'theme/locales/en.default.json'), JSON.stringify({ general: { accessibility: { skip_to_content: 'Skip to content' } } }, null, 2) + '\n');
  await writeFile(path.join(out, 'routes.json'), JSON.stringify(manifest, null, 2) + '\n');
  await mkdir(path.join(root, 'docs/licenses'), { recursive: true });
  for (const [source, dest] of [['@fontsource/dm-sans/LICENSE', 'dm-sans.txt'], ['@phosphor-icons/core/LICENSE', 'phosphor.txt']]) await copyFile(path.join(root, 'node_modules', source), path.join(root, 'docs/licenses', dest));
  return { routes: Object.keys(manifest).length, preview: path.join(out, 'preview'), theme: path.join(out, 'theme') };
}
if (process.argv[1] === import.meta.filename) console.log(JSON.stringify(await build()));

