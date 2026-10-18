// Expenses collection. Mongo-first with the usual file fallback at
// `.data/expenses.json`. The /admin/finance dashboard reads from here,
// and the Add-expense drawer writes via a server action.

import { promises as fs } from "node:fs";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";

export type StoredExpense = {
  ref: string;            // EXP-#####
  dateISO: string;        // yyyy-mm-dd
  vendor: string;
  description: string;
  category: string;       // free text from the drawer's list
  amount: number;         // positive dollars (NOT minor units)
  currency: "USD" | "EUR" | "GBP";
  receiptName?: string;
  createdISO: string;
  createdByEmail?: string;
};

const COLLECTION = "expenses";
const DATA_DIR = path.join(process.cwd(), ".data");
const EXPENSES_PATH = path.join(DATA_DIR, "expenses.json");

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(EXPENSES_PATH);
  } catch {
    await fs.writeFile(EXPENSES_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<StoredExpense[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(EXPENSES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(entries: StoredExpense[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(EXPENSES_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export async function listExpenses(): Promise<StoredExpense[]> {
  if (hasMongo()) {
    const col = await getCollection<StoredExpense>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ dateISO: -1, createdISO: -1 })
      .toArray();
  }
  const all = await fileReadAll();
  return all.slice().sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

export type CreateExpenseInput = Omit<
  StoredExpense,
  "ref" | "createdISO"
> & { createdByEmail?: string };

export async function createExpense(
  input: CreateExpenseInput,
): Promise<StoredExpense> {
  const now = new Date().toISOString();
  const ref = await nextExpenseRef();
  const record: StoredExpense = {
    ref,
    createdISO: now,
    ...input,
  };
  if (hasMongo()) {
    const col = await getCollection<StoredExpense>(COLLECTION);
    await col.insertOne(record);
  } else {
    const all = await fileReadAll();
    all.push(record);
    await fileWriteAll(all);
  }
  return record;
}

async function nextExpenseRef(): Promise<string> {
  const all = await (hasMongo()
    ? (async () => {
        const col = await getCollection<StoredExpense>(COLLECTION);
        return col.find({}, { projection: { _id: 0, ref: 1 } }).toArray();
      })()
    : fileReadAll());
  const highest = all
    .map((e) => Number.parseInt(e.ref.replace(/^EXP-/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 412);
  return `EXP-${String(highest + 1).padStart(5, "0")}`;
}
