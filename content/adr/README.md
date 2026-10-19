# Architecture Decision Records

Each ADR captures one significant decision — the context, the options considered, the chosen path, and the consequences.

| # | Title | Status |
|---|---|---|
| [0001](0001-seam-adjacency-rules.md) | Seam Adjacency Rules for the 14 × 8 Spherical Board | Accepted |
| [0002](0002-2d-board-mvp.md) | 2D Projected Board for MVP, 3D Deferred | Accepted |
| [0003](0003-tournaments-free-only.md) | Tournaments Launch as Free Entry; Paid Competition Deferred | Accepted |
| [0004](0004-realtime-pusher-channels.md) | Real-Time Layer: Pusher Channels (Managed) | Accepted |
| [0005](0005-minimum-age-13.md) | Minimum Account Age: 13 (self-attested) | Accepted |
| [0006](0006-parental-consent-micro-charge.md) | Parental Consent via Refunded Credit-Card Micro-Charge | Accepted |

## Writing a new ADR

- Use the next sequential number (`0007-…`).
- One decision per record.
- Prefer "Accepted" / "Superseded" / "Rejected" as statuses; avoid "Proposed" sitting in the repo forever.
- When one ADR supersedes another, mark the superseded ADR's status accordingly and link to the new one.
- Keep the file short enough to re-read in five minutes.
