// A/B experiment assignment. Deterministic hash of (experimentId + unit),
// so a given user/session always lands in the same variant.
//
// Experiments are declared in-code (not DB-driven at launch — admin UI
// at /admin/experiments can edit the active list). Each has:
//   id            — kebab-case
//   variants      — array of {name, weight}
//   defaultVariant — if the experiment is paused
//
// Call `pickVariant(exp, unit)` on server or client with a stable unit
// (playerId when signed in, anonymousSessionId otherwise).

export interface Experiment {
  id: string;
  description: string;
  active: boolean;
  defaultVariant: string;
  variants: Array<{ name: string; weight: number }>;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "home-hero-copy-v1",
    description: "Alternate hero headline — 'Seven games, one sphere' vs 'A board that wraps'.",
    active: true,
    defaultVariant: "control",
    variants: [
      { name: "control", weight: 50 },
      { name: "wraps",   weight: 50 },
    ],
  },
  {
    id: "signup-cta-color",
    description: "Signup button gold vs royal blue.",
    active: false,
    defaultVariant: "gold",
    variants: [
      { name: "gold", weight: 50 },
      { name: "royal", weight: 50 },
    ],
  },
];

/** Simple FNV-1a 32-bit hash. Stable across runtimes. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

export function getExperiment(id: string): Experiment | null {
  return EXPERIMENTS.find((e) => e.id === id) ?? null;
}

export function pickVariant(expId: string, unit: string): string {
  const exp = getExperiment(expId);
  if (!exp) return "control";
  if (!exp.active) return exp.defaultVariant;
  const total = exp.variants.reduce((s, v) => s + v.weight, 0);
  if (total <= 0) return exp.defaultVariant;
  const h = hash32(`${expId}|${unit}`) % total;
  let cursor = 0;
  for (const v of exp.variants) {
    cursor += v.weight;
    if (h < cursor) return v.name;
  }
  return exp.defaultVariant;
}
