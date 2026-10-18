// Finance store. Mongo-first with a file fallback for dev. See the
// commentary at the top of quotes-store.ts — the same pattern applies.
// This store currently holds one collection: `closedMonths`.

import { promises as fs } from "node:fs";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";

const DATA_DIR = path.join(process.cwd(), ".data");
const FINANCE_PATH = path.join(DATA_DIR, "finance.json");
const COLLECTION = "closedMonths";

export type ClosedMonth = {
  year: number;
  month: number; // 1 = Jan, 12 = Dec
  closedAtISO: string;
  closedBy: string;
  totalsMinor: {
    revenue: number;
    refunds: number;
    donations: number;
    expenses: number;
  };
  note?: string;
};

type FinanceState = { closedMonths: ClosedMonth[] };

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FINANCE_PATH);
  } catch {
    await fs.writeFile(
      FINANCE_PATH,
      JSON.stringify({ closedMonths: [] } satisfies FinanceState, null, 2),
      "utf8",
    );
  }
}

async function fileRead(): Promise<FinanceState> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(FINANCE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.closedMonths)) {
      return { closedMonths: parsed.closedMonths };
    }
  } catch {
    // fall through
  }
  return { closedMonths: [] };
}

async function fileWrite(state: FinanceState): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(FINANCE_PATH, JSON.stringify(state, null, 2), "utf8");
}

/* -------------------------- Public API ----------------------------- */

export async function listClosedMonths(): Promise<ClosedMonth[]> {
  if (hasMongo()) {
    const col = await getCollection<ClosedMonth>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ year: -1, month: -1 })
      .toArray();
  }
  const s = await fileRead();
  return s.closedMonths
    .slice()
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export async function findClosedMonth(
  year: number,
  month: number,
): Promise<ClosedMonth | undefined> {
  if (hasMongo()) {
    const col = await getCollection<ClosedMonth>(COLLECTION);
    const doc = await col.findOne({ year, month }, { projection: { _id: 0 } });
    return doc ?? undefined;
  }
  const s = await fileRead();
  return s.closedMonths.find((m) => m.year === year && m.month === month);
}

export async function closeMonth(entry: ClosedMonth): Promise<void> {
  if (hasMongo()) {
    const col = await getCollection<ClosedMonth>(COLLECTION);
    await col.replaceOne(
      { year: entry.year, month: entry.month },
      entry,
      { upsert: true },
    );
    return;
  }
  const s = await fileRead();
  const next = s.closedMonths.filter(
    (m) => !(m.year === entry.year && m.month === entry.month),
  );
  next.push(entry);
  await fileWrite({ closedMonths: next });
}

export async function reopenMonth(
  year: number,
  month: number,
): Promise<void> {
  if (hasMongo()) {
    const col = await getCollection<ClosedMonth>(COLLECTION);
    await col.deleteOne({ year, month });
    return;
  }
  const s = await fileRead();
  await fileWrite({
    closedMonths: s.closedMonths.filter(
      (m) => !(m.year === year && m.month === month),
    ),
  });
}
