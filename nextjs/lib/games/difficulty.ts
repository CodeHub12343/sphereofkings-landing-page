// Shared 1–100 difficulty slider used by both engines.
//
// The three preset buttons (Easy/Medium/Hard) are just labelled points
// on this slider: Easy = 20, Medium = 55, Hard = 90. The slider maps
// to the same TierConfig shape both AIs consume.

export interface TierConfig {
  maxDepth: number;
  noise: number;      // 0..1 — chance of picking a non-best move
  timeBudgetMs: number;
}

export type Difficulty = number; // 1..100

export const PRESETS: Record<"easy" | "medium" | "hard", number> = {
  easy: 20,
  medium: 55,
  hard: 90,
};

export function clampDifficulty(d: number): number {
  if (!Number.isFinite(d)) return PRESETS.medium;
  return Math.max(1, Math.min(100, Math.round(d)));
}

/**
 * Linear interpolation across the slider:
 *   depth:   1 → 2       100 → 6     (so Easy ~2, Medium ~4, Hard ~6)
 *   noise:   1 → 0.50    100 → 0     (easier = more random)
 *   time:    1 → 150ms   100 → 2800ms
 */
export function configFor(difficulty: Difficulty): TierConfig {
  const d = clampDifficulty(difficulty);
  const t = (d - 1) / 99; // 0..1
  const depth = Math.round(2 + t * 4);
  const noise = Math.max(0, 0.5 - t * 0.5);
  const timeBudgetMs = Math.round(150 + t * 2650);
  return { maxDepth: depth, noise, timeBudgetMs };
}

export function labelFor(difficulty: Difficulty): string {
  const d = clampDifficulty(difficulty);
  if (d <= 25) return "Easy";
  if (d <= 60) return "Medium";
  if (d <= 85) return "Hard";
  return "Expert";
}
