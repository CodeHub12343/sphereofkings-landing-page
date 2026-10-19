#!/usr/bin/env node
// Smoke tests for the pure Phase 9 primitives.

const exp = await import("../lib/experiments.ts");

// A/B assignment is deterministic.
const unit = "player-abc-123";
const a = exp.pickVariant("home-hero-copy-v1", unit);
const b = exp.pickVariant("home-hero-copy-v1", unit);
if (a !== b) { console.error("FAIL: non-deterministic", a, b); process.exit(1); }
console.log("deterministic ✓", a);

// Different units can land in different variants.
const vs = new Set();
for (let i = 0; i < 500; i++) vs.add(exp.pickVariant("home-hero-copy-v1", `u${i}`));
if (vs.size < 2) { console.error("FAIL: single-variant distribution", [...vs]); process.exit(1); }
console.log("variants seen:", [...vs]);

// Paused experiment returns default.
const paused = exp.pickVariant("signup-cta-color", "anyone");
if (paused !== "gold") { console.error("FAIL: paused experiment picked non-default", paused); process.exit(1); }
console.log("paused -> default ✓");

// Unknown experiment returns "control".
const unknown = exp.pickVariant("does-not-exist", "x");
if (unknown !== "control") { console.error("FAIL: unknown fallback", unknown); process.exit(1); }
console.log("unknown -> control ✓");

// Vlog parser (reused) + i18n fallthrough. Note we test i18n via its
// pure translator export (resolveLocale needs Next's headers/cookies).
const i18n = await import("../lib/i18n/dict/en.ts");
if (!i18n.en["nav.play"]) { console.error("FAIL: en missing nav.play"); process.exit(1); }
const es = await import("../lib/i18n/dict/es.ts");
if (!es.es["nav.play"]) { console.error("FAIL: es missing nav.play"); process.exit(1); }
console.log("i18n keys ✓");

console.log("phase 9 smoke OK");
