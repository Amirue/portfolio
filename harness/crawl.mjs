// harness/crawl.mjs — crawl root-relative links from seed pages; report 200 vs non-200. <=10 lines.
const DEV = 'http://localhost:4321';
const seeds = ['/', '/work', '/gallery', '/services', '/contact', '/work/ai-kiosk-interface/'];
const links = new Set();
for (const s of seeds) {
  const r = await fetch(DEV + s);
  if (!r.ok) { console.log(`seed ${s} -> ${r.status}`); continue; }
  const h = await r.text();
  for (const m of h.matchAll(/href="(\/[^"'#? ]*)/g)) {
    let u = m[1];
    if (u.startsWith('//')) continue;
    if (!u.endsWith('/') && !/\.[a-z0-9]+$/i.test(u)) u += '/';
    links.add(u);
  }
}
let ok = 0;
const fail = [];
for (const l of [...links].sort()) {
  const r = await fetch(DEV + l, { redirect: 'follow' });
  if (r.status === 200) ok++;
  else fail.push(`${l}(${r.status})`);
}
console.log(`seeds: ${seeds.length} | links found: ${links.size}`);
console.log(`ok: ${ok} / fail: ${fail.length}`);
if (fail.length) console.log(`fail: ${fail.join(', ')}`);
