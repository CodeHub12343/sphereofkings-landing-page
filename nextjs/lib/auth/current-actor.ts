// Server-only helper that returns the current admin actor for the
// request. Works in both auth modes:
//
//   - MONGODB_URI set → signed-in admin from the admin session cookie.
//   - Not set → the HTTP Basic username from ADMIN_USER (verified by
//     middleware; we never trust the raw header for identity).

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import { findAdminById } from "@/lib/db/collections/admin-users";
import { AuditActor } from "@/lib/db/collections/audit";

export async function currentAdminActor(): Promise<AuditActor> {
  if (process.env.MONGODB_URI) {
    const jar = await cookies();
    const cookie = jar.get(ADMIN_SESSION_COOKIE)?.value;
    const payload = await readSessionToken(cookie, "admin").catch(() => null);
    if (payload) {
      const user = await findAdminById(payload.id);
      if (user) {
        return {
          kind: "admin-session",
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
      // Signed cookie, but no account — fall through to a generic
      // "admin-session" with the id only.
      return { kind: "admin-session", id: payload.id, role: payload.role };
    }
  }
  const envUser = process.env.ADMIN_USER;
  if (envUser) {
    return { kind: "env-basic", email: envUser, role: "owner" };
  }
  return { kind: "system" };
}
