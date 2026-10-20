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

// Sphere of Kings catalog — the 2026 Kickstarter reward list.
//
// Order is owner-signed (James Bowser, 2026-10-19 chat): rewards in the
// exact order he sent them, add-ons last. `sortOrder` makes that order
// explicit so admin edits + Mongo reads preserve it.
//
// Admin edits in the Products console override the fields in this seed
// on the live site. The seed only runs on an empty collection — to
// re-seed, run `scripts/reseed-products.mjs`.

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
  // Catalog ordering + add-on wiring (James, 2026-10-19).
  sortOrder: number;
  category: ProductCategory;
  // Add-on slugs offered on this product's detail page.
  // Empty / undefined = no add-ons available on this one.
  addonSlugs?: string[];
  // "Custom 3D Puzzle Upload Your Photo" + "Custom Photo-to-3D"
  // require a user image upload at purchase time.
  requiresPhotoUpload?: boolean;
  // "Pick Your Puzzle Collection" rewards let the buyer pick one
  // design at checkout. Shown as a radio grid in the detail page.
  puzzleOptions?: PuzzleDesignOption[];
  // Owner-signed long-form copy (Markdown) shown in the "Read full
  // description" modal on the detail page. The short `description`
  // field is still the card / hero summary.
  fullDescription?: string;
  // Color customisation hook. When set, the detail page shows the
  // filament colour picker. `pattern` controls how many picks:
  //   "two-color": buyer picks exactly two different colours
  //                (board + alternate squares)
  //   "single":   buyer picks one colour (DIY piece sets, board-only)
  // `defaultColors` seeds the picker on first open.
  colorable?: {
    pattern: "two-color" | "single";
    defaultColors?: [string, string?];
    // Admin-provided copy explaining what the picks will apply to on
    // the physical product (shown under the picker heading).
    helper?: string;
  };
};

/* ------------------------------------------------------------------ *
 * Add-on slug list — reused by every reward.
 * ------------------------------------------------------------------ */

const COMMON_ADDON_SLUGS = [
  "pick-your-puzzle-collection",
  "custom-photo-to-3d",
  "royal-checkers-pieces",
  "imperial-kings-pieces",
  "diy-puzzle-pieces",
  "royal-checkers-diy",
  "imperial-kings-diy",
  "game-board-only",
];

const PUZZLE_DESIGNS: PuzzleDesignOption[] = [
  { slug: "earth",  label: "Earth",  image: "/images/products/puzzle-earth.jpg"  },
  { slug: "galaxy", label: "Galaxy", image: "/images/products/puzzle-galaxy.jpg" },
  { slug: "lion",   label: "Lion",   image: "/images/products/puzzle-lion.jpg"   },
  { slug: "moon",   label: "Moon",   image: "/images/products/puzzle-moon.jpg"   },
  { slug: "ocean",  label: "Ocean",  image: "/images/products/puzzle-ocean.jpg"  },
];

/* ------------------------------------------------------------------ *
 * REWARDS — in the order owner sent them.
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  // #1
  {
    slug: "royal-checkers-set",
    name: "Royal Checkers – Two-Color Board & Checkers Set",
    tagline: "One sphere. Endless possibilities. Rule the game.",
    description:
      "Experience checkers like never before with Sphere of Kings! This unique 3D spherical game board transforms traditional checkers into an exciting, interactive experience for family and friends.\n\nYour reward includes:\n• One premium two-color spherical game board\n• One complete set of red and black magnetic checkers\n• Magnetic pieces designed for secure placement\n• Durable, detailed 3D-printed construction\n• A unique gift for game lovers and collectors\n\nThis reward includes the Royal Checkers game pieces only. Additional game sets are sold separately.",
    image: "/images/products/royal-checkers-set.jpg",
    alt: "Royal Checkers two-color spherical board with red and black magnetic checkers",
    priceApproved: true,
    price: { amount: 179, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 1, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two colours — one for the board's light squares and matching checkers, one for the dark squares and alternate checkers.",
    },
    fullDescription: `# 👑 Royal Checkers – Two-Color Board & Checkers Set

Experience checkers like never before with **Sphere of Kings!** This unique 3D spherical game board transforms traditional checkers into an exciting, interactive experience for family and friends.

Your reward includes:

- 🔴⚫ One premium two-color spherical game board
- 👑 One complete set of red and black magnetic checkers
- 🧲 Magnetic pieces designed for secure placement
- 🎯 Durable, detailed 3D-printed construction
- 🎁 A unique gift for game lovers and collectors

**One Sphere. Endless Possibilities. Rule the Game!**

This reward includes the Royal Checkers game pieces only. Additional game sets are sold separately.`,
  },

  // #2
  {
    slug: "imperial-kings-kit",
    name: "Imperial Kings – Complete Royal Game Board Kit",
    tagline: "One sphere. Two kingdoms. Endless royal battles.",
    description:
      "Rule the kingdom with Imperial Kings! Experience a whole new dimension of strategy with our innovative 3D spherical game board.\n\nThis complete kit includes the Sphere of Kings game board and a full set of black-and-white Imperial Kings game pieces, designed for exciting, competitive gameplay.\n\nEnjoy a unique royal gaming experience with family and friends. Perfect for kids under adult supervision, adults, collectors, and strategy game enthusiasts.",
    image: "/images/products/imperial-kings-kit.jpg",
    alt: "Imperial Kings complete kit — spherical board with black and white chess-style pieces",
    priceApproved: true,
    price: { amount: 189, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 2, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["pure-white", "jet-black"],
      helper: "Pick two colours for the board's checkered pattern and your Imperial Kings piece sets.",
    },
    fullDescription: `# 👑 Imperial Kings – Complete Royal Game Board Kit

Rule the kingdom with **Imperial Kings!** Experience a whole new dimension of strategy with our innovative 3D spherical game board.

This complete kit includes the **Sphere of Kings game board and a full set of black-and-white Imperial Kings game pieces**, designed for exciting, competitive gameplay.

Enjoy a unique royal gaming experience with family and friends. Perfect for kids under adult supervision, adults, collectors, and strategy game enthusiasts.

**One Sphere. Two Kingdoms. Endless Royal Battles!**`,
  },

  // #3
  {
    slug: "puzzle-pre-picks",
    name: "Sphere of Kings – Puzzle Pre-Picks (Option 3)",
    tagline: "Choose your adventure from our pre-selected designs.",
    description:
      "Choose your adventure with the Sphere of Kings 7-in-1 collection! This reward includes our unique 3D spherical puzzle game board and a complete set of puzzle pieces featuring your choice from our available pre-selected designs.\n\nFrom Planet Earth to exciting themed puzzles, enjoy a hands-on experience that brings families, children, and adults together.\n\nYour reward includes:\n• 1 Sphere of Kings spherical puzzle game board\n• 1 complete puzzle piece set in your selected design\n• Your choice from our available pre-designed puzzles\n• A reusable 3D puzzle experience\n\nPerfect for family game nights, gifts, collectors, and puzzle enthusiasts. Puzzle selections are subject to availability. Recommended for children with adult supervision.",
    image: "/images/products/puzzle-pre-picks.jpg",
    alt: "Pre-picked spherical puzzle game board — Earth design",
    priceApproved: true,
    price: { amount: 199, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 3, category: "reward",
    puzzleOptions: PUZZLE_DESIGNS,
    addonSlugs: COMMON_ADDON_SLUGS,
    fullDescription: `# Sphere of Kings – Puzzle Pre-Picks (Option 3)

Choose your adventure with the **Sphere of Kings 7-in-1 collection!** This reward includes our unique 3D spherical puzzle game board and a complete set of puzzle pieces featuring your choice from our available pre-selected designs.

From Planet Earth to exciting themed puzzles, enjoy a hands-on experience that brings families, children, and adults together.

## Your Reward Includes:

- 1 Sphere of Kings spherical puzzle game board
- 1 complete puzzle piece set in your selected design
- Your choice from our available pre-designed puzzles
- A reusable 3D puzzle experience

Perfect for family game nights, gifts, collectors, and puzzle enthusiasts!

**Choose your favorite design and bring your Sphere of Kings adventure to life!**

*Puzzle selections are subject to availability. Recommended for children with adult supervision.*`,
  },

  // #4
  {
    slug: "custom-3d-puzzle-upload",
    name: "Custom 3D Puzzle Game Board – Upload Your Photo",
    tagline: "Your picture. Your puzzle. Your kingdom.",
    description:
      "Turn your favorite memories into a one-of-a-kind 3D puzzle adventure!\n\nBring your favorite photos to life with the Sphere of Kings Custom 3D Puzzle Game Board! Upload a picture of your family, children, pets, favorite memories, or your own artwork, and we'll transform it into a unique, spherical 3D-printable puzzle game.\n\nHow it works:\n1. Upload your photo: Choose your favorite picture, artwork, or personal design.\n2. We convert your image: Our team transforms your image into a simplified, 3D-printable puzzle design.\n3. We create your puzzle: Your customized puzzle pieces are 3D printed and prepared for assembly.\n4. Assemble & play: Enjoy putting together your personalized spherical puzzle with family and friends!\n\nImportant: Uploaded images are converted into simplified designs with fewer colors and less detail to make 3D printing practical. Your finished puzzle will preserve the main shapes, colors, and recognizable features of your original image, but it will not be an exact photographic reproduction.",
    image: "/images/products/custom-3d-puzzle-upload.jpg",
    alt: "Custom 3D puzzle game board made from an uploaded photo of a golden retriever",
    priceApproved: true,
    price: { amount: 210, currency: "USD" },
    inventoryCap: 500, unitsSold: 0, purchasable: true,
    sortOrder: 4, category: "reward",
    requiresPhotoUpload: true,
    addonSlugs: COMMON_ADDON_SLUGS,
    fullDescription: `# 👑 Custom 3D Puzzle Game Board – Upload Your Photo

**Turn Your Favorite Memories Into a One-of-a-Kind 3D Puzzle Adventure!**

Bring your favorite photos to life with the **Sphere of Kings Custom 3D Puzzle Game Board!** Upload a picture of your family, children, pets, favorite memories, or your own artwork, and we'll transform it into a unique, spherical 3D-printable puzzle game.

## How It Works:

1. **Upload Your Photo:** Choose your favorite picture, artwork, or personal design.
2. **We Convert Your Image:** Our team transforms your image into a simplified, 3D-printable puzzle design.
3. **We Create Your Puzzle:** Your customized puzzle pieces are 3D printed and prepared for assembly.
4. **Assemble & Play:** Enjoy putting together your personalized spherical puzzle with family and friends!

## What Makes This Reward Special?

- Personalized spherical 3D puzzle game board.
- Custom design created from your uploaded image.
- Interlocking 3D-printed puzzle pieces.
- A unique gift for birthdays, holidays, and special occasions.
- Fun for families, children under adult supervision, and puzzle enthusiasts.
- A personalized keepsake you can proudly display.

**Important:** Uploaded images are converted into simplified designs with fewer colors and less detail to make 3D printing practical. Your finished puzzle will preserve the main shapes, colors, and recognizable features of your original image, but it will not be an exact photographic reproduction.

**Your Picture. Your Puzzle. Your Kingdom.**

Create something truly personal with *Sphere of Kings*, where your favorite memories become an interactive 3D puzzle adventure!`,
  },

  // #5
  {
    slug: "paint-your-own-puzzle",
    name: "Sphere of Kings – Paint Your Own Puzzle Kit",
    tagline: "Build it. Paint it. Customize it. Make it your own.",
    description:
      "Unleash your imagination with the Sphere of Kings 7-in-1 Paint Your Own Puzzle Kit! Turn a blank 3D spherical puzzle into a colorful masterpiece designed entirely by YOU.\n\nPerfect for children, families, artists, and puzzle lovers, this hands-on creative experience combines the excitement of puzzle building with the freedom of painting and personal expression.\n\nWhat's included:\n• 3D Spherical Puzzle Pieces — assemble your very own puzzle sphere.\n• Multicolor Paint Kit — bring your imagination to life.\n• Paintbrushes — create your own colorful designs.\n• Paint Palette — mix colors and explore your creativity.\n• Puzzle Display Stand — proudly showcase your finished masterpiece.\n• Easy Instructions — follow simple steps to build, paint, and display.\n\nFour steps to creativity: Build → Paint → Customize → Display.\n\nRecommended for children with adult supervision. Final kit contents and designs are subject to production specifications.",
    image: "/images/products/paint-your-own-puzzle.jpg",
    alt: "Paint Your Own Puzzle Kit — castle design painted on a spherical puzzle",
    priceApproved: true,
    price: { amount: 189, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 5, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    fullDescription: `# 🎨 Sphere of Kings – Paint Your Own Puzzle Kit

**Build It. Paint It. Customize It. Make It Your Own!**

Unleash your imagination with the **Sphere of Kings 7-in-1 Paint Your Own Puzzle Kit!** Turn a blank 3D spherical puzzle into a colorful masterpiece designed entirely by YOU!

Perfect for children, families, artists, and puzzle lovers, this hands-on creative experience combines the excitement of puzzle building with the freedom of painting and personal expression.

## 🎁 What's Included

- **3D Spherical Puzzle Pieces** – Assemble your very own puzzle sphere.
- **Multicolor Paint Kit** – Bring your imagination to life.
- **Paintbrushes** – Create your own colorful designs.
- **Paint Palette** – Mix colors and explore your creativity.
- **Puzzle Display Stand** – Proudly showcase your finished masterpiece.
- **Easy Instructions** – Follow simple steps to build, paint, and display.

## 🌟 Four Steps to Creativity

1. **BUILD** – Assemble your spherical puzzle.
2. **PAINT** – Choose your colors and paint any design you imagine.
3. **CUSTOMIZE** – Create landscapes, planets, animals, patterns, fantasy worlds, or completely original artwork.
4. **DISPLAY** – Show off your one-of-a-kind creation!

## 👑 Why You'll Love It

Every puzzle becomes a personal work of art! Enjoy creative family time, encourage artistic expression, and create something truly unique.

**No two puzzles have to look alike!**

Whether you're creating a beautiful planet Earth, a magical kingdom, or your own colorful universe, the possibilities are endless.

**🎨 Your Puzzle. Your Colors. Your Kingdom!**

Back our Kickstarter campaign and bring home the Sphere of Kings Paint Your Own Puzzle Kit!

*Recommended for children with adult supervision. Final kit contents and designs are subject to production specifications.*`,
  },

  // #6 — main item AND add-on
  {
    slug: "pick-your-puzzle-collection",
    name: "Sphere of Kings – Pick Your Puzzle Collection",
    tagline: "Your puzzle. Your choice. Your adventure.",
    description:
      "Explore a world of imagination with the Sphere of Kings 7-in-1 Puzzle Collection! Choose your favorite puzzle design from our exciting collection of preselected options and bring your spherical masterpiece to life.\n\nFrom the wonders of planet Earth to breathtaking galaxies, majestic lions, the mysterious Moon, and colorful underwater worlds, there's an adventure waiting for everyone.\n\nChoose your favorite design:\n🌍 Earth — Explore our beautiful planet.\n🌌 Galaxy — Journey through the wonders of space.\n🦁 Lion — Experience the majesty of the animal kingdom.\n🌕 Moon — Discover the beauty of the lunar surface.\n🐠 Ocean — Dive into a colorful underwater paradise.\n🎨 Plus additional designs from our available collection.\n\nYour reward includes:\n• Your choice of ONE puzzle design from our available selection.\n• 3D-printable-style spherical puzzle pieces.\n• An exciting, hands-on puzzle-building experience.\n• Compatibility with the Sphere of Kings spherical game board system.\n\nImportant: This reward includes one selected puzzle design, not every design shown. The Sphere of Kings game board and other game sets are sold separately unless specifically included in your selected reward.",
    image: "/images/products/pick-your-puzzle-collection.jpg",
    alt: "Pick Your Puzzle Collection — Earth, Galaxy, Lion, Moon, Ocean designs",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 6, category: "reward",
    puzzleOptions: PUZZLE_DESIGNS,
    addonSlugs: COMMON_ADDON_SLUGS.filter((s) => s !== "pick-your-puzzle-collection"),
    fullDescription: `### 👑 Sphere of Kings – Pick Your Puzzle Collection

**Your Puzzle. Your Choice. Your Adventure!**

Explore a world of imagination with the **Sphere of Kings 7-in-1 Puzzle Collection!** Choose your favorite puzzle design from our exciting collection of preselected options and bring your spherical masterpiece to life!

From the wonders of planet Earth to breathtaking galaxies, majestic lions, the mysterious Moon, and colorful underwater worlds, there's an adventure waiting for everyone!

**🌎 Choose Your Favorite Design:**

- 🌍 Earth – Explore our beautiful planet.
- 🌌 Galaxy – Journey through the wonders of space.
- 🦁 Lion – Experience the majesty of the animal kingdom.
- 🌕 Moon – Discover the beauty of the lunar surface.
- 🐠 Ocean – Dive into a colorful underwater paradise.
- 🎨 Plus additional designs from our available collection!

**🎁 Your Reward Includes:**

- Your choice of ONE puzzle design from our available selection.
- 3D-printable-style spherical puzzle pieces.
- An exciting, hands-on puzzle-building experience.
- Compatibility with the Sphere of Kings spherical game board system.

**👨‍👩‍👧‍👦 Fun for the Whole Family!**

Designed to bring children, parents, friends, and puzzle enthusiasts together, our spherical puzzles encourage creativity, problem-solving, patience, and family bonding.

**⭐ Choose It. Build It. Display It!**

Select your favorite design and experience puzzle building in a whole new dimension!

**Important:** This reward includes one selected puzzle design, not every design shown. The Sphere of Kings game board and other game sets are sold separately unless specifically included in your selected reward.

*Back us on Kickstarter and become part of the Sphere of Kings adventure!*`,
  },

  // #7 — main item AND add-on
  {
    slug: "custom-photo-to-3d",
    name: "Custom Photo-to-3D Sphere Puzzle",
    tagline: "Your memories. Your creation. Your kingdom.",
    description:
      "Turn your favorite memories into an amazing 3D puzzle adventure!\n\nImagine transforming a treasured family photo, beloved pet, favorite character, or original artwork into a one-of-a-kind spherical puzzle. With the Custom Photo-to-3D Sphere Puzzle, you can upload your own image and have it transformed into a simplified, 3D-printable puzzle design made for the Sphere of Kings gaming system.\n\nHow it works:\n1. Upload your image: Choose your favorite photo, artwork, or personal design.\n2. We convert it: Our team transforms your image into a simplified 3D-printable spherical puzzle design.\n3. We prepare your puzzle: Your design is adapted into individual interlocking puzzle pieces with simplified shapes, colors, and details.\n4. Print, assemble & play: Bring your custom creation to life and enjoy assembling your personalized spherical masterpiece.\n\nReward highlights:\n• Personalized spherical puzzle featuring your submitted image.\n• Unique 3D puzzle design created specifically for you.\n• Simplified details designed for practical 3D printing.\n• A memorable activity for families, children, and adults.\n• Great for birthdays, holidays, personalized gifts, and special memories.\n• Part of the innovative Sphere of Kings 7 IN 1 gaming collection.\n\nImportant: Submitted images will be simplified for 3D printing. Final puzzle designs may have fewer colors and less detail than the original image. All submissions are subject to design feasibility and content review.",
    image: "/images/products/custom-photo-to-3d.jpg",
    alt: "Custom Photo-to-3D Sphere Puzzle — four-step process from photo to printed puzzle",
    priceApproved: true,
    price: { amount: 99, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 7, category: "reward",
    requiresPhotoUpload: true,
    addonSlugs: COMMON_ADDON_SLUGS.filter((s) => s !== "custom-photo-to-3d"),
    fullDescription: `# 👑 Custom Photo-to-3D Sphere Puzzle
*Sphere of Kings – 7 IN 1 Collection*

**Turn Your Favorite Memories Into an Amazing 3D Puzzle Adventure!**

Imagine transforming a treasured family photo, beloved pet, favorite character, or original artwork into a one-of-a-kind spherical puzzle!

With the **Custom Photo-to-3D Sphere Puzzle**, you can upload your own image and have it transformed into a simplified, 3D-printable puzzle design made for the Sphere of Kings gaming system.

## 🎨 How It Works

1. **Upload Your Image:** Choose your favorite photo, artwork, or personal design.
2. **We Convert It:** Our team transforms your image into a simplified 3D-printable spherical puzzle design.
3. **We Prepare Your Puzzle:** Your design is adapted into individual interlocking puzzle pieces with simplified shapes, colors, and details.
4. **Print, Assemble & Play:** Bring your custom creation to life and enjoy assembling your personalized spherical masterpiece!

## 👑 Reward Highlights

- Personalized spherical puzzle featuring your submitted image.
- Unique 3D puzzle design created specifically for you.
- Simplified details designed for practical 3D printing.
- A memorable activity for families, children, and adults.
- Great for birthdays, holidays, personalized gifts, and special memories.
- Part of the innovative Sphere of Kings 7 IN 1 gaming collection.

## ❤️ Your Memories. Your Creation. Your Kingdom.

Whether it's your child's artwork, your family pet, a beautiful landscape, or a special moment worth remembering, Sphere of Kings brings your imagination into a whole new dimension.

**Important:** Submitted images will be simplified for 3D printing. Final puzzle designs may have fewer colors and less detail than the original image. All submissions are subject to design feasibility and content review.

**Make It Personal. Make It Memorable. Make It Yours!**

*Sphere of Kings – Where Every Puzzle Tells a Story!*`,
  },

  /* ----------------------- BUNDLE REWARDS ------------------------- *
   * Multi-board Royal Checkers bundles. Still rewards per owner's
   * ordering — they come after the single-item rewards but BEFORE the
   * add-ons section.
   * ---------------------------------------------------------------- */

  // #8 — reward (bundle)
  {
    slug: "royal-checkers-3pack",
    name: "Sphere of Kings – Royal Checkers 3-Pack Bundle | Checkers Included",
    tagline: "Three boards. Endless royal battles.",
    description:
      "Triple the games. Triple the fun. One royal experience!\n\nBring family and friends together with the Sphere of Kings Royal Checkers 3-Pack Bundle! This exclusive Kickstarter reward includes three complete spherical checkers game boards, each featuring its own unique two-color design and matching checkers pieces.\n\nWhat's included:\n• 3 Sphere of Kings spherical game boards\n• 3 complete sets of Royal Checkers pieces\n• Three unique two-color board designs\n• Magnetic game pieces for secure placement\n• Durable, 3D-printed construction\n• Access to additional game accessories and upgrades through available add-ons\n\nWhy you'll love this bundle:\n• Three complete games — perfect for family nights, friendly competitions, and tournaments.\n• Unique spherical design — go beyond the flat board.\n• Magnetic game pieces — secure around the sphere.\n• Family-friendly entertainment — adults, teenagers, and children (with supervision).\n• Customizable — expand with available game pieces, puzzles, and accessories.\n• Perfect for gifts — three complete games in one bundle.\n\nAdditional game modes, Imperial Kings pieces, puzzle sets, and other accessories are not included unless purchased separately as add-ons.",
    image: "/images/products/royal-checkers-3pack.jpg",
    alt: "Royal Checkers 3-pack bundle — three spherical game boards with magnetic checkers",
    priceApproved: true,
    price: { amount: 510, currency: "USD" },
    inventoryCap: 500, unitsSold: 0, purchasable: true,
    sortOrder: 8, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two colours — applied uniformly across all 3 boards in this bundle.",
    },
    fullDescription: `## 👑 Sphere of Kings – Royal Checkers 3-Pack Bundle | Checkers Included

**Triple the Games. Triple the Fun. One Royal Experience!**

Bring family and friends together with the **Sphere of Kings Royal Checkers 3-Pack Bundle!** This exclusive Kickstarter reward includes three complete spherical checkers game boards, each featuring its own unique two-color design and matching checkers pieces.

Experience a whole new dimension of checkers with our innovative 3D spherical game boards, designed to bring strategy, creativity, and excitement to every match!

### 🎁 What's Included

- **3 Sphere of Kings spherical game boards**
- **3 complete sets of Royal Checkers pieces**
- Three unique two-color board designs
- Magnetic game pieces for secure placement
- Durable, 3D-printed construction
- Access to additional game accessories and upgrades through available add-ons

### 🌟 Why You'll Love This Bundle

- ✅ **Three Complete Games** – Enjoy three separate Royal Checkers sets for family game nights, friendly competitions, and tournaments.
- ✅ **Unique Spherical Design** – Take traditional checkers beyond the flat board with an exciting three-dimensional playing experience.
- ✅ **Magnetic Game Pieces** – Designed to stay securely positioned around the spherical playing surface.
- ✅ **Family-Friendly Entertainment** – Great for adults, teenagers, and children with appropriate supervision.
- ✅ **Customizable Experience** – Expand your Sphere of Kings collection with additional available game pieces, puzzles, and accessories.
- ✅ **Perfect for Gifts** – Three complete games make an excellent choice for families, collectors, game enthusiasts, and special occasions.

### 👑 Three Boards. Endless Royal Battles!

Whether you're challenging friends, introducing your children to strategy games, or building your Sphere of Kings collection, this 3-pack delivers three exciting Royal Checkers experiences.

*Back Sphere of Kings on Kickstarter and bring home the Royal Checkers 3-Pack Bundle!*

Additional game modes, Imperial Kings pieces, puzzle sets, and other accessories are not included in this reward unless purchased separately as add-ons.

**Sphere of Kings – Where Every Move Is Royal!**`,
  },

  // #9 — reward (bundle)
  {
    slug: "royal-checkers-5pack",
    name: "Sphere of Kings – Royal Checkers 5-Pack Bundle | Checkers Included",
    tagline: "Five kingdoms. One royal experience.",
    description:
      "Five boards. Five royal battles. Endless family fun!\n\nTake your game nights to the next level with the Sphere of Kings Royal Checkers 5-Pack Bundle. This exclusive Kickstarter reward includes five complete spherical checkers game boards, each with its own exciting two-color design and matching magnetic checkers pieces.\n\nWhat's included:\n• 5 complete Sphere of Kings spherical game boards\n• 5 full sets of Royal Checkers game pieces\n• Five unique two-color board designs\n• Magnetic checkers pieces for secure placement\n• Durable, 3D-printed spherical construction\n• Individual game boards with their own stands\n• Access to additional game accessories and upgrades through available add-ons\n\nFive complete games, perfect for multiple players and simultaneous matches. Great for schools, tournaments, families, and group gatherings.\n\nThis reward includes Royal Checkers game pieces only. Imperial Kings pieces, puzzle sets, and other accessories are available separately as add-ons.",
    image: "/images/products/royal-checkers-5pack.jpg",
    alt: "Royal Checkers 5-pack bundle — five spherical game boards in five color schemes",
    priceApproved: true,
    price: { amount: 805, currency: "USD" },
    inventoryCap: 300, unitsSold: 0, purchasable: true,
    sortOrder: 9, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two colours — applied uniformly across all 5 boards. We'll vary accents per sphere so no two are identical.",
    },
    fullDescription: `# 👑 Sphere of Kings – Royal Checkers 5-Pack Bundle | Checkers Included

**Five Boards. Five Royal Battles. Endless Family Fun!**

Take your game nights to the next level with the **Sphere of Kings Royal Checkers 5-Pack Bundle!** This exclusive Kickstarter reward includes five complete spherical checkers game boards, each featuring its own exciting two-color design and matching magnetic checkers pieces.

Experience the thrill of traditional checkers reimagined on a revolutionary 3D spherical playing surface. Perfect for families, friends, collectors, schools, game clubs, and friendly competitions!

## 🎁 What's Included

- **5 complete Sphere of Kings spherical game boards**
- **5 full sets of Royal Checkers game pieces**
- Five unique two-color board designs
- Magnetic checkers pieces for secure placement
- Durable, 3D-printed spherical construction
- Individual game boards with their own stands
- Access to additional game accessories and upgrades through available add-ons

## 🌟 Why Choose the 5-Pack Bundle?

- ✅ **Five Complete Games** – Enjoy five individual Royal Checkers sets, perfect for multiple players and simultaneous games.
- ✅ **Five Unique Color Combinations** – Each spherical board features two contrasting colors, creating a distinctive playing experience.
- ✅ **Revolutionary 3D Gameplay** – Move beyond traditional flat checkers boards and discover the excitement of spherical strategy.
- ✅ **Magnetic Game Pieces** – Specially designed to stay securely positioned around the curved playing surface.
- ✅ **Perfect for Families and Groups** – Bring generations together through strategy, friendly competition, and interactive entertainment.
- ✅ **Great for Schools and Tournaments** – Five complete boards make it easy to organize group activities, competitions, and game nights.
- ✅ **Expandable Gaming Experience** – Customize your collection with additional available accessories, game pieces, and puzzle upgrades.

## 👑 Five Kingdoms. One Royal Experience!

Imagine five exciting checkers matches happening at once, with friends and family competing to become the ultimate Royal Checkers champion!

Whether you're building your personal collection, organizing a tournament, or giving unforgettable gifts, the **Sphere of Kings Royal Checkers 5-Pack Bundle** delivers a unique gaming experience.

### 🚀 Become a Kickstarter Backer!

Support the launch of Sphere of Kings and be among the first to experience our innovative spherical board game system.

*This reward includes Royal Checkers game pieces only. Imperial Kings pieces, puzzle sets, and other accessories are available separately as add-ons.*

**Sphere of Kings – Where Every Move Is Royal!**`,
  },

  // #10 — reward (bundle)
  {
    slug: "royal-checkers-10pack",
    name: "Sphere of Kings – Royal Checkers 10-Pack Bundle | Checkers Included",
    tagline: "10 boards. 10 kingdoms. Endless royal battles.",
    description:
      "10 complete games. 10 unique designs. One legendary royal experience!\n\nThe Sphere of Kings Royal Checkers 10-Pack Bundle brings family game nights, friendly competitions, and tournaments to an entirely new level. Each of the 10 spherical boards features a distinctive two-color design and its own matching set of magnetic Royal Checkers pieces.\n\nWhat's included:\n• 10 complete Sphere of Kings spherical game boards\n• 10 full sets of Royal Checkers game pieces\n• 10 distinctive two-color board designs\n• Magnetic checkers pieces designed for secure placement\n• Durable, 3D-printed spherical construction\n• Individual stands for all 10 game boards\n• Access to additional game accessories and upgrades through available add-ons\n\nPerfect for tournaments — host friendly competitions at schools, community centers, game clubs, churches, and family gatherings.\n\nImperial Kings pieces, puzzle sets, DIY kits, and other accessories are not included in this reward but may be purchased separately through available add-ons.",
    image: "/images/products/royal-checkers-10pack.jpg",
    alt: "Royal Checkers 10-pack bundle — ten spherical game boards in a tournament layout",
    priceApproved: true,
    price: { amount: 1522, currency: "USD" },
    inventoryCap: 200, unitsSold: 0, purchasable: true,
    sortOrder: 10, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two base colours. 10-pack bundles ship with varied accent combinations across the set so each board feels distinct.",
    },
    fullDescription: `# 👑 Sphere of Kings – Royal Checkers 10-Pack Bundle | Checkers Included

**10 Complete Games. 10 Unique Designs. One Legendary Royal Experience!**

Take family game nights, friendly competitions, and tournaments to an entirely new level with the **Sphere of Kings Royal Checkers 10-Pack Bundle!**

This exclusive Kickstarter reward includes **10 complete spherical checkers game boards**, each featuring a distinctive two-color design and its own matching set of magnetic Royal Checkers pieces.

Forget ordinary flat game boards! Sphere of Kings introduces an exciting three-dimensional playing experience that combines strategy, creativity, and entertainment in one extraordinary collection.

## 🎁 What's Included

- **10 complete Sphere of Kings spherical game boards**
- **10 full sets of Royal Checkers game pieces**
- 10 distinctive two-color board designs
- Magnetic checkers pieces designed for secure placement
- Durable, 3D-printed spherical construction
- Individual stands for all 10 game boards
- Access to additional game accessories and upgrades through available add-ons

## 🌟 Why Choose the Royal Checkers 10-Pack?

- ✅ **10 Complete Games** – Play multiple games simultaneously, organize tournaments, or share complete sets with friends and family.
- ✅ **10 Unique Color Combinations** – Enjoy a vibrant collection of spherical boards, each featuring two contrasting colors.
- ✅ **Revolutionary Spherical Gameplay** – Experience traditional checkers from an entirely new perspective with our innovative 3D game board design.
- ✅ **Magnetic Game Pieces** – Designed to stay securely positioned on the curved playing surface, making every move exciting.
- ✅ **Perfect for Tournaments** – Host friendly competitions at schools, community centers, game clubs, churches, and family gatherings.
- ✅ **Great for Families and Groups** – Encourage strategic thinking, friendly competition, and quality time together. Suitable for adults and children with appropriate supervision.
- ✅ **Excellent for Gifts and Collections** – With 10 complete games, this bundle is perfect for holiday gifts, collectors, organizations, and game enthusiasts.
- ✅ **Expandable Gaming System** – Explore additional game pieces, puzzles, and accessories through separately available add-ons.

## 🏆 Build Your Own Royal Checkers Tournament!

Imagine 10 Sphere of Kings boards set up for an exciting tournament, with players competing across multiple matches to claim the royal championship!

Whether you're organizing a school competition, hosting a community event, building a gaming collection, or sharing unforgettable experiences with family and friends, this bundle delivers entertainment on a whole new level.

## 🚀 Become Part of the Sphere of Kings Revolution!

By backing this Kickstarter reward, you're helping bring an innovative spherical board game system to families and gaming communities around the world.

**Your Royal Checkers 10-Pack Bundle includes 10 complete game boards and 10 matching checkers sets.**

*Imperial Kings pieces, puzzle sets, DIY kits, and other accessories are not included in this reward but may be purchased separately through available add-ons.*

**👑 10 Boards. 10 Kingdoms. Endless Royal Battles!**

**Sphere of Kings – Where Every Move Is Royal!**`,
  },

  // #11 — reward (bundle)
  {
    slug: "royal-checkers-20pack",
    name: "Sphere of Kings – Royal Checkers 20-Pack Bundle | Checkers Included",
    tagline: "20 boards. 20 kingdoms. Unlimited royal possibilities.",
    description:
      "20 complete games. 20 royal kingdoms. One extraordinary gaming experience!\n\nThe Royal Checkers 20-Pack Bundle is perfect for families, schools, churches, community centers, game clubs, tournaments, retailers, and collectors. It transforms traditional checkers into an exciting three-dimensional experience across 20 complete spherical boards.\n\nWhat's included:\n• 20 complete Sphere of Kings spherical game boards\n• 20 full sets of Royal Checkers game pieces\n• 20 distinctive two-color board designs\n• Magnetic checkers pieces designed for secure placement\n• Durable, 3D-printed spherical construction\n• Individual stands for all 20 game boards\n• Access to additional games, accessories, and upgrades through available add-ons\n\nTournament-ready collection — host exciting Royal Checkers competitions with up to 20 games happening simultaneously.\n\nImperial Kings pieces, puzzle sets, DIY kits, and additional accessories are not included in this reward but may be purchased separately through available add-ons.",
    image: "/images/products/royal-checkers-20pack.jpg",
    alt: "Royal Checkers 20-pack bundle — twenty spherical game boards arranged for a championship",
    priceApproved: true,
    price: { amount: 2664, currency: "USD" },
    inventoryCap: 100, unitsSold: 0, purchasable: true,
    sortOrder: 11, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two base colours. 20-pack bundles ship with varied accent combinations across the set.",
    },
    fullDescription: `# 👑 Sphere of Kings – Royal Checkers 20-Pack Bundle | Checkers Included

**20 Complete Games. 20 Royal Kingdoms. One Extraordinary Gaming Experience!**

Bring the excitement of Sphere of Kings to an entirely new level with our **Royal Checkers 20-Pack Bundle!**

This exclusive Kickstarter reward includes **20 complete spherical checkers game boards**, each featuring a unique two-color design and its own complete set of magnetic Royal Checkers pieces.

Perfect for families, schools, churches, community centers, game clubs, tournaments, retailers, and collectors, this incredible bundle transforms traditional checkers into an exciting three-dimensional experience!

## 🎁 What's Included

- **20 complete Sphere of Kings spherical game boards**
- **20 full sets of Royal Checkers game pieces**
- 20 distinctive two-color board designs
- Magnetic checkers pieces designed for secure placement
- Durable, 3D-printed spherical construction
- Individual stands for all 20 game boards
- Access to additional games, accessories, and upgrades through available add-ons

## 🌟 Why Choose the Royal Checkers 20-Pack?

- ✅ **20 Complete Games** – Set up 20 individual games for family gatherings, group activities, competitions, or large-scale tournaments.
- ✅ **Unique Two-Color Designs** – Each board features two contrasting colors, creating an exciting and visually impressive collection.
- ✅ **Revolutionary Spherical Gameplay** – Experience a new dimension of strategy with checkers played across an innovative three-dimensional spherical surface.
- ✅ **Magnetic Game Pieces** – Specially designed magnetic checkers help keep pieces securely positioned around the curved game boards.
- ✅ **Perfect for Schools and Organizations** – Bring strategic entertainment to classrooms, after-school programs, youth groups, churches, and community centers.
- ✅ **Tournament-Ready Collection** – Host exciting Royal Checkers competitions with up to 20 games happening simultaneously.
- ✅ **Excellent for Gifts and Group Purchases** – Share complete game sets with family members, friends, students, or fellow gaming enthusiasts.
- ✅ **Expandable Gaming System** – Discover additional game modes, Imperial Kings pieces, customizable puzzles, DIY kits, and accessories through separately available add-ons.

## 🏆 Create Your Own Royal Checkers Championship!

Imagine an entire room filled with Sphere of Kings boards, where players compete across 20 exciting matches to become the ultimate Royal Checkers champion!

From family game nights to organized tournaments, this 20-pack gives you the opportunity to create unforgettable experiences and introduce more people to the excitement of spherical strategy gaming.

Whether you're purchasing for an organization, starting a game club, preparing for tournaments, or building an impressive collection, the **Sphere of Kings Royal Checkers 20-Pack Bundle** offers an extraordinary way to bring people together.

## 🚀 Be Part of the Sphere of Kings Revolution!

Your Kickstarter pledge helps bring our innovative spherical board game system to families and gaming communities around the world.

**Your reward includes 20 complete spherical game boards and 20 matching sets of Royal Checkers pieces.**

*Imperial Kings pieces, puzzle sets, DIY kits, and additional accessories are not included in this reward but may be purchased separately through available add-ons.*

### 👑 20 Boards. 20 Kingdoms. Unlimited Royal Possibilities!

**Sphere of Kings – Where Every Move Is Royal!**`,
  },

  // #12 — reward (bundle)
  {
    slug: "royal-checkers-50pack",
    name: "Sphere of Kings – Royal Checkers 50-Pack Bundle | Checkers Included",
    tagline: "50 boards. 50 kingdoms. 100 players. One royal championship.",
    description:
      "50 complete games. 50 royal kingdoms. One ultimate gaming experience!\n\nOur ultimate large-quantity Kickstarter reward designed for schools, churches, tournaments, retailers, organizations, collectors, and gaming enthusiasts.\n\nWhat's included:\n• 50 complete Sphere of Kings spherical game boards\n• 50 full sets of Royal Checkers game pieces\n• A variety of exciting two-color board designs\n• Magnetic checkers pieces designed for secure placement\n• Durable, 3D-printed spherical construction\n• Individual stands for all 50 game boards\n• Access to additional game accessories and upgrades through available add-ons\n\nUltimate tournament package — organize exciting competitions with up to 50 games happening simultaneously, allowing as many as 100 players to compete in head-to-head matches.\n\nPerfect for schools, retailers, organizations, and group purchases. Imperial Kings pieces, puzzle sets, DIY kits, and additional accessories are not included in this reward but may be purchased separately through available add-ons.",
    image: "/images/products/royal-checkers-50pack.jpg",
    alt: "Royal Checkers 50-pack bundle — fifty spherical game boards in a warehouse fulfillment layout",
    priceApproved: true,
    price: { amount: 6713, currency: "USD" },
    inventoryCap: 50, unitsSold: 0, purchasable: true,
    sortOrder: 12, category: "reward", addonSlugs: COMMON_ADDON_SLUGS,
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two base colours. 50-pack bundles ship with a wide variety of accent combinations so every sphere is distinctive.",
    },
    fullDescription: `# 👑 Sphere of Kings – Royal Checkers 50-Pack Bundle | Checkers Included

**50 Complete Games. 50 Royal Kingdoms. One Ultimate Gaming Experience!**

Introducing the **Sphere of Kings Royal Checkers 50-Pack Bundle**, our ultimate large-quantity Kickstarter reward designed for schools, churches, tournaments, retailers, organizations, collectors, and gaming enthusiasts!

This incredible bundle includes **50 complete spherical checkers game boards**, each featuring a distinctive two-color design and its own complete set of magnetic Royal Checkers pieces.

Transform ordinary game nights into extraordinary events with our innovative 3D spherical gaming system!

## 🎁 What's Included

- **50 complete Sphere of Kings spherical game boards**
- **50 full sets of Royal Checkers game pieces**
- A variety of exciting two-color board designs
- Magnetic checkers pieces designed for secure placement
- Durable, 3D-printed spherical construction
- Individual stands for all 50 game boards
- Access to additional game accessories and upgrades through available add-ons

## 🌟 Why Choose the Royal Checkers 50-Pack?

- ✅ **50 Complete Games** – Enjoy 50 individual Royal Checkers sets, perfect for large gatherings, group competitions, and organized events.
- ✅ **Incredible Color Variety** – Experience an impressive collection of spherical game boards featuring vibrant two-color combinations.
- ✅ **Revolutionary 3D Gameplay** – Discover a new dimension of strategy as traditional checkers meets our innovative spherical playing surface.
- ✅ **Magnetic Game Pieces** – Specially designed to stay securely positioned around the curved game boards.
- ✅ **Ultimate Tournament Package** – Organize exciting competitions with up to 50 games happening simultaneously, allowing as many as 100 players to compete in head-to-head matches.
- ✅ **Perfect for Schools and Organizations** – Equip classrooms, recreation centers, youth programs, churches, community centers, and game clubs with a complete collection.
- ✅ **Excellent for Retailers and Group Purchases** – Ideal for businesses, event organizers, gift programs, and anyone looking to purchase multiple complete games.
- ✅ **Great for Families and All Generations** – Encourage strategic thinking, friendly competition, teamwork, and unforgettable memories. Children should play with appropriate adult supervision.
- ✅ **Expandable Gaming System** – Add Imperial Kings pieces, customizable puzzles, DIY painting kits, and other available accessories to expand your gaming experience.

## 🏆 Host the Ultimate Royal Checkers Championship!

Imagine an entire tournament hall filled with **50 Sphere of Kings game boards**, where up to 100 players compete simultaneously to become the ultimate Royal Checkers champion!

From local community competitions to school tournaments, gaming conventions, and large family gatherings, this bundle opens the door to exciting possibilities.

Whether you're starting a gaming club, organizing a major tournament, supplying an organization, or building an impressive collection, the **Royal Checkers 50-Pack Bundle** delivers an extraordinary experience.

## 👑 Build Your Own Kingdom of Champions!

With 50 complete games, you can introduce Sphere of Kings to more people, host multiple competitions, distribute games as gifts, or create your own Royal Checkers gaming community.

This bundle represents an exciting opportunity to become part of the Sphere of Kings journey and help bring spherical strategy gaming to players around the world.

## 🚀 Become a Sphere of Kings Kickstarter Backer!

Your pledge helps support the production and launch of our innovative spherical board game system.

**Your reward includes 50 complete spherical game boards and 50 matching sets of Royal Checkers pieces.**

*Imperial Kings pieces, puzzle sets, DIY kits, and additional accessories are not included in this reward but may be purchased separately through available add-ons.*

### 👑 50 Boards. 50 Kingdoms. 100 Players. One Royal Championship!

**Sphere of Kings – Where Every Move Is Royal!**`,
  },

  /* -------------------- ADD-ONS (owner says: last) ----------------- */

  // #13 — addon
  {
    slug: "royal-checkers-pieces",
    name: "Royal Checkers – Complete Game Pieces Set",
    tagline: "Build your collection. Crown your kings. Rule the sphere.",
    description:
      "Upgrade your Sphere of Kings experience with the Royal Checkers Game Pieces Set!\n\nBring classic checkers to a whole new level with our beautifully designed red and black game pieces, created specifically for the Sphere of Kings spherical gaming system.\n\nEach piece features a sleek, durable, stackable design with integrated magnets for secure placement on your compatible spherical game board.\n\nReward features:\n• Complete red and black Royal Checkers game pieces set\n• Magnetic design for secure gameplay\n• Stackable pieces for crowning your kings\n• Premium-looking, 3D-printed construction\n• Designed for the Sphere of Kings gaming system\n• Great for family game nights, friendly competitions, and players of different ages\n\nImportant: This reward includes the Royal Checkers game pieces ONLY. The spherical game board is sold separately.",
    image: "/images/products/royal-checkers-pieces.jpg",
    alt: "Royal Checkers complete game pieces — red and black magnetic set",
    priceApproved: true,
    price: { amount: 69, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 13, category: "addon",
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick two colours for your red-and-black equivalent — eg red + white, blue + gold.",
    },
    fullDescription: `## 👑 Royal Checkers – Complete Game Pieces Set

**Upgrade your Sphere of Kings experience with the Royal Checkers Game Pieces Set!**

Bring classic checkers to a whole new level with our beautifully designed red and black game pieces, created specifically for the Sphere of Kings spherical gaming system.

Each piece features a sleek, durable, stackable design with integrated magnets for secure placement on your compatible spherical game board.

**Reward Features:**

- 🔴 Complete red and black Royal Checkers game pieces set
- 🧲 Magnetic design for secure gameplay
- 👑 Stackable pieces for crowning your kings
- 🎨 Premium-looking, 3D-printed construction
- ♟️ Designed for the Sphere of Kings gaming system
- 👨‍👩‍👧‍👦 Great for family game nights, friendly competitions, and players of different ages

**Important:** This reward includes the Royal Checkers game pieces ONLY. The spherical game board is sold separately.

**Build your collection. Crown your kings. Rule the sphere!**

Experience Royal Checkers like never before with *Sphere of Kings 7 IN 1!*`,
  },

  // #14 — addon
  {
    slug: "imperial-kings-pieces",
    name: "Imperial Kings – Complete Game Pieces Set",
    tagline: "Rule the kingdom. Master the strategy. Claim your crown.",
    description:
      "Bring the excitement of royalty, strategy, and competition to life with the Imperial Kings Game Pieces Set, exclusively designed for the Sphere of Kings 7-in-1 Gaming System!\n\nThis premium collection features beautifully designed black and white chess-style pieces, bringing a royal touch to every move and making game night an unforgettable experience for families, friends, and players of all ages.\n\nWhat's included:\n• Complete set of black Imperial Kings game pieces\n• Complete set of white Imperial Kings game pieces\n• Kings, Queens, Rooks, Knights, Bishops, and Pawns\n• Durable, precision-crafted 3D-printed designs\n• Designed for compatibility with the Sphere of Kings spherical gaming board\n\nImportant: This reward includes the Imperial Kings game pieces ONLY. The Sphere of Kings spherical game board is sold separately.",
    image: "/images/products/imperial-kings-pieces.jpg",
    alt: "Imperial Kings complete game pieces — black and white chess-style set",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 14, category: "addon",
    colorable: {
      pattern: "two-color",
      defaultColors: ["pure-white", "jet-black"],
      helper: "Pick two colours for your white-and-black Imperial Kings equivalent.",
    },
    fullDescription: `# Imperial Kings – Complete Game Pieces Set

**Rule the Kingdom. Master the Strategy. Claim Your Crown!**

Bring the excitement of royalty, strategy, and competition to life with the **Imperial Kings Game Pieces Set**, exclusively designed for the Sphere of Kings 7-in-1 Gaming System!

This premium collection features beautifully designed black and white chess-style pieces, bringing a royal touch to every move and making game night an unforgettable experience for families, friends, and players of all ages.

## What's Included:

- Complete set of black Imperial Kings game pieces
- Complete set of white Imperial Kings game pieces
- Kings, Queens, Rooks, Knights, Bishops, and Pawns
- Durable, precision-crafted 3D-printed designs
- Designed for compatibility with the Sphere of Kings spherical gaming board

## Why You'll Love It:

- **Royal Design:** Elegant pieces inspired by classic chess with a premium appearance.
- **Strategic Entertainment:** Challenge your mind while enjoying exciting competition.
- **Family-Friendly:** Perfect for family game nights, friendly matches, and competitive players.
- **Unique Gaming Experience:** Take traditional chess-style gameplay to a whole new dimension with Sphere of Kings.
- **Collectible Quality:** A distinctive addition to your growing Sphere of Kings collection.

### Important Reward Information

This reward includes the Imperial Kings game pieces ONLY. The Sphere of Kings spherical game board is sold separately.

### Back Our Kickstarter Today!

Become part of the Sphere of Kings revolution and help bring a new generation of innovative tabletop gaming to families around the world.

**One Sphere. Endless Possibilities. Rule Your Kingdom!**`,
  },

  // #15 — addon
  {
    slug: "diy-puzzle-pieces",
    name: "Sphere of Kings – DIY Paint Your Own Puzzle Pieces",
    tagline: "Paint it. Create it. Make it your own.",
    description:
      "Unleash your creativity with the Sphere of Kings DIY Puzzle Pieces Kit! Transform blank 3D puzzle pieces into your very own colorful masterpiece. Whether you're painting planets, animals, patterns, landscapes, or your own imaginative designs, the possibilities are endless.\n\nPerfect for children, families, adults, artists, and puzzle enthusiasts, this interactive experience combines creativity, hands-on learning, and the excitement of building something truly unique.\n\nWhat's included:\n• Blank, paintable 3D spherical puzzle pieces\n• Colorful paint kit for personalizing your pieces\n• Paintbrushes for creating your designs\n• Puzzle pieces designed to fit together into a spherical creation\n• Endless opportunities to create your own masterpiece\n\nReward includes the DIY puzzle pieces and painting supplies. The spherical game board is sold separately unless specifically included in your selected reward.",
    image: "/images/products/diy-puzzle-pieces.jpg",
    alt: "DIY paint-your-own puzzle pieces with multicolor paint kit",
    priceApproved: true,
    price: { amount: 69, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 15, category: "addon",
    fullDescription: `## 👑 Sphere of Kings 7-in-1 – DIY Paint Your Own Puzzle Pieces

**Paint It. Create It. Make It Your Own!**

Unleash your creativity with the **Sphere of Kings DIY Puzzle Pieces Kit!** Transform blank 3D puzzle pieces into your very own colorful masterpiece. Whether you're painting planets, animals, patterns, landscapes, or your own imaginative designs, the possibilities are endless!

Perfect for children, families, adults, artists, and puzzle enthusiasts, this interactive experience combines creativity, hands-on learning, and the excitement of building something truly unique.

### 🎨 What's Included

- Blank, paintable 3D spherical puzzle pieces
- Colorful paint kit for personalizing your pieces
- Paintbrushes for creating your designs
- Puzzle pieces designed to fit together into a spherical creation
- Endless opportunities to create your own masterpiece!

### 🌟 Why You'll Love It

- **Create Your Own Designs:** Paint each piece however you imagine.
- **Fun for All Ages:** Enjoy creative family time, with adult supervision for younger children.
- **Educational & Interactive:** Encourage creativity, problem-solving, patience, and coordination.
- **Personalized Masterpiece:** No two finished puzzles have to look alike!
- **Build & Display:** Assemble your painted pieces and proudly display your finished creation.
- **A Unique Gift:** Perfect for birthdays, holidays, Christmas, and family activities.

### 👑 Become the Creator!

With Sphere of Kings, you're not just solving a puzzle — **you're creating your own world!**

Every brushstroke brings your imagination to life, turning ordinary puzzle pieces into an extraordinary spherical work of art.

*Back our Kickstarter today and bring creativity, imagination, and family fun together with Sphere of Kings 7-in-1!*

Reward includes the DIY puzzle pieces and painting supplies. The spherical game board is sold separately unless specifically included in your selected reward.`,
  },

  // #16 — addon
  {
    slug: "royal-checkers-diy",
    name: "Royal Checkers – DIY Paint Your Own Game Pieces",
    tagline: "Create it. Paint it. Make it royal.",
    description:
      "Bring your creativity to life with the Sphere of Kings 7-in-1 Royal Checkers DIY Game Pieces Kit!\n\nTurn ordinary game pieces into your own royal masterpieces. This exciting hands-on experience lets kids, families, and adults customize their Royal Checkers pieces with their favorite colors, patterns, and creative designs.\n\nWhat's included:\n• Royal Checkers DIY game pieces, ready to customize\n• Paint kit with multiple colors\n• Paintbrushes for creative decorating\n• Beautiful 3D-printed checker pieces featuring royal crown designs\n• Built-in magnets positioned underneath each piece for compatibility with the Sphere of Kings magnetic game board\n\nImportant: This reward includes the DIY Royal Checkers game pieces and painting supplies only. The Sphere of Kings game board is sold separately.",
    image: "/images/products/royal-checkers-diy.jpg",
    alt: "Royal Checkers DIY paint-your-own game pieces with brushes and paint",
    priceApproved: true,
    price: { amount: 69, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 16, category: "addon",
    fullDescription: `# 👑 Royal Checkers – DIY Paint Your Own Game Pieces

**Create It. Paint It. Make It Royal!**

Bring your creativity to life with the **Sphere of Kings 7-in-1 Royal Checkers DIY Game Pieces Kit!**

Turn ordinary game pieces into your own royal masterpieces! This exciting hands-on experience lets kids, families, and adults customize their Royal Checkers pieces with their favorite colors, patterns, and creative designs.

### 🎨 What's Included

- Royal Checkers DIY game pieces, ready to customize.
- Paint kit with multiple colors.
- Paintbrushes for creative decorating.
- Beautiful 3D-printed checker pieces featuring royal crown designs.
- Built-in magnets positioned underneath each piece for compatibility with the Sphere of Kings magnetic game board.

### 👑 Why You'll Love It

- **Unlimited Creativity:** Design your pieces however you imagine!
- **Family Fun:** A creative activity for parents, children, and friends.
- **Make It Personal:** Create your own royal colors, teams, and styles.
- **Magnetic Design:** Each piece features a bottom-mounted magnet for gameplay.
- **Fun for All Ages:** Perfect for family activities, gifts, and game enthusiasts. Adult supervision is recommended for younger children.

### 🎁 A Reward Fit for Royalty!

Paint your kingdom, create your own royal team, and bring your imagination to the game!

**Important:** This reward includes the DIY Royal Checkers game pieces and painting supplies only. The Sphere of Kings game board is sold separately.

*Sphere of Kings 7-in-1 – Where Creativity Meets Royalty!*`,
  },

  // #17 — addon
  {
    slug: "imperial-kings-diy",
    name: "Imperial Kings – DIY Paint Your Own Game Pieces",
    tagline: "Create it. Paint it. Make it your kingdom.",
    description:
      "Unleash your creativity with the Sphere of Kings 7-in-1 Imperial Kings DIY Game Pieces! Transform classic royal game pieces into your very own masterpieces with this exciting, hands-on painting experience designed for families, kids, adults, and collectors.\n\nEach set features beautifully designed, 3D-printed Imperial Kings game pieces ready for you to customize. Choose your favorite colors, create royal designs, and bring your own kingdom to life.\n\nReward highlights:\n• Imperial Kings game pieces: a complete set of unpainted royal game pieces\n• Unlimited creativity: paint your pieces in any colors or designs you imagine\n• DIY family fun: enjoy a creative activity with friends and family\n• Unique royal designs: customize kings, queens, knights, bishops, rooks, and pawns\n• 3D-printed quality: carefully crafted pieces designed for painting and personalization\n• Perfect for gifts: a creative experience for chess enthusiasts, collectors, and families\n\nImportant: This reward features DIY Imperial Kings game pieces only. The spherical game board is sold separately. Finished painted pieces shown in promotional images are examples of possible customization.",
    image: "/images/products/imperial-kings-diy.jpg",
    alt: "Imperial Kings DIY paint-your-own game pieces, white blanks with painted example",
    priceApproved: true,
    price: { amount: 79, currency: "USD" },
    inventoryCap: 2000, unitsSold: 0, purchasable: true,
    sortOrder: 17, category: "addon",
    fullDescription: `# 👑 Imperial Kings – DIY Paint Your Own Game Pieces

**Create It. Paint It. Make It Your Kingdom!**

Unleash your creativity with the **Sphere of Kings 7-in-1 Imperial Kings DIY Game Pieces!** Transform classic royal game pieces into your very own masterpieces with this exciting, hands-on painting experience designed for families, kids, adults, and collectors.

Each set features beautifully designed, 3D-printed Imperial Kings game pieces ready for you to customize. Choose your favorite colors, create royal designs, and bring your own kingdom to life!

### 🎨 Reward Highlights

- 👑 **Imperial Kings Game Pieces:** A complete set of unpainted royal game pieces.
- 🎨 **Unlimited Creativity:** Paint your pieces in any colors or designs you imagine.
- 🖌️ **DIY Family Fun:** Enjoy a creative activity with friends and family.
- ♟️ **Unique Royal Designs:** Customize kings, queens, knights, bishops, rooks, and pawns.
- 🧩 **3D-Printed Quality:** Carefully crafted pieces designed for painting and personalization.
- 🎁 **Perfect for Gifts:** A creative experience for chess enthusiasts, collectors, and families.

### 👑 Build Your Own Kingdom!

Go beyond ordinary game pieces! Create golden kings, colorful knights, dazzling queens, or an entirely original royal army.

Every piece becomes a reflection of your imagination, making your Imperial Kings collection truly one of a kind.

**Important:** This reward features DIY Imperial Kings game pieces only. The spherical game board is sold separately. Finished painted pieces shown in promotional images are examples of possible customization.

*Back this reward today and bring your own royal kingdom to life with Sphere of Kings 7-in-1!*`,
  },

  // #18 — addon
  {
    slug: "game-board-only",
    name: "Sphere of Kings – Game Board Only (No Game Pieces)",
    tagline: "Create your kingdom. Choose your games. Rule your sphere.",
    description:
      "Experience the foundation of Sphere of Kings with our premium 3D-printed spherical game board, designed for creativity, strategy, and endless possibilities.\n\nThis reward includes the Sphere of Kings game board only, giving you the freedom to purchase your favorite game pieces and puzzle sets separately.\n\nWhat's included:\n• 1 Sphere of Kings 3D-printed spherical game board\n• Integrated magnetic system for compatible game pieces\n• Durable, carefully assembled construction\n• Protective lid for storage and transportation\n• Compatible with our expanding collection of Sphere of Kings games and accessories\n\nPlease note: No checkers, chess pieces, puzzle pieces, paint kits, or other game pieces are included with this reward.\n\nPerfect for collectors, families, and players who want to customize their Sphere of Kings experience.",
    image: "/images/products/game-board-only.jpg",
    alt: "Sphere of Kings game board only — red and black spherical board with no pieces",
    priceApproved: true,
    price: { amount: 129, currency: "USD" },
    inventoryCap: 1000, unitsSold: 0, purchasable: true,
    sortOrder: 18, category: "addon",
    colorable: {
      pattern: "two-color",
      defaultColors: ["royal-red", "jet-black"],
      helper: "Pick the two base colours for your board's checkered pattern.",
    },
    fullDescription: `### Reward Title

**Sphere of Kings – Game Board Only (No Game Pieces)**

### Kickstarter Reward Description

👑 **Build Your Kingdom Your Way!**

Experience the foundation of Sphere of Kings with our premium 3D-printed spherical game board, designed for creativity, strategy, and endless possibilities!

This reward includes the **Sphere of Kings game board only**, giving you the freedom to purchase your favorite game pieces and puzzle sets separately.

**What's Included:**

- 1 Sphere of Kings 3D-printed spherical game board
- Integrated magnetic system for compatible game pieces
- Durable, carefully assembled construction
- Protective lid for storage and transportation
- Compatible with our expanding collection of Sphere of Kings games and accessories

**Please Note:** No checkers, chess pieces, puzzle pieces, paint kits, or other game pieces are included with this reward.

**Create Your Kingdom. Choose Your Games. Rule Your Sphere!**

Perfect for collectors, families, and players who want to customize their Sphere of Kings experience.`,
  },
];
