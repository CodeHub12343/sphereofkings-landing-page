# Sphere of Kings — Investor Submission Package v2.0

**Prepared for:** Shark Ready / Rabbit Capital investor screening
**Package version:** v2.0 — 2026-11-04 · **Supersedes:** v1.0 (2026-11-03)

This folder is the deliverable for the master-prompt update of the Sphere of Kings Investor Master Blueprint. It replaces `docs/investor-blueprint/` (v1.0) for all forward use; v1.0 is retained for reference.

## Folder structure

```
docs/investor-submission-v2/
  01-Investor-Master-Blueprint/
    SOK_Updated_Investor_Master_Blueprint.html
    SOK_Updated_Investor_Master_Blueprint.pdf
  02-Shark-Ready-Buybox/
    SOK_Shark_Ready_Buybox.html
    SOK_Shark_Ready_Buybox.pdf
  03-Due-Diligence/
    SOK_Updated_Due_Diligence_Questionnaire.md
  04-Investor-Readiness/
    SOK_Investor_Readiness_Checklist.csv
    SOK_Investor_Readiness_Checklist.md
  05-Source-and-Assumptions/
    SOK_Source_and_Assumption_Register.csv
    SOK_Source_and_Assumption_Register.md
  06-Management-Review/
    SOK_Management_Review_Report.md
  07-Supporting-Evidence/
    (to be populated as verified documents arrive)
  build-pdfs.mjs
  README.md (this file)
```

## Deliverable summary

| # | Deliverable | Purpose |
|---|---|---|
| 1 | **Updated Investor Master Blueprint** | Full 44-page investor document. Preserves v1.0's strategic framework; integrates James's Nov-3 corporate info; adopts Shark Ready status taxonomy; prominent "What is new in v2.0" page. |
| 2 | **Shark Ready Buybox** | Single-page, 10-beat investor one-pager (~90-second screening). Includes the mandatory `[DD folder link — pending]` placeholder. |
| 3 | **Updated Due Diligence Questionnaire** | Shark Ready A–J categories with status flags per answer. |
| 4 | **Investor Readiness Checklist** | CSV + Markdown. P0 blockers highlighted. |
| 5 | **Source & Assumption Register** | CSV + Markdown. Every claim mapped to a source and a status. A-list of 13 blockers. |
| 6 | **Management Review Report** | Internal memo for James — what changed, what to supply next. |
| 7 | **Supporting Evidence folder** | Verified documents only. Empty until James provides them. |

## How to produce the PDFs

```bash
node docs/investor-submission-v2/build-pdfs.mjs
```

If Chromium is not yet installed for Playwright:

```bash
cd nextjs
npx playwright install chromium
cd ..
node docs/investor-submission-v2/build-pdfs.mjs
```

Both PDFs land next to their source HTML files.

## Critical status flags

- **$100M is a proposed capital-raising target, not confirmed funding.** No commitment letter, term sheet, or signed investment agreement is on file.
- **Shark Ready and Rabbit Capital have neither approved, endorsed, accepted, nor committed to this opportunity.** All references to them in this package describe engagement discussions, not outcomes.
- **No EIN is currently held.** Founder uses personal tax identification for applicable business tax purposes; EIN application is planned. The founder's SSN is nowhere in this package.
- **Cap table is not finalized.** No ownership percentages, option grants, SAFEs, or outstanding equity commitments are represented as finalized.
- **No verified historical financials.** All Year 1–5 revenue, EBITDA, valuation, and investor-return figures are illustrative management targets.
- **Jellop, PostcardMania, and the IP-firm 90-day pilot are PROPOSED** — none are executed partnerships.
- **The $30M Kickstarter figure is an internal stretch objective** — not the published campaign goal. The public Kickstarter goal is $10,000.

## Next steps

See the P0 blockers in `04-Investor-Readiness/SOK_Investor_Readiness_Checklist.md` and the action list in `06-Management-Review/SOK_Management_Review_Report.md`.

Before external circulation:

1. Clear the P0 blockers (entity, EIN, cap table, financials, IP, DD folder, securities counsel).
2. Replace every `[PENDING MANAGEMENT CONFIRMATION]` and `[DD folder link — pending]` placeholder.
3. Independent accountant review of model mechanics.
4. Securities-counsel review of the Buybox and Blueprint.
5. Re-render both PDFs after corrections.
6. Sign off in the approval blocks (DD Questionnaire; Blueprint Appendix C).
