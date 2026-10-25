#!/usr/bin/env node
/**
 * IndexNow batch submission (research/GROWTH.md §1.2).
 *
 * Reads every URL from the BUILT sitemap (dist/sitemap-*.xml, written by
 * `npm run build`) so the submitted list can never drift from what is live,
 * then POSTs the whole set to api.indexnow.org in one batch. That single
 * POST notifies Bing, Yandex, Naver, Seznam and Yep (Google does not
 * participate in IndexNow).
 *
 * The key is discovered from public/: the file whose name is `<key>.txt`
 * and whose content is exactly the key (IndexNow's verification file,
 * deployed to https://tabarcade.online/<key>.txt).
 *
 * ⚠️ ONLY run this once the site answers on HTTPS — IndexNow validates the
 * key file over the submitted URLs' scheme, and the GitHub Pages cert has
 * to be live first. Until then use --dry-run to check the URL list.
 *
 * Usage:
 *   npm run build && npm run indexnow            # submit all sitemap URLs
 *   npm run indexnow -- --dry-run                # print the list, send nothing
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'tabarcade.online';
const dryRun = process.argv.includes('--dry-run');

/* --- discover the key ------------------------------------------------- */
const keyFile = readdirSync(path.join(root, 'public')).find((f) => {
  if (!/^[a-zA-Z0-9-]{8,128}\.txt$/.test(f)) return false;
  return readFileSync(path.join(root, 'public', f), 'utf8').trim() === f.slice(0, -4);
});
if (!keyFile) {
  console.error('IndexNow: no key file found in public/ (expected <key>.txt containing the key).');
  process.exit(1);
}
const key = keyFile.slice(0, -4);

/* --- collect URLs from the built sitemap ------------------------------ */
const dist = path.join(root, 'dist');
if (!existsSync(dist)) {
  console.error('IndexNow: dist/ not found — run `npm run build` first.');
  process.exit(1);
}
const sitemapFiles = readdirSync(dist)
  .filter((f) => /^sitemap-\d+\.xml$/.test(f))
  .sort();
if (!sitemapFiles.length) {
  console.error('IndexNow: no sitemap-*.xml in dist/ — run `npm run build` first.');
  process.exit(1);
}
const urls = [
  ...new Set(
    sitemapFiles.flatMap((f) =>
      [...readFileSync(path.join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
    ),
  ),
].sort();
if (!urls.length) {
  console.error('IndexNow: sitemap contained no URLs.');
  process.exit(1);
}

console.log(`IndexNow: ${urls.length} URLs from ${sitemapFiles.join(', ')}`);
console.log(`IndexNow: key file https://${HOST}/${keyFile}`);

if (dryRun) {
  console.log('IndexNow: --dry-run, nothing sent. First/last URLs:');
  console.log(' ', urls[0]);
  console.log(' ', urls[urls.length - 1]);
  process.exit(0);
}

/* --- submit (batches of 10,000 = the API limit; we send one) ---------- */
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `https://${HOST}/${keyFile}`,
      urlList: batch,
    }),
  });
  const body = await res.text();
  console.log(`IndexNow: POST ${batch.length} URLs -> HTTP ${res.status}${body ? ` ${body.slice(0, 200)}` : ''}`);
  // 200 = received; 202 = received, key validation pending (normal first run).
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}
console.log('IndexNow: done.');
