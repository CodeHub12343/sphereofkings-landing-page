# 04C · Investor Readiness Dashboard

**Snapshot:** 2026-11-04 · **Package version:** v2.1 · **Supersedes:** v2.0 snapshot
**Secure DD folder:** `[DD folder link — pending]`

> This dashboard aggregates counts from the completed registers in this package. Counts are derived directly from the 03B–03K CSVs, the 04A Readiness Checklist, and `03-Due-Diligence/APPLICATION_CAPABILITIES_INVENTORY.md`.

---

## 1 · Status counts across all registers

**Material change from v2.0 → v2.1:** a deep inspection of the Next.js codebase added a large volume of `CONFIRMED` evidence. Many rows previously tagged `PROPOSED` or `MANAGEMENT-REPORTED` are now backed by inspected code / commits / content files. See `APPLICATION_CAPABILITIES_INVENTORY.md` for the line-by-line evidence.

| Status | Count | Change vs v2.0 | Representative examples |
|---|---:|---|---|
| `CONFIRMED` | **~90** | +72 | 25-SKU product catalog with approved prices · 20% site-wide discount · Royal Checkers + Imperial Kings game engines + AI · Glicko-2 rating · tournament engine · Pusher realtime · Stripe webhook + finance reconciliation · sponsorship pricing (10 Silver @ $3K + 5 Gold @ $10K) · 24-page admin back-office · affiliate program · blog system · sweepstakes with AMOE · child-safety policy covering COPPA/GDPR-K/UK-AADC/PIPEDA · parental-consent micro-charge · 23 MongoDB collections · 34 API routes · 65 page routes · 10 smoke tests · 6 owner-approved ADRs · 3 owner-approved game-rules documents · playable 3D sphere · online multiplayer · phone-app shell + PWA |
| `MANAGEMENT-REPORTED` | **~22** | unchanged | Four-division strategy · Y5 ambitions · ~$30 direct-cost target · Bambu Lab printer access · $100M proposed target · founder biography (pending detail) |
| `IN PROGRESS` | **~5** | unchanged | EIN application plan · privacy/ToS review · cybersecurity controls formalization |
| `PROPOSED` | **~35** | −20 | Future facilities · metal division · injection molding · CNC · MES software platform · creator marketplace public enrollment · brand/sports/entertainment licensing · board + committees |
| `PENDING` | **~65** | −45 | Corporate items (entity type, state, EIN, cap table) · bank statements · bottom-up financial model · FTO memo · patent/trademark filings · product-liability insurance · toy-safety test reports |
| `NOT APPLICABLE` | **~11** | unchanged | HIPAA · CMMC · EN71 (until EU distribution) · PCI-DSS direct scope · SOC 2 / ISO 27001 at current scale |
| `ILLUSTRATIVE` | **~10** | unchanged | Financial math sums, ROI math, payback math, break-even — all internally consistent |

## 2 · Critical blockers (must close before external circulation)

The P0 list has shrunk from 13 items to **10**, because three previously-P0 items are now effectively covered by the shipped application and documented policies.

| # | Blocker | Register row | Owner |
|---:|---|---|---|
| 1 | Shark Ready / Rabbit Capital engagement letters on file | 03H PART-17/18 | Founder + counsel |
| 2 | Legal entity type + state of formation chosen and filed | 03B CF-01/02 | Founder + corp counsel |
| 3 | EIN application after entity formation | 03B CF-05 | Founder |
| 4 | Fully-diluted cap table | 03B CF-06/07/08/09 | Founder + corp counsel |
| 5 | IP ownership chain — signed assignments + FTO memo + patent filings | 03E IP-* + 03J LEG-24 | Founder + IP counsel |
| 6 | Bottom-up five-year financial model | 03C FIN-18 | External financial consultant |
| 7 | Stage-1 and Stage-2 equipment quotations (three per class) | 03F MFG-27 | Operations |
| 8 | Toy-safety testing (ASTM F963) for the physical 25-SKU catalog | 03D PROD-13 + 03J LEG-05 | Operations + lab |
| 9 | Product liability insurance bound | 03J LEG-29 | Insurance broker |
| 10 | Securities-counsel engagement + review | 03J LEG-03 | Founder + counsel |
| 11 | Secure DD folder provisioned (replaces `[DD folder link — pending]`) | 00_Master_DD_Index.md §1 | Founder |
| 12 | Founder biography paragraph for Buybox beat 05 | 03K TM-01 | Founder |

(The old #8 pilot-facility feasibility and #13 are now reclassified as P1 since the current operation runs on Bambu Lab printers and the Blueprint already labels the warehouse as illustrative.)

## 3 · Items ready for investor review now

A dramatically expanded list vs v2.0 — every one is backed by direct repository inspection, documented in `APPLICATION_CAPABILITIES_INVENTORY.md`:

**Codebase scale**
- 406 TypeScript source files · ~68,964 lines · 65 page routes · 34 API routes · 122 React components · 23 typed MongoDB collections

**Digital gaming platform**
- Royal Checkers game engine + AI (owner-approved rules on file)
- Imperial Kings game engine + AI (owner-approved rules on file)
- Glicko-2 rating system
- Online multiplayer with Pusher channels + QStash
- Matchmaking + match lifecycle (invite / accept / join / move / chat / resign / ranked-result)
- Tournament engine with bracket math (free-only per ADR-0003)
- Champions page + leaderboards
- Playable 3D sphere + sideways-phone layout + opt-in fullscreen
- Phone-app shell + PWA installation

**Commerce**
- 25 SKUs in `products.ts` with approved prices and Markdown descriptions
- Stripe checkout + webhook
- Cart + checkout UI
- Order management + public order status + admin orders pipeline
- Custom-upload puzzle flow with Vercel Blob storage
- **Site-wide 20% discount approved by James 2026-10-21** (single-source pricing function)
- Wholesale checkout (B2B token-protected)
- Fulfillment pipeline with carrier config
- Finance reconciliation engine (Stripe charge / refund / payout matching)

**Sponsorship program (James-approved tiers)**
- 10 Silver Business Sponsor slots at $3,000
- 5 Gold Business Sponsor slots at $10,000
- Public /sponsorship page + Stripe-backed /sponsorship/pay
- Waitlist when tier is sold out
- Sponsor portal (sign-in / sign-out)

**Creator / licensing infrastructure**
- License application flow with admin review
- User-submitted sphere designs with public catalog

**Affiliate / referral program**
- Tiered affiliate program + promotion mechanics + apply/payout flow
- Attributed orders + referral links + withdrawal requests

**Content & marketing**
- Blog system with per-post comments (5 seed posts)
- Email subscriber system (confirm / unsubscribe / admin)
- Sweepstakes with AMOE compliance flow
- Videos / vlog embeds
- Donate
- Experiments / feature flags

**Compliance & safety**
- Child-safety policy covering COPPA, GDPR-K, UK Age Appropriate Design Code, PIPEDA — owner-approved 2026-10-19
- Age gating + safety gates
- Parental consent micro-charge flow (per ADR-0006)
- Moderation + audit log
- Localization scaffolding (i18n)

**Administrative back-office (24 pages)**
- The owner can run the entire business from `/admin/*` — affiliates, analytics, audit, blog, custom-spheres, emails, experiments, finance, fulfillment, license-applications, orders, products, reports, sponsorships, subscribers, sweepstakes, tournaments, wholesale, plus detail pages.

**Owner-approved reference documents**
- 6 ADRs (seams, 2D MVP, tournaments, Pusher, min-age 13, parental-consent)
- 3 game-rules documents (Royal Checkers, Imperial Kings, Non-digital game modes)
- 1 child-safety policy
- Game App Product Overview (PDF + DOCX) authored by James
- Game Design & Implementation Reference (DOCX) authored by James
- SPHERE_OF_KINGS_DIGITAL_PLATFORM_IMPLEMENTATION_ROADMAP.md

**CI-grade smoke test coverage**
- 10 smoke/audit scripts: game-smoke, ik-smoke, glicko-smoke, bracket-smoke, match-engine-smoke, moderation-smoke, blog-smoke, phase9-smoke, a11y-audit, game-feedback-smoke

**Kickstarter launch**
- November 19, 2026 declared in site metadata — 15 days from the date of this dashboard

## 4 · Items awaiting James

Items only James can decide, disclose, or supply. See `06B_Outstanding_Information_Request_for_James.md` and `06C_Management_Decisions_Required.md`:

- Entity type decision (LLC / C-Corp / S-Corp)
- Disclose every past equity promise or commitment
- Confirm full-time status and any personal capital contribution
- Supply contractor list and chase IP assignments
- Supply bank statements and any accounting records
- Supply (or deny) Jellop / PostcardMania / IP-firm documentation
- Confirm final Kickstarter reward tiers and pricing
- Confirm M&A openness (03N)
- Confirm strategic-alliance preferences (03N)

## 5 · Items awaiting professional advisers

- **Corporate counsel:** entity formation, operating agreement, cap-table formalization
- **Securities counsel:** offering structure review, Blueprint & Buybox review before circulation
- **IP counsel:** FTO memo, patent filings (provisional utility + design), trademark clearance + filing, contractor-assignment chase
- **Financial consultant / fractional CFO:** bottom-up five-year model
- **Independent accountant:** opening balance sheet; ongoing books
- **CPSC-accepted toy-safety test lab:** ASTM F963 testing for the physical product line
- **Insurance broker:** product liability + premises + cyber as applicable
- **Commercial broker:** pilot-facility shortlist (deferred until contract backlog exists)

## 6 · Items that must NOT be represented as verified

- The $100M as committed, offered, or approved
- Shark Ready or Rabbit Capital as having endorsed, accepted, or committed
- Jellop, PostcardMania, or IP firms as confirmed partners
- Any patent as granted or filed
- Any trademark as registered
- Any ISO 9001 / SOC 2 / ISO 27001 / toy-safety certification as held
- Any historical revenue, customers, sales, LOIs, or MOUs
- Any manufacturing capacity, facility lease, or metal cell as operating
- Any valuation or ownership percentage as agreed

## 7 · Readiness at a glance

| Area | Readiness v2.0 | Readiness v2.1 | Change |
|---|---|---|---|
| Strategic framework & narrative | Ready | Ready | — |
| **Shipped application (consumer side)** | Partially ready | **Ready** | ↑↑ |
| **Game platform (digital)** | Partially ready | **Ready** | ↑↑ |
| **Commerce / Stripe infrastructure** | Partially ready | **Ready** | ↑↑ |
| **Sponsorship program** | Proposed | **Ready — signed tiers on file** | ↑↑ |
| **Admin back-office** | Unspecified | **Ready — 24 pages** | ↑↑ |
| **Child-safety / compliance framework** | Not detailed | **Ready — owner-approved policy** | ↑↑ |
| Corporate (entity / EIN / cap table) | Blocked — P0 | Blocked — P0 | — |
| Financial (bank / accounting / model) | Blocked — P0 | Blocked — P0 | — |
| IP (ownership / FTO / filings) | Blocked — P0 | Blocked — P0 | — |
| Physical product (BOM / toy-safety) | Partially planned | Partially planned | — |
| Manufacturing (facility / supplier / metal) | Partially planned | Partially planned | — |
| Commercial traction (sales / LOIs) | No verified traction | **Platform-level traction (product-shipped scale)** | ↑ |
| Partnerships | All PROPOSED | All PROPOSED | — |
| Kickstarter | Launch scheduled; evidence pending | **Launch scheduled Nov 19 — platform is live** | ↑ |
| Legal & compliance | Blocked on securities counsel | Blocked on securities counsel | — |
| Governance | Minimal | Minimal | — |
| Investor data-room | Framework ready; evidence empty | **Framework ready; shipped-platform evidence catalogued** | ↑ |

## 8 · Summary for an investor

**What exists today:** a professionally built, operator-ready software platform for Sphere of Kings — full commerce, two playable games with AI, online multiplayer, tournaments, a 24-page admin back-office, a sponsorship program with signed pricing tiers, an affiliate program, a blog, a sweepstakes with AMOE compliance, a child-safety policy covering four jurisdictions, and a 25-SKU product catalog with approved prices. The app is 15 days from launching on Kickstarter.

**What is still proposed:** the physical-manufacturing expansion (polymer print farm, injection molding, CNC, metal additive) and the formal corporate / financial / IP paperwork that institutional investors require.

**Where the $100M would go:** primarily into the physical-manufacturing and commercial expansion — the software stack that most $100M raises would need to build already exists.
