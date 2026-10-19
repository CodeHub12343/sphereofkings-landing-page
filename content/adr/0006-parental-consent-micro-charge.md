# ADR-0006 — Parental Consent via Refunded Credit-Card Micro-Charge

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D8 |

## Context

Minors aged 13–17 may create accounts (see [ADR-0005](0005-minimum-age-13.md)) but their accounts remain inactive until a parent or guardian provides **verifiable parental consent**. "Verifiable" is a legal term — self-attestation and plain email confirmation do not meet the FTC's COPPA standard, even where that standard does not strictly apply (we hold ourselves to it as a best practice).

## Decision

**Approved verifiable-parental-consent method: email-plus-refunded-credit-card-micro-charge.**

Flow:
1. Minor creates account → attests age 13–17 → supplies parent email.
2. Parent receives a unique consent link.
3. Link lands on a consent page explaining the account summary + Sphere of Kings privacy practices digest.
4. Parent enters credit card details via Stripe hosted elements.
5. We charge **$0.50 USD** (local-currency equivalent) and immediately refund it.
6. On successful charge + refund, `consentStatus = "parental-granted"`. Stripe charge-id and refund-id are stored in the audit log as the paper trail.

A **fallback** manual document-verified consent path exists for parents without credit cards: ID + a signed consent form sent to a verified operator inbox, processed by admin, same audit trail.

## Rationale

- Explicitly named by the FTC as a COPPA-acceptable mechanism (payment-system verification).
- Reuses infrastructure already present (Stripe) rather than adding a new vendor.
- $0.50 is below any gift-card-fraud threshold, and the full refund keeps the parent whole.
- Government-ID verification was considered and rejected for launch: too heavy, drives signup abandonment past 60%, and introduces biometric-data concerns beyond our data-minimisation posture.

## Consequences

- Stripe integration surfaces a new endpoint `/api/parental-consent/*` that uses the existing Stripe server client.
- The consent page is a standalone, no-auth-required route reachable only via the signed link in the parent email.
- Revocation is honoured within 24 hours: the account is disabled and messaging / uploads / published content are purged on request.
- The policy and the Stripe charge descriptor must be transparent (parents see "SPHERE OF KINGS CONSENT $0.50" and then a full refund).

## Alternatives considered

- **Email-only confirmation.** Rejected: not COPPA-"verifiable."
- **Government ID verification** (via Veriff / Persona). Deferred: appropriate for a future prize-money tournament tier (see [ADR-0003](0003-tournaments-free-only.md)), overkill at Phase 6.
- **Social-login attestation** (parent signs in with their own existing adult account). Rejected: creates account-linking privacy concerns and does not actually prove the signing-in adult is the minor's guardian.

## Related documents

- [ADR-0005 Minimum age 13](0005-minimum-age-13.md)
- [content/policy/child-safety.md §4](../policy/child-safety.md)
- Roadmap §12 (Child Safety)
