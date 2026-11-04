# Sphere of Kings — Source and Assumption Register

**Document version:** v1.0 — 2026-11-03
**Prepared for:** James Scott Bowser, Creative Design Networks
**Purpose:** Catalog the provenance of every material claim in the Investor Master Blueprint. Distinguishes verified facts, management-provided information, proposed plans, illustrative scenarios, and items requiring confirmation before external investor submission.

> This register is the companion to `SOK-Investor-Master-Blueprint-v1.html`. It should be reviewed by James and (where applicable) counsel before the Blueprint is circulated outside the company.

---

## 1. Source inventory

| # | Source | Type | Status |
|---|---|---|---|
| S1 | James Bowser message (via user): "I just secured the payment with the Shark Ready team for Rabbit Capital. It looks like we're going to raise $100 million…" | Verbal / chat instruction | Un-documented; see **A1** below |
| S2 | Existing SOK Investor Master Blueprint (pasted content, this conversation) | Management-provided draft | Primary content source |
| S3 | `nextjs/` codebase (brand system, product catalog, routes) | Project repository | Verified in-repo |
| S4 | `README.md`, `SPHERE_OF_KINGS_DIGITAL_PLATFORM_IMPLEMENTATION_ROADMAP.md` | Project docs | Verified in-repo |
| S5 | `nextjs/public/images/products/*` — 36 product/asset images | Visual assets | Verified in-repo |
| S6 | `content/adr/*` — architecture decision records (seams, 2D MVP, tournaments, Pusher, min-age 13, parental consent) | Project policy | Verified in-repo |
| S7 | Recent git log (Kickstarter-only mode, game-app shell, 3D sphere, sponsorship program) | Repository history | Verified via `git log` |

---

## 2. Verified facts (drawn from S3–S7)

| V# | Claim | Source |
|---|---|---|
| V1 | Project exists as a Next.js 15 app (`nextjs/`) with Stripe, MongoDB, Pusher, Three.js integrations | `nextjs/package.json` |
| V2 | Brand typography: **Cinzel** (display/serif) + **Inter** (body/sans); locally hosted woff2 | `nextjs/app/fonts.css`, `nextjs/lib/theme.ts` |
| V3 | Brand palette tokens: gold `#c9a227`, gold-light `#f0c040`, text `#f5f0e8`, text-muted `#a89880`, bg `#0a0a0a` / `#0d0b08` / `#111009`, border `#2a2218` | `nextjs/lib/theme.ts`, `nextjs/lib/GlobalStyle.tsx` |
| V4 | Kickstarter launch date publicly declared: **November 19, 2026** | `nextjs/app/layout.tsx` metadata |
| V5 | Product catalog art exists for: complete 7-in-1, Imperial Kings, Royal Checkers (including 3/5/10/20/50 packs), DIY/paintable variants, 5 themed puzzles (Earth, Galaxy, Lion, Moon, Ocean), custom-upload puzzle, creator edition, kingdom supporter | `nextjs/public/images/products/` (36 files) |
| V6 | Repo recently added: Kickstarter-only mode, Christmas Early Bird copy, sponsor dashboard, sideways-phone layout, playable 3D sphere, online multiplayer | `git log` (`f1f7e7a`, `7871689`, `7679016`, `99b320b`, `bc72406`) |
| V7 | Platform design decisions on record: seam adjacency rules, 2D board MVP, free-only tournaments, Pusher channels for realtime, minimum age 13, parental-consent micro-charge | `content/adr/0001`–`0006` |
| V8 | Founder contact details in existing Blueprint draft: James Scott Bowser · Creative Design Networks · Sphereofkings.com · 209-622-9391 · jbowser727@gmail.com | S2 (management-provided; verify before external use) |

---

## 3. Management-provided information (from S2)

These items originate from the existing Blueprint draft and have **not** been independently verified by financial, legal, manufacturing, or commercial due diligence.

| M# | Claim / figure | Required confirmation |
|---|---|---|
| M1 | Four-division strategy: Gaming / Polymer / Metal / Technology & Licensing | Confirm current corporate structure and which entity will own each division |
| M2 | Capital target: **$100 million**, staged across five tranches ($2M · $8M · $20M · $30M · $40M) | Confirm with placement agent / counsel; stage milestones must be contractually defined |
| M3 | Five-year revenue ambition: **$250M**; Year-5 EBITDA ambition: **$50M** | Must be reconciled to a bottom-up operating model before external circulation |
| M4 | Divisional Y5 revenue split: Gaming $100M · Polymer/mass-prod $80M · Metal $50M · Licensing/digital $20M | Each division requires its own unit-economics model |
| M5 | Flagship retail price **~$179**; board-only **~$129**; current direct-manufacturing cost target **~$30** per set | Costing unverified — see **A7** |
| M6 | Seven game experiences (Royal Checkers, Imperial Kings, Pre-designed Puzzle, Custom Upload Puzzle, DIY Paint Puzzle, Paintable Royal Checkers, Paintable Imperial Kings) | Verified against product-image catalog (V5) |
| M7 | Illustrative 150,000 sq. ft. warehouse plan with $12M facilities budget | **No signed lease.** Requires feasibility study, electrical/HVAC/fire/zoning review |
| M8 | Equipment categories budgeted: Bambu Lab polymer fleet, industrial polymer systems, metal additive (LPBF class), CNC, injection molding, robotics | No supplier quotations on file |
| M9 | Kickstarter funding goal $10,000 (official); $30M aspirational founder figure; Jellop marketing relationship referenced | Jellop contract and campaign deliverables not on file |
| M10 | Illustrative pre-money valuation **$300M** → post-money **$400M** → **25%** for a $100M investor | Not an independent valuation; no term sheet |
| M11 | Illustrative investor ROI scenarios up to 650% at a $3B exit | Mathematical sensitivity table only — not a projection |

---

## 4. Proposed plans (not yet commenced)

| P# | Item | Comment |
|---|---|---|
| P1 | Metal additive manufacturing division | No equipment ordered, no qualified customers signed, no safety hazard assessment performed |
| P2 | Industrial polymer print farm at warehouse scale | Pilot not operating; Bambu Lab fleet not procured |
| P3 | Creator marketplace with 50/50 net-profit royalty model | Terms unsigned; platform not built; rights framework draft only |
| P4 | Mass-production/injection-molding capacity | No tooling commissioned; no mold-maker selected |
| P5 | AI-assisted quoting / MES platform | Not scoped; no software spec on file |
| P6 | International distribution | No agreements with distributors, retailers, freight forwarders |
| P7 | Patent portfolio (utility + design) | No filings located in repo; filings status unknown |
| P8 | Product safety certifications (toy safety, children's editions) | No test reports on file |

---

## 5. Illustrative scenarios (planning math only)

| I# | Scenario | Notes |
|---|---|---|
| I1 | $100M revenue at $130 ASP → ~769,231 units/year (gaming) | Sensitivity model; no customer pipeline supports this volume today |
| I2 | $130M industrial-manufacturing revenue mix: 20 large (×$2.5M) + 100 mid (×$500K) + 300 small (×$100K) customers | Entirely illustrative — no customer list |
| I3 | EBITDA ramp: –$3M, –$4M, $5M, $20M, $50M (Y1→Y5) | Derived from revenue ambition; no supporting cost model |
| I4 | Year-5 free-cash-flow bridge: $50M EBITDA → ~$28M after interest, tax, maintenance capex, working capital | Illustrative; excludes growth capex and distributions |
| I5 | Valuation sensitivity: 6× to 20× EBITDA on $50M → $300M to $1B EV | Market multiples are planning assumptions |
| I6 | $5M production line, $1.5M incremental cash → 3.3-year simple payback | Generic equipment-economics example, not a specific machine |
| I7 | Make-or-buy break-even: 10,000 units at $18/unit saving against $180K tooling | Illustrative only |

---

## 6. Conflicts and items requiring reconciliation (A-list)

| A# | Item | Action |
|---|---|---|
| **A1** | **Rabbit Capital / Shark Ready status.** James has reported that payment with the Shark Ready team was secured for Rabbit Capital. There is **no documentary evidence** in the project that Rabbit Capital has committed, approved, or offered $100M. Shark Ready appears to be an intermediary/syndicator rather than an investor. The Blueprint must **not** imply committed funding | Request: engagement letter from Shark Ready, any term sheets, any Rabbit Capital correspondence. Until produced, Blueprint states "proposed capital-raising target, not confirmed funding." |
| A2 | Repo evidence (`git log 7679016`) says **"Kickstarter-only mode: remove direct sales"**; earlier Blueprint assumes Sphereofkings.com direct sales as a central channel | Reconcile: is direct DTC removed for now, resumed post-Kickstarter, or permanently a B2C-via-retail model? |
| A3 | $30M Kickstarter founder ambition vs. $10,000 official goal | Keep $10,000 as the official goal; label $30M explicitly as "founder aspirational," never as a forecast |
| A4 | $100M investor-ownership math: 25% at $300M pre-money gives $400M post-money and **$100M = exactly 25%**. Math is correct, but no term sheet supports $300M pre-money | Add "assumption" and "subject to negotiation" labels |
| A5 | Gaming revenue of $100M at $130 ASP requires 769K units/yr; Blueprint also references $179 retail / $129 board-only | Clarify which ASP applies (gross retail, net of channel discounts, or blended). Build DTC/wholesale/retail mix table |
| A6 | Metal additive revenue of $50M by Year 5 while the Blueprint also says "avoid large purchases without credible demand" | Make Year-3 go/no-go gate explicit in roadmap |
| A7 | $30 direct-cost-per-set has no supporting BOM, cycle time, scrap rate, or packaging detail | Request James to supply current Bambu-lab cost study or defer to a Phase-1 deliverable |
| A8 | "Jellop assist with marketing" | Request Jellop agreement for the file |
| A9 | Creator marketplace 50/50 net-profit split — "net" is undefined | Define eligible deductions in a separate term sheet |
| A10 | References to "Innovise IT", "Forgely", "3D Printing Industry" imagery/mentions in draft | Replace with SOK-owned assets or clearly-licensed placeholders; do not imply a commercial relationship with those companies |

---

## 7. Register maintenance

This register should be updated whenever:
- James supplies new documentary evidence (contracts, quotations, agreements)
- Any A-list item is resolved
- A new figure is added to the Blueprint
- A figure changes materially (threshold: ≥10% change or any change in stated status)

When an item moves from management-provided / proposed / illustrative → verified, record the supporting document and move the row into **Section 2**. Keep the history line in Section 7 below.

### Change log

| Date | Change | By |
|---|---|---|
| 2026-11-03 | v1.0 initial compilation from existing Blueprint draft, repo inspection, and James's instruction | Blueprint prep team |
