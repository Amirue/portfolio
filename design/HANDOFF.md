# Amiruan V6 — Design → Code Handoff

Design source: `untitled.pen` (pen.dev canvas).
This folder holds the exported reference. **Nothing here is implemented yet.**

---

## 0. Read this first — readiness

**The design is finished. The code is not.** The live site (`index.astro`) is still the
*previous* light theme. Adopting V6 means a front-end rewrite of every page, not a tweak.

Blockers before this can go live:

| # | Blocker | Owner |
| --- | --- | --- |
| 1 | No V6 implementation exists in the repo | dev |
| 2 | Fonts (Space Grotesk / Inter / JetBrains Mono) are not loaded | dev |
| 3 | Shader backgrounds need a web implementation or a CSS fallback | dev |
| 4 | Contact email conflict: live says `hello@amiruan.dev`, design says `amiruan12@gmail.com` | **you** |
| 5 | Social links conflict: live has GitHub/LinkedIn/Twitter/Dribbble, design has Email/Instagram/LinkedIn/GitHub | **you** |
| 6 | "Ask AI" terminal + "UX Pathfinder" panel are live features absent from the design — keep or drop? | **you** |
| 7 | Work CPT has more posts than the 6 designed cards; some slugs have no design | **you** |
| 8 | No staging environment — any push to `main` deploys to production | dev |

At the time of writing the *existing* site works and is deployed. Treat this as a
**branch + preview deploy** job, never a direct push to `main`.

---

## 1. Stack (what the repo actually is)

- **Astro 7.3.2**, minimal template. Single dependency: `astro`.
- **No React. No Tailwind. No motion library.** Styling is one vanilla stylesheet
  (`public/assets/css/styles.css`, ~68KB) plus a second for gallery
  (`public/assets/css/gallery.css`). Behaviour is vanilla JS (`public/assets/js/main.js`).
- **Content:** headless WordPress over the REST API at
  `PUBLIC_WP_API_URL` → `https://wp.amiruan.site/wp-json/wp/v2`.
- Adapter lives in `src/lib/wordpress.ts` — all fetches, with timeouts and non-JSON guards.
- **Deploy:** Cloudflare Pages, triggered by a WordPress webhook
  (`cf-deploy-webhook.php`). Static output in `dist/`.

**Do not add React or Tailwind for this.** Keep Astro + vanilla CSS + small vanilla JS
islands. Everything the design needs (scroll reveals, marquees, count-ups, accordion,
tabs, lightbox) is achievable in ~150 lines of CSS/JS and will be far faster than
hydrating a React tree. If you disagree, raise it before starting — it changes every file.

---

## 2. Pages (22 designed frames → 11 routes)

Route → desktop frame → mobile frame → Astro file.

| Route | Desktop | Mobile | File to (re)write |
| --- | --- | --- | --- |
| `/` | `JrcX9` Home (V6) | `Cq8mG` M · Home | `src/pages/index.astro` |
| `/work` | `aNnw6` Work Index (V6) | `e3DNI5` M · Work Index | `src/pages/work/index.astro` **(new)** |
| `/work/[slug]` | `v2ikn0` AI Kiosk, `icSc0` Headless | `oJt3G`, `bT0SM` | `src/pages/work/[slug].astro` |
| `/gallery` | `siOva` Gallery V6 | `BEb9P` M · Gallery | `src/pages/gallery.astro` |
| `/services` | `iCRlg` Services | `AOhNs` M · Services | `src/pages/services/index.astro` **(new)** |
| `/services/wordpress-development` | `KN2nw` | `lYi3G` | `src/pages/services/wordpress-development.astro` **(new)** |
| `/services/ui-ux-design` | `c0bkc` | `mHhaE` | `src/pages/services/ui-ux-design.astro` **(new)** |
| `/services/ai-integration` | `yjXsu` | `gCbMi` | `src/pages/services/ai-integration.astro` **(new)** |
| `/contact` | `F8TkC` Contact | `vX1d9` M · Contact | `src/pages/contact.astro` **(new)** |
| `/404` | `BeX3W` 404 | `ACt1n` M · 404 | `src/pages/404.astro` **(new)** |

Desktop and mobile are the **same route**, responsive. Do not build two route trees.

---

## 3. Design tokens

Copy into `src/styles/tokens.css` (or the top of `styles.css`) and use everywhere.
No hardcoded hex in components.

```css
:root{
  /* surfaces */
  --ink:#0A0A0A;        /* dark section bg + light-mode text */
  --paper:#F7F6F3;      /* light section bg */
  --paper-2:#EDECE8;
  --marquee:#050505;
  --tile:#131318;       /* dark card */
  --line-d:#1C1C1C;     /* hairline on dark */
  --line-d2:#2A2A33;    /* card border on dark */
  --line-l:#DCDBD6;     /* hairline on light */

  /* accents — exactly two, plus one semantic */
  --accent:#FF3B30;       /* ACTION + emphasis only */
  --accent-blue:#4DB8FF;  /* METADATA + structure only */
  --green:#2ECC71;        /* the ● AVAILABLE dot, nothing else */
  --orange:#FF7A1A;       /* reserved, barely used */

  /* text */
  --dim-d:#6B6B6B;      /* secondary on dark */
  --dim-l:#5A5A5A;      /* secondary on light */

  /* type */
  --font-display:"Space Grotesk";
  --font-body:"Inter";
  --font-mono:"JetBrains Mono";

  --radius:2px;         /* global. never larger */
}
```

**Accent discipline is the whole system.** Coral = things you click or that matter most.
Blue = labels, meta, categories, years, structure. Green = availability only. Breaking
this is the single fastest way to make the site look generic.

### Type scale (desktop)

| Role | Family | Size | Weight | Tracking |
| --- | --- | --- | --- | --- |
| Hero H1 | display | 96–120 | bold | −0.04em |
| Section H2 | display | 56–64 | bold | −0.03em |
| Card title | display | 20–28 | medium | −0.02em |
| Body | body | 15–17 | 400 | 0 |
| Label / meta | mono | 9–11 | 400 | +0.12em, uppercase |

Mobile: hero 44, section 26–34, body 14–15, mono 8–10.

**Fonts.** Load via `@fontsource/*` (self-hosted, no layout shift) or Google Fonts.
Add `<link rel="preconnect">`. Only 3 families and only the weights used.

---

## 4. Section inventory

Read `desktop.html` / `mobile.html` in this folder for exact structure, spacing and copy —
they are the Tailwind-shaped export of every frame and carry `data-layer-name` attributes
matching the names below. `png-desktop/` and `png-mobile/` are the visual truth.

**Home** (`JrcX9`) — 9 sections
`00 Marquee` · `01 Header` · `02 Hero` (shader + HUD portrait + 4 marquee rows) ·
`03 About` (statement, 2×2 stats, bio, "What I do", 3 capability blocks, process panel) ·
`04 Work` (accordion, first item expanded with a kiosk UI mock) · `05 Path` (timeline,
centre spine, colour-coded nodes) · `06 Toolbox` (radar + script-generated tool grid) ·
`07 Life Lately` (photo marquee + mono ticker) · `08 Closing` (manifesto + CTA + marquee + footer)

**Work Index** (`aNnw6`) — `00 Marquee` · `01 Header` · `02 Hero` · `03 Grid` (filter + 2×3) · `04 Footer`
**Gallery** (`siOva`) — Marquee · Header · GHero · GFilter · GFeed · GEnd · Footer
**Case study** (`v2ikn0`, `icSc0`) — `00 Marquee` · `01 Header` · `02 Split` (case info | visual) · `Meta` · `Footer`
**Services** (`iCRlg`) — Marquee\* · Header\* · Hero · List · CTA\* · Footer\*
**Service page** (`KN2nw`, `c0bkc`, `yjXsu`) — Marquee\* · Header\* · Hero · Body · CTA\* · Footer\*
**Contact** (`F8TkC`) — Marquee\* · Header\* · Hero (email/instagram/linkedin) · CTA\* · Footer\*
**404** (`BeX3W`) — Marquee\* · Header\* · Hero · Footer\*

\* already a component instance in the design.

### Components

| pen component | Build as | Used by |
| --- | --- | --- |
| `awBQy` Comp / Marquee | `src/components/layout/Marquee.astro` | all desktop pages |
| `KK1mN` Comp / Header | `src/components/layout/Header.astro` | all desktop pages |
| `Z46xNJ` Comp / CTA | `src/components/layout/ClosingCTA.astro` | services, contact |
| `k1umv` Comp / Footer | `src/components/layout/Footer.astro` | all desktop pages |
| `hf0mS` Comp / M Marquee | `src/components/layout/MobileBar.astro` | all mobile pages |
| `XMQqb` Comp / M Header | (same file, mobile markup) | all mobile pages |
| `IEG9e` Comp / M Closing | `ClosingCTA.astro` + `Footer.astro` (mobile) | all mobile pages |

Home, Work Index, Gallery and the case studies currently inline these rather than
instancing them — build them **once** as components and reuse. Same markup on every page.

---

## 5. Link map (extract from the design, do not invent)

The `.pen` drops hrefs; targets live in each node's `context` as `link: <url>`.

**Nav** (Header, all pages): Work `/work` · Services `/services` · Stack `/#stack` ·
About `/#about` · Gallery `/gallery` · Contact `/contact`

**Work cards** (both index grids): `/work/ai-kiosk-interface/`, `/work/wordcamp-dashboard/`,
`/work/portfolio-engine/`, `/work/headless-commerce/`, `/work/community-platform/`,
`/work/studio-brand-site/`

**Service EXPLORE links**: `/services/wordpress-development`, `/services/ui-ux-design`,
`/services/ai-integration`

**Contact / CTA / Footer**
- Email → `mailto:amiruan12@gmail.com` ⚠️ conflicts with live `hello@amiruan.dev`
- Instagram → `https://www.instagram.com/amiruan_12`
- LinkedIn → `https://www.linkedin.com/in/amiruddin-zulkifli-9485a2261`
- GitHub → `https://github.com/amiruan`
- Back to home → `/`

---

## 6. WordPress data mapping

Existing adapter: `src/lib/wordpress.ts`. Existing CPTs and fields — **no schema change
strictly required**:

| Design slot | Source |
| --- | --- |
| Work card image | `acf.work_images[0].url` (fallback: a generated placeholder) |
| Work card title | `title.rendered` |
| Work card description | `acf.subtitle` |
| Work card year | `acf.year` |
| Work card category chip | `work_type[0]` → `uiux` \| `wordpress` \| `ai` |
| Work metric badge | `acf.metric` |
| Case study split-panel left | `acf.context`, `acf.process`, `wp.content.rendered` |
| Case study split-panel right | `acf.work_images[]` |
| Case study meta rows | `acf.role`, `acf.year`, `acf.tools[]`, `work_type[0]` |
| Case study live button | `acf.demo_url` |
| Gallery post image(s) | `acf.gallery_images[].url` |
| Gallery post meta | `acf.location`, `acf.camera`, `acf.date_label`, `acf.views`, `acf.likes`, `acf.tags` |
| Gallery category filter | `gallery_type[0]` → `events` \| `travel` \| `studio` \| `moments` |

**Not yet modelled, currently static copy in the design** — decide: keep static (simplest,
ship now) or add CPTs later.
- Services copy (3 pages + hub): number, title, tagline, description, offering pairs, related work
- Path timeline (5 entries): year, kind (education/experience/open), title, body
- About stats (`08`, `60+`, `12`, `100`), capability blocks, process panel
- Toolbox radar values + tool grid

Recommendation: **ship them static**, structured as arrays at the top of each `.astro`
file so a later CPT swap is a one-line change.

### Work slugs — reconcile before launch

Designed cards reference: `ai-kiosk-interface`, `wordcamp-dashboard`, `portfolio-engine`,
`headless-commerce`, `community-platform`, `studio-brand-site`, plus `ai-knowledge-assistant`
(linked from a service page).

Existing WP posts include older ones: `brand-website-redesign`, `automated-printing`,
`fintech-dashboard`. Decide per slug: create the post, or 301 it. Never leave a designed
link pointing at a 404.

---

## 7. Shaders

Two backgrounds in the design are WebGL fragment shaders:

- `glow-a.glsl` — the warm/coral-to-cool/blue wash behind dark heroes, the closing band and the footer
- `dark-glow.glsl` — the darker vignette behind the Work / Toolbox sections

`--accent-blue: #4DB8FF` was **derived from this shader** (its cool term is
`vec3(0.012,0.055,0.082)` → hue 204°), so the two are meant to match.

Two options:

1. **CSS fallback (recommended to ship).** Recreate as layered radial-gradients at the
   tested colour stops. Zero JS, zero GPU cost, no risk. Visually ~90% there.
2. **Real shader.** Small WebGL canvas per section, one shared render loop, `IntersectionObserver`
   to pause off-screen, static gradient as the first frame and the no-WebGL fallback.

Start with (1) so the site ships; upgrade to (2) behind a flag if you want the motion.

---

## 8. Motion

No motion library. One CSS reveal utility + tiny vanilla JS:

- `IntersectionObserver` adds `.is-in` → `opacity/translateY` transition, `0.5s ease-out`,
  `80ms` stagger via `--i`.
- Marquees: CSS `@keyframes` translate, duplicate the track for a seamless loop,
  `animation-play-state:paused` on hover (marquee only).
- Stats count-up: `requestAnimationFrame` over ~800ms, once, on first enter.
- Header: `progressive blur` on scroll — a backdrop-filter that ramps in.
- Lightbox for gallery/case images: `<dialog>` + a small open/close script.
- Toolbox radar: it is a static SVG polygon in the design. On hover/tap of an axis,
  swap the active polygon + the adjacent panel. No chart library.

**Wrap every one of these in `@media (prefers-reduced-motion: reduce)`** — disable
transforms and animations, keep everything visible.

---

## 9. SEO (fix on the way through)

- [ ] One `<h1>` per page — the current home has **none**
- [ ] `canonical` on every page
- [ ] OG + Twitter card meta, per-page OG image
- [ ] Real `robots.txt` and `sitemap.xml` (the live site currently serves HTML for both) → `@astrojs/sitemap`
- [ ] JSON-LD: `Person`, `ProfessionalService` (areaServed Kuala Lumpur/Selangor), `BreadcrumbList`, `CreativeWork` (work), `Article` (blog)
- [ ] `404.astro` wired
- [ ] Images via `astro:assets` → AVIF/WebP, lazy below the fold, explicit width/height
- [ ] Internal links: home ↔ services ↔ work ↔ gallery

---

## 10. Do not break

- `src/lib/wordpress.ts` — every page depends on it. Extend, don't rewrite.
- The WP REST contract and the ACF field names. The WordPress side is already live.
- `gallery.js` / the gallery data shape (`window.galleryData`) — unless you're
  deliberately replacing that page's behaviour.
- The Cloudflare deploy webhook. Any push to `main` is a production deploy.

---

## 11. Assets in this folder

| File | Purpose |
| --- | --- |
| `desktop.html`, `mobile.html` | full structural export of every frame (Tailwind-shaped, layer names preserved) |
| `png-desktop/`, `png-mobile/` | 1× renders, one per frame — visual source of truth |
| `DMypP.png` | logo mark, bare (`<A>`) — 6× |
| `cLqz4.png` | logo mark, favicon tile — 6× |
| `glow-a.glsl`, `dark-glow.glsl` | shader source, if you take option 2 in §7 |

Already copied into `public/assets/images/`: `wc-1.jpg`, `wc-2.jpg`, `wc-3.jpg`
(hero-1/2/3.png and profile.png were already there).
