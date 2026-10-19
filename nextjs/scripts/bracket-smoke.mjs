#!/usr/bin/env node
// Bracket smoke test: build a 16-seed single-elim, simulate a full
// run where the top seed always wins, confirm the champion is seed 1,
// then simulate a chaos upset path and confirm advancement is still
// consistent.

const b = await import("../lib/tournaments/bracket.ts");

function mkEntries(n) {
  return Array.from({ length: n }, (_, i) => ({
    seed: i + 1, playerId: `p${i + 1}`,
    username: `u${i + 1}`, displayName: `Player ${i + 1}`,
  }));
}

// 16-player: top seed wins every round.
{
  let bracket = b.buildInitial(16, mkEntries(16));
  while (true) {
    const ready = b.readyToSchedule(bracket).filter((n) => !n.winner);
    if (ready.length === 0) break;
    for (const node of ready) {
      const aSeed = node.a?.seed ?? 99;
      const bSeed = node.b?.seed ?? 99;
      const winnerKey = aSeed < bSeed ? "a" : "b";
      bracket = b.advance(bracket, node.roundIdx, node.idxInRound, winnerKey);
    }
  }
  const champ = b.champion(bracket);
  console.log("16-player top-seed path champion:", champ?.seed, champ?.displayName);
  if (champ?.seed !== 1) { console.error("FAIL: expected seed 1"); process.exit(1); }
}

// 8-player: lowest seed wins every match (chaos). Champion should be seed 8.
{
  let bracket = b.buildInitial(8, mkEntries(8));
  while (true) {
    const ready = b.readyToSchedule(bracket).filter((n) => !n.winner);
    if (ready.length === 0) break;
    for (const node of ready) {
      const aSeed = node.a?.seed ?? 0;
      const bSeed = node.b?.seed ?? 0;
      const winnerKey = aSeed > bSeed ? "a" : "b";
      bracket = b.advance(bracket, node.roundIdx, node.idxInRound, winnerKey);
    }
  }
  const champ = b.champion(bracket);
  console.log("8-player chaos champion seed:", champ?.seed);
  if (champ?.seed !== 8) { console.error("FAIL: expected seed 8"); process.exit(1); }
}

console.log("bracket smoke OK");
