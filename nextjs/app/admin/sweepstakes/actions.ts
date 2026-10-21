"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import {
  createRound, listRounds, GiveawayRound, updateRound,
} from "@/lib/db/collections/referrals";
import { sealAndQualify, drawWinner } from "@/lib/sweepstakes";
import { sendEmail } from "@/lib/email/send";
import { findPlayerById } from "@/lib/db/collections/players";

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
    const winnerId = await drawWinner(r);
    // Fire the winner notification immediately (rules § 8: within 24 h).
    // AMOE entrants are stored under "visitor:<hash>" and don't have a
    // playerId; those get notified from the AMOE mailing address instead.
    let emailStatus = "no-email-on-file";
    if (!winnerId.startsWith("visitor:")) {
      const player = await findPlayerById(winnerId);
      if (player?.emailLower) {
        const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sphereofkings.com";
        const res = await sendEmail({
          to: player.emailLower,
          subject: `🎉 You won the Royal Sphere Giveaway — round ${r.index}`,
          html: `
            <div style="font-family:Inter,Arial,sans-serif;color:#1a1510;line-height:1.6;">
              <h1 style="font-family:'Cinzel',Georgia,serif;color:#b8901e;">
                You're the Sphere of Kings winner.
              </h1>
              <p>Hi ${player.displayName},</p>
              <p>Your entry was drawn as the winner of round <strong>#${r.index}</strong>
              of the Royal Sphere Giveaway. The prize:</p>
              <p style="padding:12px 16px;background:#f6edd0;border-left:3px solid #b8901e;">
                <strong>${r.prize}</strong><br>
                Approximate retail value: $179 USD.
              </p>
              <p><strong>To claim your prize:</strong> reply to this email with your
              shipping address within <strong>72 hours</strong>. If we don't hear back
              by then, a replacement winner is drawn per the official rules.</p>
              <p>Round governed by rules version <code>${r.rulesVersion}</code>
              — see <a href="${origin}/sweepstakes">${origin}/sweepstakes</a>.</p>
              <p>Congratulations.<br>— James Bowser · Sphere of Kings</p>
            </div>
          `,
          replyTo: "hello@sphereofkings.com",
        });
        emailStatus = res.ok ? `emailed ${player.emailLower}` : `email failed: ${res.reason}`;
      }
    }
    await updateRound(r.id, {
      status: "notified",
      winnerEmail: emailStatus.startsWith("emailed") ? emailStatus.replace("emailed ", "") : undefined,
      claimDeadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    });
    revalidatePath("/admin/sweepstakes");
    return { ok: true, message: `Winner drawn: ${winnerId}. ${emailStatus}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Draw failed." };
  }
}
