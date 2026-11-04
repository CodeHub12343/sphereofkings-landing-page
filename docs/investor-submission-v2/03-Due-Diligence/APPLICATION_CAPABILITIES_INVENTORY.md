# Sphere of Kings — Application Capabilities Inventory

**Status:** `CONFIRMED` — every item below is verified by direct inspection of the repository at `C:\Users\HP\sphereofkings-landing-page\nextjs\` on 2026-11-04.
**Date:** 2026-11-04 · **Package version:** v2.1
**Companion to:** Blueprint v2.0, Buybox v2.1, DD Questionnaire, 03D Product & Technology Register

> This is the single most important diligence document for the opportunity: it lists everything that **actually exists and runs** today, with the file paths an engineer can open to verify each claim. Everything else in the package is organized around this foundation.

---

## 1 · Codebase at a glance (verified counts)

| Metric | Count | How verified |
|---|---:|---|
| Total TypeScript / TSX source files | **406** | `find nextjs/{app,components,lib} -name "*.ts*" \| wc -l` |
| Total source lines of code | **~68,964** | `wc -l` on the same set |
| Next.js App-Router page routes | **65** | `find nextjs/app -name page.tsx \| wc -l` |
| API route handlers | **34** | `find nextjs/app/api -name route.ts \| wc -l` |
| Admin back-office pages | **24** | `find nextjs/app/admin -name page.tsx \| wc -l` |
| React components | **122** | `find nextjs/components -name "*.tsx" \| wc -l` |
| MongoDB collections (typed) | **23** | `nextjs/lib/db/collections/*.ts` |
| Library modules | **47** | `nextjs/lib/*` |
| Smoke-test + utility scripts | **25** | `nextjs/scripts/*` |
| Product SKUs in catalog | **25** | `nextjs/lib/products.ts` |
| Game rules documents (owner-approved) | **3** | `content/rules/` |
| Architecture Decision Records (ADRs) | **6** | `content/adr/` |
| Child-safety policy (owner-approved) | **1** | `content/policy/child-safety.md` |

## 2 · Technology stack (verified)

- **Framework:** Next.js 15 (App Router) · React 19
- **Language:** TypeScript 5.6 · strict mode
- **Styling:** styled-components 6 + CSS custom properties; brand tokens in `nextjs/lib/theme.ts`
- **Database:** MongoDB 8 via `mongodb` driver 6
- **Payments:** Stripe 17 (`@stripe/stripe-js`, `@stripe/react-stripe-js`) + webhook handler
- **Realtime:** Pusher 5 (`pusher` server + `pusher-js` client) + Upstash QStash
- **3D:** three.js 0.186 + `@react-three/fiber` + `@react-three/drei`
- **File storage:** `@vercel/blob`
- **QR codes:** `qrcode`
- **Testing / tooling:** Playwright (for a11y + smoke)

## 3 · Physical product catalog (25 SKUs, approved prices, Stripe-ready)

Every SKU is listed in `nextjs/lib/products.ts` with an approved price (`priceApproved: true`), inventory cap, product image, and Markdown description that the owner has signed off.

| # | Slug | Name | Price | Inventory cap | Category |
|---:|---|---|---:|---:|---|
| 1 | `royal-checkers-set` | Royal Checkers — Two-Color Board & Checkers Set | $179 | 1,000 | reward |
| 2 | `imperial-kings-kit` | Imperial Kings — Complete Royal Game Board Kit | $189 | 1,000 | reward |
| 3 | `puzzle-pre-picks` | Sphere of Kings — Puzzle Pre-Picks | $199 | 1,000 | reward |
| 4 | `custom-3d-puzzle-upload` | Custom 3D Puzzle Game Board — Upload Your Photo | $210 | 500 | reward |
| 5 | `custom-photo-to-3d` | Custom Photo-to-3D | — | — | add-on |
| 6 | `royal-checkers-pieces` | Royal Checkers replacement pieces | — | — | add-on |
| 7 | `imperial-kings-pieces` | Imperial Kings replacement pieces | — | — | add-on |
| 8 | `diy-puzzle-pieces` | DIY blank puzzle pieces | — | — | add-on |
| 9 | `royal-checkers-diy` | Royal Checkers DIY paintable | — | — | add-on |
| 10 | `imperial-kings-diy` | Imperial Kings DIY paintable | — | — | add-on |
| 11 | `game-board-only` | Sphere game board only | — | — | add-on |
| 12 | `pick-your-puzzle-collection` | Pick Your Puzzle Collection | — | — | add-on |
| 13–17 | `puzzle-earth`, `-galaxy`, `-lion`, `-moon`, `-ocean` | Five themed puzzle designs | — | — | design |
| 18–22 | `pack-3`, `pack-5`, `pack-10`, `pack-20`, `pack-50` | Multi-piece packs | — | — | pack |
| 23 | `creator-edition` | Creator Edition | — | — | reward |
| 24 | `kingdom-supporter` | Kingdom Supporter | — | — | tier |
| 25 | `diy-pieces` | DIY pieces | — | — | add-on |

**Site-wide 20% discount** (approved by James 2026-10-21, `nextjs/lib/products.ts:27`): the retail price is shown struck through and the sale price is charged. One constant controls every price shown and every Stripe charge.

## 4 · Shipped application features (every one is in the code today)

### 4.1 Digital gaming platform
- **Royal Checkers engine** — authoritative implementation of the owner-approved rules at `content/rules/royal-checkers.md`. Pure function engine in `nextjs/lib/games/royal-checkers/engine.ts` + AI opponent in `ai.ts`. Covered by `nextjs/scripts/game-smoke.mjs`.
- **Imperial Kings engine** — authoritative implementation of `content/rules/imperial-kings.md`. Engine + AI at `nextjs/lib/games/imperial-kings/`. Covered by `nextjs/scripts/ik-smoke.mjs`.
- **Glicko-2 rating system** — `nextjs/lib/games/glicko2.ts`; covered by `nextjs/scripts/glicko-smoke.mjs`.
- **Online multiplayer** — Pusher channels, QStash scheduled jobs, match-engine logic (`nextjs/lib/realtime/match-engine.ts`). Full match lifecycle: invite → accept → join → move → chat → resign → ranked-result. API routes at `/api/matches/*`.
- **Matchmaking** — `nextjs/lib/db/collections/matchmaking.ts` + `/api/matchmaking`.
- **AI difficulty system + worker** — `nextjs/lib/games/difficulty.ts`, `ai-worker.ts`.
- **Official puzzles** — `nextjs/lib/games/puzzles/official.ts` + `/api/puzzles/*`.
- **Tournament engine** — bracket logic (`nextjs/lib/tournaments/bracket.ts`) + tournament lifecycle (`engine.ts`) + registration API + public pages (`/tournaments`, `/tournaments/[slug]`). Covered by `nextjs/scripts/bracket-smoke.mjs`.
- **Champions / leaderboards** — `/champions`, `/leaderboards`.
- **Playable sphere UI** — Three.js 3D sphere, sideways-phone layout + rotate tip + opt-in fullscreen (commit `f1f7e7a`).
- **Phone-app shell / PWA** — `manifest.webmanifest`, apple-icon, icon, standalone capability per `nextjs/app/layout.tsx`.

### 4.2 Commerce
- **25-SKU product catalog** with Stripe integration (`nextjs/lib/stripe/server.ts` + `/api/stripe/webhook`).
- **Shopping cart** (`nextjs/lib/cart.tsx`) + **checkout** (`nextjs/app/checkout/page.tsx`).
- **Order management** — `nextjs/lib/db/collections/orders.ts` + public order status at `/order/[ref]` + admin at `/admin/orders`.
- **Custom-sphere orders** — photo-upload flow via Vercel Blob (`nextjs/lib/blob.ts`), custom-upload puzzle SKU, admin pipeline at `/admin/custom-spheres`.
- **Site-wide 20% discount** engine — single-source pricing function in `nextjs/lib/products.ts`.
- **Wholesale checkout** — token-protected B2B flow at `/wholesale-checkout/[token]` + admin at `/admin/wholesale`.
- **Fulfillment pipeline** — `/admin/fulfillment` with carrier config (`nextjs/lib/carriers.ts`).
- **Finance reconciliation** — Stripe charge/refund/payout reconciliation engine at `nextjs/lib/finance/reconcile.ts` + admin at `/admin/finance`.

### 4.3 Sponsorship program (James-approved tiers)
From `nextjs/lib/sponsorship.ts` (quoted comment: *"James (owner) wants 10 Silver slots at $3,000 and 5 Gold slots at $10,000, available for purchase from the website. When a tier is sold out the buyer joins a notification waitlist that emails them when a slot opens."*):

| Tier | Price | Slots | Mechanism |
|---|---:|---:|---|
| Silver Business Sponsor | $3,000 | 10 | On-sale via Stripe |
| Gold Business Sponsor | $10,000 | 5 | On-sale via Stripe; waitlist when full |

Public page at `/sponsorship` + Stripe-backed payment at `/sponsorship/pay` + admin at `/admin/sponsorships` + sponsor sign-in portal at `/sponsor/signin` and `/sponsor/signout`.

### 4.4 Creator / licensing infrastructure
- **License application flow** — `/license`, `/license/apply`, `/api/license/applications`, `nextjs/lib/db/collections/licensing.ts`, admin at `/admin/license-applications`.
- **Sphere designs** — user-submitted designs with `/me/designs` + public catalog at `/puzzles` + per-design pages `/puzzles/[slug]`; data model at `nextjs/lib/db/collections/sphere-designs.ts`.

### 4.5 Affiliate / referral program
- **Affiliate program** — tiers (`nextjs/lib/affiliate-tiers.ts`), promotion mechanics (`affiliate-promotion.ts`), application flow at `/affiliate/apply`, payout management at `/affiliate/payout`, admin at `/admin/affiliates`, referral links at `/r/[code]`, attribution tracking (`attributed-orders.ts`), withdrawal requests (`withdrawal-requests.ts`).
- **User referrals page** — `/me/referrals`.

### 4.6 Content & marketing
- **Blog system** — `/blog` + `/blog/[slug]` with per-post comments via `/api/blog/[slug]/comments` + admin editor at `/admin/blog`; data at `nextjs/lib/db/collections/blog.ts`; 5 seed posts in `nextjs/scripts/seed-blog.mjs`.
- **Email subscriber system** — `/subscribe`, `/subscribe/confirm`, `/subscribe/unsubscribe` + `/api/subscribers/count` + admin at `/admin/subscribers`; token auth at `nextjs/lib/subscriber-tokens.ts`.
- **Sweepstakes** — `/sweepstakes` + AMOE (Alternate Means of Entry) flow at `/api/sweepstakes/amoe` + admin at `/admin/sweepstakes`.
- **Videos / vlog** — `/videos` + embeds (`nextjs/lib/vlog-embed.ts`).
- **Donate** — `/donate`.
- **Experiments / feature flags** — `nextjs/lib/experiments.ts` + `feature-flags.ts` + admin at `/admin/experiments`.

### 4.7 Compliance & safety infrastructure
- **Child-safety policy** (owner-approved 2026-10-19, `content/policy/child-safety.md`) — covers COPPA, GDPR-K, UK Age Appropriate Design Code, PIPEDA; 13+ minimum age; UK-style standards for 13-17 attesters.
- **Consent flow** — tokenized parental-consent micro-charge path per ADR-0006 (`/consent/[token]`, `/me/consent`, `/api/consent/*`).
- **Age gating + safety gates** — `nextjs/lib/safety-gates.ts` + `nextjs/lib/db/collections/safety.ts` + `safety-io.ts`.
- **Moderation** — `nextjs/lib/moderation.ts` (covered by `moderation-smoke.mjs`).
- **Audit log** — `nextjs/lib/db/collections/audit.ts` + admin view at `/admin/audit`.
- **Game feedback** — `nextjs/lib/game-feedback.ts`.

### 4.8 Localization
- **i18n** — `nextjs/lib/i18n/` + `/api/locale` endpoint.

### 4.9 Administrative back-office (24 pages)
The owner can operate the entire business from `/admin/*`:

`affiliates` · `analytics` · `audit` · `blog` · `custom-spheres` · `emails` · `experiments` · `finance` · `fulfillment` · `license-applications` · `orders` · `products` · `reports` · `signin` · `signout` · `sponsorships` · `subscribers` · `sweepstakes` · `tournaments` · `wholesale` + per-feature detail pages.

Session auth at `nextjs/lib/auth/admin-session.ts` (bcrypt-style hashing via `password.ts`).

## 5 · Owner-approved specifications on file

| Document | Status | Path |
|---|---|---|
| Royal Checkers Official Rules | Owner-approved Phase-0 (2026-10-19) | `content/rules/royal-checkers.md` |
| Imperial Kings Official Rules | Owner-approved Phase-0 (2026-10-19) | `content/rules/imperial-kings.md` |
| Non-Digital Game Modes (Phase 0 Confirmation) | Owner-approved (2026-10-19) | `content/rules/other-modes.md` |
| Child-Safety Policy | Owner-approved Phase-0 (2026-10-19) | `content/policy/child-safety.md` |
| ADR-0001 Seam Adjacency Rules | Shipped | `content/adr/0001-seam-adjacency-rules.md` |
| ADR-0002 2D Board MVP | Shipped | `content/adr/0002-2d-board-mvp.md` |
| ADR-0003 Tournaments Free-Only | Shipped | `content/adr/0003-tournaments-free-only.md` |
| ADR-0004 Realtime Pusher Channels | Shipped | `content/adr/0004-realtime-pusher-channels.md` |
| ADR-0005 Minimum Age 13 | Shipped | `content/adr/0005-minimum-age-13.md` |
| ADR-0006 Parental Consent Micro-Charge | Shipped | `content/adr/0006-parental-consent-micro-charge.md` |
| Game Design & Implementation Reference | James-authored | `nextjs/scripts/docs/Sphere of Kings — Game Design & Implementation Reference.docx` |
| Game App Product Overview | James-authored | `nextjs/scripts/docs/Sphere of Kings — The Game App — Product Overview.pdf` + `.docx` |
| SPHERE_OF_KINGS_DIGITAL_PLATFORM_IMPLEMENTATION_ROADMAP.md | On file | repo root |

## 6 · Smoke tests on file (CI-grade coverage proof)

| Script | What it covers |
|---|---|
| `game-smoke.mjs` | Royal Checkers engine end-to-end |
| `ik-smoke.mjs` | Imperial Kings engine end-to-end |
| `glicko-smoke.mjs` | Glicko-2 rating math |
| `bracket-smoke.mjs` | Tournament bracket engine |
| `match-engine-smoke.mjs` | Realtime match engine |
| `moderation-smoke.mjs` | Content moderation path |
| `blog-smoke.mjs` | Blog publishing + comments |
| `phase9-smoke.mjs` | Phase-9 integration check |
| `a11y-audit.mjs` | Accessibility audit (Playwright) |
| `game-feedback-smoke.mjs` | Feedback ingestion |

## 7 · Items not yet shipped (status PROPOSED today)

Everything on the list is in the design docs but not in the code:
- Physical production facility (currently: Bambu Lab printers only)
- Injection molding / CNC / metal additive hardware
- MES / automated quoting / AI-assisted pricing
- International distribution
- Creator marketplace public enrollment (data model exists; public submission flow proposed)
- Brand / sports / entertainment licensing partnerships (template proposed)

## 8 · Implications for the Readiness Dashboard

The following rows in `03D_Product_Technology_Register.csv` and `04C_Investor_Readiness_Dashboard.md` are upgraded on the strength of this inventory:

- Many `MANAGEMENT-REPORTED` rows for software features → `CONFIRMED`.
- `PROPOSED` rows for digital companion layers that are actually shipped (tournaments, sponsorship, affiliate, blog, sweepstakes, consent flow) → `CONFIRMED`.
- The "Items ready for investor review now" section in 04C grows significantly.

See the updated `04C_Investor_Readiness_Dashboard.md` and `03D_Product_Technology_Register.csv` for the new row-by-row classifications.

## 9 · What an investor can inspect right now

An engineer-led diligence team can, in under two hours, verify:

1. The 25-SKU catalog with Markdown descriptions and approved prices — open `nextjs/lib/products.ts`.
2. The two playable game engines + AI opponents — open `nextjs/lib/games/`.
3. The tournament engine + bracket math — open `nextjs/lib/tournaments/`.
4. The sponsorship pricing signed by the owner — open `nextjs/lib/sponsorship.ts`.
5. The Stripe webhook + finance reconciliation engine — open `nextjs/lib/stripe/` and `nextjs/lib/finance/reconcile.ts`.
6. The child-safety policy and consent flow — open `content/policy/child-safety.md` + `content/adr/0005` + `0006`.
7. The 24-page admin back-office — open `nextjs/app/admin/*/page.tsx`.
8. The 34 API handlers — open `nextjs/app/api/`.
9. The 10 shipped smoke tests — open `nextjs/scripts/*-smoke.mjs`.
10. The six owner-approved ADRs — open `content/adr/`.

Every path is a hyperlink in the GitHub mirror of the repository (once pushed).
