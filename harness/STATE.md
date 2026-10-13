# Harness — STATE

Source of truth for the V6 verification/commit session. Update after every step.

## Environment
- Repo: `C:/Users/light/Documents/New OpenCode Project/portfolio-astro` (branch `v6-redesign`, do NOT push/deploy).
- Dev server: `node harness/dev.mjs start|stop|restart|status` (detached; kills :4321 first). URL http://localhost:4321.
- Local WP (Laragon): MySQL `mysqld` + Apache `httpd`; root `C:/laragon/www/portfolio-wp`;
  API `http://localhost/portfolio-wp/wp-json/wp/v2`; work slugs (6): ai-kiosk-interface, headless-commerce,
  fintech-dashboard, ai-knowledge-assistant, automated-printing, brand-website-redesign.
- Tools: `harness/check.mjs` (health, <=10 lines), `harness/probe-html.mjs` (static counts),
  `harness/crawl.mjs` (link crawl). Logs -> `harness/logs/`.

## Job 1 — verification results
Desktop 1440 (browser, emulate 1440x900): w=1440 docW=1425
- `/` 200; glow=4; tiles 15/15 visible; `.tooltabs` display:none; `.what__grid` = 389.6px x3 (3 col);
  5 `.pentry`; hover `.bench__axis[4]` -> 15/15 visible + label "BACKEND" + row `.is-active`=[4];
  `.pathpin.is-pinned`=true; `.pathpin__stage` position=sticky; exactly 1 `.pentry.is-active`. ALL PASS.

Mobile 390 (emulate 390x844): w=390 docW=390
- `.pathpin.is-pinned`=true; wrapper height 3798px; `.pathpin__stage` 844px, sticky;
- `.what__grid` scrollable (scrollW 894 > clientW 350); first card left=20 (flush);
- `.tooltabs` display:flex; CTA line transition-delay 0s / 0.16s / 0.32s; no horiz overflow. PASS.
- Panel wiring PASS: axis2 -> "AI / LLM" + tab 2; axis4 -> "BACKEND" + tab 4; tab1 -> "WORDPRESS".
- **(was FAIL, now FIXED) mobile tool tiles: 15 visible, expected 3 (active axis only).**
  Root cause: `.tool { display:flex }` (index.astro:666) overrides the `[hidden]` attribute the JS sets.
  Fix `.tool[hidden] { display:none; }` (index.astro:671) was added OUTSIDE this session (after the first
  commit `d838136`, so it was NOT in that commit). Re-verified at 390: initial axis0 = 1 axis / 3 tiles,
  hover axis2 -> 3 tiles, tab1 -> 3 tiles, docW 390 (no overflow). Committed as `fix(toolbox): …`.

Both:
- `/contact`: glow=1, .band=1, .chero=1, .closing=0, .ft=1. PASS (CTA removed; hero/marquee/footer share gradient).
- CTA stagger PASS: forcing `.is-in` -> t120 line0=72.7 / others 133.86; t240 28.9/97.9/133.86;
  t360 10.3/35.8/114.6; done 0/0/0. Different times + different mid-flight transforms.
- Dead links PASS: crawl 16 links, 16 ok / 0 fail (seeds /, /work, /gallery, /services, /contact, /work/ai-kiosk-interface/).
- Old design PASS: no `<!DOCTYPE` in src/pages; no refs to assets/css|js legacy files; all 8 pages import layout/Base.astro.
- Build PASS: `npm run build` exit 0, 15 pages.

## Notes / caveats
- Embedded browser (pencil) cannot scroll (window.scrollTo + wheel both no-op; no lock class) — an
  embedding artifact, not a page bug. Reveal/animation verified by firing `.is-in` directly.
- Earlier work-detail 404s = stale module graph (server started while WP down); fixed by WP up + dev restart.
- `data-axis` (20) and `is-pinned` (18) static string counts are noisy; use real selectors
  (`#axesGrid .tool[data-axis]`, `.pathpin.is-pinned`).

## Open (do NOT guess)
- (resolved) Contact email: user confirmed `amiruan12@gmail.com`. Build already uses it on all
  surfaces (contact.astro:6, ClosingCTA.astro:8, Footer.astro:8) — no code change.
- (resolved) "Ask AI" terminal + "UX Pathfinder": absent from src/ — already dropped in the V6 rebuild.
- (resolved) Footer socials: build already matches the design's four — Instagram, LinkedIn, GitHub,
  Email (Footer.astro:4-9). GitHub href `github.com/Amirue` confirmed correct by user; HANDOFF §5's
  `github.com/amiruan` is outdated (design/ is read-only, so left as-is).
- (resolved) Resume: DOWNLOAD RESUME now points at the user-supplied PDF
  `https://wp.amiruan.site/wp-content/uploads/2026/10/Resume_Muhammad_Amiruddin_Bin_Zulkifli-1.pdf`
  (index.astro:138, :255). Verified 200 application/pdf over https; 2 links on `/`.
- (resolved) Work slugs: user chose to KEEP the current WP 6 (no new posts, no redirects); crawl
  was already green (no dead links).
- (resolved) Accordion kiosk UI mock built: `src/components/KioskMock.astro` (620x412, #0D0D12) shown for
  slug `ai-kiosk-interface` in the Work accordion panel; other projects keep image/PREVIEW SOON.
  Verified 1440: 620x412, 35 wave bars, "KIOSK · TABLE 04", "CONFIRM ORDER", "RM 15.50"; 390: 310x412, docW 390.
- (resolved) Dead weight in public/: legacy css/gallery.css/js dropped in `cef621e`. Remaining
  dead images `public/assets/images/gallery/g01–g12.svg` were referenced ONLY by the deleted
  `public/assets/js/data/posts.js` (also `cef621e`) — removed this session; build 15 pages PASS.
  `hero-1/2/3.png`, `profile.png`, `wc-1/2/3.jpg` are all still referenced (index.astro, Base.astro).
- (resolved) mobile `.tool[hidden]` fix applied + verified.

## Commits (branch v6-redesign, NOT pushed)
- `d838136` feat(v6): closing band shared gradient, gallery + case study on V6, services/contact/404 routes
  (batch from design agent + this session's harness; all 6 untracked paths staged).
- `chore(harness): ignore harness/logs runtime output` — .gitignore `harness/logs/*` + `!harness/logs/.gitkeep`;
  untracked committed build.log/check.log.
- `3b9ec59` fix(toolbox): hide inactive tool tiles on mobile.
- `cef621e` chore: drop dead legacy assets (public/assets css + js; incl. orphan posts.js).
- `dfcbc85` feat(work): kiosk UI mock in the featured Work accordion panel.
- `30791dc` fix(footer): match design height (gap 40, drop extra mid padding) — footer 321->273, band 1153.
- `c9853e5` docs(harness): state after kiosk mock + footer height + asset cleanup.
- `6a8d12e` chore: drop dead gallery placeholder svgs (g01-g12; orphaned by cef621e) + contact-email decision.
- `87742ad` feat(home): wire DOWNLOAD RESUME to the real PDF (index.astro:138, :255).

## Next
- ALL previously-open "do NOT guess" decisions are now resolved (contact email, socials incl. GitHub,
  Ask AI / UX Pathfinder, resume, work slugs). No open items remain.
- PHASE3 §5 closing/footer heights now match. About (WFacts/Process) + Toolbox (3x5) already built by design agent.
- Nothing else verified outstanding from Job 1. No push/deploy.
