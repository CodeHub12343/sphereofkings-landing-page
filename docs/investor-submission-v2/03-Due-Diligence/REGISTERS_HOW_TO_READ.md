# How to read the 03B–03K registers

Each register is a CSV that opens in Excel, Numbers, Google Sheets, or any plain-text editor. Filter / sort by Status or Priority to find what needs action.

## Common columns

All registers share these columns (names vary slightly):

| Column | Meaning |
|---|---|
| **ID** | Short unique reference you can cite in correspondence (e.g. `IP-13`, `FIN-18`). |
| **Item / Claim / Asset** | What the row is about. |
| **Current known position** | Best summary of where we are today. |
| **Status** | One of: `CONFIRMED` · `MANAGEMENT-REPORTED` · `IN PROGRESS` · `PROPOSED` · `PENDING` · `NOT APPLICABLE`. See 00_Master_DD_Index.md §1 for definitions. |
| **Evidence available / Evidence file** | What already exists in the DD folder. |
| **Evidence missing** | What is still needed to upgrade the row. |
| **Responsible** | Who owns the next action. |
| **Next action** | What must happen next. |
| **Priority** | `P0` (critical blocker) → `P3` (later-stage). |

## The registers

| # | Register | Scope |
|---|---|---|
| 03B | `03B_Corporate_Formation_Register.csv` | Entity, EIN, cap table, governance (17 rows) |
| 03C | `03C_Financial_DD_Register.csv` | Shark Ready financial Q&A + evidence checklist + model-reconciliation schedule (36 rows including math-reconciliation rows FIN-MR-*) |
| 03D | `03D_Product_Technology_Register.csv` | Hardware, 7 experiences, software platform, product dev stage (34 rows) |
| 03E | `03E_IP_Register.csv` | Every IP asset — ownership, creator, filing, assignment, FTO (20 rows) |
| 03F | `03F_Manufacturing_Operations_Register.csv` | Equipment, production, materials, quality, facility, metal gate (36 rows) |
| 03G | `03G_Commercial_Traction_Register.csv` | Sales / users / growth / LOIs — **evidence-only, no invented figures** (26 rows) |
| 03H | `03H_Partnerships_Licensing_Register.csv` | Jellop, PostcardMania, IP-firm pilot, suppliers, distribution, Shark Ready, Rabbit Capital (18 rows) |
| 03I | `03I_Kickstarter_Register.csv` | Campaign readiness, reward tiers, fulfillment, Jellop status, pre-launch evidence (25 rows) |
| 03J | `03J_Legal_Compliance_Register.csv` | Corporate, securities, product safety, privacy, cybersecurity, IP, employment, insurance, international (33 rows) |
| 03K | `03K_Team_Governance_Register.csv` | Current + planned roles, advisors, board, financial controls (23 rows) |

Narrative sections (Markdown):

| # | Document | Scope |
|---|---|---|
| 03L | `03L_Investment_Structure_Register.md` | Proposed $100M deployment, stage gates, governance |
| 03M | `03M_Market_Competitor_Register.md` | Qualitative market framing; no invented market sizes |
| 03N | `03N_Value_and_Market_Acceleration.md` | Draft founder-intent answers on M&A openness and strategic alliances |

## Status-flag cheat sheet

- **CONFIRMED** means I inspected a file, commit, filing, or contract that proves this exact claim. A founder's email does not trigger CONFIRMED.
- **MANAGEMENT-REPORTED** means James said it in writing. We record it as his statement.
- **IN PROGRESS** means work has demonstrably started.
- **PROPOSED** is a future intention or planned agreement.
- **PENDING** means we are waiting for information or evidence.
- **NOT APPLICABLE** is used only where the item genuinely does not apply (e.g. HIPAA for a consumer-products company).

## Updating the registers

- Preserve the schema (column order and headers).
- Add new rows at the bottom; never renumber existing IDs.
- When a row changes status, update `Status`, the date, `Evidence available`, and `Next action` in one pass.
- Keep every register together with the Source & Assumption Register (05) so the provenance ties up.
