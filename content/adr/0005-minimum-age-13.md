# ADR-0005 — Minimum Account Age: 13 (self-attested)

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D7 |

## Context

The platform must choose a minimum age at which a visitor can create a player account. The decision interacts with COPPA (United States, under 13), GDPR-K (European Union, floor 13–16), the UK Age Appropriate Design Code (standards for all under-18 users), and PIPEDA (Canada, under 13).

## Decision

**Minimum age for a Sphere of Kings player account is 13**, self-attested at signup via year-of-birth collection only.

- Under-13 signups are **blocked at creation**. The user sees a friendly refusal and is pointed to the physical product as the current under-13 experience.
- Users attesting 13–17 are flagged as minors (`isMinor = true`) and routed to the parental-consent workflow before their account becomes active.
- Users attesting 18+ proceed to a standard adult account.

## Rationale

- 13 is the standard floor adopted by every major platform frequented by this audience (Discord, Instagram, YouTube, Minecraft Realms, Roblox accounts).
- Blocking under-13s entirely avoids the COPPA verifiable-parental-consent burden for the youngest users at launch (where the complexity-to-user-count ratio is worst).
- Still welcomes the full 13–18 range with appropriate safeguards (see [ADR-0006](0006-parental-consent-micro-charge.md) and [child-safety.md](../policy/child-safety.md)).
- Year-of-birth only (not full DOB) is the minimum data to make this classification — a data-minimisation win.

## Consequences

- The signup form collects year of birth; the server rejects anything implying `age < 13`.
- The derived `isMinor` flag drives safe defaults enumerated in [child-safety.md §3](../policy/child-safety.md).
- Future expansion to an under-13 "kid-friendly puzzle only" surface would be a separate ADR and would require full COPPA-grade verifiable parental consent on a per-account basis.

## Alternatives considered

- **Minimum age 18 (adults only)**. Rejected: closes the door on the family audience the brand is explicitly built for.
- **Minimum age 16**. Rejected: harder to justify versus industry norms; shrinks addressable audience without proportional risk reduction.
- **Minimum age 7 with full COPPA consent for all under-13s**. Rejected for launch: operationally expensive, delays Phase 3 by several weeks. Reconsider as a Phase 9 expansion if demand justifies.

## Related documents

- [ADR-0006 Parental consent via micro-charge](0006-parental-consent-micro-charge.md)
- [content/policy/child-safety.md §2](../policy/child-safety.md)
