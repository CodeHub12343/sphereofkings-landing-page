// Sphere of Kings 3D-print filament catalog (owner-signed 2026-10-20).
//
// Standard tier (20): the shop's default customer-selectable set.
// Specialty tier: premium finishes offered as an upgrade — rendered
// in their own expand section on the picker so the common path stays
// uncluttered. Specialty picks can carry a surcharge at checkout later
// (surchargeCents starts at 0 and admin can edit per-color).
//
// Each color has:
//   • id — stable slug stored on the order
//   • name — shown to buyers
//   • hex — swatch background
//   • gradient (optional) — rendered for rainbow / silk / galaxy swatches
//   • tier — "standard" | "specialty"
//   • surchargeCents — 0 by default
//   • note — a short note shown when the color is selected
//     (e.g. "specialty finish, 2 week lead time")

export type ColorTier = "standard" | "specialty";

export interface FilamentColor {
  id: string;
  name: string;
  hex: string;
  gradient?: string;
  tier: ColorTier;
  surchargeCents: number;
  note?: string;
}

/* The 20 owner-recommended standard colors, in brand-first order. */
export const STANDARD_COLORS: FilamentColor[] = [
  { id: "royal-red",       name: "Royal Red",        hex: "#C62B44", tier: "standard", surchargeCents: 0 },
  { id: "royal-blue",      name: "Royal Blue",       hex: "#4C7CE0", tier: "standard", surchargeCents: 0 },
  { id: "emerald-green",   name: "Emerald Green",    hex: "#2E8B57", tier: "standard", surchargeCents: 0 },
  { id: "imperial-purple", name: "Imperial Purple",  hex: "#6A2C91", tier: "standard", surchargeCents: 0 },
  { id: "sunshine-yellow", name: "Sunshine Yellow",  hex: "#F4C430", tier: "standard", surchargeCents: 0 },
  { id: "bright-orange",   name: "Bright Orange",    hex: "#F57A1F", tier: "standard", surchargeCents: 0 },
  { id: "hot-pink",        name: "Hot Pink",         hex: "#E63EB2", tier: "standard", surchargeCents: 0 },
  { id: "jet-black",       name: "Jet Black",        hex: "#1a1510", tier: "standard", surchargeCents: 0 },
  { id: "pure-white",      name: "Pure White",       hex: "#F5EFD8", tier: "standard", surchargeCents: 0 },
  { id: "silver",          name: "Silver",           hex: "#C0C0C0", tier: "standard", surchargeCents: 0 },
  { id: "gold",            name: "Gold",             hex: "#C9A227", tier: "standard", surchargeCents: 0 },
  { id: "bronze",          name: "Bronze",           hex: "#8C7853", tier: "standard", surchargeCents: 0 },
  { id: "turquoise",       name: "Turquoise",        hex: "#30D5C8", tier: "standard", surchargeCents: 0 },
  { id: "lavender",        name: "Lavender",         hex: "#B497D6", tier: "standard", surchargeCents: 0 },
  { id: "lime-green",      name: "Lime Green",       hex: "#A3E635", tier: "standard", surchargeCents: 0 },
  { id: "burgundy",        name: "Burgundy",         hex: "#6B1A28", tier: "standard", surchargeCents: 0 },
  { id: "navy-blue",       name: "Navy Blue",        hex: "#1F2A5E", tier: "standard", surchargeCents: 0 },
  { id: "chocolate-brown", name: "Chocolate Brown",  hex: "#5A3A22", tier: "standard", surchargeCents: 0 },
  { id: "cream",           name: "Cream",            hex: "#F2E6C8", tier: "standard", surchargeCents: 0 },
  { id: "slate-gray",      name: "Slate Gray",       hex: "#5A6373", tier: "standard", surchargeCents: 0 },
];

/* Owner-recommended first six specialty finishes. */
export const SPECIALTY_COLORS: FilamentColor[] = [
  {
    id: "silk-gold",   name: "Silk Gold",   hex: "#D4A82A", tier: "specialty", surchargeCents: 0,
    gradient: "linear-gradient(135deg,#B8901E 0%,#F6D977 50%,#B8901E 100%)",
    note: "Silk finish · adds a glossy, metallic sheen.",
  },
  {
    id: "silk-silver", name: "Silk Silver", hex: "#C9C9C9", tier: "specialty", surchargeCents: 0,
    gradient: "linear-gradient(135deg,#8A8A8A 0%,#EDEDED 50%,#8A8A8A 100%)",
    note: "Silk finish · bright, pearlescent silver.",
  },
  {
    id: "rainbow",     name: "Rainbow Silk", hex: "#9B59B6", tier: "specialty", surchargeCents: 0,
    gradient: "linear-gradient(135deg,#E63946 0%,#F4C430 25%,#4FB07D 50%,#4C7CE0 75%,#9B59B6 100%)",
    note: "Fast-gradient rainbow silk · colour shifts across the surface.",
  },
  {
    id: "galaxy",      name: "Galaxy",      hex: "#2E1A47", tier: "specialty", surchargeCents: 0,
    gradient: "radial-gradient(circle at 30% 30%,#A66DD4 0%,#4A2A82 40%,#1A0F2E 100%)",
    note: "Deep purple-black with sparkle flakes.",
  },
  {
    id: "glow-in-dark", name: "Glow-in-the-Dark", hex: "#B6F0A0", tier: "specialty", surchargeCents: 0,
    gradient: "linear-gradient(135deg,#DAFBC9 0%,#8FE37A 50%,#B6F0A0 100%)",
    note: "Charges in light, glows green in the dark.",
  },
  {
    id: "marble",      name: "Marble",      hex: "#E8E4D8", tier: "specialty", surchargeCents: 0,
    gradient: "radial-gradient(circle at 40% 40%,#FFFFFF 0%,#E8E4D8 55%,#A6A398 100%)",
    note: "Natural marble veining · each print is unique.",
  },
];

export const ALL_COLORS: FilamentColor[] = [...STANDARD_COLORS, ...SPECIALTY_COLORS];

export function findColor(id: string): FilamentColor | undefined {
  return ALL_COLORS.find((c) => c.id === id);
}

/** Default two-color pairing when a product doesn't specify its own. */
export const DEFAULT_TWO_COLOR: [string, string] = ["royal-red", "jet-black"];
