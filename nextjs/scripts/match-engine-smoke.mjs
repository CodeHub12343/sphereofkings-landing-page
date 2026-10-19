#!/usr/bin/env node
// Smoke test for server-authoritative move pipeline.
// We run the match-engine applyServerMove through 20 plies on both
// games to confirm JSON round-tripping of Move + legal-move matching.

const me = await import("../lib/realtime/match-engine.ts");
const rc = await import("../lib/games/royal-checkers/engine.ts");
const ik = await import("../lib/games/imperial-kings/engine.ts");

function playOne(game, decode, legalMoves) {
  let state = me.initialState(game);
  for (let i = 0; i < 20; i++) {
    const parsed = decode(state);
    const moves = legalMoves(parsed);
    if (moves.length === 0) { console.log(game, "no moves at ply", i); break; }
    const move = moves[Math.floor(Math.random() * moves.length)];
    const outcome = me.applyServerMove(game, state, JSON.stringify(move));
    state = outcome.state;
    if (outcome.finished) { console.log(game, "finished at ply", i, outcome); break; }
  }
  console.log(game, "20 plies OK");
}

playOne("royal-checkers", rc.decode, rc.legalMoves);
playOne("imperial-kings", ik.decode, ik.legalMoves);

// Illegal-move rejection.
let state = me.initialState("royal-checkers");
try {
  me.applyServerMove("royal-checkers", state, JSON.stringify({
    from: { col: 1, row: 1 }, path: [{ col: 1, row: 1 }, { col: 2, row: 4 }], captured: [], crowned: false,
  }));
  console.log("FAIL: accepted illegal move");
  process.exit(1);
} catch (err) {
  console.log("illegal move rejected OK:", err.message);
}
