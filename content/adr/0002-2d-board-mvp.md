# ADR-0002 — 2D Projected Board for MVP, 3D Deferred

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D5 |

## Context

The spherical board can be rendered in-browser as either:
- A true 3D object via WebGL (`three.js` + `react-three-fiber`), with the player rotating / orbiting a textured sphere.
- A 2D projection — a flat 14 × 8 grid with an explicit seam indicator between columns 14 and 1.

Both are capable of expressing every rule in [ADR-0001](0001-seam-adjacency-rules.md). The choice is about **time-to-market and device reach**, not game correctness.

## Decision

**MVP (Phases 1 + 2) uses a 2D projected board.** 3D rendering is deferred to Phase 7 and bundled with the sphere-painting / customization feature where 3D delivers direct user value.

## Rationale

- Building a correct 2D board takes approximately **1 week**; building a correct 3D board that is accessible, responsive, mobile-performant and keyboard-navigable takes **4–6 weeks**.
- 3D adds roughly 300KB to the initial JS bundle (three.js) which hurts time-to-interactive on mobile.
- Our target audience includes low-end Android devices (parents of kids). WebGL fallback paths are complicated.
- Every downstream feature — rules, AI, multiplayer, rankings, tournaments, replays — is **independent of rendering**. Shipping 2D first lets us prove each in sequence without the 3D learning curve blocking any of them.
- 3D will land when the sphere-painting feature makes it a user-visible win (previewing a painted design on a rotating 3D sphere is a far better experience than a flat image).

## Consequences

- The 2D board uses an SVG or CSS-grid implementation, both of which are testable without a browser.
- Seam communication becomes a design task: a gold vertical rule between columns 14 and 1, plus a subtle "wraps" indicator that fades in on hover / move preview.
- Phase 7 adds `three.js` + `@react-three/fiber` and a toggle "View in 3D" on the game surfaces that already shipped in 2D. The engine does not change.
- Marketing images continue to use the existing hero-shot product renders where a 3D feel is already present.

## Alternatives considered

- **A — 3D from day one**. Rejected: delays MVP by ~5 weeks, blocks every downstream phase, and solves a problem that users will not notice during a single-player Royal Checkers match.
- **B — 2D forever**. Rejected: sphere-painting is a legitimate 3D-worthy feature and would be a disappointment flat.

## Related documents

- Roadmap §7 (Digital Game Engine)
- Roadmap §18 (Phase 7 Customization and Recorded Games)
