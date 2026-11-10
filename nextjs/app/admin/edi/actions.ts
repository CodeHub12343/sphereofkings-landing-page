"use server";

import { revalidatePath } from "next/cache";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  findEdiOrder,
  updateEdiOrderStatus,
} from "@/lib/store/edi-orders-store";
import { getEdiProvider } from "@/lib/edi/provider";

/* -------------------------- Acknowledge (855) -------------------------- */

export type AcknowledgeResult =
  | { ok: true; providerDocumentId: string }
  | { ok: false; error: string };

export async function acknowledgeEdiOrderAction(
  id: string,
): Promise<AcknowledgeResult> {
  const order = await findEdiOrder(id);
  if (!order) return { ok: false, error: `No EDI order ${id}` };
  if (order.status !== "received") {
    return {
      ok: false,
      error: `Order is ${order.status}; only 'received' orders can be acknowledged.`,
    };
  }

  const provider = getEdiProvider();
  const result = await provider.acknowledgePO({
    poNumber: order.poNumber,
    partnerId: order.partnerId,
    accepted: true,
  });

  const actor = await currentAdminActor();
  if (!result.ok) {
    await recordAuditEvent({
      actor,
      action: "edi.acknowledge.failed",
      target: { collection: "ediOrders", id },
      summary: `Acknowledge PO ${order.poNumber} failed: ${result.error}`,
      details: { poNumber: order.poNumber, reason: result.error },
    }).catch(() => {});
    return { ok: false, error: result.error };
  }

  const now = new Date().toISOString();
  await updateEdiOrderStatus(id, {
    status: "acknowledged",
    acknowledgedISO: now,
  });
  await recordAuditEvent({
    actor,
    action: "edi.acknowledge.sent",
    target: { collection: "ediOrders", id },
    summary: `Acknowledged PO ${order.poNumber} via ${provider.name}`,
    details: {
      poNumber: order.poNumber,
      providerDocumentId: result.providerDocumentId,
    },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  return { ok: true, providerDocumentId: result.providerDocumentId };
}

/* --------------------------- Ship (856 ASN) ---------------------------- */

export type ShipResult =
  | { ok: true; providerDocumentId: string }
  | { ok: false; error: string };

export async function shipEdiOrderAction(
  id: string,
  input: { trackingNumber: string; carrier: string },
): Promise<ShipResult> {
  const order = await findEdiOrder(id);
  if (!order) return { ok: false, error: `No EDI order ${id}` };
  if (order.status !== "acknowledged" && order.status !== "in-fulfillment") {
    return {
      ok: false,
      error: `Order is ${order.status}; ship only from 'acknowledged' or 'in-fulfillment'.`,
    };
  }
  if (!input.trackingNumber.trim()) {
    return { ok: false, error: "Tracking number required." };
  }
  if (!input.carrier.trim()) {
    return { ok: false, error: "Carrier required." };
  }

  const provider = getEdiProvider();
  const now = new Date().toISOString();
  const result = await provider.sendASN({
    poNumber: order.poNumber,
    partnerId: order.partnerId,
    trackingNumber: input.trackingNumber.trim(),
    carrier: input.carrier.trim(),
    shipDateISO: now,
  });

  const actor = await currentAdminActor();
  if (!result.ok) {
    await recordAuditEvent({
      actor,
      action: "edi.asn.failed",
      target: { collection: "ediOrders", id },
      summary: `ASN for PO ${order.poNumber} failed: ${result.error}`,
      details: { poNumber: order.poNumber, reason: result.error },
    }).catch(() => {});
    return { ok: false, error: result.error };
  }

  await updateEdiOrderStatus(id, {
    status: "shipped",
    shippedISO: now,
    trackingNumber: input.trackingNumber.trim(),
    carrier: input.carrier.trim(),
  });
  await recordAuditEvent({
    actor,
    action: "edi.asn.sent",
    target: { collection: "ediOrders", id },
    summary: `Sent 856 ASN for PO ${order.poNumber} (${input.carrier} ${input.trackingNumber})`,
    details: {
      poNumber: order.poNumber,
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
      providerDocumentId: result.providerDocumentId,
    },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  return { ok: true, providerDocumentId: result.providerDocumentId };
}

/* --------------------------- Invoice (810) ----------------------------- */

export type InvoiceResult =
  | { ok: true; providerDocumentId: string; invoiceNumber: string }
  | { ok: false; error: string };

export async function invoiceEdiOrderAction(id: string): Promise<InvoiceResult> {
  const order = await findEdiOrder(id);
  if (!order) return { ok: false, error: `No EDI order ${id}` };
  if (order.status !== "shipped") {
    return {
      ok: false,
      error: `Order is ${order.status}; invoice only from 'shipped'.`,
    };
  }

  // Generate a simple invoice number based on the PO + timestamp. In a
  // real deployment this would come from the finance module.
  const invoiceNumber = `INV-${order.poNumber}-${Date.now().toString().slice(-6)}`;
  const provider = getEdiProvider();
  const now = new Date().toISOString();
  const result = await provider.sendInvoice({
    poNumber: order.poNumber,
    partnerId: order.partnerId,
    invoiceNumber,
    invoiceDateISO: now,
    totalAmount: order.subtotal,
    currency: order.currency,
  });

  const actor = await currentAdminActor();
  if (!result.ok) {
    await recordAuditEvent({
      actor,
      action: "edi.invoice.failed",
      target: { collection: "ediOrders", id },
      summary: `Invoice for PO ${order.poNumber} failed: ${result.error}`,
      details: { poNumber: order.poNumber, reason: result.error },
    }).catch(() => {});
    return { ok: false, error: result.error };
  }

  await updateEdiOrderStatus(id, {
    status: "invoiced",
    invoicedISO: now,
    invoiceNumber,
  });
  await recordAuditEvent({
    actor,
    action: "edi.invoice.sent",
    target: { collection: "ediOrders", id },
    summary: `Sent 810 invoice ${invoiceNumber} for PO ${order.poNumber}`,
    details: {
      poNumber: order.poNumber,
      invoiceNumber,
      providerDocumentId: result.providerDocumentId,
      amount: order.subtotal,
      currency: order.currency,
    },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  return { ok: true, providerDocumentId: result.providerDocumentId, invoiceNumber };
}

/* ------------------------- Close / Cancel ------------------------------ */

export async function closeEdiOrderAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await findEdiOrder(id);
  if (!order) return { ok: false, error: `No EDI order ${id}` };
  const now = new Date().toISOString();
  await updateEdiOrderStatus(id, { status: "closed", closedISO: now });
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "edi.order.closed",
    target: { collection: "ediOrders", id },
    summary: `Closed PO ${order.poNumber}`,
    details: { poNumber: order.poNumber },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  return { ok: true };
}

export async function cancelEdiOrderAction(
  id: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await findEdiOrder(id);
  if (!order) return { ok: false, error: `No EDI order ${id}` };
  await updateEdiOrderStatus(id, { status: "cancelled" });
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "edi.order.cancelled",
    target: { collection: "ediOrders", id },
    summary: `Cancelled PO ${order.poNumber}${reason ? ` — ${reason}` : ""}`,
    details: { poNumber: order.poNumber, reason },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  return { ok: true };
}
