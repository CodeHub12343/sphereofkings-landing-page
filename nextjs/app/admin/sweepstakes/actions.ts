"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import {
  createRound, listRounds, GiveawayRound, updateRound,
} from "@/lib/db/collections/referrals";
import { sealAndQualify, drawWinner } from "@/lib/sweepstakes";

async function requireAdmin() {
  const jar = await cookies();
  const admin = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!admin) throw new Error("admin only");
  return admin;
}

export async function startNewRoundAction(prize: string) {
  try { await requireAdmin(); } catch { return { error: "Admin sign-in required." }; }
  const existing = await listRounds();
  const nextIndex = (existing[0]?.index ?? 0) + 1;
  // Cancel any still-collecting round so we don't have two running at once.
  for (const r of existing) {
    if (r.status === "collecting") {
      await updateRound(r.id, { status: "cancelled" });
    }
  }
  await createRound({
    index: nextIndex,
    threshold: 100,
    qualifierTarget: 50,
    prize: prize || "Royal Checkers – Two-Color Board & Checkers Set",
    rulesVersion: "1.0-counsel-approved-2026-10-20",
    rulesUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "") + "/sweepstakes",
  });
  revalidatePath("/admin/sweepstakes");
  return { ok: true, message: `Round #${nextIndex} opened.` };
}

async function activeRound(): Promise<GiveawayRound | null> {
  const all = await listRounds();
  return all.find((r) => r.status === "collecting" || r.status === "sealed") ?? null;
}

export async function sealRoundAction() {
  try { await requireAdmin(); } catch { return { error: "Admin sign-in required." }; }
  const r = await activeRound();
  if (!r) return { error: "No active round. Start one first." };
  if (r.status !== "collecting") return { error: `Round is ${r.status}, not collecting.` };
  try {
    const { qualifiers } = await sealAndQualify(r);
    revalidatePath("/admin/sweepstakes");
    return { ok: true, message: `Sealed. ${qualifiers.length} qualifiers selected.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Seal failed." };
  }
}

export async function drawRoundAction() {
  try { await requireAdmin(); } catch { return { error: "Admin sign-in required." }; }
  const r = await activeRound();
  if (!r) return { error: "No active round." };
  if (r.status !== "sealed") return { error: `Round is ${r.status}, must be sealed first.` };
  try {
    const winner = await drawWinner(r);
    revalidatePath("/admin/sweepstakes");
    return { ok: true, message: `Winner drawn: ${winner}. Notify them within 24 h.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Draw failed." };
  }
}
