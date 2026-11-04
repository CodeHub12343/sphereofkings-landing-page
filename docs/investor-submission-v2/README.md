# Sphere of Kings — Investor Submission Package v2.1

**Prepared for:** Shark Ready / Rabbit Capital investor screening
**Package version:** v2.1 — 2026-11-04 · **Supersedes:** v2.0 (same date) and v1.0 (2026-11-03)
**Entry point for investors:** `03-Due-Diligence/00_Master_DD_Index.md`
**Entry point for James:** `DELIVERY_SUMMARY.md`

This is the full Shark Ready / Rabbit Capital investor due-diligence package for the proposed $100M Sphere of Kings program. It replaces `docs/investor-blueprint/` (v1.0) for all forward use; v1.0 is retained for reference.

## Folder structure

```
docs/investor-submission-v2/
├── 01-Investor-Master-Blueprint/
│   ├── SOK_Updated_Investor_Master_Blueprint.html
│   └── SOK_Updated_Investor_Master_Blueprint.pdf       (44 pages, A4 portrait)
├── 02-Shark-Ready-Buybox/
│   ├── SOK_Shark_Ready_Investor_Buybox_One_Pager.html
│   ├── SOK_Shark_Ready_Investor_Buybox_One_Pager.pdf   (1 page, A4 landscape)
│   ├── SOK_Shark_Ready_Investor_Buybox_Editable.md
│   ├── SOK_Buybox_Content_and_Evidence_Review.md
│   ├── SOK_Shark_Ready_Buybox.html  (portrait legacy)
│   └── SOK_Shark_Ready_Buybox.pdf   (portrait legacy)
├── 03-Due-Diligence/
│   ├── 00_Master_DD_Index.md
│   ├── SOK_Updated_Due_Diligence_Questionnaire.md
│   ├── 03B_Corporate_Formation_Register.csv
│   ├── 03C_Financial_DD_Register.csv
│   ├── 03D_Product_Technology_Register.csv
│   ├── 03E_IP_Register.csv
│   ├── 03F_Manufacturing_Operations_Register.csv
│   ├── 03G_Commercial_Traction_Register.csv
│   ├── 03H_Partnerships_Licensing_Register.csv
│   ├── 03I_Kickstarter_Register.csv
│   ├── 03J_Legal_Compliance_Register.csv
│   ├── 03K_Team_Governance_Register.csv
│   ├── 03L_Investment_Structure_Register.md
│   ├── 03M_Market_Competitor_Register.md
│   ├── 03N_Value_and_Market_Acceleration.md
│   └── REGISTERS_HOW_TO_READ.md
├── 04-Investor-Readiness/
│   ├── SOK_Investor_Readiness_Checklist.csv
│   ├── SOK_Investor_Readiness_Checklist.md
│   ├── 04B_Critical_Path_Action_Plan.csv
│   ├── 04B_Critical_Path_Action_Plan.md
│   └── 04C_Investor_Readiness_Dashboard.md
├── 05-Source-and-Assumptions/
│   ├── SOK_Source_and_Assumption_Register.csv
│   └── SOK_Source_and_Assumption_Register.md
├── 06-Management-Review/
│   ├── SOK_Management_Review_Report.md
│   ├── 06B_Outstanding_Information_Request_for_James.md
│   └── 06C_Management_Decisions_Required.md
├── 07-Supporting-Evidence/
│   ├── README.md
│   ├── 01-Corporate-Formation/MANIFEST.md
│   ├── 02-Ownership-and-Capitalization/MANIFEST.md
│   ├── 03-Financial-Records/MANIFEST.md
│   ├── 04-Product-and-Technical/MANIFEST.md
│   ├── 05-Intellectual-Property/MANIFEST.md
│   ├── 06-Manufacturing-and-Equipment/MANIFEST.md
│   ├── 07-Commercial-and-Customers/MANIFEST.md
│   ├── 08-Partnerships-and-Licensing/MANIFEST.md
│   ├── 09-Kickstarter/MANIFEST.md
│   ├── 10-Legal-and-Compliance/MANIFEST.md
│   ├── 11-Insurance/MANIFEST.md
│   ├── 12-Team-and-Management/MANIFEST.md
│   ├── 13-Market-and-Competition/MANIFEST.md
│   └── 14-Investment-and-Funding/MANIFEST.md
├── Document_Control_Register.csv
├── DELIVERY_SUMMARY.md
├── README.md                       (this file)
└── build-pdfs.mjs                  (Playwright → PDF renderer)
```

## Deliverable summary

| # | Deliverable | Format(s) | Purpose |
|---|---|---|---|
| 1 | **Investor Master Blueprint** | HTML + PDF | 44-page strategic document |
| 2 | **Shark Ready Buybox One-Pager** | HTML + PDF (A4 landscape) + Markdown | 10-beat, 90-second screening |
| 3 | **Buybox Content & Evidence Review** | Markdown | Internal: what's in, out, pending |
| 4 | **Master DD Index** | Markdown | Entry point for the DD package |
| 5 | **DD Questionnaire** | Markdown | Shark Ready A–J follow-up answers |
| 6 | **DD Registers 03B–03K** | CSV × 10 | 221 rows across every DD category |
| 7 | **DD Narratives 03L–03N** | Markdown × 3 | Investment structure, market, value / market acceleration |
| 8 | **Investor Readiness Checklist** | CSV + Markdown | 04A — P0 blocker tracking |
| 9 | **Critical Path & Action Plan** | CSV + Markdown | 04B — 41-action roadmap |
| 10 | **Investor Readiness Dashboard** | Markdown | 04C — status counts, blockers, readiness-at-a-glance |
| 11 | **Source & Assumption Register** | CSV + Markdown | Line-by-line provenance |
| 12 | **Management Review Report** | Markdown | 06A — internal memo for James |
| 13 | **Outstanding Info Request for James** | Markdown | 06B — fillable request |
| 14 | **Management Decisions Register** | Markdown | 06C — 24 founder-only decisions |
| 15 | **Supporting Evidence framework** | 14 subfolders + 14 MANIFEST.md | Empty; populated as James supplies docs |
| 16 | **Document Control Register** | CSV | 39-doc inventory with version, confidentiality, next review |
| 17 | **Delivery Summary** | Markdown | Final report per master-prompt §17 |
| 18 | **PDF renderer** | Node (Playwright) | `node build-pdfs.mjs` |

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

## Reading order

**For James** (internal review flow):
1. `DELIVERY_SUMMARY.md` (this delivery)
2. `06-Management-Review/SOK_Management_Review_Report.md`
3. `06-Management-Review/06B_Outstanding_Information_Request_for_James.md`
4. `06-Management-Review/06C_Management_Decisions_Required.md`
5. `04-Investor-Readiness/04C_Investor_Readiness_Dashboard.md`
6. `04-Investor-Readiness/04B_Critical_Path_Action_Plan.md`

**For Shark Ready / investors** (once P0 blockers close and securities counsel approves):
1. `02-Shark-Ready-Buybox/SOK_Shark_Ready_Investor_Buybox_One_Pager.pdf`
2. `01-Investor-Master-Blueprint/SOK_Updated_Investor_Master_Blueprint.pdf`
3. `03-Due-Diligence/00_Master_DD_Index.md`
4. `03-Due-Diligence/SOK_Updated_Due_Diligence_Questionnaire.md`
5. 03B–03N registers as requested
6. Supporting evidence in `07-Supporting-Evidence/`

## Critical status flags

- **$100M is a proposed capital-raising target, not confirmed funding.**
- **Shark Ready and Rabbit Capital have neither approved, endorsed, nor committed capital.**
- **No EIN is currently held.** Founder uses personal tax identification; EIN application planned.
- **Cap table is not finalized.**
- **No verified historical financials.** All Y1–Y5 revenue, EBITDA, valuation, and investor-return figures are illustrative management targets.
- **Jellop, PostcardMania, and the IP-firm 90-day pilot are PROPOSED.**
- **The $30M Kickstarter figure is an internal stretch.** Public Kickstarter goal is $10,000.
- **No patents filed; no trademarks registered; no toy-safety certifications held.**
- **No supporting evidence has been populated in 07-Supporting-Evidence/** — the framework is ready; evidence is not.

## File-format note

Per master prompt §13, DOCX / XLSX are replaced in this delivery with Markdown and CSV respectively ("best available editable alternative"). CSV opens directly in Excel / Numbers / Google Sheets. See `DELIVERY_SUMMARY.md` §12 for details.
