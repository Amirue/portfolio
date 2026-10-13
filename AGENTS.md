# Project notes

## This repo

**`portfolio-clean` is the canonical repo.** A superseded copy exists at
`../portfolio-astro` — it is retired, it diverges, and it is **not** to be edited, built or
served. If your cwd or file paths say `portfolio-astro`, you are in the wrong repo: switch to
`portfolio-clean` before doing anything. See `harness/STATE.md` and
`../portfolio-astro/ARCHIVED.md`.

Working branch is `v6-redesign`. Do not push and do not deploy unless explicitly asked.

## Dev server

**The user runs the dev server themselves — do not start, stop or restart it.**

It is managed by `harness/dev.mjs` (detached; kills :4321 first via process-tree kill and
re-scans the port up to 3x; prints one line `up <code>` / `failed: <reason>`):

```
node harness/dev.mjs start|stop|restart|status
```

`astro dev status` will report "no dev server" even while one is running — the harness manages
it directly rather than through Astro's background wrapper. Don't trust it.

**If a change seems not to appear in the browser, suspect a stale dev server before suspecting
the code.** This has already cost two debugging rounds: a server left up for hours served a
stale Vite module graph, so edits were invisible while the page still returned 200. Prove the
CSS is fresh before debugging further, e.g.

```
curl -s "http://localhost:4321/src/components/layout/ClosingCTA.astro?astro&type=style&index=0&lang.css" | grep -o 'closing__line[^{]*{[^}]*}'
```

## Verification harness

`harness/check.mjs` (health), `harness/probe-html.mjs` (static counts), `harness/crawl.mjs`
(link crawl). Logs go to `harness/logs/`. `harness/STATE.md` is the source of truth for the
current verification state.

When asserting on visibility, check **computed style** (`getComputedStyle(el).display !== 'none'`),
not the `hidden` property — an author rule like `.tool { display: flex }` overrides the UA
stylesheet's `[hidden] { display: none }`, so the property can be correct while the element is
still visible.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
