// Availability helper — unchanged from the previous catalog.
export function availability(p: { inventoryCap: number; unitsSold: number; reservedUnits?: number; purchasable: boolean }) {
  const reserved = p.reservedUnits ?? 0;
  const remaining = Math.max(0, p.inventoryCap - p.unitsSold - reserved);
  const soldOut = remaining <= 0;
  return {
    remaining,
    soldOut,
    canSell: !soldOut && p.purchasable,
  };
}

// Pretty-print USD / currency amounts. Falls back to a bare symbol+amount
// if the Intl API is unavailable (never, in practice).
export function formatMoney(amount: number, currency: "USD" = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

// Site-wide sale discount was used while direct-sale was live. Now that
// the site is Kickstarter-only (James, 2026-11-20 chat), the shop shows
// the Kickstarter pledge amount only — no retail-vs-sale comparison, no
// "X% off" badge. The constant is kept at 0 so any legacy call site that
// still invokes pricing() reads back a clean no-discount result.
export const SITE_WIDE_DISCOUNT_PCT = 0;
const SITE_WIDE_DISCOUNT = SITE_WIDE_DISCOUNT_PCT / 100;

export type ProductPricing = {
  retail: number;              // original list price
  sale: number;                // what the customer pays
  savings: number;             // retail - sale, rounded to cents
  discountPct: number;         // integer 0–100
  retailFormatted: string;     // "$179"
  saleFormatted: string;       // "$143.20"
  savingsFormatted: string;    // "$35.80"
};

// Single source of truth for pricing display + checkout math. Any UI
// that shows a price, and any server code that charges a price, MUST
// call this — never multiply by (1 - discount) inline.
export function pricing(
  product: { price?: { amount: number; currency: "USD" } | undefined },
): ProductPricing | null {
  if (!product.price) return null;
  const retail = product.price.amount;
  // Round the sale price to whole cents so it survives the ×100 → integer
  // conversion that checkout and Stripe expect without drifting.
  const sale = Math.round(retail * (1 - SITE_WIDE_DISCOUNT) * 100) / 100;
  const savings = Math.round((retail - sale) * 100) / 100;
  return {
    retail,
    sale,
    savings,
    discountPct: SITE_WIDE_DISCOUNT_PCT,
    retailFormatted: formatMoney(retail),
    saleFormatted: formatMoney(sale),
    savingsFormatted: formatMoney(savings),
  };
}

// Sphere of Kings catalog — mirrors the 30 Kickstarter reward tiers
// 1:1 (James, 2026-11-20 chat). Each entry links out to the Kickstarter
// campaign on the shop page — no direct purchase from the site.
//
// Admin edits in the Products console override the fields in this seed
// on the live site. The seed only runs on an empty collection — to
// re-seed, delete .data/products.json or run scripts/reseed-products.mjs.

export type ProductCategory = "reward" | "addon";

export interface PuzzleDesignOption {
  slug: string;
  label: string;
  image: string;
}

export type Product = {
  slug: string;
  name: string;
  description: string;
  // Short pitch for shop cards — one or two sentences.
  tagline?: string;
  image: string;
  alt: string;
  priceApproved: boolean;
  price?: { amount: number; currency: "USD" };
  inventoryCap: number;
  unitsSold: number;
  reservedUnits?: number;
  purchasable: boolean;
  sortOrder: number;
  category: ProductCategory;
  addonSlugs?: string[];
  requiresPhotoUpload?: boolean;
  puzzleOptions?: PuzzleDesignOption[];
  fullDescription?: string;
  colorable?: {
    pattern: "two-color" | "single";
    defaultColors?: [string, string?];
    helper?: string;
  };
};

const PUZZLE_DESIGNS: PuzzleDesignOption[] = [
  { slug: "earth",  label: "Earth",  image: "/images/products/puzzle-earth.jpg"  },
  { slug: "galaxy", label: "Galaxy", image: "/images/products/puzzle-galaxy.jpg" },
  { slug: "lion",   label: "Lion",   image: "/images/products/puzzle-lion.jpg"   },
  { slug: "moon",   label: "Moon",   image: "/images/products/puzzle-moon.jpg"   },
  { slug: "ocean",  label: "Ocean",  image: "/images/products/puzzle-ocean.jpg"  },
];

// Image fallback for digital app tiers — no app product image yet.
const APP_IMAGE = "/images/products/kingdom-supporter.png";

// Default stock values applied to every entry (the shop no longer shows
// inventory counters; these keep the Product shape valid).
const DEFAULT_STOCK = { inventoryCap: 100000, unitsSold: 0, purchasable: true, priceApproved: true } as const;

/* ------------------------------------------------------------------ *
 * REWARDS — mirror of the Kickstarter campaign's 30 reward tiers,
 * listed in Kickstarter's own order (ascending pledge amount).
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  {
    slug: "guinness-wr-puzzle-supporter",
    name: "Guinness World Record Puzzle Supporter",
    tagline: "Back the record-setting Sphere of Kings puzzle attempt.",
    description: "Support our Guinness World Record puzzle attempt. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-guinness-wr-puzzle-supporter.jpg",
    alt: "Sphere of Kings puzzle sphere game board",
    price: { amount: 4, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 1, category: "reward",
  },
  {
    slug: "kingdom-supporter",
    name: "Kingdom Supporter",
    tagline: "Help bring Sphere of Kings Game Boards to life — supporter tier.",
    description: "Sphere of Kings Game Boards Kingdom Supporter. Ships anywhere in the world. Estimated delivery December 2027.",
    image: "/images/products/kingdom-supporter.png",
    alt: "Kingdom Supporter badge — Sphere of Kings",
    price: { amount: 5, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 2, category: "reward",
  },
  {
    slug: "app-early-access",
    name: "Sphere of Kings Game App – Early Access",
    tagline: "Lifetime digital access to the Sphere of Kings app.",
    description: "Sphere of Kings Game App – Lifetime Digital Access. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-early-access.png",
    alt: "Sphere of Kings Game App — Early Access",
    price: { amount: 10, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 3, category: "reward",
  },
  {
    slug: "app-founders-set",
    name: "Sphere of Kings Game App – Founder's Set",
    tagline: "Founder's Gold Piece Set — digital edition.",
    description: "Sphere of Kings – Founder's Gold Piece Set. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-founders-set.png",
    alt: "Sphere of Kings Game App — Founder's Set",
    price: { amount: 25, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 4, category: "reward",
  },
  {
    slug: "custom-puzzle-pieces",
    name: "Custom Puzzle Game Pieces",
    tagline: "A custom set of puzzle game pieces.",
    description: "Custom Puzzle Game Pieces. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-custom-puzzle-pieces.jpg",
    alt: "Custom Sphere of Kings puzzle game pieces",
    price: { amount: 35, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 5, category: "reward",
  },
  {
    slug: "app-royal-support",
    name: "Sphere of Kings Game App – Royal Support",
    tagline: "Royal Supporter exclusive digital benefits.",
    description: "Sphere of Kings – Royal Supporter Exclusive Benefits. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-royal-support.png",
    alt: "Sphere of Kings Game App — Royal Support",
    price: { amount: 50, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 6, category: "reward",
  },
  {
    slug: "one-sok-puzzle-board",
    name: "One SOK Puzzle Game Board",
    tagline: "A single Sphere of Kings puzzle sphere game board.",
    description: "Sphere of Kings – Puzzle Sphere Game Board. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-one-sok-puzzle-board.jpg",
    alt: "Sphere of Kings puzzle sphere game board",
    price: { amount: 79, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 7, category: "reward",
    puzzleOptions: PUZZLE_DESIGNS,
  },
  {
    slug: "royal-checkers-board",
    name: "Royal Checkers Game Board",
    tagline: "Complete Royal Checkers game board set.",
    description: "Sphere of Kings – Royal Checkers Complete Game Board Set. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-royal-checkers-board.jpg",
    alt: "Sphere of Kings Royal Checkers complete game board",
    price: { amount: 79, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 8, category: "reward",
  },
  {
    slug: "imperial-kings-board",
    name: "Imperial Kings Game Board",
    tagline: "Complete Imperial Kings board set.",
    description: "Sphere of Kings – Imperial Kings Complete Board Set. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-imperial-kings-board.jpg",
    alt: "Sphere of Kings Imperial Kings complete board set",
    price: { amount: 79, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 9, category: "reward",
  },
  {
    slug: "custom-sphere-puzzle-upload",
    name: "Custom Sphere Puzzle — Upload Your Image",
    tagline: "Your photo. Your custom sphere puzzle.",
    description: "Sphere of Kings – Create your Own Custom Sphere Puzzle. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-custom-sphere-puzzle-upload.jpg",
    alt: "Custom Sphere of Kings puzzle made from an uploaded photo",
    price: { amount: 89, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 10, category: "reward",
    requiresPhotoUpload: true,
  },
  {
    slug: "app-collector-edition",
    name: "Sphere of Kings Game App – Collector Edition",
    tagline: "Collector tier of the Sphere of Kings app.",
    description: "Sphere of Kings Game App – Collector Edition. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-collector-edition.png",
    alt: "Sphere of Kings Game App — Collector Edition",
    price: { amount: 125, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 11, category: "reward",
  },
  {
    slug: "sok-canvas-sphere",
    name: "SOK CANVAS SPHERE™ — Create • Paint • Display",
    tagline: "A blank canvas sphere to create, paint, and display.",
    description: "SOK CANVAS SPHERE™ — Create • Paint • Display. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-canvas-sphere.jpg",
    alt: "SOK Canvas Sphere — paintable blank sphere",
    price: { amount: 129, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 12, category: "reward",
  },
  {
    slug: "sok-canvas-bank-sphere",
    name: "SOK Canvas Bank Sphere™ — Paint It, Create It & Save It!",
    tagline: "A paintable canvas sphere that doubles as a savings bank.",
    description: "SOK Canvas Bank Sphere™ – Paint It, Create It & Save It! Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-canvas-bank-sphere.jpg",
    alt: "SOK Canvas Bank Sphere — paintable sphere savings bank",
    price: { amount: 129, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 13, category: "reward",
  },
  {
    slug: "mindsphere-quest",
    name: "MindSphere Quest™ – The Ultimate 3D Spherical Memory Challenge",
    tagline: "A 3D spherical memory challenge for all ages.",
    description: "MindSphere Quest™ – The Ultimate 3D Spherical Memory Challenge. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-mindsphere-quest.jpg",
    alt: "MindSphere Quest — 3D spherical memory game",
    price: { amount: 129, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 14, category: "reward",
  },
  {
    slug: "complete-7in1-game",
    name: "Complete Sphere of Kings Game Boards Set",
    tagline: "The full Sphere of Kings Game Boards spherical set.",
    description: "Sphere of Kings – Complete Game Boards Set. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-complete-7in1-game.jpg",
    alt: "Complete Sphere of Kings Game Boards set",
    price: { amount: 179, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 15, category: "reward",
  },
  {
    slug: "diy-creator-edition",
    name: "DIY Creator Edition Game Board",
    tagline: "A buildable creator edition of the Sphere of Kings Game Boards.",
    description: "Sphere of Kings – DIY Creator Edition Game Boards Kit. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-diy-creator-edition.jpg",
    alt: "DIY Creator Edition Game Boards kit",
    price: { amount: 179, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 16, category: "reward",
  },
  {
    slug: "sok-takeover-founders",
    name: "SOK TAKEOVER™ – Founder's Edition 3D Sphere Game",
    tagline: "Founder's Edition takeover-style 3D sphere strategy.",
    description: "SOK TAKEOVER™ – Founder's Edition 3D Sphere Game. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-takeover-founders.jpg",
    alt: "SOK Takeover — Founder's Edition 3D sphere game",
    price: { amount: 179, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 17, category: "reward",
  },
  {
    slug: "sok-marbel-maze",
    name: "SOK MARBEL MAZE™ — a 360°",
    tagline: "A 360° marble maze built around the Sphere of Kings.",
    description: "SOK MARBEL MAZE™ — a 360°. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-marbel-maze.jpg",
    alt: "SOK Marbel Maze — 360° spherical marble maze",
    price: { amount: 179, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 18, category: "reward",
  },
  {
    slug: "sok-risk-it-all",
    name: "SOK: RISK IT ALL™ — The Global Conquest Strategy Game",
    tagline: "Global-conquest style strategy on the sphere.",
    description: "SOK: RISK IT ALL™ — The Global Conquest Strategy Game. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-risk-it-all.jpg",
    alt: "SOK Risk It All — global conquest strategy sphere game",
    price: { amount: 179, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 19, category: "reward",
  },
  {
    slug: "sok-strateosphere",
    name: "SOK STRATEOSPHERE™ — Double-Stacked Hidden Pieces Edition",
    tagline: "Double-stacked hidden-pieces strategy edition.",
    description: "SOK STRATEOSPHERE™ — Double-Stacked Hidden Pieces Edition. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-strateosphere.jpg",
    alt: "SOK Strateosphere — double-stacked hidden pieces edition",
    price: { amount: 199, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 20, category: "reward",
  },
  {
    slug: "sok-marble-conquest",
    name: "SOK MARBLE CONQUEST™ — Equal Territory Edition",
    tagline: "Equal-territory marble conquest on the sphere.",
    description: "SOK MARBLE CONQUEST™ — Equal Territory Edition. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-sok-marble-conquest.jpg",
    alt: "SOK Marble Conquest — equal territory edition",
    price: { amount: 299, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 21, category: "reward",
  },
  {
    slug: "app-patron-edition",
    name: "Sphere of Kings Game App – Patron Edition",
    tagline: "Patron-tier digital edition of the Sphere of Kings app.",
    description: "Sphere of Kings Game App – Patron Edition. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-patron-edition.png",
    alt: "Sphere of Kings Game App — Patron Edition",
    price: { amount: 300, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 22, category: "reward",
  },
  {
    slug: "royal-triple-pack",
    name: "Royal Triple Pack",
    tagline: "Three complete Sphere of Kings game boards.",
    description: "Sphere of Kings – Royal Triple Pack Complete Game Boards. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-royal-triple-pack.jpg",
    alt: "Royal Triple Pack — three complete game boards",
    price: { amount: 510, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 23, category: "reward",
  },
  {
    slug: "app-imperial-edition",
    name: "Sphere of Kings Game App – Imperial Edition",
    tagline: "Imperial-tier digital edition of the Sphere of Kings app.",
    description: "Sphere of Kings Game App – Imperial Edition. Digital reward. Estimated delivery March 2027.",
    image: APP_IMAGE,
    alt: "Sphere of Kings Game App — Imperial Edition",
    price: { amount: 750, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 24, category: "reward",
  },
  {
    slug: "kingdom-5-pack",
    name: "Kingdom 5 Pack",
    tagline: "Five complete Sphere of Kings game boards.",
    description: "Sphere of Kings – Kingdom 5-Pack Complete Game Boards. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-kingdom-5-pack.jpg",
    alt: "Kingdom 5 Pack — five complete game boards",
    price: { amount: 805, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 25, category: "reward",
  },
  {
    slug: "grandmaster-10-pack",
    name: "Grandmaster 10 Pack",
    tagline: "Ten complete Sphere of Kings game boards.",
    description: "Sphere of Kings – Grandmaster 10-Pack Complete Game Boards. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-grandmaster-10-pack.jpg",
    alt: "Grandmaster 10 Pack — ten complete game boards",
    price: { amount: 1521, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 26, category: "reward",
  },
  {
    slug: "imperial-20-pack",
    name: "Imperial 20 Pack",
    tagline: "Twenty complete Sphere of Kings game boards.",
    description: "Sphere of Kings – Imperial 20-Pack Complete Game Boards. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-imperial-20-pack.jpg",
    alt: "Imperial 20 Pack — twenty complete game boards",
    price: { amount: 1719, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 27, category: "reward",
  },
  {
    slug: "app-sovereign-edition",
    name: "Sphere of Kings Game App – Sovereign Edition",
    tagline: "Sovereign-tier digital edition of the Sphere of Kings app.",
    description: "Sphere of Kings Game App – Sovereign Edition. Digital reward. Estimated delivery March 2027.",
    image: "/images/products/new-app-sovereign-edition.png",
    alt: "Sphere of Kings Game App — Sovereign Edition",
    price: { amount: 2000, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 28, category: "reward",
  },
  {
    slug: "app-studio-club-edition",
    name: "Sphere of Kings Game App – Studio / Club Edition",
    tagline: "Studio / Club tier — digital edition for groups.",
    description: "Sphere of Kings Game App – Studio / Club Edition. Digital reward. Estimated delivery March 2027.",
    image: APP_IMAGE,
    alt: "Sphere of Kings Game App — Studio / Club Edition",
    price: { amount: 5000, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 29, category: "reward",
  },
  {
    slug: "kingdom-legacy-retailer-50-pack",
    name: "Kingdom Legacy Retailer 50 Pack",
    tagline: "Fifty complete Sphere of Kings game boards for retailers.",
    description: "Sphere of Kings – Kingdom Retailer 50-Pack Complete Game Boards. Ships anywhere in the world. Estimated delivery June 2027.",
    image: "/images/products/new-kingdom-legacy-retailer-50-pack.jpg",
    alt: "Kingdom Legacy Retailer 50 Pack — fifty complete game boards",
    price: { amount: 6712, currency: "USD" },
    ...DEFAULT_STOCK,
    sortOrder: 30, category: "reward",
  },
];
