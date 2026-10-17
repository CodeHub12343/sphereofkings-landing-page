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
  purchasable: boolean;
};

// Christmas Early Bird catalog. Prices stay unapproved until the owner confirms them;
// the shop surfaces "Price pending" placeholders instead of inventing values.
export const PRODUCTS: Product[] = [
  {
    slug: "complete-7-in-1",
    name: "Complete 7-in-1",
    description:
      "The full Sphere of Kings experience — seven games on one spherical, customizable board.",
    image: "/images/0426fb4f-6550-4e4d-b8c2-42ce56f2a2ef.jpg",
    alt: "Complete 7-in-1 Sphere of Kings game",
    priceApproved: false,
    inventoryCap: 1000,
    unitsSold: 278,
    purchasable: true,
  },
  {
    slug: "royal-triple-pack",
    name: "Royal Triple Pack",
    description:
      "Three complete 5-in-1 boards for family tournaments and gift bundles.",
    image: "/images/b537bf89-3632-4281-aab5-1d928a83effd.jpg",
    alt: "Royal Triple Pack — three complete Sphere of Kings game boards",
    priceApproved: false,
    inventoryCap: 1000,
    unitsSold: 922,
    purchasable: true,
  },
  {
    slug: "kingdom-5-pack",
    name: "Kingdom 5-Pack",
    description:
      "Five complete boards for game clubs, classrooms, or the ultimate collector.",
    image: "/images/08c0600b-f713-4ca9-9dd7-b792d0b9a0bc.jpg",
    alt: "Kingdom 5-Pack — five complete Sphere of Kings game boards",
    priceApproved: false,
    inventoryCap: 1000,
    unitsSold: 184,
    purchasable: true,
  },
  {
    slug: "grandmaster-10-pack",
    name: "Grandmaster 10-Pack",
    description:
      "Ten complete boards for clubs, classrooms, and tournament directors.",
    image: "/images/de6dcdb2-d872-4b9d-8451-b21622f9ec9e.jpg",
    alt: "Grandmaster 10-Pack — ten complete Sphere of Kings game boards",
    priceApproved: false,
    inventoryCap: 1000,
    unitsSold: 1000,
    purchasable: false,
  },
  {
    slug: "custom-sphere-puzzle",
    name: "Custom Sphere Puzzle",
    description:
      "Upload your own image and we print it as a spherical puzzle built on the Sphere of Kings board.",
    image: "/images/d846e954-7329-421e-9b42-85a07f82d117.jpg",
    alt: "Custom Sphere Puzzle — upload your image",
    priceApproved: false,
    inventoryCap: 1000,
    unitsSold: 61,
    purchasable: true,
  },
];

export type Availability =
  | { kind: "available"; remaining: number }
  | { kind: "low-stock"; remaining: number }
  | { kind: "sold-out" };

export function availability(p: Product): Availability {
  const remaining = Math.max(0, p.inventoryCap - p.unitsSold);
  if (remaining === 0) return { kind: "sold-out" };
  if (remaining / p.inventoryCap <= 0.1) return { kind: "low-stock", remaining };
  return { kind: "available", remaining };
}

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
