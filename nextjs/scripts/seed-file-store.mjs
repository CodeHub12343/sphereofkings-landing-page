#!/usr/bin/env node
// Rewrites .data/products.json from the PRODUCTS catalog. Used when
// the file store gets corrupted by a race or needs a clean refresh.

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const mod = await import("../lib/products.ts");
await mkdir(".data", { recursive: true });
await writeFile(
  join(".data", "products.json"),
  JSON.stringify(mod.PRODUCTS, null, 2),
  "utf8",
);
console.log("wrote", mod.PRODUCTS.length, "products to .data/products.json");
