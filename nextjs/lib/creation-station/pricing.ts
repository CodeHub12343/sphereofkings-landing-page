// Deterministic rules-based pricing for a Creation Station design.
// Numbers are placeholders calibrated against the existing $149 custom
// sphere SKU; swap in a real cost model when the Python manufacturing
// service is online.

import type { CreationConfig } from "@/lib/db/collections/creation-designs";
import type { CreationOrderLine } from "@/lib/db/collections/creation-orders";

const BASE_SPHERE_CENTS = 9900;
const BASE_SPHERE_MINUTES = 420;

const CHECKER_SET_CENTS = 2900;
const CHECKER_SET_MINUTES = 90;

const IMPERIAL_KINGS_CENTS = 3900;
const IMPERIAL_KINGS_MINUTES = 110;

const FINISH_MULTIPLIER: Record<CreationConfig["finish"], number> = {
  matte: 1.0,
  glossy: 1.08,
  metallic: 1.25,
  glow: 1.30,
  translucent: 1.18,
};

const PER_EXTRA_COLOR_CENTS = 400; // over the included 3
const PER_EXTRA_COLOR_MINUTES = 12;

const ENGRAVE_CENTS_PER_CHAR = 40;
const ENGRAVE_MINUTES_PER_10_CHARS = 2;

const SHIPPING_CENTS_DOMESTIC = 1200;
const SHIPPING_CENTS_INTL = 3500;
const TAX_RATE_FALLBACK = 0.07;

export interface PricingResult {
  lines: CreationOrderLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  royaltyCents: number;
  totalCents: number;
  printMinutes: number;
  estimateNotes: string[];
}

export function priceCreation(
  grid: string[][],
  config: CreationConfig,
  opts?: {
    quantity?: number;
    country?: string;        // ISO alpha-2
    royaltyBps?: number;     // 0..5000
  },
): PricingResult {
  const quantity = Math.max(1, Math.min(500, opts?.quantity ?? config.quantity ?? 1));
  const notes: string[] = [];

  // Count distinct exterior colors actually used.
  const exteriorColors = new Set(grid.flat().filter((c) => c));
  const extraColors = Math.max(0, exteriorColors.size - 3);

  const finishMult = FINISH_MULTIPLIER[config.finish] ?? 1.0;
  if (finishMult > 1) notes.push(`${config.finish} finish adds ${Math.round((finishMult - 1) * 100)}%`);

  // Board / sphere line
  const boardUnit = Math.round(
    (BASE_SPHERE_CENTS + extraColors * PER_EXTRA_COLOR_CENTS) * finishMult,
  );
  const boardMinutes = BASE_SPHERE_MINUTES + extraColors * PER_EXTRA_COLOR_MINUTES;
  const sphereColors = Array.from(exteriorColors).slice(0, 9);
  if (extraColors > 0) notes.push(`${exteriorColors.size} exterior colors (+${extraColors} beyond baseline)`);

  // Double-stack checker set (always included — it's core gameplay)
  const checkerUnit = Math.round(CHECKER_SET_CENTS * finishMult);
  const checkerEngraveChars = (config.checker.engraving ?? "").length;
  const checkerEngrave = checkerEngraveChars * ENGRAVE_CENTS_PER_CHAR;
  if (checkerEngraveChars) notes.push(`Checker engraving: ${checkerEngraveChars} chars`);

  // Imperial Kings pieces
  const imperialUnit = Math.round(IMPERIAL_KINGS_CENTS * finishMult);

  // Personalization engraving on the board
  const personalChars =
    (config.personal.name?.length ?? 0) +
    (config.personal.verse?.length ?? 0) +
    (config.personal.message?.length ?? 0);
  const personalEngrave = personalChars * ENGRAVE_CENTS_PER_CHAR;
  if (personalChars) notes.push(`Personalization: ${personalChars} chars engraved`);

  const lines: CreationOrderLine[] = [
    {
      label: "Sphere board (9-color system)",
      quantity, unitCents: boardUnit + personalEngrave,
      printMinutes: boardMinutes + Math.ceil(personalChars / 10) * ENGRAVE_MINUTES_PER_10_CHARS,
      material: config.finish,
      colors: sphereColors,
    },
    {
      label: "Double-stack checker set",
      quantity, unitCents: checkerUnit + checkerEngrave,
      printMinutes: CHECKER_SET_MINUTES + Math.ceil(checkerEngraveChars / 10) * ENGRAVE_MINUTES_PER_10_CHARS,
      material: config.finish,
      colors: [config.checker.topColor, config.checker.bottomColor, ...(config.checker.crown ? [config.checker.crownColor] : [])],
    },
    {
      label: "Imperial Kings pieces",
      quantity, unitCents: imperialUnit,
      printMinutes: IMPERIAL_KINGS_MINUTES,
      material: config.finish,
      colors: sphereColors.slice(0, 2),
    },
  ];

  const subtotalCents = lines.reduce((s, l) => s + l.unitCents * l.quantity, 0);
  const printMinutes = lines.reduce((s, l) => s + l.printMinutes * l.quantity, 0);

  const country = (opts?.country ?? "US").toUpperCase();
  const shippingCents = country === "US" ? SHIPPING_CENTS_DOMESTIC : SHIPPING_CENTS_INTL;

  const taxCents = Math.round(subtotalCents * TAX_RATE_FALLBACK);
  const royaltyBps = Math.max(0, Math.min(5000, opts?.royaltyBps ?? 0));
  const royaltyCents = Math.round(subtotalCents * royaltyBps / 10_000);
  const totalCents = subtotalCents + shippingCents + taxCents;

  if (quantity >= 10) notes.push(`Bulk order: ${quantity} units`);

  return { lines, subtotalCents, shippingCents, taxCents, royaltyCents, totalCents, printMinutes, estimateNotes: notes };
}

export function fmtMoney(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() })
    .format(cents / 100);
}

export function fmtPrintTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
