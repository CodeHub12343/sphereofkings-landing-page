"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";
import {
  createProductRecord,
  deleteProductRecord,
  findProductBySlug,
  updateProductRecord,
} from "@/lib/db/collections/products";
import { Product } from "@/lib/products";

/* ------------------- Persistence actions --------------------------- */

export type CreateProductResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createProductAction(
  product: Product,
): Promise<CreateProductResult> {
  // Reject duplicate slug up front — nicer error than a Mongo
  // duplicate-key crash.
  const existing = await findProductBySlug(product.slug);
  if (existing) {
    return { ok: false, error: `Slug "${product.slug}" is already taken.` };
  }
  try {
    await createProductRecord(product);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the product.",
    };
  }
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "product.create",
    target: { collection: "products", id: product.slug },
    summary: `Created ${product.name}`,
    details: snapshot(product),
  });
  revalidatePathsForProducts();
  return { ok: true };
}

export async function updateProductAction(
  slug: string,
  patch: Partial<Product>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const before = await findProductBySlug(slug);
  if (!before) return { ok: false, error: "Product not found." };
  const after = await updateProductRecord(slug, patch);
  if (!after) return { ok: false, error: "Could not save the product." };
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "product.update",
    target: { collection: "products", id: slug },
    summary: `Edited ${after.name}`,
    details: diff(snapshot(before), snapshot(after)),
  });
  revalidatePathsForProducts();
  return { ok: true };
}

export async function deleteProductAction(
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await findProductBySlug(slug);
  if (!existing) return { ok: false, error: "Product not found." };
  const removed = await deleteProductRecord(slug);
  if (!removed) return { ok: false, error: "Could not delete the product." };
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "product.delete",
    target: { collection: "products", id: slug },
    summary: `Deleted ${existing.name}`,
  });
  revalidatePathsForProducts();
  return { ok: true };
}

/* ---------------- Helpers (audit snapshot, diff) ------------------- */

// Pull the audit-relevant fields out of a product. We clip any inline
// data-URL image to a short marker so the audit payload doesn't blow
// up with multi-megabyte base64 blobs.
function snapshot(p: Product): Record<string, unknown> {
  return {
    name: p.name,
    description: p.description,
    alt: p.alt,
    image: p.image.startsWith("data:")
      ? `data:[${p.image.length}bytes]`
      : p.image,
    priceApproved: p.priceApproved,
    price: p.price?.amount ?? null,
    inventoryCap: p.inventoryCap,
    unitsSold: p.unitsSold,
    purchasable: p.purchasable,
  };
}

function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of keys) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      out[k] = { from: before[k], to: after[k] };
    }
  }
  return out;
}

function revalidatePathsForProducts() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/audit");
  revalidatePath("/shop");
  // Specific product paths are revalidated opportunistically — the
  // broad "/shop" revalidation flushes the collection page, and a bad
  // slug 404s naturally.
}

/* --------------- Compat shim for existing audit calls -------------- */

// ProductsAdmin.tsx still imports `recordProductChangeAction` for the
// pre-persistence audit code path. Keep the symbol working by routing
// each kind through the real persistence action.

export type ProductAuditInput =
  | {
      kind: "create";
      slug: string;
      name: string;
      priceApproved: boolean;
      inventoryCap: number;
      purchasable: boolean;
    }
  | {
      kind: "update";
      slug: string;
      name: string;
      before: Record<string, unknown>;
      after: Record<string, unknown>;
    }
  | {
      kind: "delete";
      slug: string;
      name: string;
    };

export async function recordProductChangeAction(
  input: ProductAuditInput,
): Promise<{ ok: true }> {
  // Audit only — the UI calls the create/update/delete actions directly
  // for persistence. This shim lets older call-sites keep working if
  // they haven't been migrated yet.
  const actor = await currentAdminActor();
  const base = {
    actor,
    target: { collection: "products", id: input.slug },
  } as const;
  if (input.kind === "create") {
    await recordAuditEvent({
      ...base,
      action: "product.create",
      summary: `Created ${input.name}`,
      details: {
        slug: input.slug,
        priceApproved: input.priceApproved,
        inventoryCap: input.inventoryCap,
        purchasable: input.purchasable,
      },
    });
  } else if (input.kind === "delete") {
    await recordAuditEvent({
      ...base,
      action: "product.delete",
      summary: `Deleted ${input.name}`,
    });
  } else {
    await recordAuditEvent({
      ...base,
      action: "product.update",
      summary: `Edited ${input.name}`,
      details: diff(input.before, input.after),
    });
  }
  revalidatePath("/admin/audit");
  return { ok: true };
}
