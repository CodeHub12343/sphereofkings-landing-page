// Glicko-2 rating system (Mark Glickman, 2012).
//
// Reference: http://www.glicko.net/glicko/glicko2.pdf
//
// Values are stored on each (player, game) ranking row:
//   rating     (default 1500)
//   deviation  (default 350)
//   volatility (default 0.06)
//
// After each rated game we call updateRating(player, [opponent]) with
// 1 for a win, 0 for a loss, 0.5 for a draw. Multiple games can be
// batched into a single rating period; for the launch cadence we
// treat each ranked game as its own period.
//
// System constant τ (tau) controls how reactive ratings are to
// upsets. Glickman recommends 0.3–1.2; we pick 0.5 to match most
// chess sites.

const TAU = 0.5;
const SCALE = 173.7178;
const EPSILON = 0.000001;

export interface Rating {
  rating: number;
  deviation: number;
  volatility: number;
}

export const DEFAULT_RATING: Rating = {
  rating: 1500,
  deviation: 350,
  volatility: 0.06,
};

export interface GameResult {
  opponent: Rating;
  score: 0 | 0.5 | 1; // from `player`'s perspective
}

function toInternal(r: Rating): { mu: number; phi: number } {
  return { mu: (r.rating - 1500) / SCALE, phi: r.deviation / SCALE };
}

function fromInternal(mu: number, phi: number, volatility: number): Rating {
  return {
    rating: mu * SCALE + 1500,
    deviation: phi * SCALE,
    volatility,
  };
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function E(mu: number, muJ: number, phiJ: number): number {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

/**
 * Update one player's rating after a rating period of 1+ games.
 * Returns the player's new (rating, deviation, volatility).
 */
export function updateRating(player: Rating, games: GameResult[]): Rating {
  // Step 1 — pure RD inflation for an inactive period.
  if (games.length === 0) {
    const { phi } = toInternal(player);
    const phiNew = Math.sqrt(phi * phi + player.volatility * player.volatility);
    return fromInternal(toInternal(player).mu, phiNew, player.volatility);
  }

  const { mu, phi } = toInternal(player);

  // Step 3 — variance v.
  let vInv = 0;
  for (const g_ of games) {
    const { mu: muJ, phi: phiJ } = toInternal(g_.opponent);
    const gJ = g(phiJ);
    const EJ = E(mu, muJ, phiJ);
    vInv += gJ * gJ * EJ * (1 - EJ);
  }
  const v = 1 / vInv;

  // Step 4 — improvement Δ.
  let delta = 0;
  for (const g_ of games) {
    const { mu: muJ, phi: phiJ } = toInternal(g_.opponent);
    delta += g(phiJ) * (g_.score - E(mu, muJ, phiJ));
  }
  delta *= v;

  // Step 5 — new volatility (iterative).
  const a = Math.log(player.volatility * player.volatility);
  const f = (x: number): number => {
    const ex = Math.exp(x);
    const num = ex * (delta * delta - phi * phi - v - ex);
    const den = 2 * Math.pow(phi * phi + v + ex, 2);
    return num / den - (x - a) / (TAU * TAU);
  };
  let A = a;
  let B: number;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) k++;
    B = a - k * TAU;
  }
  let fA = f(A);
  let fB = f(B);
  while (Math.abs(B - A) > EPSILON) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) { A = B; fA = fB; } else { fA /= 2; }
    B = C; fB = fC;
  }
  const sigmaPrime = Math.exp(A / 2);

  // Step 6 — pre-rating-period deviation.
  const phiStar = Math.sqrt(phi * phi + sigmaPrime * sigmaPrime);

  // Step 7 — new rating & deviation.
  const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  let muPrime = mu;
  for (const g_ of games) {
    const { mu: muJ, phi: phiJ } = toInternal(g_.opponent);
    muPrime += phiPrime * phiPrime * g(phiJ) * (g_.score - E(mu, muJ, phiJ));
  }
  return fromInternal(muPrime, phiPrime, sigmaPrime);
}

/** Round for display: integer rating, integer RD, 4-decimal volatility. */
export function round(r: Rating): Rating {
  return {
    rating: Math.round(r.rating),
    deviation: Math.round(r.deviation),
    volatility: Math.round(r.volatility * 10000) / 10000,
  };
}
