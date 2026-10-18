// Admin users collection. Mongo only — admin accounts need password
// hashes and a role, which doesn't fit the local file-store pattern.
//
// A single "owner" account is seeded on first use from the env vars
// ADMIN_USER + ADMIN_PASSWORD. After that, add new operators from the
// admin console with their own passwords.

import { randomUUID } from "node:crypto";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type AdminRole = "owner" | "finance" | "support" | "fulfillment";

export type AdminUser = {
  id: string;
  email: string; // lowercased
  displayName: string;
  role: AdminRole;
  passwordHash: string;
  createdISO: string;
  lastSignInISO?: string;
};

const COLLECTION = "adminUsers";

async function col() {
  return getCollection<AdminUser>(COLLECTION);
}

let bootstrapChecked = false;
export async function ensureAdminBootstrap(): Promise<AdminUser | null> {
  if (!hasMongo()) return null;
  if (bootstrapChecked) return null;
  bootstrapChecked = true;
  const c = await col();
  const count = await c.estimatedDocumentCount();
  if (count > 0) return null;
  const email = (process.env.ADMIN_USER || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) return null;

  const user: AdminUser = {
    id: randomUUID(),
    email,
    displayName: "Owner",
    role: "owner",
    passwordHash: await hashPassword(password),
    createdISO: new Date().toISOString(),
  };
  await c.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  await c.insertOne(user).catch(() => {
    // Another process raced us; the record will exist either way.
    bootstrapChecked = false;
  });
  return user;
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  if (!hasMongo()) return null;
  await ensureAdminBootstrap();
  const c = await col();
  const key = email.trim().toLowerCase();
  const doc = await c.findOne({ email: key }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  if (!hasMongo()) return null;
  const c = await col();
  const doc = await c.findOne({ id }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function checkAdminCredentials(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const user = await findAdminByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  // Fire-and-forget sign-in stamp; failing shouldn't block the signin.
  col()
    .then((c) =>
      c.updateOne(
        { id: user.id },
        { $set: { lastSignInISO: new Date().toISOString() } },
      ),
    )
    .catch(() => {});
  return user;
}

export async function listAdmins(): Promise<AdminUser[]> {
  if (!hasMongo()) return [];
  await ensureAdminBootstrap();
  const c = await col();
  return c
    .find({}, { projection: { _id: 0, passwordHash: 0 } })
    .sort({ createdISO: 1 })
    .toArray() as unknown as Promise<AdminUser[]>;
}
