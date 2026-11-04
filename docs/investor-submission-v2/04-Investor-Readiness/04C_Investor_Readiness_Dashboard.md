# 04C · Investor Readiness Dashboard

**Snapshot:** 2026-11-04 · **Package version:** v2.1
**Secure DD folder:** `[DD folder link — pending]`

> This dashboard aggregates counts from the completed registers in this package. Counts are derived directly from `03B`–`03K` CSVs and the `04A` Readiness Checklist. No completion percentage is invented. "Investor-ready" means the row is backed by inspected evidence that establishes the specific claim.

---

## 1 · Status counts across all registers

Counted from the 03B–03K CSVs (221 rows total across the ten core registers).

| Status | Count | Comment |
|---|---:|---|
| `CONFIRMED` | ~18 | Primarily repository-verified items (brand system, Kickstarter date, product catalog art, playable 3D sphere, sponsorship program, platform ADRs, DTC storefront in Kickstarter-only mode) |
| `MANAGEMENT-REPORTED` | ~22 | Founder statements from the Nov-3 response: Bambu Lab printer access, product pricing targets, four-division strategy, Y5 ambitions, founder biography |
| `IN PROGRESS` | ~5 | EIN application planned; privacy / ToS review; cybersecurity controls formalization |
| `PROPOSED` | ~55 | Future facilities, metal division, creator marketplace, licensing agreements, software platform layers, governance bodies, board, committees |
| `PENDING` | ~110 | Everything requiring documentary evidence that has not yet been supplied |
| `NOT APPLICABLE` | ~11 | HIPAA, CMMC, EN71 (until EU distribution), PCI DSS direct scope, SOC 2/ISO 27001 at current scale |
| `ILLUSTRATIVE` | ~10 | Financial math checks (sums, ROI, payback, break-even) that are internally consistent but remain illustrative |

Totals are approximate because some rows cover multiple sub-items. Open each CSV to filter precisely.

## 2 · Critical blockers (must close before external circulation)

| # | Blocker | Register row | Owner |
|---:|---|---|---|
| 1 | Shark Ready / Rabbit Capital engagement letters on file | 03H PART-17/18 | Founder + counsel |
| 2 | Legal entity type + state of formation chosen and filed | 03B CF-01/02 | Founder + corp counsel |
| 3 | EIN application after entity formation | 03B CF-05 | Founder |
| 4 | Fully-diluted cap table | 03B CF-06/07/08/09 | Founder + corp counsel |
| 5 | IP ownership chain — signed assignments + FTO memo + patent filings | 03E IP-* + 03J LEG-24 | Founder + IP counsel |
| 6 | Bottom-up five-year financial model | 03C FIN-18 | External financial consultant |
| 7 | Stage-1 and Stage-2 equipment quotations (three per class) | 03F MFG-27 | Operations |
| 8 | Smaller pilot-facility feasibility study (replaces illustrative 150K sqft) | 03F MFG-20 | Operations + broker |
| 9 | Toy-safety testing (ASTM F963) | 03D PROD-13 + 03J LEG-05 | Operations + lab |
| 10 | Product liability insurance bound | 03J LEG-29 | Insurance broker |
| 11 | Securities-counsel engagement + review | 03J LEG-03 | Founder + counsel |
| 12 | Secure DD folder provisioned (replaces `[DD folder link — pending]`) | 00_Master_DD_Index.md §1 | Founder |
| 13 | Founder biography / full-time / personal-capital answers | 03K TM-01 | Founder |

**P0 blockers total:** 13.

## 3 · Items awaiting James

Items James must decide, disclose, or supply. See `06B_Outstanding_Information_Request_for_James.md` and `06C_Management_Decisions_Required.md`.

- Entity type decision (LLC vs C-Corp vs S-Corp).
- Disclose every past equity promise or commitment.
- Confirm full-time status and any personal capital contribution.
- Supply contractor list and chase assignments.
- Supply bank statements and any accounting records.
- Supply (or deny) Jellop / PostcardMania / IP-firm documentation.
- Confirm final Kickstarter reward tiers and pricing.
- Confirm or revise the $30M internal stretch narrative.
- Confirm M&A openness (03N).
- Confirm strategic-alliance preferences (03N).

## 4 · Items awaiting professional advisers

- **Corporate counsel:** entity formation, operating agreement, cap-table formalization.
- **Securities counsel:** offering structure review, Blueprint & Buybox review before circulation.
- **IP counsel:** FTO memo, patent filings (provisional utility + design), trademark clearance + filing, contractor-assignment chase.
- **Financial consultant / fractional CFO:** bottom-up five-year model; model mechanics review.
- **Independent accountant:** opening balance sheet; model-mechanics review; ongoing books.
- **CPSC-accepted toy-safety test lab:** ASTM F963 testing.
- **Insurance broker:** product liability + premises + cyber as applicable.
- **Commercial broker:** pilot-facility shortlist.

## 5 · Items ready for investor review now

These rows have supporting evidence in the repository or in prior shipped artifacts. They can be referenced directly in investor conversations.

- Investor Master Blueprint v2.0 (HTML + PDF). Strategic framework.
- Shark Ready Buybox one-pager v2.1 (HTML + landscape PDF). 10-beat screening.
- SOK product catalog — 36 approved product images shipped to repo.
- Playable 3D sphere game + online multiplayer + phone-app shell + sponsor dashboard — shipped to repo (commits `7871689`, `f1f7e7a`, `99b320b`, `bc72406`, `7679016`).
- Platform ADRs — six architecture decision records.
- Kickstarter launch metadata — November 19, 2026, declared in site metadata.

## 6 · Items that must NOT be represented as verified

- Any statement that the $100M is committed, offered, or approved.
- Any statement that Shark Ready or Rabbit Capital has endorsed, accepted, or committed.
- Any statement that Jellop, PostcardMania, or IP firms are confirmed partners.
- Any patent as granted or filed.
- Any trademark as registered.
- Any ISO 9001 / SOC 2 / ISO 27001 / toy-safety certification as held.
- Any historical revenue, customers, sales, LOIs, or MOUs.
- Any manufacturing capacity, facility lease, or metal cell as operating.
- Any valuation or ownership percentage as agreed.

## 7 · Readiness at a glance

| Area | Readiness |
|---|---|
| Strategic framework & narrative | **Ready** |
| Corporate (entity / EIN / cap table) | **Blocked — P0** |
| Financial (bank / accounting / model) | **Blocked — P0** |
| IP (ownership / FTO / filings) | **Blocked — P0** |
| Product (hardware / software) | **Partially ready** (software shipped; hardware BOM pending) |
| Manufacturing (capacity / supplier / facility) | **Partially planned** (pilot feasibility pending; subcontract-first for metal) |
| Commercial traction (sales / LOIs) | **No verified traction** (pre-launch) |
| Partnerships | **All PROPOSED** (Jellop / PostcardMania / IP firms pending documents) |
| Kickstarter | **Launch scheduled; readiness evidence pending** |
| Legal & compliance | **Blocked — P0** for securities counsel + P1 for pre-launch items |
| Governance | **Minimal** today — founder-led; board + committees planned |
| Investor data-room | **Framework ready; evidence folders empty** |
