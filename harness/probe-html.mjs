// harness/probe-html.mjs — static (no-browser) structural counts. Usage: node harness/probe-html.mjs [paths...]
const DEV = 'http://localhost:4321';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const RE = {
  glow: /data-glow/g,
  canvas: /<canvas/g,
  axisTile: /data-axis=/g,
  pentry: /class="[^"]*\bpentry\b/g,
  tooltabs: /class="[^"]*\btooltabs\b/g,
  whatgrid: /class="[^"]*\bwhat__grid\b/g,
  band: /class="[^"]*\bband\b/g,
  chero: /class="[^"]*\bchero\b/g,
  closing: /class="[^"]*\bclosing\b/g,
  ft: /class="[^"]*\bft\b/g,
  pathpin: /class="[^"]*\bpathpin\b/g,
  ispinned: /is-pinned/g,
  tooltile: /class="[^"]*\btooltile\b/g,
  toolpanel: /class="[^"]*\btoolpanel\b/g,
};
for (const p of pages) {
  const r = await fetch(DEV + p);
  const h = await r.text();
  const counts = Object.entries(RE).map(([k, re]) => `${k}=${(h.match(re) || []).length}`).join(' ');
  console.log(`${p} [${r.status}] ${counts}`);
}
