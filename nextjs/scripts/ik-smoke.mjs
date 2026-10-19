#!/usr/bin/env node
const eng = await import("../lib/games/imperial-kings/engine.ts");
const ai = await import("../lib/games/imperial-kings/ai.ts");

let s = eng.initial();
let whiteN = 0, blackN = 0, wKings = 0, bKings = 0;
for (const row of s.board) for (const p of row) {
  if (!p) continue;
  if (p.color === "white") { whiteN++; if (p.kind === "king") wKings++; }
  else { blackN++; if (p.kind === "king") bKings++; }
}
console.log(`setup: white=${whiteN} (K=${wKings}) black=${blackN} (K=${bKings}) [expect 30/30 K=2/2]`);
console.log("opening moves:", eng.legalMoves(s).length);

for (let i = 0; i < 20; i++) {
  const m = ai.chooseMove(s, 20);
  if (!m) { console.log("no move at ply", i); break; }
  s = eng.apply(s, m);
  const o = eng.outcome(s);
  if (o.kind !== "ongoing") { console.log("ended at ply", i, o); break; }
}
console.log("ok");
const enc = eng.encode(s);
console.log("round-trip:", eng.encode(eng.decode(enc)) === enc ? "OK" : "FAIL");
