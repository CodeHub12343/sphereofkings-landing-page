export type Product = {
  slug: string;
  name: string;
  description: string;
  image: string;
  alt: string;
  priceApproved: boolean;
  // When priceApproved is false, the shop renders a placeholder and disables Add to cart.
  price?: { amount: number; currency: "USD" };
  inventoryCap: number;
  unitsSold: number;
  // Units held for approved wholesale quotes that haven't paid yet.
  // Treated as "already gone" by the availability check so retail
  // shoppers can't deplete the cap underneath an approved buyer.
  // Released when the paying order confirms OR when the reservation
  // expires without an order (nightly / on-demand cleanup).
  reservedUnits?: number;
  purchasable: boolean;
};

// Sphere of Kings catalog. Prices here are the launch prices supplied by
// the owner; admin edits in the Products console override these on the
// live site. The seed only runs on an empty `products` collection — to
// re-seed, drop the collection in Atlas (or delete .data/products.json)
// and restart the dev server.
export const PRODUCTS: Product[] = [
  {
    slug: "kingdom-supporter",
    name: "Kingdom Supporter",
    description:
      "Become a Kingdom Supporter and help bring Sphere of Kings™ — the 7-in-1 Game Board — to life. Your $5 pledge supports development, 3D printing, testing, and launch. Every supporter becomes part of the journey. 👑 No physical product is included with this reward.",
    image: "/images/products/kingdom-supporter.png",
    alt: "Kingdom Supporter — $5 pledge tier",
    priceApproved: true,
    price: { amount: 5, currency: "USD" },
    inventoryCap: 100000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "custom-puzzle-game-pieces",
    name: "Custom Puzzle Game Pieces",
    description:
      "Unleash your creativity with the Sphere of Kings DIY Puzzle Pieces. Receive a set of unpainted puzzle pieces ready for you to paint, decorate, and personalize with your own colors and designs. Paint it. Create it. Build it. Make it yours. 🎨👑",
    image: "/images/products/diy-pieces.webp",
    alt: "Custom Puzzle Game Pieces — unpainted DIY set",
    priceApproved: true,
    price: { amount: 35, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "one-sok-puzzle-board",
    name: "One SOK Puzzle Game Board",
    description:
      "Choose one Sphere of Kings Puzzle Game Board featuring a 3D-printable spherical puzzle design. Assemble the pieces to complete the sphere and enjoy a unique hands-on puzzle experience. Pick from one of our available puzzle designs and start building your Kingdom!",
    image: "/images/products/puzzle-prepicks.webp",
    alt: "One SOK Puzzle Game Board — spherical puzzle",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "royal-checkers-board",
    name: "Royal Checkers Game Board",
    description:
      "Enter the Kingdom with Royal Checkers, the Sphere of Kings take on classic checkers! Play across a unique spherical game board using specially designed checker pieces. The curved playing surface creates a fresh, strategic experience. Classic strategy. A whole new playing field. Rule the Sphere! 👑",
    image: "/images/products/royal-checkers.png",
    alt: "Royal Checkers Game Board — spherical checkers",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "imperial-kings-board",
    name: "Imperial Kings Game Board",
    description:
      "Enter the battle with Imperial Kings, a strategic Sphere of Kings game played across a unique spherical board. Command your specially designed pieces, plan your moves around the curved playing field, and challenge your opponent for control of the Kingdom. Plan your moves. Defend your Kingdom. Become the Imperial King. 👑",
    image: "/images/products/imperial-kings.png",
    alt: "Imperial Kings Game Board — spherical chess",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "custom-sphere-puzzle",
    name: "Custom Sphere Puzzle — Upload Your Image",
    description:
      "Turn your favorite image or idea into a one-of-a-kind Sphere of Kings custom puzzle. Submit your picture or design, and we convert it into a simplified, 3D-printable spherical puzzle with properly separated pieces. Your picture. Your puzzle. Your Sphere. Limitless possibilities.",
    image: "/images/products/custom-upload-puzzle.webp",
    alt: "Custom Sphere Puzzle — upload your own image",
    priceApproved: true,
    price: { amount: 89, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "complete-7-in-1",
    name: "Complete 7-in-1 Sphere of Kings Game",
    description:
      "Get the complete Sphere of Kings 7-in-1 Game System featuring Royal Checkers, Imperial Kings, and the Sphere Puzzle in one innovative spherical design. Switch between strategy games and puzzle play for multiple ways to enjoy your Sphere of Kings. Three experiences. One Sphere. A whole new way to play. 👑",
    image: "/images/products/complete-7in1.webp",
    alt: "Complete 7-in-1 Sphere of Kings Game",
    priceApproved: true,
    price: { amount: 179, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "diy-creator-edition",
    name: "DIY Creator Edition Game Board",
    description:
      "Create your own Sphere of Kings masterpiece! The DIY Creator Edition gives you a paintable Sphere of Kings game board designed for you to customize with your own colors, patterns, and creative style. Make it bold, make it unique, and make it yours. Your Sphere. Your Colors. Your Creation. 🎨👑",
    image: "/images/products/creator-edition.webp",
    alt: "DIY Creator Edition — paintable Sphere of Kings board",
    priceApproved: true,
    price: { amount: 179, currency: "USD" },
    inventoryCap: 1000,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "royal-triple-pack",
    name: "Royal Triple Pack",
    description:
      "Build your Kingdom with the Royal Triple Pack! Receive three complete Sphere of Kings 5-in-1 Game Boards, giving you multiple ways to play, create, customize, and share the experience. Perfect for gifts, game nights, families, or starting your collection. 3 Complete Spheres. 5-in-1 each. One Royal Collection. 👑👑👑",
    image: "/images/products/pack-3.webp",
    alt: "Royal Triple Pack — three complete Sphere of Kings game boards",
    priceApproved: true,
    price: { amount: 510, currency: "USD" },
    inventoryCap: 500,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "kingdom-5-pack",
    name: "Kingdom 5-Pack",
    description:
      "Expand your Kingdom with the Kingdom 5-Pack! Receive five complete Sphere of Kings 5-in-1 Game Boards, each offering multiple ways to play, create, customize, and enjoy. Perfect for families, gifts, game groups, events, or sharing Sphere of Kings with friends. 5 Complete Spheres. 5-in-1 each. Build Your Kingdom. 👑",
    image: "/images/products/pack-5.webp",
    alt: "Kingdom 5-Pack — five complete Sphere of Kings game boards",
    priceApproved: true,
    price: { amount: 805, currency: "USD" },
    inventoryCap: 300,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "grandmaster-10-pack",
    name: "Grandmaster 10-Pack",
    description:
      "Take your collection to the next level with the Grandmaster 10-Pack! Receive 10 complete Sphere of Kings 5-in-1 Game Boards, perfect for families, organizations, clubs, events, or tournaments. 10 Complete Spheres. 5-in-1 each. Build a Kingdom worthy of a Grandmaster. 👑",
    image: "/images/products/pack-10.webp",
    alt: "Grandmaster 10-Pack — ten complete Sphere of Kings game boards",
    priceApproved: true,
    price: { amount: 1521, currency: "USD" },
    inventoryCap: 200,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "imperial-20-pack",
    name: "Imperial 20-Pack",
    description:
      "Build an even bigger Kingdom with the Imperial 20-Pack! Receive 20 complete Sphere of Kings 5-in-1 Game Boards, perfect for large families, organizations, clubs, events, tournaments, gifts, or group activities. 20 Complete Spheres. 5-in-1 each. Rule the Kingdom like an Emperor. 👑",
    image: "/images/products/pack-20.webp",
    alt: "Imperial 20-Pack — twenty complete Sphere of Kings game boards",
    priceApproved: true,
    price: { amount: 1719, currency: "USD" },
    inventoryCap: 100,
    unitsSold: 0,
    purchasable: true,
  },
  {
    slug: "kingdom-legacy-50-pack",
    name: "Kingdom Legacy Retailer 50-Pack",
    description:
      "Build the ultimate Kingdom with the King's Legacy 50-Pack! Receive 50 complete Sphere of Kings 5-in-1 Game Boards, ideal for organizations, schools, clubs, tournaments, large events, gifts, and community programs. 50 Complete Spheres. 5-in-1 each. Create a Kingdom. Build a Legacy. 👑",
    image: "/images/products/pack-50.webp",
    alt: "Kingdom Legacy 50-Pack — fifty complete Sphere of Kings game boards",
    priceApproved: true,
    price: { amount: 6712, currency: "USD" },
    inventoryCap: 50,
    unitsSold: 0,
    purchasable: true,
  },
];

export type Availability =
  | { kind: "available"; remaining: number }
  | { kind: "low-stock"; remaining: number }
  | { kind: "sold-out" };

export function availability(p: Product): Availability {
  const held = Math.max(0, (p.unitsSold ?? 0) + (p.reservedUnits ?? 0));
  const remaining = Math.max(0, p.inventoryCap - held);
  if (remaining === 0) return { kind: "sold-out" };
  if (remaining / p.inventoryCap <= 0.1) return { kind: "low-stock", remaining };
  return { kind: "available", remaining };
}

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function productLineTotal(p: Product, qty: number): number | null {
  if (!p.priceApproved || !p.price) return null;
  return p.price.amount * qty;
}
