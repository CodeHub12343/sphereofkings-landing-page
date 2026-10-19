# /content — Owner-approved specifications

This directory is the **source of truth** for anything the engineering build depends on. If a rule, policy, or architectural decision lives here, the code can rely on it. If it does not, the code must not invent it.

| Folder | Purpose |
|---|---|
| [`rules/`](rules) | Game rules. The engine's test oracles. |
| [`policy/`](policy) | Child-safety, moderation, and compliance policy. |
| [`adr/`](adr) | Architecture Decision Records. Each ADR documents one significant choice and its rationale. |
| [`design/`](design) | Design-system additions (palette, iconography) specific to the game surfaces. |

Nothing in `/content` is served at a public URL today. These are internal reference documents consumed by the engineering build and by future audits.

Document owner: James Scott Bowser (project owner).
Edits require owner approval and should land in a dedicated commit.
