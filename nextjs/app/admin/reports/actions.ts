"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import { resolveReport } from "@/lib/db/collections/safety-io";
import type { ModerationReport } from "@/lib/db/collections/safety";
import { pushNotification } from "@/lib/notifications";
import { getDb } from "@/lib/db/mongo";

export async function resolveReportAction(opts: {
  reportId: string;
  resolution: NonNullable<ModerationReport["resolution"]>;
  note?: string;
}) {
  const jar = await cookies();
  const admin = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!admin) throw new Error("admin only");

  await resolveReport(opts.reportId, {
    resolution: opts.resolution,
    resolvedByAdminId: admin.id,
    resolutionNote: opts.note,
  });

  // Notify the original reporter.
  const db = await getDb();
  const report = await db.collection<ModerationReport>("moderationReports")
    .findOne({ id: opts.reportId });
  if (report) {
    await pushNotification({
      recipientId: report.reporterId,
      kind: "report-resolved",
      payload: { reportId: opts.reportId, resolution: opts.resolution },
    });
  }
  revalidatePath("/admin/reports");
}
