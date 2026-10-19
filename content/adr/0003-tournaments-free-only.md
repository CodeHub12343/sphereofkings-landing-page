# ADR-0003 — Tournaments Launch as Free Entry; Paid Competition Deferred

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D6 |

## Context

The product brief called out paid tournament entry and cash prizes as a potential monetisation surface. Implementing it brings significant regulatory, operational, and payment-processor risk that is disproportionate to the engineering cost of the tournament engine itself.

## Decision

- **Tournaments at launch are free entry.** No fee is charged for registration.
- **Prizes at launch are non-monetary**: free physical product, discount codes against the shop, championship titles, badges on profiles, and inclusion on the public champions page.
- The `entryFeeMinor` and `prizes` fields exist in the `tournaments` schema from day one so that paid competition is **additive**, not a schema migration, if the owner wishes to introduce it later.
- Paid tournament features **cannot ship** until the owner has:
  1. External legal review in each target jurisdiction (US state-by-state at minimum).
  2. Written approval from Stripe (or a specialist processor) to run prize contests.
  3. A tax reporting workflow (US 1099-MISC above $600 per winner per year).

## Rationale

- Many US states classify paid-entry skill competitions as **games of chance**, triggering per-state gambling licence requirements.
- **Stripe's acceptable-use policy explicitly restricts prize-contest payment processing.** A platform-wide account suspension would freeze the shop revenue too, not just tournaments.
- Prize fulfilment creates annual tax reporting obligations the business is not currently equipped to handle.
- Minors cannot participate in prize competitions in most jurisdictions, which collides with the child-safety policy's "under-13 blocked, 13–17 constrained" posture.
- Non-cash prizes (free product, discounts, titles) carry none of the above risk and are **highly motivating** at launch when the audience is still forming.

## Consequences

- The tournament engine (brackets, rounds, scheduling, dispute handling) ships normally.
- Admin UI exposes an "Entry fee" field but it is locked at `$0` with a tooltip explaining the policy; unlocking requires a separate configuration flag that will not be flipped at launch.
- The "Prizes" section on tournament listings only lists non-cash prizes until paid comp is approved.
- The champions page shows winners of free tournaments; this is still prestige-generating.

## Alternatives considered

- **A — Paid tournaments at launch, pick a few states**. Rejected: Stripe risk alone is enough; one platform-wide suspension would be catastrophic.
- **B — Free forever**. Rejected: forecloses a legitimate future revenue line prematurely. The schema design keeps the door open.
- **C — Paid with external third-party processor**. Deferred: viable but adds a vendor; not a Phase 5 decision.

## Related documents

- Roadmap §11 (Tournament Architecture)
- [content/policy/child-safety.md §3](../policy/child-safety.md) (minor restrictions on paid comp)
