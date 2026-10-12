# OpenCode prompt — review the hero + Path fixes, then continue

Paste everything between the rules into OpenCode, running in
`C:/Users/light/Documents/New OpenCode Project/portfolio-astro`.

---

Heads up on provenance: **`src/pages/index.astro` was edited outside this session** by the
design agent, after your phase 1 + 2 work. Only that one file was touched, and only the
homepage hero (`02 Hero`) and Path (`05 Path`) sections. Nothing was committed, so your
phase 1/2 work and these edits are mixed in the same uncommitted file.

Two jobs: **(A) review these changes**, then **(B) continue to phase 3**. Do A fully and
report before starting B.

## A. Review

**First, protect the work:** commit the current working tree (or stash) as a checkpoint
before you change anything, so this state can be recovered.

Then verify the two rewritten sections. The reference renders are in `design/png-desktop/JrcX9.png`
(and `design/png-mobile/Cq8mG.png`); the exact numbers below are the ground truth, taken from
the design file. Measure with `getBoundingClientRect()` at a 1440 viewport — do not eyeball it.

Hero is a fixed 1440×1000 composition. At 1440 these must hold:

| Element | Target |
| --- | --- |
| `.hero` | height 1000 |
| `.hero__marquees` | top **312**, height **392** (4 rows × 98) |
| `.hero__portrait` | **480×600**, horizontally centred, top **200** (it overlaps the marquee band) |
| `.hero__title` | inside the portrait at **+30, +396**, 3 lines × 36px = **108** tall, font-size 34 |
| `.hero__top` | x **64**, y **48** |
| `.hero__bottom` | right-aligned to x64 margin, y **884** |
| marquee type | JetBrains Mono, 62px, weight 700, letter-spacing −2px |

Path rows: grid `1fr 1fr` with a **72px** gutter; `.path__y` font-size **88px**; rows alternate
sides; text hugs the centre spine (the flipped rows are right-aligned); a 1px spine at 50%
with 12px nodes and 35px ticks; `.path__btn` is a **filled** `var(--accent-blue)` button,
~190×41, in the head's right column.

Check specifically:

1. **Numbers.** Do the measurements match the table? Report any that don't.
2. **Responsive breakpoints.** The absolute hero is desktop-only. It must switch to a flow
   layout at ≤1100px and scale type again at ≤560px — confirm it never overflows or collapses
   at 1440, 1280, 1100, 900, 768, 560, 390.
3. **No horizontal overflow** at 390px (`documentElement.scrollWidth === innerWidth`).
4. **Nothing else regressed.** Only these two sections should have changed. Confirm the other
   sections (About, Work, Toolbox, Life, Closing) are untouched and still render.
5. **Semantics + a11y.** The `<h1>` is now inside `<figure>`. Confirm one `<h1>` per page, a
   sane heading order, and that the decorative overlays (`scrim`, `scan`, `pgrid`, `frame`,
   `bar`, signal bars, vertical rules) are correctly `aria-hidden`.
6. **Contrast.** The headline now sits over a photo. Confirm the scrim keeps it readable on
   both the light and dark parts of `hero-2.png` — check `EXPERIENCES` in coral especially.
7. **Reduced motion.** The marquee animation must stop under `prefers-reduced-motion` and the
   layout must stay intact.
8. **Code quality.** Flag anything you'd do differently — magic numbers worth tokenising,
   hardcoded hex that should use a CSS variable, duplicated rules, or a cleaner way to express
   the alternating Path rows (`.path__item--flip`) than the current grid-column overrides.

**Report as a list: pass / fail per item, the measured value where it fails, and your
recommended fix. Do not rewrite the sections wholesale — propose changes and wait for my go-ahead
on anything structural.** Small, clearly-correct fixes (a wrong pixel, a missing aria-hidden)
you can just make.

## B. Then continue — phase 3

Once A is reported and agreed:

1. **Toolbox** — biggest remaining gap. The 15 tools are correct but rendered as flat 2-letter
   tiles. The design groups them into **5 columns by radar axis**, uses the **real brand logos**
   (SVG paths are in `design/desktop.html`, and the source icons are in the design folder), and
   lights the **active column coral** to match whichever radar axis is hovered. Section is
   1117px tall vs **1843px** in the design.
2. **Work accordion** — the design's expanded panel is a kiosk UI mock (toolbar with
   `KIOSK / TABLE 04` + `● REC LISTENING`, waveform bars, a query line, an order list, a total,
   and a `CONFIRM ORDER` button). Replace the current image/placeholder.
3. **Section heights** — About 1791 vs **2287**, Work 1105 vs **1447**, Life 648 vs **906**,
   Closing 711 vs **1156**. Bring these closer to the design.
4. **Mobile hero** — the `M · Home` design (`design/png-mobile/Cq8mG.png`) puts the headline
   *above* the marquee band at 44px, with the portrait below it. The current build keeps the
   headline inside the portrait on small screens. Reconcile with the mobile design.

Do not touch `design/` — it is read-only reference.

**Still open from before, don't guess:** the contact email (`amiruan12@gmail.com` vs
`hello@amiruan.dev`), whether to keep the "Ask AI" terminal and "UX Pathfinder" panel, the
final four footer socials, and the resume file for `DOWNLOAD RESUME` (currently `#`).
