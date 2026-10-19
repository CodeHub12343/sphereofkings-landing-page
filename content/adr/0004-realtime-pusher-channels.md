# ADR-0004 — Real-Time Layer: Pusher Channels (Managed)

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D4 |

## Context

The MVP (Phases 1 + 2 + account layer of Phase 3) does not need real-time infrastructure. Phase 4 (multiplayer) and Phase 5 (tournaments) do.

Vercel's serverless runtime does not support long-lived WebSocket connections. Introducing real-time therefore means adopting a separate service.

## Decision

**Adopt Pusher Channels as the real-time layer**, beginning when Phase 4 engineering starts.

- Account tier at Phase 4 kick-off: **Startup ($49/mo)**, sufficient for ~100 concurrent connections.
- Upgrade to Pusher Pro ($249/mo) if sustained concurrent connections exceed 500.
- Re-evaluate (self-hosted vs. alternative managed vendor) if monthly cost crosses $1,000.

## Rationale

- **Zero servers to operate.** The project owner is one person; running a Node WebSocket process in production without an SRE is operationally unsafe.
- **Battle-tested presence + authorization hooks** (private + presence channels) match our need for "both players must authenticate to a match channel."
- **Pricing fits the growth curve.** $49/mo is cheap enough that Phase 4 is affordable; $249/mo supports the first 10k monthly actives; renegotiation past 10k is a healthy problem.
- **Alternative managed vendor Ably** is equivalent in capability but slightly pricier and lacks the broader Next.js ecosystem presence.
- **Self-hosted Node WebSocket on Fly.io or Render** is attractive at scale but introduces a second deployment target, a second observability pipeline, and new on-call surface area for one person to maintain.

## Consequences

- Add a Pusher server client to the Next.js API routes that generate authenticated channel grants.
- Add the Pusher JS client to the game surfaces that subscribe to match / tournament / notification channels.
- New environment variables: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`.
- Add Pusher to the health check and the status page planned for Phase 4.
- Introduce an abstraction layer `lib/realtime/*.ts` so the vendor could be swapped later without rewriting match-service code.
- Document reconnection behaviour, member-presence timeouts, and rate limits in the Phase 4 runbook.

## Alternatives considered

- **Ably** — functionally equivalent, slightly higher cost, equivalent SDK quality. Fine Plan B if Pusher raises prices or exits.
- **Self-hosted WebSocket on Fly.io or Render** — cheapest at >10k concurrent connections but operationally expensive. Reconsider after Phase 5 if usage trends justify it.
- **Supabase Realtime** — tempting (Postgres + realtime in one), but we are already on MongoDB. Migrating the primary datastore to adopt a realtime layer is a trade not worth making.
- **AWS AppSync subscriptions** — overkill, AWS lock-in, bigger learning curve.

## Related documents

- Roadmap §10 (Real-Time Multiplayer)
- Roadmap §17 (External Services)
