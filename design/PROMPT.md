# OpenCode prompt — Amiruan V6 front-end rebuild

Paste everything between the rules into OpenCode, running in
`C:/Users/light/Documents/New OpenCode Project/portfolio-astro`.

---

Adopt the finished V6 design in `./design/` as the new front end for this Astro portfolio.
`design/HANDOFF.md` is the spec — read it fully, then read `design/desktop.html` and
`design/mobile.html` for exact structure. `design/png-*/` is the visual truth; look at the
matching PNG before you build each page.

**Stack rules — do not deviate:**
- Astro 7 + vanilla CSS + small vanilla JS. The repo has **no React and no Tailwind**.
  Do not add them. Do not add a motion/chart/icon library.
- Keep `src/lib/wordpress.ts` and the WordPress REST contract. Extend, never rewrite.
- All colours come from the `:root` tokens in HANDOFF §3. No hardcoded hex in components.
- Fonts: self-host Space Grotesk, Inter, JetBrains Mono via `@fontsource` (only the
  weights used). Add preconnects.
- Global border-radius is `2px`. Nothing larger.

**Build order — stop after each step and tell me what you did. Do not run ahead.**

1. **Foundation.** `src/styles/tokens.css` with the tokens from HANDOFF §3; base reset,
   type scale, the `.reveal` IntersectionObserver utility, the marquee keyframes.
   Load the three fonts. Create `src/components/layout/` with `Marquee.astro`,
   `Header.astro`, `Footer.astro`, `ClosingCTA.astro`, and a `Base.astro` layout that
   composes them and handles `<head>`, canonical, OG, and JSON-LD `Person`.
   Build them once from the design — every page reuses them. Confirm the header/footer
   match `design/png-desktop/JrcX9.png` at 1440 and `design/png-mobile/Cq8mG.png` at 390.

2. **Renderer + home.** Rewrite `src/pages/index.astro` to the V6 Home: 9 sections in
   order (Marquee, Header, Hero, About, Work, Path, Toolbox, Life Lately, Closing).
   Keep the existing WP-backed work section — same data, new presentation: the accordion
   with the first item expanded, and the `VIEW ALL WORK` link pointing at `/work`.
   The hero portrait and the section backgrounds use the CSS-gradient reinterpretation
   of `glow-a.glsl` / `dark-glow.glsl` (HANDOFF §7 option 1) — layered radial-gradients
   at the tested stops, not a canvas.

3. **Work.** New `src/pages/work/index.astro` (the 6-card grid + filters) and rewrite
   `src/pages/work/[slug].astro` to the split-panel case-study template. Both stay
   WP-driven through `wordpress.ts`. Grid cards link to the exact slugs in HANDOFF §5.

4. **Gallery.** Rewrite `src/pages/gallery.astro` to Gallery V6. Preserve the existing
   `gallery_type` filtering, `acf` fields and `window.galleryData` contract in
   `public/assets/js/gallery.js` unless you have a specific reason to change it — if so,
   say why first. Add the lightbox from HANDOFF §8.

5. **New pages.** `src/pages/services/index.astro`, the three
   `src/pages/services/*.astro`, `src/pages/contact.astro`, `src/pages/404.astro`.
   Services and Path copy ships **static**, declared as arrays at the top of each file,
   so a CPT swap later is a one-line change. Do not add CPTs.

6. **Polish + SEO.** The HANDOFF §9 checklist: one `<h1>` per page (the current home has
   none), canonicals, OG images, `@astrojs/sitemap` for a real `sitemap.xml` and
   `robots.txt`, `astro:assets` for images, `prefers-reduced-motion` respected
   throughout, keyboard focus states visible on dark and light.

**Hard constraints:**
- Mobile is **not** a separate build — every page must reflow from the same markup.
  Check at 390 and 1440 and tell me if either breaks.
- Accent discipline (HANDOFF §3) is non-negotiable: coral = action/emphasis only,
  blue = metadata/structure only, green = the availability dot only.
- Do not push to `main` and do not deploy. Any push to `main` is a live production
  deploy via Cloudflare Pages. Work on a branch, hand me the preview URL.
- Diff every page you finish against its PNG in `design/png-*/` before moving on,
  and tell me where it does not match.

**Decisions I have not made yet — ask me, do not guess:**
- Contact email: the design says `amiruan12@gmail.com`, the live site says
  `hello@amiruan.dev`. Which wins?
- The live site has an "Ask AI" terminal modal and a "UX Pathfinder" panel. Neither is in
  the V6 design. Keep, drop, or restyle later?
- Footer socials: design lists Email / Instagram / LinkedIn / GitHub; live has
  GitHub / LinkedIn / Twitter / Dribbble. Confirm the final four.
- Older WP work posts (`brand-website-redesign`, `automated-printing`, `fintech-dashboard`)
  have no V6 design. Create posts for the 6 designed slugs, or 301 the old ones?

Start with step 1 and show me the foundation before continuing.
