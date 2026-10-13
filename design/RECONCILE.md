# OpenCode prompt — reconcile the two repos

Paste everything between the rules into OpenCode. **Work in `portfolio-clean`.**

---

Context: the V6 work exists in **two** directories that have fully diverged — every file in
`src/` differs:

| | `portfolio-astro` | `portfolio-clean` |
| --- | --- | --- |
| HEAD | `c9853e5` | `664132f` (**5 commits ahead**) |
| Working tree | **dirty** | clean |
| Served on :4321 | no | **yes** |

`portfolio-clean` is the canonical repo: it's ahead, clean, and it's what's being served.
Three jobs to reconcile them. **Do not start or manage the dev server** — the user runs that
themselves now. Don't push, don't deploy.

## 1. Port the newer `harness/dev.mjs` into `portfolio-clean`

This is the one piece of real work that got left behind in the copy, and it matters.

`portfolio-astro/harness/dev.mjs` has **uncommitted** changes (100 lines vs 78) that were never
carried over. The old version in `portfolio-clean` is what caused the stale-server incident:
it does a bare `taskkill /F /PID`, so a process can survive the kill and keep serving a stale
Vite module graph — which made real changes invisible in the browser for two rounds.

The new version fixes it:
- `pidsOnPort()` extracted, and `killPort()` **re-scans the port after killing**, retrying up
  to 3 times, and returns whether the port is actually free
- process-tree kill: `taskkill /PID <pid> /T /F` (kills children too)
- drops the `harness/logs/dev.log` file entirely
- one-line output format `up <code>` / `failed: <reason>`

Copy `portfolio-astro/harness/dev.mjs` over `portfolio-clean/harness/dev.mjs` and review the
diff before committing — make sure nothing in the new version references paths specific to
`portfolio-astro`. Then verify it works from `portfolio-clean`:

```
node harness/dev.mjs status
node harness/dev.mjs restart
node harness/dev.mjs status
```

It must print a single line each time and actually free the port between stop and start.

## 2. Fix the stale repo path in `harness/STATE.md`

Line 6 currently reads:

```
- Repo: `C:/Users/light/Documents/New OpenCode Project/portfolio-astro` (branch `v6-redesign`, do NOT push/deploy).
```

That's the **wrong repo** — all the work is in `portfolio-clean`. Left as-is, a future session
will read this file and operate on the wrong tree, which is the same class of silent divergence
that already cost us a debugging round. Update it to `portfolio-clean` and add a short note
under "Environment" that `portfolio-astro` is retired (see job 3), so nobody re-adopts it.

## 3. Retire `portfolio-astro`

Do **not** delete it yet. Archive instead:

1. First confirm nothing unique is left in it. After job 1, `portfolio-astro` should have only:
   - `src/pages/index.astro` — resume links pointing at a local `.docx`. **Superseded**:
     `portfolio-clean` links to the WordPress-hosted PDF
     (`https://wp.amiruan.site/wp-content/uploads/2026/10/Resume_Muhammad_Amiruddin_Bin_Zulkifli-1.pdf`),
     which is the better approach. Discard.
   - `public/resume/amiruddin-zulkifli-resume.docx` (untracked, 39KB) — not needed for the
     same reason. Discard.
   - `harness/dev.mjs` — ported in job 1.
2. Rename the directory to `portfolio-astro-ARCHIVED` (don't delete — it's the history of how
   we got here, and the user may want it).
3. Report what you found that wasn't in that list before archiving anything.

## 4. Commit

In `portfolio-clean`, on branch `v6-redesign`. Include the ported `dev.mjs` and the `STATE.md`
correction. Suggested subject:

```
chore: port hardened dev.mjs from portfolio-astro, correct STATE.md repo path
```

In the message, note that `portfolio-astro` is retired and `portfolio-clean` is canonical, so
the next session doesn't have to work it out again.

Confirm with `git status` (clean) and `git log -1 --stat`.

## Do not

- Start, stop or restart the dev server — the user handles that now
- Push or deploy
- Delete anything in `portfolio-astro` before job 1 is committed in `portfolio-clean`
