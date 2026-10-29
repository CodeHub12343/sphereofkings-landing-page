"use server";

import { revalidatePath } from "next/cache";
import { getSponsorSession } from "@/lib/auth/sponsor-session";
import { updateSponsorBrandAssets } from "@/lib/db/collections/sponsorships";
import { recordAuditEvent } from "@/lib/db/collections/audit";

export type BrandAssetsInput = {
  logoUrl?: string;
  description?: string;
  linkUrl?: string;
};

export type UpdateBrandResult =
  | { ok: true }
  | { ok: false; message: string };

function clean(x: string | undefined, max: number): string | undefined {
  const v = typeof x === "string" ? x.trim().slice(0, max) : "";
  return v || undefined;
}

export async function updateSponsorBrandAssetsAction(
  input: BrandAssetsInput,
): Promise<UpdateBrandResult> {
  const row = await getSponsorSession();
  if (!row) return { ok: false, message: "You are signed out." };

  const patch = {
    logoUrl: clean(input.logoUrl, 500),
    description: clean(input.description, 1000),
    linkUrl: clean(input.linkUrl, 500),
  };

  try {
    await updateSponsorBrandAssets(row.ref, patch);
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "sponsor.brandAssets.updated",
      target: { collection: "sponsorships", id: row.ref },
      summary: `Sponsor ${row.businessName} updated brand assets`,
      details: patch,
    }).catch(() => {});
    revalidatePath("/sponsor");
    revalidatePath("/admin/sponsorships");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not save. Please try again." };
  }
}
