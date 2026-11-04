# NEEDS_OWNER_INPUT — portfolio audit (27 Oct 2026)

Facts the site should state but that **cannot be verified from the repo or public pages**.
Do not invent these. Answer each, then the copy can be updated accurately.

## 1. Learner numbers (contradiction)
- Homepage Experience copy says **"20,000-student e-learning platform"** (`src/pages/index.astro`).
- FEN Learn work post (WordPress) metric says **"18k registered learner accounts"**.
- **Question:** what is the correct figure and what does it measure — students *served* vs
  *registered accounts* vs *active learners*? Pick one consistent wording (e.g. "20,000+ students
  served, 18,000+ registered accounts" if both are true).

## 2. MyEventQR case study
- What did you personally build vs teammates/third-party tools?
- Describe the flow: QR scan → check-in → badge print.
- How does it reach the printer (local print bridge? driver? API?)? Which hardware?
- Hardest technical challenge and any live-event failure/recovery story.
- How was it tested for live events / reliability?
- **"0.2-second badge printing"** — what exactly does it measure (trigger latency, render, or
  total physical print time)?
- **"30% reduction in badge printing time"** — 30% vs which baseline, measured how?

## 3. FEN Learn case study
- Exact role and what you personally implemented (Laravel? React? admin? certificates?).
- Registered vs active learners (see #1).
- Is it in production? Any public URL or demo safe to link?

## 4. Dates
- Confirm each work post's year (WP `acf.year`). The homepage "Selected Work" range is now
  computed from the posts (currently **2024—2026**); correct the WP years if wrong.

## 5. Metrics / labels
- **96 Lighthouse** — confirm it is **Best Practices** (not Performance), and when it was measured.
- Any other metric should state what it measures and when.

## 6. Case-study structure
The template currently renders: Context · Process · Tools · Metric · Result.
The audit asks for: Overview · Problem · My Role · Solution · Technical · Challenges · Outcome.
Those need new content. Options:
- Add ACF fields (`problem`, `challenges`, `outcome`, `my_role`) and fill them in WP, or
- Edit `acf.context` / `acf.process` / post body to cover them.
Either way the facts above must come from you first.

## 7. WordPress microcopy to fix (owner edits in WP)
- MyEventQR metric: **"0.2secs Auto Printing Badge"** → e.g. "0.2-second automated badge printing"
  (only if accurate).
- Gallery location: **"SUNWAY UNIVERISTY"** → **"Sunway University"**.
- Recheck other labels/dates/capitalisation in WP.

## 8. Decisions
- **Workbench radar**: keep numeric percentages (88% etc.) or switch to qualitative labels
  (Primary / Working knowledge / Exploring)? Numeric scores imply a measurement method.
- **Positioning/title**: changed to "Web Developer & Designer | WordPress & AI-Assisted" —
  confirm this is the wording you want.
- **Client names**: confirm you may publicly name Bank Negara Malaysia, FENetwork, PETRONAS/TFM,
  Dutaguru, Sevenue, VPKL.
- **Work images**: confirm which case-study screenshots are safe to publish.

## Already verified (no action)
- Dutaguru is **not** tagged AI on the live card (`Light Up 7 · WordPress`) — the audit note is stale.
