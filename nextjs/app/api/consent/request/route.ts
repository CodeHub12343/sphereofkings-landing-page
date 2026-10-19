import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { ensureSafetyIndexes } from "@/lib/db/collections/safety";
import { startConsentRequest } from "@/lib/db/collections/safety-io";
import { sendEmail } from "@/lib/email/send";
import { updatePlayer } from "@/lib/db/collections/players";

export const runtime = "nodejs";

/**
 * The minor (or anyone acting on their behalf) initiates consent by
 * supplying a parent's email. We issue a one-time token and email
 * a signed link to the parent landing on /consent/[token].
 */
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  if (!me.isMinor) {
    return NextResponse.json({ error: "consent only applies to minor accounts" }, { status: 400 });
  }
  if (me.consentStatus === "parental-granted") {
    return NextResponse.json({ error: "already granted" }, { status: 409 });
  }
  let body: { parentEmail?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const parentEmail = (body.parentEmail ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    return NextResponse.json({ error: "valid parent email required" }, { status: 400 });
  }

  await ensureSafetyIndexes();

  const digest = JSON.stringify({
    username: me.username,
    displayName: me.displayName,
    yearOfBirth: me.yearOfBirth,
    createdAt: me.createdAt,
    region: me.region ?? "global",
  });

  const row = await startConsentRequest({
    playerId: me.id, parentEmail, digest, mechanism: "micro-charge",
  });

  await updatePlayer(me.id, { consentStatus: "parental-pending" });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sphereofkings.com";
  const consentUrl = `${origin}/consent/${row.token}`;
  try {
    await sendEmail({
      to: parentEmail,
      subject: "Sphere of Kings — parental consent request",
      html: `
        <p>Hello,</p>
        <p>Your child <strong>${me.displayName}</strong> (@${me.username}) created
        a Sphere of Kings account and is asking for your consent to use it.
        Sphere of Kings is an online board-game platform aimed at families.</p>
        <p>To confirm your consent, open this link and complete the one-time
        $0.50 USD verification charge, which we refund immediately. The charge
        appears on your statement as "SPHERE OF KINGS CONSENT".</p>
        <p><a href="${consentUrl}">${consentUrl}</a></p>
        <p>If this request was not expected, you can safely ignore this email —
        the account stays locked.</p>
      `,
    });
  } catch (err) {
    console.warn("consent email failed:", err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
