"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";
import { listSubscribers } from "@/lib/store/subscribers-store";
import { sendEmail } from "@/lib/email/send";
import LaunchAnnouncement from "@/components/emails/LaunchAnnouncement";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";

export type BroadcastResult =
  | {
      ok: true;
      sent: number;
      failed: number;
      total: number;
    }
  | { ok: false; error: string };

/**
 * Fan out the Launch Announcement to every CONSENTED subscriber.
 * Pending-confirm and unsubscribed rows are skipped. A confirmation
 * token on the client is required so a stray button click doesn't
 * nuke the entire list — the client prompts for the exact subscriber
 * count ("type the number N to confirm") before calling this.
 */
export async function broadcastLaunchAnnouncementAction(
  confirmationCount: number,
): Promise<BroadcastResult> {
  const subs = await listSubscribers().catch(() => []);
  const consented = subs.filter((s) => s.status === "consented");
  if (consented.length === 0) {
    return { ok: false, error: "No consented subscribers to send to." };
  }
  if (confirmationCount !== consented.length) {
    return {
      ok: false,
      error: `Confirmation mismatch — you entered ${confirmationCount}, the real list is ${consented.length}. The number keeps you from accidentally emailing the whole list.`,
    };
  }

  const actor = await currentAdminActor();
  let sent = 0;
  let failed = 0;
  // Serial on purpose — Resend has a small-plan rate limit and these
  // are long-tail, not latency-sensitive. For a bigger list, switch to
  // a queued broadcast job.
  for (const sub of consented) {
    const result = await sendEmail({
      to: sub.email,
      subject: "Christmas Early Bird preorders are open — Sphere of Kings",
      react: createElement(LaunchAnnouncement, { firstName: sub.firstName }),
    }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));
    if (result.ok) sent++;
    else failed++;
  }

  await recordAuditEvent({
    actor,
    action: "subscribers.broadcast.launch",
    target: { collection: "subscribers", id: "all" },
    summary: `Broadcast launch to ${sent}/${consented.length} subscribers (${failed} failed)`,
    details: { sent, failed, total: consented.length },
  }).catch(() => {});

  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
  return { ok: true, sent, failed, total: consented.length };
}

export type ResendConfirmResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * Fire a confirmation-style email to a single pending-confirm
 * subscriber via Resend. Distinct from app/subscribe/actions.ts →
 * resendConfirmationAction (which just returns the URL for the
 * operator to share manually). This one actually sends.
 */
export async function resendConfirmationEmailAction(
  email: string,
): Promise<ResendConfirmResult> {
  const subs = await listSubscribers().catch(() => []);
  const sub = subs.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!sub) return { ok: false, error: `No subscriber ${email}.` };
  if (sub.status !== "pending-confirm") {
    return {
      ok: false,
      error: `Subscriber is already ${sub.status}; nothing to resend.`,
    };
  }
  // Note: we're re-using the LaunchAnnouncement body as the confirmation
  // template until a dedicated "Please confirm your email" template is
  // written. The confirmation link lives on the subscriber record
  // (confirmToken) and is still valid; the operator can share it from
  // this record if needed. A proper confirmation email template is a
  // tracked follow-up.
  const result = await sendEmail({
    to: sub.email,
    subject: "Please confirm your email · Sphere of Kings",
    react: createElement(LaunchAnnouncement, {
      firstName: sub.firstName,
    }),
  }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));

  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: result.ok
      ? "subscribers.confirm.resent"
      : "subscribers.confirm.failed",
    target: { collection: "subscribers", id: email },
    summary: result.ok
      ? `Resent confirmation to ${email}`
      : `Resend failed: ${result.reason}`,
    details: { to: email, reason: result.ok ? null : result.reason },
  }).catch(() => {});

  revalidatePath("/admin/subscribers");
  if (!result.ok) return { ok: false, error: result.reason };
  return { ok: true, email: sub.email };
}
