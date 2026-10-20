"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  DEFAULT_SESSION_TTL_SECONDS,
} from "@/lib/auth/token";
import { checkAdminCredentials } from "@/lib/db/collections/admin-users";
import { hasMongo } from "@/lib/db/mongo";

export type AdminSignInState = { error?: string };

export async function adminSignInAction(
  _prev: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  if (!hasMongo()) {
    return {
      error:
        "Per-account admin signin requires MONGODB_URI. The dev HTTP Basic prompt is in effect while that's unset.",
    };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  let user;
  try {
    user = await checkAdminCredentials(email, password);
  } catch (err) {
    // Atlas transient failure (serverSelectionTimeout, ETIMEDOUT, DNS,
    // IP-allowlist). The admin can't sign in without Mongo, but at
    // least show a readable error instead of a stack trace.
    console.error("adminSignInAction: Mongo unavailable:",
                  err instanceof Error ? err.message : err);
    return {
      error:
        "Could not reach the authentication database. This usually clears in a few seconds — try again. " +
        "If it keeps failing, check that this machine's IP is on the MongoDB Atlas allowlist and MONGODB_URI is correct.",
    };
  }
  if (!user) {
    return {
      error:
        "Email or password doesn't match an admin account. Password lookups are deliberately slow — try again carefully.",
    };
  }

  const token = await createSessionToken({
    kind: "admin",
    id: user.id,
    role: user.role,
  });

  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEFAULT_SESSION_TTL_SECONDS,
  });

  redirect("/admin");
}
