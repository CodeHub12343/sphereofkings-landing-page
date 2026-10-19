# Brand Palette Extension — Game Surfaces

> Status: **owner-approved** (Phase 0 sign-off, 2026-10-19).
> This document extends the existing commerce palette (in [`nextjs/lib/GlobalStyle.tsx`](../../nextjs/lib/GlobalStyle.tsx) and [`nextjs/lib/theme.ts`](../../nextjs/lib/theme.ts)) with the additional colours, roles, and surfaces required by the game, ranking, tournament, and real-time multiplayer features.

---

## 1. Existing commerce palette (unchanged)

| Token | Hex | Purpose |
|---|---|---|
| `--gold` | `#c9a227` | Primary brand accent (buttons, borders, eyebrows) |
| `--gold-light` | `#f0c040` | Hover + highlight gold |
| `--text` | `#f5f0e8` | Primary body text on dark backgrounds |
| `--text-muted` | `#a89880` | Secondary body text |
| `--bg` | `#0a0a0a` | Page background |
| `--bg2` | `#0d0b08` | Elevated panel background |
| `--bg3` | `#111009` | Secondary elevated panel |
| `--border` | `#2a2218` | Divider colour |

All existing values stay. The game surfaces use them as the default.

---

## 2. New game-surface tokens

| Token | Hex | Purpose |
|---|---|---|
| `--board-light` | `#f3e1a7` | Light board square (parchment gold) |
| `--board-dark` | `#2b2210` | Dark board square (deep umber) |
| `--board-seam` | `#f0c040` | Vertical seam line between columns 14 and 1 |
| `--board-highlight` | `rgba(240, 192, 64, 0.35)` | Selected square outline |
| `--board-legal-move` | `rgba(79, 176, 125, 0.28)` | "You can move here" dot |
| `--board-capture-move` | `rgba(198, 43, 68, 0.32)` | "You can capture here" dot |
| `--piece-red` | `#c62b44` | Royal Checkers red piece body |
| `--piece-red-stroke` | `#8a1420` | Red piece bevel / outline |
| `--piece-black` | `#1a1510` | Royal Checkers black piece body |
| `--piece-black-stroke` | `#000` | Black piece bevel / outline |
| `--piece-white` | `#f5efd8` | Imperial Kings white piece |
| `--piece-white-stroke` | `#b8901e` | White piece bevel / outline |
| `--king-crown` | `#f0c040` | King crown accent on stacked pieces |

---

## 3. Status + feedback tokens

| Token | Hex | Purpose |
|---|---|---|
| `--status-online` | `#4fb07d` | Player presence dot, "connected" states |
| `--status-waiting` | `#e0a94a` | "Waiting for opponent" states |
| `--status-offline` | `#5a4a38` | Offline / disconnected states |
| `--status-urgent` | `#ff6b7a` | Match disconnection alert, forfeit countdown |
| `--rank-starter` | `#a89880` | Starter tier chip |
| `--rank-silver` | `#c0c0c0` | Silver tier chip |
| `--rank-gold` | `#f0c040` | Gold tier chip |
| `--rank-royal` | `#7fa3ff` | Royal tier chip |
| `--rank-imperial` | `#c62b44` | Imperial tier chip |
| `--rank-sovereign` | `#9b7cff` | Sovereign tier chip |

---

## 4. Child-safety indicators

| Token | Hex | Purpose |
|---|---|---|
| `--minor-badge` | `#4c7ce0` | Visible "age-restricted" chip on surfaces that would otherwise be adults-only (e.g. the public leaderboard where a minor's rating is hidden). Blue is deliberately **not red/warning**; this is not a shame indicator, it is a privacy indicator. |
| `--consent-pending` | `#e0a94a` | Minor accounts awaiting parental consent (visible only to admin and the minor themselves). |

---

## 5. Game-specific accents (per mode)

| Mode | Accent | Hex |
|---|---|---|
| Royal Checkers | Royal (blue) | `#4c7ce0` |
| Imperial Kings | Crimson | `#c62b44` |
| Spherical Puzzle | Gold | `#c9a227` |
| DIY Paintable | Gold | `#c9a227` |
| Custom Sphere Upload | Gold | `#c9a227` |
| Expanded Challenges | Royal | `#4c7ce0` |
| Creator's Edition | Crimson | `#c62b44` |

Already used in [`nextjs/components/howtoplay/HowToPlay.tsx`](../../nextjs/components/howtoplay/HowToPlay.tsx). Game surfaces inherit the same accent per mode for consistency.

---

## 6. Accessibility

- Every colour pair used for text + background must meet **WCAG 2.1 AA contrast** (4.5:1 for body text, 3:1 for large text).
- Status colours are always paired with an **icon or label**, never used as the sole conveyor of state (red-green blindness is common; "that red dot means forfeit" alone is not acceptable).
- Board move-highlights use a shape (dot or ring) in addition to colour.

---

## 7. Dark theme is default

The commerce site is dark-themed by design. The game surfaces inherit this. A light-theme variant is **not planned** for launch and is a Phase 9+ nice-to-have.

---

## 8. Change log

| Date | Change | Approved by |
|---|---|---|
| 2026-10-19 | Initial palette extension for game surfaces | James Scott Bowser |

Updates require a new row above with the reason for the change.
