"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAffiliate } from "@/lib/db/collections/affiliates";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { AFF_SESSION_MAX_AGE_SECONDS } from "@/lib/affiliate-auth";
import { AFF_SESSION_COOKIE, createSessionToken } from "@/lib/auth/token";

export type ApplyState = {
  error?: string;
};

export async function applyAction(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const result = await createAffiliate({ firstName, lastName, email, password });
  if (!result.ok) return { error: result.error };

  // Audit the signup. System-attributed since the applicant isn't an
  // admin — we only have their own identity.
  await recordAuditEvent({
    actor: { kind: "system" },
    action: "affiliate.signup",
    target: { collection: "affiliates", id: result.affiliate.code },
    summary: `Affiliate signup: ${result.affiliate.firstName} ${result.affiliate.lastName} (${result.affiliate.email})`,
  }).catch(() => {});

  // Auto-approve + sign in — createAffiliate already stores the row
  // with state="active", so we drop the session cookie right away and
  // land them on their dashboard.
  const token = await createSessionToken({
    kind: "affiliate",
    id: result.affiliate.code,
    ttlSeconds: AFF_SESSION_MAX_AGE_SECONDS,
  });
  const jar = await cookies();
  jar.set(AFF_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AFF_SESSION_MAX_AGE_SECONDS,
  });

  revalidatePath("/admin/affiliates");
  redirect("/affiliate");
}
