// Server-only helpers for reading the admin session on a request. The
// middleware already verified the cookie's signature; here we hydrate
// the full user record so pages can show the signed-in name/role.

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import {
  AdminUser,
  findAdminById,
} from "@/lib/db/collections/admin-users";

export type AdminSessionInfo = {
  // True when the admin area is in per-account mode (MONGODB_URI set).
  perAccount: boolean;
  // Full user record when known. Null in HTTP Basic dev mode (no
  // account to look up) or when the token can't be parsed.
  user: AdminUser | null;
};

export async function getAdminSessionInfo(): Promise<AdminSessionInfo> {
  if (!process.env.MONGODB_URI) {
    return { perAccount: false, user: null };
  }
  const jar = await cookies();
  const cookie = jar.get(ADMIN_SESSION_COOKIE)?.value;
  const payload = await readSessionToken(cookie, "admin").catch(() => null);
  if (!payload) return { perAccount: true, user: null };
  const user = await findAdminById(payload.id);
  return { perAccount: true, user };
}
