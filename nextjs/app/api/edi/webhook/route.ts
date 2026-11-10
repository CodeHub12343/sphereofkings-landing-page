// Inbound webhook from the EDI provider. Whenever a retailer sends us
// an 850 Purchase Order (or an 860 PO Change, or a 997 ack), the
// provider POSTs the translated JSON here. We validate a shared secret,
// map the payload onto our EdiOrder shape, and write it to the store so
// it appears in /admin/edi.
//
// Auth: expects header `x-edi-webhook-secret` matching env
// `EDI_WEBHOOK_SECRET`. The provider's dashboard is where that secret
// is configured on their end.
//
// Payload: provider-agnostic shape (see type below). Each adapter in
// lib/edi/providers/* is responsible for translating the vendor's own
// payload into this shape on their side, or we can accept raw vendor
// payloads and translate here per-provider.

import { NextRequest, NextResponse } from "next/server";
import { insertEdiOrder } from "@/lib/store/edi-orders-store";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import type { EdiOrderLine } from "@/lib/edi/types";

type InboundPOPayload = {
  documentType: "850";
  poNumber: string;
  partnerId: string;
  partnerName: string;
  providerDocumentId?: string;
  currency?: string;
  lines: Array<{
    lineNumber: number;
    sku: string;
    upc?: string;
    retailerItemId?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shipTo?: string;
  shipDateRequested?: string;
  cancelDate?: string;
};

function badRequest(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const expected = process.env.EDI_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "EDI_WEBHOOK_SECRET not configured on server" },
      { status: 503 },
    );
  }
  const got = req.headers.get("x-edi-webhook-secret");
  if (got !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: InboundPOPayload;
  try {
    body = (await req.json()) as InboundPOPayload;
  } catch {
    return badRequest("Invalid JSON");
  }

  if (body.documentType !== "850") {
    // Future: route 860 (PO changes), 997 (ack of our 855), etc. For
    // MVP we only persist 850s and audit everything else.
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "edi.webhook.unsupported",
      target: { collection: "ediOrders", id: body.poNumber ?? "unknown" },
      summary: `Received unsupported EDI document ${body.documentType}`,
      details: { body },
    }).catch(() => {});
    return NextResponse.json({ ok: true, ignored: body.documentType });
  }

  if (!body.poNumber || !body.partnerId || !Array.isArray(body.lines)) {
    return badRequest("Missing poNumber, partnerId or lines");
  }

  const lines: EdiOrderLine[] = body.lines.map((l) => ({
    lineNumber: l.lineNumber,
    sku: l.sku,
    upc: l.upc,
    retailerItemId: l.retailerItemId,
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    lineTotal: Number((l.quantity * l.unitPrice).toFixed(2)),
  }));
  const subtotal = Number(
    lines.reduce((s, l) => s + l.lineTotal, 0).toFixed(2),
  );

  const record = await insertEdiOrder({
    poNumber: body.poNumber,
    partnerId: body.partnerId,
    partnerName: body.partnerName ?? body.partnerId,
    providerDocumentId: body.providerDocumentId,
    currency: body.currency ?? "USD",
    lines,
    subtotal,
    shipTo: body.shipTo,
    shipDateRequested: body.shipDateRequested,
    cancelDate: body.cancelDate,
    rawProviderPayload: body,
  });

  await recordAuditEvent({
    actor: { kind: "system" },
    action: "edi.webhook.po.received",
    target: { collection: "ediOrders", id: record.id },
    summary: `Received PO ${record.poNumber} from ${record.partnerName}`,
    details: {
      poNumber: record.poNumber,
      partnerId: record.partnerId,
      lineCount: lines.length,
      subtotal,
      currency: record.currency,
    },
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: record.id, poNumber: record.poNumber });
}
