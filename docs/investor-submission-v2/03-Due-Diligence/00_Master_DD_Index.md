# Sphere of Kings — Master Due-Diligence Index (03A)

**Project:** Sphere of Kings — 7-in-1 Spherical Gaming System
**Development Company:** Creative Design Networks · Founder: James Scott Bowser
**Website:** https://SphereofKings.com · jbowser727@gmail.com · 209-622-9391
**Package version:** v2.1 — 2026-11-04 · **Capital-raising target:** USD $100M (proposed · not committed)
**Investor-preparation context:** Shark Ready / Rabbit Capital
**Secure due-diligence folder:** `[DD folder link — pending]`

> This index is the entry point to the Sphere of Kings Investor Due-Diligence Package. It explains the purpose of each folder and document, how status flags are used, who is responsible for what, and which documents are investor-facing versus internal. Nothing in this package is an offer, a commitment, or an endorsement.

---

## 1 · Status legend (used consistently across every document)

| Status | Meaning |
|---|---|
| **CONFIRMED** | Supported by inspected documentary or technical evidence that establishes the specific claim. |
| **MANAGEMENT-REPORTED** | Supplied by James or management but not independently verified. |
| **IN PROGRESS** | Work has demonstrably started but is not complete. |
| **PROPOSED** | A future intention, proposed agreement, planned activity, or strategy. |
| **PENDING** | Information or evidence has not yet been supplied or confirmed. |
| **NOT APPLICABLE** | The item genuinely does not apply, with a brief explanation. |

A founder's written statement is **MANAGEMENT-REPORTED**, not CONFIRMED.

## 2 · Package structure

```
Sphere-of-Kings-Investor-Data-Room/  (= docs/investor-submission-v2/)
├── 01-Investor-Master-Blueprint/      Investor Master Blueprint v2.0 (HTML + PDF)
├── 02-Shark-Ready-Buybox/             10-beat Buybox one-pager (landscape HTML + PDF) · editable MD · content/evidence review
├── 03-Due-Diligence/                  THIS folder — the main deliverable
│   ├── 00_Master_DD_Index.md                                 03A — this file
│   ├── SOK_Updated_Due_Diligence_Questionnaire.md            Shark Ready A–J follow-up answers
│   ├── 03B_Corporate_Formation_Register.csv + .md            Entity, EIN, cap table, governance
│   ├── 03C_Financial_DD_Register.csv + .md                   Financial questions, evidence checklist, model-review schedule
│   ├── 03D_Product_Technology_Register.csv + .md             Product, software, differentiation, dev stage
│   ├── 03E_IP_Register.csv + .md                             Every IP asset, filings, assignments, FTO
│   ├── 03F_Manufacturing_Operations_Register.csv + .md       Equipment, capacity, suppliers, facility
│   ├── 03G_Commercial_Traction_Register.csv + .md            Sales / users / growth / LOIs — evidence-only
│   ├── 03H_Partnerships_Licensing_Register.csv + .md         Jellop · PostcardMania · IP firms · prospects
│   ├── 03I_Kickstarter_Register.csv + .md                    Campaign readiness, evidence requests
│   ├── 03J_Legal_Compliance_Register.csv + .md               Corporate, securities, consumer, cyber, privacy
│   ├── 03K_Team_Governance_Register.csv + .md                Current team, planned hires, advisors
│   ├── 03L_Investment_Structure_Register.md                  Proposed $100M deployment, stage gates
│   ├── 03M_Market_Competitor_Register.md                     Market framing, competitive map (qualitative)
│   └── 03N_Value_and_Market_Acceleration.md                  M&A openness; strategic-alliance openness
├── 04-Investor-Readiness/             Checklist · Action plan · Dashboard
│   ├── SOK_Investor_Readiness_Checklist.csv + .md            04A
│   ├── 04B_Critical_Path_Action_Plan.csv + .md               Prioritized roadmap
│   └── 04C_Investor_Readiness_Dashboard.md                   Counts by status, blockers
├── 05-Source-and-Assumptions/         Register v2.0 (CSV + MD)
├── 06-Management-Review/              Internal — not for investors
│   ├── SOK_Management_Review_Report.md                       06A
│   ├── 06B_Outstanding_Information_Request_for_James.md      06B
│   └── 06C_Management_Decisions_Required.md                  06C
├── 07-Supporting-Evidence/            14 subfolders, each with a placeholder manifest
│   ├── 01-Corporate-Formation/
│   ├── 02-Ownership-and-Capitalization/
│   ├── 03-Financial-Records/
│   ├── 04-Product-and-Technical/
│   ├── 05-Intellectual-Property/
│   ├── 06-Manufacturing-and-Equipment/
│   ├── 07-Commercial-and-Customers/
│   ├── 08-Partnerships-and-Licensing/
│   ├── 09-Kickstarter/
│   ├── 10-Legal-and-Compliance/
│   ├── 11-Insurance/
│   ├── 12-Team-and-Management/
│   ├── 13-Market-and-Competition/
│   └── 14-Investment-and-Funding/
├── Document_Control_Register.csv
├── DELIVERY_SUMMARY.md                 Final report for James
├── README.md
└── build-pdfs.mjs                      Playwright → PDF renderer
```

## 3 · Folder-to-category mapping (Blueprint data-room → v2 submission folders)

The Investor Master Blueprint proposes a data-room taxonomy with 11 categories. This submission package maps them into the 7-folder structure so there is one canonical home for every document.

| Blueprint data-room category | v2 package location |
|---|---|
| 01 Corporate | `03-Due-Diligence/03B_Corporate_Formation_Register.*` + `07-Supporting-Evidence/01-Corporate-Formation/` + `07-Supporting-Evidence/02-Ownership-and-Capitalization/` |
| 02 Financials | `03-Due-Diligence/03C_Financial_DD_Register.*` + `07-Supporting-Evidence/03-Financial-Records/` |
| 03 Business plan & Blueprint | `01-Investor-Master-Blueprint/` |
| 04 Product & IP | `03D_*` + `03E_*` + `07-Supporting-Evidence/04-Product-and-Technical/` + `07-Supporting-Evidence/05-Intellectual-Property/` |
| 05 Operations & equipment | `03F_*` + `07-Supporting-Evidence/06-Manufacturing-and-Equipment/` |
| 06 Facility | `03F_Manufacturing_Operations_Register.*` (facility section) |
| 07 Commercial & pipeline | `03G_*` + `07-Supporting-Evidence/07-Commercial-and-Customers/` |
| 08 Legal & compliance | `03J_*` + `07-Supporting-Evidence/10-Legal-and-Compliance/` |
| 09 Insurance | `07-Supporting-Evidence/11-Insurance/` + rows in `03J_*` |
| 10 Technology | `03D_Product_Technology_Register.*` (platform/architecture rows) |
| 11 References & introductions | `03H_Partnerships_Licensing_Register.*` + `07-Supporting-Evidence/08-Partnerships-and-Licensing/` |

## 4 · Investor-facing vs. internal

| Folder / document | Audience | Confidentiality mark |
|---|---|---|
| 01 Blueprint | Qualified investors | **CONFIDENTIAL — FOR QUALIFIED INVESTOR REVIEW ONLY** |
| 02 Buybox | Qualified investors | **CONFIDENTIAL — FOR QUALIFIED INVESTOR REVIEW ONLY** |
| 03 DD Questionnaire + registers | Qualified investors (once populated) | **CONFIDENTIAL — FOR QUALIFIED INVESTOR REVIEW ONLY** |
| 04 Readiness checklist, action plan, dashboard | Mixed — primarily internal, summary dashboard shareable | Internal + redacted external version |
| 05 Source & Assumption Register | Internal (reference) | **CONFIDENTIAL — INTERNAL MANAGEMENT REVIEW — NOT FOR EXTERNAL CIRCULATION** |
| 06 Management Review, Outstanding Info Request, Decisions Register | Internal to James + preparation team | **CONFIDENTIAL — INTERNAL MANAGEMENT REVIEW — NOT FOR EXTERNAL CIRCULATION** |
| 07 Supporting Evidence | Qualified investors (under NDA) | **CONFIDENTIAL — FOR QUALIFIED INVESTOR REVIEW ONLY** |

## 5 · How to use this package

1. Read **00_Master_DD_Index.md** (this file).
2. Open the **Investor Master Blueprint v2.0** for the strategic narrative.
3. Open **SOK_Shark_Ready_Investor_Buybox_One_Pager.pdf** for the 90-second screening view.
4. Review the **Due-Diligence Questionnaire** for the Shark Ready follow-up answers.
5. For each diligence category, consult the matching 03B–03N register. Each register has a CSV (the data) and a short Markdown cover note (how to read it).
6. Open **04-Investor-Readiness/04C_Investor_Readiness_Dashboard.md** for a one-page snapshot of readiness counts and blockers.
7. For evidence, navigate to **07-Supporting-Evidence/** and the matching subfolder. Each subfolder currently holds only a placeholder manifest until James supplies the documents.
8. For an internal view, James should read **06-Management-Review/** — the review report, the outstanding-info request (fillable), and the decisions register (founder-only decisions).

## 6 · File-naming convention

Investor-facing documents follow:

```
SOK_DD_[CATEGORY]_[DOCUMENT-NAME]_V<N.N>_<YYYY-MM-DD>
```

Example: `SOK_DD_IP_Register_V1.0_2026-11-04.csv`.

Internal documents follow the same pattern with `_INT_` inserted after `SOK_`. Established v2.0 artifacts keep their legacy names as noted in the Document Control Register.

## 7 · Not included in this package

- Any fabricated corporate certificate, EIN letter, cap-table entry, bank statement, invoice, patent receipt, trademark registration, or signed agreement.
- Any representation that Shark Ready, Rabbit Capital, Jellop, PostcardMania, or any other third party has committed capital, executed an agreement, or endorsed the opportunity.
- The founder's Social Security number or any personally-identifying tax identifier.
- Market statistics not attributable to a named, dated source.
