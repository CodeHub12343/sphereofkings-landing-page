#!/usr/bin/env node
const eng = await import("../lib/games/royal-checkers/engine.ts");
const ai = await import("../lib/games/royal-checkers/ai.ts");

let s = eng.initial();
let red = 0, black = 0;
for (const row of s.board) for (const p of row) {
  if (!p) continue;
  if (p.color === "red") red++; else black++;
}
console.log("initial red=", red, "black=", black, "(expect 21/21)");
console.log("opening moves:", eng.legalMoves(s).length);

for (let i = 0; i < 40; i++) {
  const m = ai.chooseMove(s, "easy");
  if (!m) break;
  s = eng.apply(s, m);
  const o = eng.outcome(s);
  if (o.kind !== "ongoing") { console.log("ended at ply", i, o); break; }
}
console.log("plies played OK");
const enc = eng.encode(s);
const dec = eng.decode(enc);
console.log("round-trip:", eng.encode(dec) === enc ? "OK" : "FAIL");
