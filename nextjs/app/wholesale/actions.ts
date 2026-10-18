"use server";

import { revalidatePath } from "next/cache";
import { createQuote } from "@/lib/store/quotes-store";
import { QuoteLine } from "@/lib/sample-quotes";

export type QuoteFormState =
  | { kind: "idle" }
  | { kind: "ok"; ref: string; totalUnits: number; business: string }
  | { kind: "error"; message: string };

export async function submitQuoteAction(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const business = String(formData.get("business") ?? "").trim();
    const contactName = String(formData.get("contactName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const requestedTierRaw = String(formData.get("requestedTier") ?? "auto");
    const requestedTier: "auto" | "40" =
      requestedTierRaw === "40" ? "40" : "auto";
    const autoTierPct = Number.parseInt(
      String(formData.get("autoTierPct") ?? "0"),
      10,
    );
    const neededBy = String(formData.get("neededBy") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const slugs = formData.getAll("line.slug").map(String);
    const names = formData.getAll("line.name").map(String);
    const qtys = formData.getAll("line.qty").map((v) => Number(v));
    const lines: QuoteLine[] = [];
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i]?.trim();
      const qty = qtys[i];
      if (!slug || !Number.isFinite(qty) || qty <= 0) continue;
      lines.push({
        productSlug: slug,
        productName: names[i]?.trim() || slug,
        qty: Math.max(1, Math.floor(qty)),
      });
    }

    if (!business) return { kind: "error", message: "Business name is required." };
    if (!contactName) return { kind: "error", message: "Contact name is required." };
    if (!/.+@.+\..+/.test(email)) return { kind: "error", message: "Enter a valid email." };
    if (lines.length === 0) {
      return { kind: "error", message: "Add at least one product and quantity." };
    }

    const q = await createQuote({
      business,
      contactName,
      email,
      phone: phone || undefined,
      requestedTier,
      autoTierPct: Number.isFinite(autoTierPct) ? autoTierPct : 0,
      neededBy: neededBy || undefined,
      notes: notes || undefined,
      lines,
    });

    revalidatePath("/admin/wholesale");

    const totalUnits = lines.reduce((n, l) => n + l.qty, 0);
    return { kind: "ok", ref: q.ref, totalUnits, business };
  } catch {
    return {
      kind: "error",
      message: "Something went wrong saving your inquiry. Please try again.",
    };
  }
}
