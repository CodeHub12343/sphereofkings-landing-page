#!/usr/bin/env node
// Seed three publishable posts into Mongo. Idempotent — upserts by slug.
//
// Usage: MONGODB_URI=... node scripts/seed-blog.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }
const dbName = process.env.MONGODB_DB ?? "sphereofkings";

const now = new Date().toISOString();
const author = "James Bowser";
const posts = [
  {
    slug: "introducing-sphere-of-kings",
    title: "Introducing Sphere of Kings",
    excerpt: "A 7-in-1 spherical board game that lets a family of mixed ages share one table.",
    bodyMarkdown: `# One table, many games

Most board games pick a lane. Sphere of Kings sits on seven of them at once —
Royal Checkers for the five-year-old, Imperial Kings for the chess club member,
the Spherical Puzzle for the quiet evenings, and four more.

The cylindrical geometry is the point. There is no edge of the board — the
left side meets the right side — so classic chess and checkers both change in
one specific way: your pieces can wrap through the seam.

## Where to start

- Order the physical set at the shop.
- Try [Royal Checkers in your browser](/play/royal-checkers).
- Read the full rules at [/content/rules/royal-checkers.md](/content/rules/royal-checkers.md).

The next post will go deep on the seam geometry — why "columns wrap, rows do not"
is the right choice.`,
    heroImageUrl: "/images/products/royal-checkers.jpg",
    tags: ["announcement", "founding"],
    status: "published",
    authorDisplayName: author,
    publishedAt: now,
    createdAt: now, updatedAt: now,
  },
  {
    slug: "why-the-seam",
    title: "Why the seam — cylindrical geometry explained",
    excerpt: "The board wraps along columns but not along rows. Here is why that is the only version that works.",
    bodyMarkdown: `# Column wrap vs row wrap

A sphere has no edges at all. A cylinder has two edges — top and bottom —
and seams on the long axis. We chose the cylinder because every classic
board game can be mapped onto it without changing move legality for most
pieces most of the time.

If rows wrapped too, a pawn pushing from "home" would exit at the top of
the board and re-enter at the bottom. The notion of "home row" and
"promotion" would stop making sense. The move set would stop looking like
chess or checkers.

If only columns wrap, the lateral directions become infinite — a rook can
slide across the seam forever — but no vertical rule breaks. Home rows,
promotion, en passant (coming in Phase 3), direction-of-attack for pawns
and checkers men — all preserved.

## The one place it does bend

Castling. On a cylinder with no edge-of-row, "the rook on the far side"
is ambiguous. ADR-0001 pins down castling to the *shorter* of the two
possible seam paths, and ADR-0002 defers the whole thing to Phase 3 of
the digital build.

## The puzzle library bakes this in

Try our [seam puzzles](/puzzles) — three difficulty tiers. The hardest
puzzle wraps twice in one combo.`,
    heroImageUrl: "/images/products/spherical-puzzle.jpg",
    tags: ["rules", "geometry"],
    status: "published",
    authorDisplayName: author,
    publishedAt: now,
    createdAt: now, updatedAt: now,
  },
  {
    slug: "roadmap-digital-platform",
    title: "The digital roadmap — eight phases to launch",
    excerpt: "What the Sphere of Kings online platform looks like, phase by phase, and what ships when.",
    bodyMarkdown: `# From a physical game to an online platform

The physical game shipped first. The online platform is a longer road —
eight distinct phases spanning twelve months. Each phase ships a usable
slice, so there is never a moment where "the website works, but you cannot
do anything on it".

## The eight phases

- **Phase 1** — Royal Checkers in your browser, vs a 3-tier AI.
- **Phase 2** — Imperial Kings, 1-100 difficulty slider, official puzzles.
- **Phase 3** — Accounts and Glicko-2 ratings, achievements.
- **Phase 4** — Real-time multiplayer. The hardest phase.
- **Phase 5** — Tournaments, brackets, champions page, regional leaderboards.
- **Phase 6** — Safety: parental consent, moderation, in-app notifications.
- **Phase 7** — The sphere painter and recorded-game replays.
- **Phase 8** — This blog you are reading, and the vlog.

Phases 1–8 are live now at [sphereofkings.com](/). Future phases cover
AI narration, custom-image sphere uploads, a public activity feed, and
paid tournaments.

Thanks for being here from the start.`,
    heroImageUrl: "/images/products/imperial-kings.jpg",
    tags: ["roadmap", "platform"],
    status: "published",
    authorDisplayName: author,
    publishedAt: now,
    createdAt: now, updatedAt: now,
  },
];

const client = new MongoClient(uri);
await client.connect();
try {
  const db = client.db(dbName);
  const col = db.collection("blogPosts");
  await col.createIndex({ slug: 1 }, { unique: true });
  for (const p of posts) {
    await col.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
  }
  console.log(`seeded ${posts.length} blog posts into ${dbName}.blogPosts`);
} finally {
  await client.close();
}
