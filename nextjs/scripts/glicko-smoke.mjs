#!/usr/bin/env node
// Reference test: Glickman's own worked example from the Glicko-2 paper.
//
//   Player: rating 1500, RD 200, volatility 0.06.
//   Three games vs. opponents (1400,30), (1550,100), (1700,300).
//   Scores: 1, 0, 0 (one win, two losses).
//
// Expected after one rating period:
//   rating  ≈ 1464.06
//   RD      ≈ 151.52
//   vol     ≈ 0.05999...
//
// Reference: http://www.glicko.net/glicko/glicko2.pdf (page 2, example).

const g = await import("../lib/games/glicko2.ts");

const player = { rating: 1500, deviation: 200, volatility: 0.06 };
const games = [
  { opponent: { rating: 1400, deviation: 30,  volatility: 0.06 }, score: 1 },
  { opponent: { rating: 1550, deviation: 100, volatility: 0.06 }, score: 0 },
  { opponent: { rating: 1700, deviation: 300, volatility: 0.06 }, score: 0 },
];
const out = g.updateRating(player, games);
const expected = { rating: 1464.06, deviation: 151.52, volatility: 0.05999 };
console.log("Glicko-2 output:", out);
console.log("Expected approx:", expected);
const okR  = Math.abs(out.rating - expected.rating) < 0.5;
const okRD = Math.abs(out.deviation - expected.deviation) < 0.5;
const okV  = Math.abs(out.volatility - expected.volatility) < 0.001;
console.log("rating OK:", okR, "RD OK:", okRD, "vol OK:", okV);
process.exit(okR && okRD && okV ? 0 : 1);
