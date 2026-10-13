# OpenCode prompt — run dev, verify, commit

Paste everything between the rules into OpenCode, running in
`C:/Users/light/Documents/New OpenCode Project/portfolio-astro`.

---

Three jobs: start the dev server, verify a batch of changes made outside this session,
then commit. Do them in order and report after each.

## 0. Start the dev server

No dev server is currently running (it was stopped). Start it using the background mode
described in `AGENTS.md`:

```
astro dev --background
astro dev status
```

Do **not** just `nohup` it — a backgrounded process from a shell call does not survive, and
you'll get a 200 from a server that is actually dead or stale.

**Important context — this bit us already.** The previous dev server had been up for
**4.2 hours** and was serving a **stale Vite module graph**. The page returned 200 and looked
fine, but the `ClosingCTA` stylesheet it served contained no `.closing__mask` rules at all and
`.closing__line` had no `transform`/`transition`. So real changes were invisible in the browser
and two rounds were wasted chasing phantom bugs.

**So after starting it, prove the CSS is fresh** before verifying anything:

```
curl -s "http://localhost:4321/src/components/layout/ClosingCTA.astro?astro&type=style&index=0&lang.css" | grep -o 'closing__line[^{]*{[^}]*}'
```

You must see `display: block`, `transform: translateY(115%)`, `transition: transform .85s`,
and `transition-delay: calc(var(--i, 0) * 80ms)`. If any are missing, restart the server and
check again — don't proceed until they're present.

## 1. Verify

All of the below was implemented outside this session. Check each one; report pass/fail with
the measured value. Don't fix anything yet — just report.

### Desktop (1440)

| Check | Expected |
| --- | --- |
| `/` returns | 200 |
| Glow canvases on `/` | **4** (hero, work, toolbox, closing band — the CTA and footer share one) |
| `#stack` tool tiles visible | **15 / 15**, `.tooltabs` computed `display: none` |
| Hovering a radar axis on desktop | still 15/15 visible, that row highlighted |
| Path section | `.pathpin` has `is-pinned`, `.pathpin__stage` is `position: sticky` |
| Path entries | 5 `.pentry`, exactly one `.is-active` |
| `.what__grid` | 3-column grid (`repeat(3, 1fr)`) |

### Mobile (390)

| Check | Expected |
| --- | --- |
| Path pin active | `.pathpin.is-pinned` true; wrapper ≈ 3798px; stage = 844px (one viewport) |
| `.what__grid` scrollable | `scrollWidth > clientWidth`; first card's `left` === `var(--pad)` (20px) — flush, not clipped |
| Tool tiles | **3 visible** (the active axis only) |
| `.tooltabs` | `display: flex` |
| Hover radar axis 2 | visible tiles all `data-axis="2"`, active tab = 2, panel label "AI / LLM" |
| Hover radar axis 4 | visible tiles all `data-axis="4"`, active tab = 4, panel "BACKEND" |
| Click tab 1 | visible tiles all `data-axis="1"`, panel "WORDPRESS" |
| CTA line delays | `0s` / `0.16s` / `0.32s` |
| No horizontal page overflow | `documentElement.scrollWidth === innerWidth` |

### Both

- **Contact** (`/contact`): exactly **1** `data-glow` canvas, **1** `.band`, **1** `.chero`, **0** `.closing` (CTA removed), 1 `.ft` — the hero, marquee bar and footer share one gradient.
- **CTA animation**: scroll the closing band into view; the three lines must reach `is-in` at different times and each be at a different `transform` mid-flight.
- **Dead links**: crawl `href="/..."` across `/`, `/work`, `/gallery`, `/services`, `/services/*`, `/contact`, `/work/ai-kiosk-interface/` — all must be 200.
- **No page on the old design**: no `.astro` file under `src/pages` should contain `<!DOCTYPE`, or reference `assets/css/styles.css`, `assets/css/gallery.css`, `assets/js/main.js`, `assets/js/gallery.js`. Every page must import `layout/Base.astro`.
- `astro check` (or `npm run build`) passes.

**Also flag anything that looks wrong that isn't on this list.** I could not verify visually
for most of this session — the browser's CDP channel was wedged — so this list is structural
verification, not a design review. A human should still look at it.

## 2. Commit

Branch is `v6-redesign`. **Do not push, do not deploy.**

A plain `git commit -am` will miss six untracked paths:

```
?? src/components/layout/ClosingBand.astro
?? src/data/services.ts
?? src/pages/404.astro
?? src/pages/contact.astro
?? src/pages/services/          (index.astro + [slug].astro)
?? src/pages/work/index.astro
```

Missing `ClosingBand.astro` in particular would break every page — `Base.astro` imports it.

Suggested subject:

```
feat(v6): closing band shared gradient, gallery + case study on V6, services/contact/404 routes
```

In the message, note that this batch was largely done outside this session by the design
agent: the real shader backgrounds, the pinned Path section with the spring cursor, the
About/WhatIDo restructure, the toolbox axis/tab wiring, the Contact band merge, and the
Gallery / case-study / Services / Contact / 404 rebuilds.

Then confirm with `git status` and `git log -1 --stat` that everything landed and the working
tree is clean.

## Still open — do not guess

- Contact email: design says `hello@amiruan.site`, build uses `amiruan12@gmail.com`
- Keep or drop the old "Ask AI" terminal + "UX Pathfinder" panel
- Final four footer socials (design: Email/Instagram/LinkedIn/GitHub; live: GitHub/LinkedIn/Twitter/Dribbble)
- Resume file for `DOWNLOAD RESUME` (currently `#`)
- Work slugs: the design references 6 projects, WordPress has 6 different ones — only 2 overlap
- The accordion's expanded panel is still the WP featured image, not the design's kiosk UI mock
- Dead weight still shipping in `public/`: `assets/css/styles.css`, `assets/css/gallery.css`, `assets/js/main.js`, `assets/js/gallery.js` — referenced by nothing now
