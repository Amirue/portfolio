# OpenCode prompt — verify, commit, push to production

Paste everything between the rules into OpenCode, running in
`C:/Users/light/Documents/New OpenCode Project/portfolio-clean`.

---

Verify the current working tree, commit it, and push it live. Branch is `v6-redesign`.

## How deploy works here (don't improvise)

- **Live branch is `master`.** Pushing to `master` triggers a Cloudflare Pages build that
  publishes `amiruan.site`. `v6-redesign` is a descendant of `master`, so
  `git push origin v6-redesign:master` is a clean fast-forward.
- `HEAD` currently equals `origin/master` — the last deploy is at `11626ec`. Everything below
  is new on top of it.

## ⚠️ Do NOT build or deploy from this machine

**Local Apache is down**, so local WordPress is unreachable (`localhost/portfolio-wp` returns
`000`). A local `npm run build` therefore produces **9 pages instead of 15**, with the work
grid and gallery feed empty — because `src/lib/wordpress.ts` swallows the fetch failure and
returns `[]`.

**Deploying that `dist/` would ship a site with no projects and no photos.**

The Cloudflare build is fine: it uses its own `PUBLIC_WP_API_URL` pointing at
`https://wp.amiruan.site`, which I verified returns `200` with 6 works. So the deploy must go
through the push — never through a locally built `dist/`.

If you want to run a build locally for verification, point it at production first:

```
PUBLIC_WP_API_URL=https://wp.amiruan.site/wp-json/wp/v2 npm run build
```

Then confirm it produces **15 HTML files**, not 9. Delete `dist/` afterwards; it must not be
committed (it's gitignored, but don't leave a stale local build around either).

## 1. Verify

Eight modified files and one untracked. Five are design-reference exports (no runtime effect),
three are the actual changes:

**Source changes to verify:**

`src/pages/index.astro`
- **Mobile hero band position.** The desktop band is centred with `top: 50%; transform:
  translateY(-50%)`, and the `≤1100px` block reset only `position`. The transform stayed live
  and dragged the band to `y −7` — behind the sticky header. Now cleared with `top: auto;
  transform: none`. At 390px, `.hero__marquees` must sit at `y 105` (hero 77 + 28 padding).
- **Capability cards are now a dark tile** (design option C) instead of an orange fill. The
  old fill was a `::before` with `inset: -28px -20px -24px`, which bled 20px sideways and
  landed on the neighbouring card in the mobile slider, where the gap is 16px. It's gone.
  - Active: `background: var(--tile)` (#131318), `border-color: var(--line-d2)`, number coral,
    title `#fff`, body `#a8a8b3`, list rules `#2a2a33`.
  - Padding (`36px 28px 30px`) and all four borders are on **every** card, transparent when
    inactive, so switching state cannot shift the box. Please confirm that: toggling
    `.is-active` must not change any card's `width`, `height` or `left`.
  - Grid gap went `64px → 16px`, because 16 + 28 + 28 preserves the design's 64px rhythm.
- **New mobile slide indicator.** `.whatprog` under the slider: one segment per slide filled up
  to the active one, plus a mono `01 / 03` counter. `display: none` above 900px (the grid
  isn't a slider there). Driven from the same `markActiveCap` handler as the active card.
  Swiping must move segments `[100] → [110] → [111]` and the counter `01/03 → 02/03 → 03/03`,
  and reverse correctly.

`src/pages/work/index.astro` and `src/pages/gallery.astro`
- **Same class of bug as the hero.** `.whero > .wrap { position: relative }` has specificity
  `(0,2,0)` — two classes — which outranks the mobile `(0,1,0)` `position: static`. The
  elements stayed `relative` (still in flow) but the desktop `top: 90px` / `top: 509px` kept
  applying as offsets, pushing the H1 onto the marquee band and the foot 630px down. Fixed
  with `top: auto`, which does win.
- Verify at 390px: `.whero__top` at y125, `.whero__foot` at y336, and **no overlap** between
  the top block and the band. Same for `.ghero__*` on `/gallery`.

**Design exports (no runtime effect, just reference):** `design/desktop.html`,
`design/mobile.html`, `design/png-desktop/JrcX9.png`, `design/png-mobile/Cq8mG.png`, and new
`design/png-mobile/rJi1C.png`.

**Also confirm:** no page still uses the old design (no `<!DOCTYPE` in `src/pages`, every page
imports `layout/Base.astro`), and the internal link crawl is clean.

**Report pass/fail per item with measured values, and flag anything wrong that isn't on this
list.** Note that the local dev server at `:4321` *is* up, so browser checks work — but its
data comes from local WP, which is down, so expect empty work/gallery grids there.

## 2. Commit

Include the untracked file — `git commit -am` will miss it:

```
?? design/png-mobile/rJi1C.png
```

Suggested subject:

```
fix(mobile): hero band behind header, work/gallery hero offsets; feat(home): dark active card + slide indicator
```

## 3. Push

```
git push origin v6-redesign:master      # this is the deploy
git push origin v6-redesign             # keep the branch in sync
```

Then verify the live result — **follow redirects**, Astro 308-redirects the bare paths:

```
curl -sL -o /dev/null -w "%{http_code}\n" https://amiruan.site/work/     # expect 200
curl -sL https://amiruan.site/work/ | grep -c wcard                      # expect > 0
curl -sL https://amiruan.site/ | grep -c tloop                           # expect > 0
```

Then confirm on the live site: `/work/` has 6 cards, `/gallery/` has posts, the homepage hero
band sits below the header on mobile, and the "What I do" slider shows the dark active card
with the progress bar beneath it.

**Report the live URL and what you checked.** If the deploy build fails or a page comes back
empty, stop and tell me rather than re-pushing.

## Notes, not blockers

- Local Apache won't start: Laragon's generated `httpd.conf` keeps re-introducing a doubled
  path (`php/php-php-8.3.33-Win32-vs16-x64`) on the `LoadModule php_module` and `PHPIniDir`
  lines. I've fixed it twice and Laragon has regenerated it twice. Doesn't affect the deploy,
  which happens on Cloudflare — but it's why local WP keeps dropping out.
- `portfolio-astro` is retired. All work goes in `portfolio-clean`.
