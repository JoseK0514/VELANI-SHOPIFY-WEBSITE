// Render every route (preview page and Shopify section body) plus the Shopify snippets to a JSON snapshot.
const [srcDir, out] = process.argv.slice(2);
const { routes } = await import(srcDir + '/content.mjs');
const r = await import(srcDir + '/render.mjs');
const snap = {};
for (const p of [...Object.keys(routes), '/not-found']) { snap['page ' + p] = r.renderPage(p).html; snap['shopify ' + p] = r.renderBody(p, { target: 'shopify' }); }
for (const [k, v] of Object.entries(r.renderShopifySnippets())) snap['snippet ' + k] = v;
(await import('node:fs')).writeFileSync(out, JSON.stringify(snap));
console.log(Object.keys(snap).length);
