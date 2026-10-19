#!/usr/bin/env node
// Smoke test grid validation.

const sd = await import("../lib/sphere-grid.ts");

const good = sd.emptyGrid();
good[0][0] = "#c9a227";
good[7][13] = "#f0c040";
console.log("empty-grid dims:", good.length, "x", good[0].length);
const normalized = sd.validateGrid(good);
console.log("validate OK:", normalized[0][0], normalized[7][13]);

const cases = [
  [[], "wrong row count"],
  [new Array(8).fill([]), "wrong col count"],
  [sd.emptyGrid().map((r) => r.map(() => "notahex")), "hex regex rejects"],
  [sd.emptyGrid().map((r, i) => i === 0 ? r.map(() => "#abc") : r), "short hex ok"],
];
let fail = 0;
for (const [grid, label] of cases) {
  try { sd.validateGrid(grid); console.log("accepted:", label); }
  catch (err) { console.log("rejected:", label, "(" + err.message + ")"); }
}
process.exit(fail);
