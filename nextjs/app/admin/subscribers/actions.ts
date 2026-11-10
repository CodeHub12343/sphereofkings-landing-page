"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";
import {
  insertConsentedSubscriber,
  listSubscribers,
} from "@/lib/store/subscribers-store";
import { sendEmail } from "@/lib/email/send";
import LaunchAnnouncement from "@/components/emails/LaunchAnnouncement";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";

export type AddSubscriberResult =
  | { ok: true; email: string; existed: boolean }
  | { ok: false; error: string };

/**
 * Admin-only direct-insert of a consented subscriber. Used for hand-
 * curated outreach lists (e.g. a sponsor contact the operator added
 * from LinkedIn) that bypass the public double-opt-in flow. The record
 * is marked `consented` immediately and audit-logged.
 */
export async function addConsentedSubscriberAction(
  email: string,
  firstName?: string,
): Promise<AddSubscriberResult> {
  const trimmed = email.trim();
  if (!/.+@.+\..+/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const actor = await currentAdminActor();
  try {
    const { record, existed } = await insertConsentedSubscriber({
      email: trimmed,
      firstName: firstName?.trim() || undefined,
      source: "import",
    });
    await recordAuditEvent({
      actor,
      action: existed
        ? "subscribers.add.already-exists"
        : "subscribers.add.consented",
      target: { collection: "subscribers", id: record.email },
      summary: existed
        ? `Add attempted but ${record.email} already on list (status: ${record.status})`
        : `Added consented subscriber ${record.email}`,
      details: { email: record.email, firstName: record.firstName, existed },
    }).catch(() => {});
    revalidatePath("/admin/subscribers");
    revalidatePath("/admin");
    return { ok: true, email: record.email, existed };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type BulkImportResult =
  | {
      ok: true;
      added: number;
      existed: number;
      invalid: number;
      total: number;
    }
  | { ok: false; error: string };

/**
 * Paste-and-import a batch of consented subscribers at once. Accepts any
 * blob of text — emails separated by commas, semicolons, spaces, or
 * newlines are all parsed. Every valid new address is direct-inserted
 * as `consented`, duplicates are skipped silently, and the whole batch
 * is audit-logged as a single event with the breakdown.
 */
export async function bulkImportConsentedSubscribersAction(
  input: string,
  firstName?: string,
): Promise<BulkImportResult> {
  if (!input || !input.trim()) {
    return { ok: false, error: "Paste at least one email first." };
  }
  // Split on anything that isn't a valid email character.
  const raw = input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const valid: string[] = [];
  let invalid = 0;
  for (const token of raw) {
    const lower = token.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    if (/.+@.+\..+/.test(token)) {
      valid.push(token);
    } else {
      invalid++;
    }
  }

  if (valid.length === 0) {
    return {
      ok: false,
      error: `No valid email addresses found (saw ${raw.length} tokens, ${invalid} invalid).`,
    };
  }

  const actor = await currentAdminActor();
  let added = 0;
  let existed = 0;
  const errors: string[] = [];
  const addedEmails: string[] = [];

  for (const email of valid) {
    try {
      const r = await insertConsentedSubscriber({
        email,
        firstName: firstName?.trim() || undefined,
        source: "import",
      });
      if (r.existed) existed++;
      else {
        added++;
        addedEmails.push(r.record.email);
      }
    } catch (e) {
      errors.push(`${email}: ${(e as Error).message}`);
    }
  }

  await recordAuditEvent({
    actor,
    action: "subscribers.import.bulk",
    target: { collection: "subscribers", id: "bulk" },
    summary: `Bulk-imported ${added} subscribers (${existed} already existed, ${invalid} invalid, ${errors.length} errors)`,
    details: {
      added,
      existed,
      invalid,
      total: valid.length,
      addedEmails,
      errors,
    },
  }).catch(() => {});

  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");

  return {
    ok: true,
    added,
    existed,
    invalid,
    total: valid.length,
  };
}

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

export type SendLaunchToOneResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * Send the Launch Announcement to ONE already-consented subscriber.
 * Used by the per-row "Resend" button for consented rows. Rate-limit
 * safe for one-offs — no serial-loop concerns.
 */
export async function sendLaunchToSubscriberAction(
  email: string,
): Promise<SendLaunchToOneResult> {
  const subs = await listSubscribers().catch(() => []);
  const sub = subs.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!sub) return { ok: false, error: `No subscriber ${email}.` };
  if (sub.status !== "consented") {
    return {
      ok: false,
      error: `Subscriber is ${sub.status}, not consented — launch mail is only sent to consented rows.`,
    };
  }

  const result = await sendEmail({
    to: sub.email,
    subject: "Christmas Early Bird preorders are open — Sphere of Kings",
    react: createElement(LaunchAnnouncement, { firstName: sub.firstName }),
  }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));

  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: result.ok
      ? "subscribers.launch.resent-one"
      : "subscribers.launch.resend-one-failed",
    target: { collection: "subscribers", id: sub.email },
    summary: result.ok
      ? `Resent launch to ${sub.email}`
      : `Resend to ${sub.email} failed: ${result.reason}`,
    details: { to: sub.email, reason: result.ok ? null : result.reason },
  }).catch(() => {});

  revalidatePath("/admin/subscribers");
  if (!result.ok) return { ok: false, error: result.reason };
  return { ok: true, email: sub.email };
}

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
