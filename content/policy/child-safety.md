# Child-Safety Policy

> Status: **owner-approved** (Phase 0 sign-off, 2026-10-19).
> This document is the operating standard for every surface where a child under 18 could reach the Sphere of Kings digital platform. It drives engineering defaults, admin workflows, and vendor selection.

---

## 1. Applicable Regimes

Sphere of Kings is operated from the United States and serves a global audience. The following child-protection regimes have been identified as applicable; this is not legal advice and the policy will be re-reviewed before each phase that expands social features.

| Regime | Jurisdiction | Protects | Age floor |
|---|---|---|---|
| COPPA (Children's Online Privacy Protection Act) | United States | Users under 13 | 13 |
| GDPR-K (child-specific GDPR provisions) | European Union | Users under 13–16 (per member state) | 13 (member-state floor; some set higher) |
| UK Age Appropriate Design Code | United Kingdom | Users under 18 | 18 (standards apply to all under-18 users) |
| PIPEDA + provincial privacy laws | Canada | Users under 13 | 13 |

**Operating decision**: Sphere of Kings will apply the strictest commonly-encountered floor — **13** — as the global minimum self-attested age, with additional UK-style standards for anyone attesting 13–17.

---

## 2. Age Collection and Verification

### What is collected
At account creation, the user supplies:
- **Year of birth only**. No full date, no month, no day. This is the minimum data required to apply age-based rules and the maximum we store.

### How it is used
- Derive `isMinor` (true when `currentYear − birthYear < 18`).
- Derive `isUnder13` (true when `currentYear − birthYear < 13`).
- Store the derived flags; recompute on each sign-in to catch 13th-birthday crossovers.

### What happens for `isUnder13 === true`
- **Account creation is refused.** The user is shown a friendly explanation and offered a parental-controlled Puzzle-Only mode in a future phase (not included in launch).

### What happens for `isMinor === true` (13–17)
- Account is created with `consentStatus = "parental-pending"`.
- Routed to the parental consent flow (see §4).
- Account is **inactive** (cannot play ranked, cannot chat, cannot be found in search) until consent is granted.

### Honesty-at-signup
We do **not** attempt to verify age technically beyond the self-attestation. We do document the attestation + timestamp + IP in the audit log so a knowingly-false claim is recoverable.

---

## 3. Safe Defaults for Minors (13–17)

Any account where `isMinor === true` ships with:

| Setting | Default | Can override? |
|---|---|---|
| `profileVisibility` | `connections` | Yes, but no higher than `connections` without parent approval |
| `allowMessages` | `none` | Opt-in requires parent approval |
| `allowChallenges` | `connections` | Opt-in to `anyone` requires parent approval |
| `showRanking` | `false` | Opt-in requires account holder confirmation only |
| `showHistory` | `false` | Same as above |
| Puzzle uploads to public gallery | Disabled | Not available until 18 |
| Replay publishing to public gallery | Disabled | Not available until 18 |
| Tournament entry (state scope) | Allowed with parental consent | — |
| Tournament entry (national scope) | Allowed with parental consent | — |
| Tournament entry (worldwide) | Blocked | Not available until 18 at launch |
| Payment forms (shop checkout, prize entry) | Blocked | Not available until 18 |
| In-app purchases | Blocked | Not available until 18 |

Admin can relax a specific default **per-account** via a documented override action that is audited.

---

## 4. Verifiable Parental Consent — Method

**Approved method**: email + refunded credit-card micro-charge.

### Flow
1. Minor creates account → attests age 13–17 → provides a parent/guardian email address.
2. System emails the parent a unique consent link.
3. Parent clicks the link → sees the account summary (child's chosen username, year of birth, requested capabilities) + the Sphere of Kings privacy practices digest.
4. Parent enters a credit card. System charges **$0.50** (or local-currency equivalent) via Stripe and immediately refunds it.
5. On successful charge + refund, `consentStatus` becomes `"parental-granted"` and the audit log records the consent event with Stripe charge id + refund id as the paper trail.

### Why this method
- Named explicitly by the FTC as a COPPA-acceptable mechanism (payment-system verification).
- Uses infrastructure already present (Stripe) rather than onboarding a new vendor.
- The 50¢ charge is below any gift-card-fraud threshold, and the full refund keeps the parent whole.

### Fallback
If a parent cannot or will not use a credit card, admin can process a **manual document-verified consent** out-of-band (government ID + consent form sent to a verified operator inbox). This is slower and will be rare; it is specified so no parent is turned away.

### Revocation
A parent can revoke consent at any time. Revocation disables the minor's account within 24 hours (child-privacy best practice) and purges messages, uploaded puzzles, and recorded gameplay on request.

---

## 5. Data Minimisation

For every account (minor or adult), we collect only:
- Username.
- Email.
- Password hash.
- Year of birth.
- Country + state (self-declared, used for regional rankings — see roadmap §9).
- Optional: display name, avatar, bio.

We do **not** collect:
- Full date of birth.
- Phone number.
- Home address (except through the physical-product checkout, which is a distinct commerce workflow).
- Precise geolocation.
- Facial, biometric, or ID data (unless a future verification tier is approved for prize comps).

Minor accounts additionally **cannot upload a facial avatar** at launch; they must use a generated monogram or an officially provided avatar from a safe gallery.

---

## 6. Moderation

Every user-generated artefact — bios, usernames, custom puzzles, uploaded images, recorded gameplay, direct messages — passes through a two-step moderation pipeline:

1. **Automated first pass**:
   - Images → AWS Rekognition or Hive (unsafe content detection).
   - Text → Perspective API (toxicity / insult / threat scoring).
   - Immediate rejection above hard thresholds; soft flag between thresholds for human review.
2. **Human review queue** at `/admin/reports`:
   - Any user can report any content with a one-click button.
   - Reports create entries in `moderationReports` with context.
   - Admin can suspend, redact, or dismiss. Every decision is audited.

Moderation for minor-interactions is **stricter**:
- Any text message between a minor and an adult triggers an automatic review.
- Any image uploaded by a minor is reviewed before being made visible to any other user.

---

## 7. Blocking and Reporting

- Every player profile has a **Block** button and a **Report** button.
- Block hides the blocker from the blocked user's search, challenge, and messaging surfaces.
- Reports go to the moderation queue with a required reason category (harassment, spam, inappropriate content, impersonation, cheating, other) and optional free text.

Blocking a user does **not** notify them.

---

## 8. Account Deletion and Data Export

A player (or a parent of a minor) can request:
- **Account deletion**: soft-delete immediately, hard-delete after 30 days.
- **Data export**: a machine-readable JSON of all data associated with the account (profile, matches, puzzles, messages, replays).

Both are honoured within 30 days per GDPR Article 17 timelines.

---

## 9. Workflow Owners

| Workflow | Owner |
|---|---|
| Policy updates | Project owner (James Scott Bowser) |
| Day-to-day moderation decisions | Fulfillment admin (Benjamin Osei), escalates ambiguous cases to project owner |
| Legal review before each phase that expands social surfaces | External counsel (to be engaged before Phase 6) |
| Incident response | Project owner + fulfillment admin |

---

## 10. Change Log

| Date | Change | Approved by |
|---|---|---|
| 2026-10-19 | Initial policy sign-off; minimum age 13; credit-card micro-charge consent | James Scott Bowser |

Updates to this policy require a new row above with the explicit reason for the change.
