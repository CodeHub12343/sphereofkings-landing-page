# Royal Checkers™ — Official Rules

> Status: **owner-approved** (Phase 0 sign-off, 2026-10-19).
> This document is the single source of truth for the Royal Checkers engine. If the engine disagrees with this document, the engine is wrong.

---

## 1. The Board

- **Shape**: 14 columns × 8 rows laid out on a **spherical surface**, implemented as a horizontal cylinder: columns 1 and 14 are adjacent along the long dimension; rows 1 and 8 are **not** adjacent.
- **Squares**: alternating light / dark in the standard checkers pattern. All moves and captures occur on dark squares.
- **Coordinates**: `(col, row)` where `col ∈ 1..14` and `row ∈ 1..8`. Red home row is `row = 1`; Black home row is `row = 8`.

## 2. Pieces

- Each player starts with **28 pieces** (one row of 14 along their home row, one row of 14 along the second row from home — all on dark squares — then adjusted for the alternating square pattern to the standard "three rows" layout extended across the wider 14-column board).
  - **Owner note**: exact per-row placement to match the physical product is pinned below in §12 as "Standard Starting Position".
- **Red** pieces move "up" the board (increasing `row`).
- **Black** pieces move "down" the board (decreasing `row`).
- A piece that reaches its opponent's home row is **crowned a king** and gains backward movement.

## 3. Turn Order

- Red moves first.
- Players alternate turns.
- A turn ends when the moving player has (a) made one simple move, or (b) completed a jump combo.

## 4. Simple Moves

- A piece moves **one diagonal square** toward an unoccupied dark square.
- A king may move diagonally in any of the four diagonal directions.
- A non-king piece may only move in its forward direction (Red up, Black down).

## 5. Captures (Jumps)

- A piece captures by jumping diagonally over an **adjacent opponent piece** and landing on the **vacant dark square immediately beyond it**.
- **Multi-jumps**: if, after a jump, the same piece can perform another jump, the player may continue jumping with that same piece. The combo ends when no further jumps are available OR the player chooses to stop. (See §6 for the seam rule.)
- **Captures are mandatory**: if any jump is available on your turn, you must make a jump. (If multiple jumps are available, you may choose which.)
- Captured pieces are removed at the end of the full combo (not between hops).

## 6. The Seam (Spherical Wrap)

The board's long dimension wraps:

- A piece on `(14, row)` has its diagonal moves to the right side treated as if column 15 were column 1 of the same row.
  - e.g. a Red piece on `(14, 3)` has diagonal moves to `(1, 4)` and (if a king) `(1, 2)`.
- A piece on `(1, row)` has its diagonal moves to the left side treated as if column 0 were column 14 of the same row.
- Rows do **not** wrap. A Red piece on `(c, 8)` has no "upward" diagonal; it is already in Black's home row and is crowned (see §7).

**Multi-jump combos may cross the seam.**

- A combo that jumps from `(13, 3)` over `(14, 4)` landing on `(1, 5)` (wrapping) is legal, and if from `(1, 5)` a further jump exists, it continues.
- The jumped-over piece on the seam column is captured normally.

## 7. Kinging

- A non-king piece that **ends its turn** on the opponent's home row (Red reaching `row = 8`, Black reaching `row = 1`) is crowned a king.
- Kinging ends the turn **unless** the piece has become a king mid-combo and additional jumps as a king are available (this is the owner's choice for Royal Checkers — see Owner Decision Log §12).
- A king is physically represented by **stacking a second disc of the same colour** on top. See §9 and §10 for stack-dependent rules.

## 8. Winning

- A player wins when their opponent **has no legal move** on their turn:
  - All opponent pieces have been captured, OR
  - No opponent piece can move (all blocked).
- A player may also **resign**, which is a loss for the resigning player.

## 9. Draws

- **40-move rule**: if no capture has been made and no non-king piece has been moved in the last 40 plies by both players combined, either player may claim a draw.
- **Threefold repetition**: if the same position (same pieces on same squares, same side to move) occurs three times, either player may claim a draw.
- **Insufficient material**: if neither player can force a win (e.g. one king vs. one king on an open board after 10 further moves), the game is a draw.

## 10. Variation — Stacked King Returns Home

(Approved; previously added to the Hero's How to Play page.)

- A player's king that has been **stacked** (crowned) may travel all the way back to its own home row.
- When a stacked king **ends its turn** on its own home row, the owner has the **option** (not obligation) to **split the stack into two separate kings**:
  - The original stacked king remains at its landing square as a single king.
  - A new single king is placed on any unoccupied dark square of the home row.
- The split option expires at the end of the turn — a king that passes through the home row without declaring the split loses the opportunity (though it may return again later).
- A split action does **not** itself grant another move; the next player moves.

## 11. Variation — Kings Face Off

(Approved game-type variation.)

- Game type selected at match start, before the first move.
- **All pieces begin as kings and are double-stacked** (i.e. each starting piece counts as a king and may move in all four diagonal directions from move one).
- Standard capture, winning, drawing, and seam rules apply.
- The "Stacked king returns home" variation (§10) is **not** available in Kings Face Off (every piece is already stacked at start).

## 12. Owner Decision Log

| Date | Decision | Approved by |
|---|---|---|
| 2026-10-19 | Seam = horizontal cylinder; same-row wrap; jumps may cross seam | James Scott Bowser |
| 2026-10-19 | Mid-combo kinging **does not** permit the newly-crowned king to continue jumping on the same turn | James Scott Bowser |
| 2026-10-19 | Standard Starting Position for the 14 × 8 board: three rows of 14 pieces per player on dark squares, starting from each home row | James Scott Bowser |
| 2026-10-19 | 40-move draw rule and threefold repetition rule as above | James Scott Bowser |

If a rule needs to change, add a new row with the new decision, superseding the earlier one. Do not edit historical rows.

## 13. Open Items

None at Phase 0 sign-off. Any new ambiguity discovered during engine implementation goes into §12 as a new row; the engine stops advancing against this file until a row is signed.
