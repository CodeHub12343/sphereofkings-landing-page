"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AFF_SESSION_MAX_AGE_SECONDS } from "@/lib/affiliate-auth";
import { AFF_SESSION_COOKIE, createSessionToken } from "@/lib/auth/token";
import { verifyAffiliateCredentials } from "@/lib/db/collections/affiliates";

export type SignInState = { error?: string };

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await verifyAffiliateCredentials(email, password);
  if (!result.ok) return { error: result.reason };

  // Issue a signed, stateless session token so a forged cookie fails
  // integrity checks before it ever reaches the dashboard page.
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

  redirect("/affiliate");
}
