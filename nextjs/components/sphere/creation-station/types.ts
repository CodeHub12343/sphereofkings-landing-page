// Shared types used across the Creation Station UI. These mirror the
// server-side Creation / CreationConfig shapes but stay client-safe
// (no mongo / server-only imports).

export type Category =
  | "exterior" | "lid" | "base" | "board"
  | "checkers" | "imperial" | "puzzle"
  | "personalization" | "accessories" | "packaging";

export type Finish = "matte" | "glossy" | "metallic" | "glow" | "translucent";

export interface CheckerConfig {
  topColor: string;
  bottomColor: string;
  crown: boolean;
  crownColor: string;
  symbol: string;
  engraving: string;
}

export interface Personalization {
  name: string; date: string; message: string; verse: string;
}

export interface CreationConfig {
  palette: string[];
  finish: Finish;
  checker: CheckerConfig;
  personal: Personalization;
  categories: Record<string, { palette?: string[]; assetId?: string; text?: string; notes?: string }>;
  mechanics: { magneticStacking: boolean; reinforcedLid: boolean; internalStorage: boolean };
  rightsConfirmed: boolean;
  quantity: number;
  giftMessage?: string;
  memorial?: boolean;
}

export interface Feasibility {
  score: number;
  level: "ok" | "review" | "blocked";
  notes: string[];
}

export interface PricingLine {
  label: string; quantity: number; unitCents: number;
  printMinutes: number; material: string; colors: string[];
}

export interface Pricing {
  lines: PricingLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  royaltyCents: number;
  totalCents: number;
  printMinutes: number;
  estimateNotes: string[];
}

export interface Creation {
  id: string;
  title: string;
  grid: string[][];
  config: CreationConfig;
  status: string;
  isPublic: boolean;
  marketplaceVotes: number;
  marketplaceDownloads: number;
  royaltyBps: number;
  tags: string[];
  moderationState: "clear" | "flagged" | "blocked";
  ipFlags?: string[];
  previewDataUrl?: string;
  previewBlobKey?: string;
  updatedAt: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Version {
  v: number;
  grid: string[][];
  config: CreationConfig;
  snapshotAt: string;
  reason?: string;
}

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "exterior", label: "Sphere exterior", blurb: "Paint the 14×8 play surface." },
  { id: "lid", label: "Sphere lid", blurb: "Top artwork, engraving, logos." },
  { id: "base", label: "Base & stand", blurb: "Stand color and engraving." },
  { id: "board", label: "Game board", blurb: "Tile colors, borders, overlays." },
  { id: "checkers", label: "Double-stack checkers", blurb: "Top + bottom pieces, crowns." },
  { id: "imperial", label: "Imperial Kings", blurb: "Royal symbols and themed pieces." },
  { id: "puzzle", label: "Puzzle system", blurb: "Photo puzzles and AI artwork." },
  { id: "personalization", label: "Personalization", blurb: "Names, dates, verses." },
  { id: "accessories", label: "Accessories", blurb: "Stand, case, replacements." },
  { id: "packaging", label: "Packaging", blurb: "Gift message and presentation." },
];

export const DEFAULT_PALETTE: string[] = [
  "#D4AF37", "#191919", "#FFFFFF", "#D32F2F", "#1565C0",
  "#2E7D32", "#8E24AA", "#FF8F00", "#00ACC1",
];

export const FINISHES: Finish[] = ["matte", "glossy", "metallic", "glow", "translucent"];

export function defaultConfig(): CreationConfig {
  return {
    palette: DEFAULT_PALETTE,
    finish: "matte",
    checker: {
      topColor: DEFAULT_PALETTE[0], bottomColor: DEFAULT_PALETTE[1],
      crown: true, crownColor: DEFAULT_PALETTE[0],
      symbol: "", engraving: "",
    },
    personal: { name: "", date: "", message: "", verse: "" },
    categories: {},
    mechanics: { magneticStacking: true, reinforcedLid: true, internalStorage: true },
    rightsConfirmed: false,
    quantity: 1,
  };
}
