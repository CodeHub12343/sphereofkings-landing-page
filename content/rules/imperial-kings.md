# Imperial Kings™ — Official Rules

> Status: **owner-approved** (Phase 0 sign-off, 2026-10-19).
> This document is the single source of truth for the Imperial Kings engine. If the engine disagrees with this document, the engine is wrong.

---

## 1. The Board

- **Shape**: 14 columns × 8 rows on a spherical surface, implemented as a **horizontal cylinder** (same geometry as Royal Checkers — see [royal-checkers.md §1](royal-checkers.md)).
- **Coordinates**: `(col, row)` where `col ∈ 1..14` and `row ∈ 1..8`. White home row is `row = 1`; Black home row is `row = 8`.
- Rows do **not** wrap. Columns do (column 14 is adjacent to column 1 in the same row).

## 2. Pieces

Each player has standard chess pieces, re-arranged for the 14-column board:

- **2 Kings** — the defining rule of Imperial Kings (see §8).
- **2 Queens**.
- **4 Rooks**.
- **4 Bishops**.
- **4 Knights**.
- **14 Pawns**.

Total: 30 pieces per player, 60 on the board.

## 3. Standard Starting Position

Along each player's home row (White: row 1, Black: row 8), left to right:

```
Rook · Knight · Bishop · Queen · King · Bishop · Knight · Rook · Rook · Knight · Bishop · King · Queen · Bishop   (owner-signed)
                                                       ↑ seam midpoint
```

(Note: this specific per-column arrangement is the approved layout — mirrored by colour.) Along the second row (White: row 2, Black: row 7), 14 pawns.

- **Owner-signed starting diagram** for both colours is pinned at `/content/rules/imperial-kings-start.svg` (to be exported from the owner's design file when ready). Until the SVG exists, the engine renders from the ASCII arrangement above.

## 4. Turn Order

- White moves first.
- Players alternate turns.
- A turn consists of a single piece move (except castling — see §9).

## 5. Movement

Standard chess movement applies to every piece, **with the following spherical adaptations**:

- **Pawn**: moves one square forward (toward opponent's home row); may move two squares from its starting row 2 / row 7. Captures diagonally forward. Promotes on reaching the opponent's home row (see §6).
- **Knight**: standard L-shape. May traverse the seam normally (a knight on `(14, 3)` can reach `(1, 4)`, `(1, 5)`, `(2, 2)`, etc.).
- **Bishop**: unlimited diagonals. May cross the seam. Rows do not wrap, so a bishop's diagonal is bounded by row 1 and row 8.
- **Rook**: unlimited horizontals and verticals. **A horizontal rook may wrap through the seam** — a rook on `(5, 4)` can move to `(14, 4)` moving right (through 6, 7, ..., 14) OR to `(14, 4)` moving left (through 4, 3, 2, 1, 14) — these are two distinct lines of attack. The rook stops as normal when it reaches an occupied square. A rook may NOT wrap all the way around and attack itself (a complete loop ends on the square before its origin).
- **Queen**: combined bishop + rook rules, including seam wrapping on horizontals and diagonals.
- **King**: one square in any of the eight directions. May traverse the seam normally.

## 6. Promotion

- A pawn reaching the opponent's home row (`row = 8` for White, `row = 1` for Black) **must** promote to Queen, Rook, Bishop, or Knight of the same colour. Player's choice at move time.
- Underpromotion to another king is **not** permitted (Imperial Kings has exactly two kings per side at game start; they are not pieces a pawn can become).

## 7. Captures

Standard chess capture: a piece moves to a square occupied by an opponent piece and the opponent piece is removed.

- **En passant**: a pawn that has just moved two squares from its starting row may be captured by an opposing pawn as though it had moved only one square. The capture must be made on the very next ply or the opportunity expires.
- **No two of a player's own pieces may occupy the same square.**

## 8. Winning — The Two-King Rule

**Imperial Kings' defining departure from classical chess**: **both** of a player's kings must be captured to end the match.

- A single king being captured is a legal move; the capturing player's turn ends normally.
- Check and checkmate as concepts do **not** apply. A player may move their king into or through a square attacked by an opponent piece.
- A player wins when their opponent has **no remaining kings on the board**.
- A player may also **resign**, which is a loss for the resigning player.

### Implications

- Pins, forks, discovered checks still exist tactically, but there is no legal obligation to protect a king.
- A player may willingly sacrifice one of their two kings to gain material or position.
- The 50-move / threefold-repetition / insufficient-material draw rules (§10) still apply.

## 9. Castling

- A king (either one) may castle with any rook of the same colour, provided:
  - Neither the king nor that rook has moved previously this game.
  - All squares between them on their shared row are empty.
  - The king does **not** pass through or land on a square attacked by an opponent piece. (Note: unlike classical chess, this restriction applies only to the king's path during the castling move itself — not before or after, since there is no check.)
- The king moves two squares toward the rook, and the rook moves to the square the king passed over.
- Castling across the seam is **not** permitted at Phase 0 (owner decision; see §12). Standard non-wrapping castling only.

## 10. Draws

- **50-move rule**: if no pawn has moved and no capture has been made in the last 50 plies, either player may claim a draw.
- **Threefold repetition**: same position (same pieces on same squares, same side to move) three times → either player may claim a draw.
- **Insufficient material**: if no sequence of legal moves can lead to the capture of all opposing kings (e.g. king vs. king, or king + knight vs. king), the game is a draw.
- **Stalemate** (no legal move available but kings still on the board) is a draw.

## 11. The Seam

Identical to Royal Checkers §6:

- Columns 1 and 14 are adjacent in the same row.
- Rows do not wrap.
- Rooks and Queens may wrap along their horizontal; bishops/queens/kings/knights may traverse the seam as part of their natural movement.

## 12. Owner Decision Log

| Date | Decision | Approved by |
|---|---|---|
| 2026-10-19 | Starting arrangement per §3 (two kings, two queens, four each of rook/bishop/knight, 14 pawns) | James Scott Bowser |
| 2026-10-19 | Two kings must be captured; check / checkmate do not apply | James Scott Bowser |
| 2026-10-19 | Rook / Queen may wrap horizontally through the seam | James Scott Bowser |
| 2026-10-19 | Pawns promote to Q/R/B/N only; not to a King | James Scott Bowser |
| 2026-10-19 | Castling does NOT wrap across the seam at launch | James Scott Bowser |
| 2026-10-19 | 50-move / threefold / stalemate / insufficient-material = draw | James Scott Bowser |

## 13. Open Items

- Final decorative starting-position SVG (`imperial-kings-start.svg`) to be delivered. Does not block engine development; the engine uses the ASCII arrangement in §3 until the SVG lands.
