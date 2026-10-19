# ADR-0001 — Seam Adjacency Rules for the 14 × 8 Spherical Board

| Field | Value |
|---|---|
| Status | **Accepted** |
| Date | 2026-10-19 |
| Decision owner | James Scott Bowser |
| Addresses roadmap decision | D1 |

## Context

The physical Sphere of Kings board wraps 14 columns around a sphere. Translating this to a validated game-engine required explicit choices about how pieces move when they cross the "seam" where column 14 meets column 1.

## Decision

Treat the board as a **horizontal cylinder, not a true topological sphere**:

- **Columns wrap**: column 1 is adjacent to column 14 in the same row.
- **Rows do not wrap**: row 1 and row 8 are the physical ends of the board.
- **Multi-jump combos may cross the seam.** A capture-combo that would end on column 14 and continue on column 1 is legal in Royal Checkers.
- **Rooks and Queens** in Imperial Kings may slide across the seam on their horizontal line. The line stops when it hits an occupied square or completes a full loop (ending one square before its origin).
- **Castling** in Imperial Kings does **not** wrap. Standard non-wrapping castling only at launch.

## Rationale

- A horizontal-cylinder model preserves the "which row am I on" cognitive load of checkers / chess while still giving the sphere its strategic character.
- A true topological-sphere model (rows wrap too) would make kinging incoherent and dramatically change promotion rules — neither game is being redesigned.
- Allowing combos to cross the seam is what makes the wrap matter strategically rather than being purely cosmetic.
- Rook / Queen seam wrapping gives Imperial Kings its distinctive tactical identity vs. standard chess.

## Consequences

- Engine `legalMoves` must evaluate four diagonal moves per non-king (and eight per king / each sliding piece's direction set) with modular arithmetic on `col`.
- Rendering must indicate the seam clearly to a player (vertical gold line between columns 14 and 1, with "wraps around" hint on hover).
- The test oracle expands: every rule must be tested with at least one through-the-seam case.

## Alternatives considered

- **A — True sphere topology** (both axes wrap). Rejected: breaks kinging, pawn promotion, and the mental model of "my side of the board."
- **B — Seam-stopping jumps** (combos end at column 14 / 1). Rejected: makes the wrap feel like a bug rather than a feature.
- **C — Seam wrapping with diagonal shift** (row changes by 1 when crossing). Rejected: mathematically interesting but makes the game hard to teach.

## Related documents

- [content/rules/royal-checkers.md §6](../rules/royal-checkers.md)
- [content/rules/imperial-kings.md §11](../rules/imperial-kings.md)
