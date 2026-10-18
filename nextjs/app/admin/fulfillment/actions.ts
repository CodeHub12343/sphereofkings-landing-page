"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";
import {
  updateOrderFulfillment,
  findOrderByRef,
} from "@/lib/db/collections/orders";
import { FulfillmentState } from "@/lib/sample-orders";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { sendEmail } from "@/lib/email/send";
import DispatchNotice from "@/components/emails/DispatchNotice";

const VALID: FulfillmentState[] = ["none", "produced", "packed", "dispatched"];

export type AdvanceFulfillmentResult =
  | { ok: true; ref: string; fulfillment: FulfillmentState }
  | { ok: false; error: string };

export async function setFulfillmentStageAction(
  ref: string,
  fulfillment: FulfillmentState,
): Promise<AdvanceFulfillmentResult> {
  if (!VALID.includes(fulfillment)) {
    return { ok: false, error: `Invalid fulfillment state: ${fulfillment}` };
  }
  const before = await findOrderByRef(ref);
  if (!before) return { ok: false, error: `Order ${ref} not found` };
  const updated = await updateOrderFulfillment(ref, fulfillment);
  if (!updated) {
    // Sample demo rows live in-memory only; nothing to persist. Treat
    // as a successful no-op so the UI reflects the click.
    return { ok: true, ref, fulfillment };
  }
  // Audit the stage change so the overview + /admin/audit show it.
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "fulfillment.setStage",
    target: { collection: "orders", id: ref },
    summary: `${ref}: ${before.fulfillment} → ${fulfillment}`,
    details: { previous: before.fulfillment, next: fulfillment },
  }).catch(() => {});
  // Transactional email: dispatch notice to the buyer when the order
  // moves INTO the "dispatched" stage for the first time. We don't
  // re-send on repeat clicks or on reversions (e.g. dispatched →
  // packed → dispatched). Non-blocking; a failure is audited.
  if (
    fulfillment === "dispatched" &&
    before.fulfillment !== "dispatched" &&
    before.customerEmail
  ) {
    const first = (before.customerName || "").split(/\s+/)[0] || undefined;
    const emailResult = await sendEmail({
      to: before.customerEmail,
      subject: `Your Sphere is on its way · ${before.ref}`,
      react: createElement(DispatchNotice, {
        firstName: first,
        orderRef: before.ref,
        itemsSummary: before.itemSummary || "Your Sphere of Kings order",
        shipTo: before.shipTo
          ? [
              before.shipTo.name,
              before.shipTo.line1,
              before.shipTo.line2 ?? "",
              `${before.shipTo.city} ${before.shipTo.postal}`.trim(),
              before.shipTo.country,
            ]
              .filter(Boolean)
              .join("\n")
          : before.customerName,
        // Carrier / tracking are entered in the fulfillment UI; we
        // don't persist them yet, so the email ships without a
        // tracking row rather than inventing one.
      }),
    }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));
    await recordAuditEvent({
      actor,
      action: emailResult.ok
        ? "fulfillment.email.dispatch.sent"
        : "fulfillment.email.dispatch.failed",
      target: { collection: "orders", id: ref },
      summary: emailResult.ok
        ? `Dispatch notice sent to ${before.customerEmail}`
        : `Dispatch notice NOT sent: ${emailResult.reason}`,
      details: {
        to: before.customerEmail,
        resendId: emailResult.ok ? emailResult.id : null,
        reason: emailResult.ok ? null : emailResult.reason,
      },
    }).catch(() => {});
  }

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${ref}`);
  return { ok: true, ref, fulfillment };
}
