"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import {
  CustomSphereOrder, updateCustomSphereOrder,
} from "@/lib/db/collections/custom-sphere-orders";

const VALID: CustomSphereOrder["status"][] = [
  "pending-payment", "paid", "in-production", "shipped", "delivered", "cancelled",
];

export async function updateStatusAction(opts: { id: string; status: CustomSphereOrder["status"] }) {
  const jar = await cookies();
  const admin = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!admin) throw new Error("admin only");
  if (!VALID.includes(opts.status)) throw new Error("bad status");
  await updateCustomSphereOrder(opts.id, { status: opts.status });
  revalidatePath("/admin/custom-spheres");
}
