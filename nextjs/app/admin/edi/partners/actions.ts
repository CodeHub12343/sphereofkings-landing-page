"use server";

import { revalidatePath } from "next/cache";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  createTradingPartner,
  deleteTradingPartner,
  updateTradingPartner,
  type CreateTradingPartnerInput,
  type UpdateTradingPartnerInput,
} from "@/lib/store/trading-partners-store";

export type PartnerResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createPartnerAction(
  input: CreateTradingPartnerInput,
): Promise<PartnerResult> {
  if (!input.name?.trim()) return { ok: false, error: "Name required." };
  const actor = await currentAdminActor();
  const record = await createTradingPartner(input);
  await recordAuditEvent({
    actor,
    action: "edi.partner.created",
    target: { collection: "tradingPartners", id: record.id },
    summary: `Created trading partner ${record.name}`,
    details: { id: record.id, transport: record.transport },
  }).catch(() => {});
  revalidatePath("/admin/edi");
  revalidatePath("/admin/edi/partners");
  return { ok: true, id: record.id };
}

export async function updatePartnerAction(
  id: string,
  patch: UpdateTradingPartnerInput,
): Promise<PartnerResult> {
  const actor = await currentAdminActor();
  const record = await updateTradingPartner(id, patch);
  if (!record) return { ok: false, error: `No partner ${id}` };
  await recordAuditEvent({
    actor,
    action: "edi.partner.updated",
    target: { collection: "tradingPartners", id },
    summary: `Updated trading partner ${record.name}`,
    details: { id, patch },
  }).catch(() => {});
  revalidatePath("/admin/edi/partners");
  return { ok: true, id };
}

export async function deletePartnerAction(
  id: string,
): Promise<PartnerResult> {
  const actor = await currentAdminActor();
  const ok = await deleteTradingPartner(id);
  if (!ok) return { ok: false, error: `No partner ${id}` };
  await recordAuditEvent({
    actor,
    action: "edi.partner.deleted",
    target: { collection: "tradingPartners", id },
    summary: `Deleted trading partner ${id}`,
    details: { id },
  }).catch(() => {});
  revalidatePath("/admin/edi/partners");
  return { ok: true, id };
}
