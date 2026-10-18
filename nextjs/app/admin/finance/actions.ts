"use server";

import { revalidatePath } from "next/cache";
import { closeMonth, reopenMonth, ClosedMonth } from "@/lib/store/finance-store";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";
import {
  createExpense,
  StoredExpense,
  CreateExpenseInput,
} from "@/lib/db/collections/expenses";

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export async function closeMonthAction(
  entry: ClosedMonth,
): Promise<{ ok: true }> {
  await closeMonth(entry);
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "finance.closeMonth",
    target: {
      collection: "closedMonths",
      id: `${entry.year}-${String(entry.month).padStart(2, "0")}`,
    },
    summary: `Closed ${monthLabel(entry.year, entry.month)}`,
    details: {
      totalsMinor: entry.totalsMinor,
      closedBy: entry.closedBy,
      note: entry.note ?? null,
    },
  });
  revalidatePath("/admin/finance");
  revalidatePath("/admin/audit");
  return { ok: true };
}

export type RecordExpenseResult =
  | { ok: true; expense: StoredExpense }
  | { ok: false; error: string };

export async function recordExpenseAction(
  input: Omit<CreateExpenseInput, "createdByEmail">,
): Promise<RecordExpenseResult> {
  if (!input.vendor?.trim()) {
    return { ok: false, error: "Vendor is required." };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a positive amount." };
  }
  const actor = await currentAdminActor();
  const createdByEmail = actor.email;
  const expense = await createExpense({ ...input, createdByEmail });
  await recordAuditEvent({
    actor,
    action: "expense.create",
    target: { collection: "expenses", id: expense.ref },
    summary: `Recorded expense · ${expense.vendor} · $${expense.amount.toFixed(2)} ${expense.currency}`,
    details: {
      category: expense.category,
      description: expense.description,
      receiptName: expense.receiptName ?? null,
      dateISO: expense.dateISO,
    },
  });
  revalidatePath("/admin/finance");
  revalidatePath("/admin/audit");
  return { ok: true, expense };
}

export async function reopenMonthAction(
  year: number,
  month: number,
): Promise<{ ok: true }> {
  await reopenMonth(year, month);
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "finance.reopenMonth",
    target: {
      collection: "closedMonths",
      id: `${year}-${String(month).padStart(2, "0")}`,
    },
    summary: `Re-opened ${monthLabel(year, month)}`,
  });
  revalidatePath("/admin/finance");
  revalidatePath("/admin/audit");
  return { ok: true };
}
