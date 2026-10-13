// harness/check.mjs — one-shot health check for the V6 build.
// Prints <=10 lines. Verbose detail (if any) goes to harness/logs/check.log.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEV = 'http://localhost:4321';
const WP = 'http://localhost/portfolio-wp/wp-json/wp/v2';
const LOG = path.join(root, 'harness', 'logs', 'check.log');
fs.mkdirSync(path.dirname(LOG), { recursive: true });
const verbose = [];

async function get(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { redirect: 'manual', signal: ctrl.signal });
    clearTimeout(t);
    return r.status;
  } catch (e) {
    clearTimeout(t);
    verbose.push(`ERR ${url} :: ${e.message}`);
    return 0;
  }
}

const devCode = await get(`${DEV}/`);

// WP API + slugs
let wpLine = 'wp-api: down';
let slugs = [];
try {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  const r = await fetch(`${WP}/work?per_page=50&_fields=slug`, { signal: ctrl.signal });
  clearTimeout(t);
  if (r.ok) {
    let txt = await r.text();
    txt = txt.replace(/^\uFEFF/, '');
    slugs = JSON.parse(txt).map((x) => x.slug);
    wpLine = `wp-api: ${r.status} (${slugs.length} works)`;
  } else {
    wpLine = `wp-api: ${r.status}`;
  }
} catch (e) {
  verbose.push(`WP ERR: ${e.message}`);
}

// Crawl work detail pages
let ok = 0;
const fail = [];
for (const s of slugs) {
  const code = await get(`${DEV}/work/${s}/`);
  if (code === 200) ok++;
  else fail.push(`${s}(${code})`);
}

fs.writeFileSync(LOG, verbose.join('\n') + '\n');

console.log(`dev: ${devCode === 200 ? '200' : devCode || 'down'}`);
console.log(wpLine);
console.log(`work pages: ${ok} ok / ${fail.length} fail`);
if (fail.length) console.log(`fail: ${fail.join(', ')}`);
