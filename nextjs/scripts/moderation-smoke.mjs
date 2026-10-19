#!/usr/bin/env node
// Smoke test: moderateText blocks the obvious bad cases offline (no
// Perspective key needed in CI) and lets clean messages through.

const m = await import("../lib/moderation.ts");

const cases = [
  { body: "Good game, well played!", want: "clean" },
  { body: "", want: "blocked" },
  { body: "a".repeat(2500), want: "blocked" },
  { body: "my number is 555-123-4567", want: "blocked" },
  { body: "contact me at foo@bar.com", want: "blocked" },
  { body: "you are such an idiot", want: "flagged" },
];
let fail = 0;
for (const c of cases) {
  const v = await m.moderateText(c.body);
  const ok = v.status === c.want;
  console.log(ok ? "✓" : "✗", `want=${c.want} got=${v.status}`, `"${c.body.slice(0, 40)}"`);
  if (!ok) fail++;
}
process.exit(fail === 0 ? 0 : 1);
