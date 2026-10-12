# OpenCode prompt — phase 3 remainder + review the shader work

Paste everything between the rules into OpenCode, running in
`C:/Users/light/Documents/New OpenCode Project/portfolio-astro`.

---

Two things landed outside this session that you should review first, then a batch of
spec-matching work. The design reference in `design/` has been **re-exported** — reload
`design/desktop.html` and `design/png-desktop/` before starting.

## 0. Review what changed outside your session

**A. Real shaders (new).** The design's gradients are WebGL fragment shaders, and the
previous build only approximated them with CSS — wrong colours, wrong positions, ~10x too
bright. That's now fixed by rendering the actual GLSL:

| File | What |
| --- | --- |
| `public/shaders/glow-a.glsl`, `dark-glow.glsl` | the design's real GLSL, verbatim |
| `src/components/layout/Glow.astro` | `<canvas>` + a CSS fallback (first paint / no WebGL) |
| `src/scripts/glow.js` | the WebGL runner |

Wired into the hero, Work, Toolbox, Closing and Footer; the five fake CSS `::before`
gradients were deleted.

Verified values, straight from the shader:

- `glow-a` — base `#08080B`; coral blob core `#4d1726` at **16% / 66%** (lower-left);
  cyan blob core `#0c2435` at **88% / 22%** (upper-right). Note it is *dark*, not bright coral.
- `dark-glow` — dark-red band across the **top centre**: `#1d1115` at the top, `#160e11` at
  the upper third, `#0e0b0d` mid, `#09090b` at the bottom and side edges.

**Please review this specifically:**

1. Do the gradients actually render in your dev server? I could not confirm visually — my
   browser session died mid-check. If they're blank, the likely culprit is the shared rAF
   loop in `glow.js`.
2. Performance: 5 canvases per home page, one shared rAF at ~30fps, off-screen instances
   skipped, DPR capped at 1.5. Confirm no jank and no console errors, and tell me if you'd
   restructure it (e.g. a single context).
3. Correctness: the canvas must stay transparent until it actually draws, so the CSS
   fallback shows if WebGL fails. Confirm that holds.
4. `prefers-reduced-motion` should render one static frame and stop.

**B. Hero + Path** were also rewritten earlier — already reviewed and approved, no action.

## 1. Toolbox — layout changed in the design

The design is updated to match what the client asked for: radar and tools side by side,
tools at ~60%, grid 3 across. Rebuild to this.

```
ToolStage  1312 wide, horizontal, gap 48, height 780
  RadarCol   480 wide, vertical, gap 24
    Radar        480 x 480   (was 660 — the design was rescaled)
    ActivePanel  480 wide    (moved below the radar)
  ElementGrid  784 wide, height 780   <- 784/1312 = 59.8%
```

The grid is **3 columns x 5 rows**, and because there are 15 tools across 5 axes, **each row
is exactly one axis** (row 1 UI/UX, row 2 WordPress, row 3 AI/LLM, row 4 Frontend, row 5
Backend). Keep that ordering — hovering a radar axis should light that entire row.

Tile: `255 x 148`, gap 10, padding 14, radius 2.
- fill `#FF3B3012` and stroke `#FF3B30` when lit, else transparent fill + `#26262E` stroke
- top row: index (mono 9, coral when lit else `#6B6B7B`) + brand logo (19x19, coral when lit else white)
- middle: 2-letter mark, Space Grotesk 34 bold, letter-spacing -1.5, coral when lit else white
- bottom: tool name, mono 10, letter-spacing 0.5, white when lit else `#6B6B7B`

Radar axis labels sit **inside** the 480 box, mono 10, `fixed-width` 150px, aligned away from
the centre: `UI/UX  88%` centred at top, `WORDPRESS  92%` right at y158, `AI/LLM  80%` right
at y392, `FRONTEND  78%` left at y392, `BACKEND  74%` left at y158. (The small coral leader
line above the top vertex was removed — it collided with the label.)

Section height is now **1224** (was 1843) so radar and grid share one viewport.

## 2. About — WFacts (`Q3gy7U`)

Currently light tiles with blue numbers on paper. Should be:

- 4 tiles, gap 16, each: fill `#131318`, radius 2, stroke `#2A2A33` 1px, padding `26 24`, gap 12
- number: Space Grotesk **42px bold**, letter-spacing -1, colour **`$accent` (coral, not blue)**
- label: mono 10, letter-spacing 1.5, `$dimL`
- values: `08` YEARS BUILDING · `60+` PROJECTS SHIPPED · `12` COUNTRIES WORKED WITH · `100` LIGHTHOUSE SCORE

## 3. About — Process (`AFJ3O`)

Currently a plain 4-column grid on `--paper-2`. Should be a card with a rail and dots:

- card: fill `#131318`, radius 2, stroke `#2A2A33` 1px, gap 30, padding `36 32`
- head: label pill — fill `#1B1B22`, stroke `#33333D` 1px, radius 2, padding `9 14`
- steps region: height 290, with a **horizontal rail** 1px tall, fill `#FFFFFF1F`, at y30
- 4 steps at x = 0 / 312 / 624 / 936, each 272 wide:
  - number: mono 11, `$accent-blue`, at y0
  - **dot**: 13x13 ellipse at y24, fill `#131318`, stroke `$accent` 2px
  - content at y64: title + description
- copy: `01` Discover · `02` Design · `03` Build · `04` Ship & iterate

## 4. Work accordion — Item1 (`omz37`)

Wrong surface and spacing. Should be:

- row: fill `#131318`, stroke `#2A2A33` **top and bottom** 1px, gap 6, padding `0 40`
- head row: padding `36 0`
- expanded panel: gap 48, padding `0 0 48 0`
- kiosk mock: `620 x 412`, fill `#0D0D12` (the mock contents from the earlier B2 brief)

## 5. Closing + Footer heights

Design is 1156 total: Closing 880 + Footer 276. Footer padding `64 64 40 64`, gap 44.
Currently the section is 711 — bring it to the design height.

## Rules

- Every value above is from the design file. Match it; don't re-interpret.
- Colours come from `tokens.css`. Only the shader values in `glow.js`/`Glow.astro` are literal,
  because they're copied from GLSL.
- Do not touch `design/` — read-only reference. Reload it, it changed.
- Do the Toolbox first and report, then the rest.
- Still open, don't guess: contact email, the "Ask AI" terminal + "UX Pathfinder" panel,
  final footer socials, resume file for `DOWNLOAD RESUME`.
