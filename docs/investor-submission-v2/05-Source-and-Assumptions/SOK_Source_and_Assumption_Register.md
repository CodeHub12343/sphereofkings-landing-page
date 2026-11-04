# Sphere of Kings — Source & Assumption Register v2.0

**Prepared for:** James Scott Bowser, Creative Design Networks
**Package version:** v2.0 — 2026-11-04 (supersedes v1.0 of 2026-11-03)
**Purpose:** Track the provenance of every material claim, figure, and assumption in the updated Investor Master Blueprint and companion documents. Enables a reviewer to see, at a glance, where each statement originates and what evidence is still needed.

> This register supersedes `docs/investor-blueprint/SOURCE-AND-ASSUMPTION-REGISTER.md` (v1.0). Status flags follow the Shark Ready convention: CONFIRMED · MANAGEMENT-REPORTED · IN PROGRESS · PROPOSED · PENDING · NOT APPLICABLE.

---

## 1. Source inventory

| # | Source | Type | Date | Status | Affects |
|---|---|---|---|---|---|
| S1 | James Bowser message re: Shark Ready/Rabbit Capital raise ("we're going to raise $100M…") | Verbal/chat | 2026-11-03 | MANAGEMENT-REPORTED (not documentary) | Blueprint Part I, Buybox §10, DD §A |
| S2 | Prior "Expanded Investor Master Blueprint" draft (pasted in session) | Management draft | — | MANAGEMENT-REPORTED | Entire Blueprint; primary content base |
| S3 | **James's Corporate Information & Investor Due-Diligence Response** | Management statement | 2026-11-03 | MANAGEMENT-REPORTED | DD questionnaire; corporate sections of Blueprint v2 |
| S4 | Shark Ready / Rabbit Capital AI Investor Blueprint & 10-beat Buybox v1.9 | Third-party framework | 2026-11-03 | CONFIRMED (framework) | Buybox structure; DD question catalog |
| S5 | `nextjs/` codebase (Next 15 app) — brand system, product catalog, routes, playable 3D sphere | Project repository | 2026-11-04 (as-of) | CONFIRMED | Product sections; design system |
| S6 | `content/adr/0001`–`0006` architecture decision records | Project policy | 2026-10-19 | CONFIRMED | Product & platform sections |
| S7 | Git history (Kickstarter-only mode, online multiplayer, sponsorship program) | Repository history | 2026-11-03 | CONFIRMED | Product-status section |

---

## 2. Verified facts (CONFIRMED — supported by inspected evidence)

| V# | Claim | Source |
|---|---|---|
| V1 | Project is a Next.js 15 app with Stripe, MongoDB, Pusher, Three.js integrations | S5 `nextjs/package.json` |
| V2 | Brand typography: **Cinzel** (display) + **Inter** (body); woff2 locally hosted | S5 `nextjs/app/fonts.css`, `nextjs/lib/theme.ts` |
| V3 | Brand palette tokens: gold `#c9a227`, text `#f5f0e8`, bg `#0a0a0a` + variants | S5 `nextjs/lib/theme.ts` |
| V4 | Kickstarter launch declared **November 19, 2026** in site metadata | S5 `nextjs/app/layout.tsx` |
| V5 | 36 product images on disk covering 7-in-1 complete set, Imperial Kings, Royal Checkers (3/5/10/20/50 packs), DIY/paintable variants, five themed puzzles (Earth, Galaxy, Lion, Moon, Ocean), custom-upload puzzle, creator edition | S5 `nextjs/public/images/products/` |
| V6 | Playable 3D sphere + online multiplayer + phone-app shell shipped to repo | S7 commits `7871689`, `f1f7e7a` |
| V7 | Sponsorship program shipped | S7 commit `bc72406` |
| V8 | Site currently runs in "Kickstarter-only mode" (direct sales removed) | S7 commit `7679016` |
| V9 | Platform policy decisions on record: seam adjacency, 2D MVP, free-only tournaments, Pusher realtime, min-age 13, parental-consent micro-charge | S6 ADRs |
| V10 | Development company name stated by founder: **Creative Design Networks** · Website: SphereofKings.com · Founder: James Scott Bowser · Contact: jbowser727@gmail.com · 209-622-9391 | S3 |

---

## 3. Management-reported information (NOT independently verified)

All items below are stated by the founder in Source S3 or S2; they have not been independently verified.

### 3.1 Corporate & structural (from S3)

| M# | Claim | Status |
|---|---|---|
| M01 | Sphere of Kings is a venture being developed through Creative Design Networks | MANAGEMENT-REPORTED |
| M02 | Formal entity registration, articles of incorporation, bylaws, operating agreements **not yet assembled / confirmed** | PENDING |
| M03 | **No EIN** currently held; founder uses personal tax identification for applicable business tax purposes | MANAGEMENT-REPORTED → IN PROGRESS |
| M04 | Venture is founder-led; no formal cap table has been finalized | PENDING |
| M05 | No independently verified historical financial statements; actual revenue, expenses, assets, liabilities, cash balances, outstanding obligations require accounting/bank-record confirmation | PENDING |
| M06 | Secure due-diligence folder has not yet been provided | PENDING `[DD folder link — pending]` |

### 3.2 Partnerships & commercial relationships (from S3)

| M# | Claim | Status |
|---|---|---|
| M10 | **Jellop** — Kickstarter marketing collaboration *discussed and planned*; scope, contract, budget, deliverables require verification | PROPOSED · agreement pending |
| M11 | **PostcardMania** — direct-mail marketing *being explored* | PROPOSED · agreement pending |
| M12 | IP/licensing firms — *seeking* patent and licensing partners, including a *possible 90-day exclusive pilot*; may include referral compensation, licensing services, revenue participation | PROPOSED |
| M13 | Licensing opportunities being developed with independent creators, brands, sports organizations, entertainment IP holders | PROPOSED |

### 3.3 Intellectual property (from S3)

| M# | Claim | Status |
|---|---|---|
| M20 | SOK is an original 7-in-1 spherical gaming system incorporating modular boards, custom puzzle configurations, interchangeable gameplay, manufacturing methods | MANAGEMENT-REPORTED (creation claim) |
| M21 | IP strategy: utility patents where eligible; design patents; trademarks; copyrights; licensing; creator agreements; NDAs; invention assignments | PROPOSED |
| M22 | Patent filings / registrations / invention assignments / legal IP ownership require documentation and verification | PENDING |

### 3.4 Kickstarter (from S3)

| M# | Claim | Status |
|---|---|---|
| M30 | Published Kickstarter funding goal: **$10,000** | CONFIRMED (public goal) |
| M31 | Internal stretch objective: **$30M** | MANAGEMENT-REPORTED (aspirational — not the public goal, not funding, not forecast revenue) |
| M32 | Kickstarter launch planned for **November 19, 2026** | CONFIRMED by V4; as of 2026-11-04 the campaign has **not yet launched** |

### 3.5 Manufacturing & operations (from S3)

| M# | Claim | Status |
|---|---|---|
| M40 | Initial production focus on 3D-printed products using **Bambu Lab printers** | MANAGEMENT-REPORTED |
| M41 | Current printer inventory, actual production capacity, unit costs, supplier details, quality procedures all require evidence | PENDING |
| M42 | Future expansion: larger facilities, automated print farms, industrial equipment, metal manufacturing, scalable distribution | PROPOSED |

### 3.6 Financials & capital strategy (from S2, preserved)

| M# | Claim | Status |
|---|---|---|
| M50 | Capital target: **$100M**, staged $2M · $8M · $20M · $30M · $40M | PROPOSED (target; not committed) |
| M51 | Five-year revenue ambition: **$250M** (A $100M · B $80M · C $50M · D $20M) | MANAGEMENT-REPORTED (illustrative) |
| M52 | Year-5 EBITDA ambition: **$50M** (20% margin) | MANAGEMENT-REPORTED (illustrative) |
| M53 | Flagship retail $179; board-only $129; direct-manufacturing cost target ~$30 (BOM unvalidated) | MANAGEMENT-REPORTED |
| M54 | Illustrative pre-money $300M → post-money $400M → 25% for $100M investor | ILLUSTRATIVE (modeling only, not a term sheet) |

---

## 4. Illustrative scenarios (planning math only)

| I# | Scenario | Notes |
|---|---|---|
| I1 | $100M gaming revenue at $130 ASP → ~769,231 units/yr (not 250,000 units) | Corrects reader confusion in the earlier draft |
| I2 | $130M industrial-manufacturing mix → 420 customers (20×$2.5M + 100×$500K + 300×$100K) | Entirely illustrative; no customer list |
| I3 | Y5 free cash flow bridge: EBITDA $50M − interest $2M − tax $7M − maint capex $8M − WC $5M = ~$28M | Illustrative; excludes growth capex, acquisitions, distributions |
| I4 | Valuation sensitivity 6× to 20× EBITDA on $50M = $300M to $1B EV | Enterprise value, not equity value |
| I5 | Investor outcomes at 25% stake: $500M exit → 25% ROI; $1B exit → 150%; $2B → 400%; $3B → 650% | Pre-dilution, pre-tax, pre-cost |
| I6 | Make-or-buy break-even: 10,000 units at $18/unit saving vs $180K tooling | Illustrative decision rule |

---

## 5. Changes from v1.0 (2026-11-03) to v2.0 (2026-11-04)

| Change | Reason |
|---|---|
| Added S3 as a formal source | James's Nov-3 corporate response received |
| Added M01–M06 corporate status rows | Formal entity, EIN, cap table, financials, DD folder all explicitly PENDING per S3 |
| Added M10–M13 partnership rows | Jellop/PostcardMania/IP-firm pilot explicitly classified as PROPOSED, not executed |
| Added `[DD folder link — pending]` placeholder reference | Per Shark Ready Buybox instruction (10-beat §1) |
| Reclassified $30M Kickstarter ambition as internal stretch, not goal | Per S3 §4 |
| Added Shark Ready Buybox framework (S4) as source | Guides Buybox and DD deliverables |
| Status taxonomy aligned to Shark Ready vocabulary | CONFIRMED / MANAGEMENT-REPORTED / IN PROGRESS / PROPOSED / PENDING / NOT APPLICABLE |
| Explicit non-reproduction of founder SSN | Security |

---

## 6. A-list: items requiring confirmation before external submission

These are **blockers**. The Blueprint v2.0 must not be sent to Shark Ready or any investor until each is resolved or explicitly flagged.

| A# | Item | Who | Priority |
|---|---|---|---|
| A01 | Documentary evidence of any Shark Ready / Rabbit Capital engagement (engagement letter, any term sheets, correspondence) | Founder + counsel | P0 |
| A02 | Confirm legal entity type (LLC / C-Corp / S-Corp) and state of formation for Creative Design Networks and/or SOK | Founder + counsel | P0 |
| A03 | EIN application status and timing | Founder | P0 |
| A04 | Finalized cap table (founders, options, SAFEs, outstanding commitments) | Founder + counsel | P0 |
| A05 | IP ownership chain: signed IP assignments from every past contractor; current patent/trademark filing status; freedom-to-operate memo | Founder + IP counsel | P0 |
| A06 | Jellop engagement letter and campaign plan | Founder | P1 |
| A07 | PostcardMania scope confirmation (quote, agreement, or "exploration only") | Founder | P1 |
| A08 | IP/licensing-firm 90-day pilot: proposed terms (referral %, licensing-service fees, revenue participation) | Founder | P1 |
| A09 | Current Bambu Lab printer inventory, unit production economics, BOM for flagship 7-in-1 | Founder/operations | P1 |
| A10 | Kickstarter status check on and after 2026-11-19: did it launch? initial 48-hour performance? | Founder | P1 |
| A11 | Secure DD folder (Drive / Dropbox / data room) stood up with current evidence | Founder + doc team | P0 |
| A12 | Independent accountant review of model mechanics before any investor circulation | CFO (to be hired) / accountant | P1 |
| A13 | Securities-counsel engagement letter before any external circulation | Founder + counsel | P0 |

---

## 7. Register maintenance

Update this register whenever:
- A P0/P1 blocker is resolved (move the row into Section 2 Verified Facts with its supporting document).
- A new figure or claim is added to the Blueprint.
- Any figure changes by ≥10% or any status changes.

### Change log

| Date | Change | By |
|---|---|---|
| 2026-11-03 | v1.0 initial compilation | Blueprint prep team |
| 2026-11-04 | v2.0 — incorporated James's Nov-3 DD response; added Shark Ready framework; aligned status taxonomy; added A-list blockers | Blueprint prep team |
