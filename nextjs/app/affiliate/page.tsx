import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import { AFF_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import { listAttributionsForAffiliate } from "@/lib/db/collections/attributed-orders";
import { findOrderByRef } from "@/lib/db/collections/orders";
import AffiliateAuthedShell, {
  AttributedRowView,
} from "@/components/affiliate/AffiliateAuthedShell";

export const metadata = {
  title: "Affiliate dashboard — Sphere of Kings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const jar = await cookies();
  const cookie = jar.get(AFF_SESSION_COOKIE)?.value;
  // Verify the token's HMAC + expiry. A forged or tampered cookie
  // yields null here and lands at /affiliate/signin.
  const payload = await readSessionToken(cookie, "affiliate").catch(() => null);
  if (!payload) redirect("/affiliate/signin");

  // Live record from the Mongo `affiliates` collection — state changes
  // the admin makes (approve, suspend) take effect on the next request.
  const aff = await findAffiliateByCode(payload.id);
  if (!aff) redirect("/affiliate/signin");
  // Suspended / pending accounts can't sign in anyway, but hard-stop if a
  // cookie survived a state change.
  if (aff.state !== "active") redirect("/affiliate/signin");

  // Fetch the affiliate's real attribution records and join with the
  // order so the dashboard shows a human-readable customer label.
  const attributions = await listAttributionsForAffiliate(aff.code);
  const rows: AttributedRowView[] = await Promise.all(
    attributions.map(async (a) => {
      const order = await findOrderByRef(a.orderRef);
      const customer = order?.customerName
        ? customerInitials(order.customerName)
        : "—";
      const status: AttributedRowView["status"] =
        a.status === "eligible" || a.status === "paid-out"
          ? "eligible"
          : a.status === "pending"
          ? "pending"
          : a.status === "refund-pending"
          ? "refund-pending"
          : "cancelled";
      return {
        dateISO: a.placedISO,
        orderRef: a.orderRef,
        customer,
        units: a.unitCount,
        status,
        commissionAmountMinor: a.commissionAmountMinor ?? 0,
        sharePct: a.sharePct ?? 100,
        touch: a.touch ?? "sole",
      };
    }),
  );

  // Pre-compute money totals from the raw attributions so the dashboard
  // KPIs render real values. We split them by status here (before the
  // view type collapses "paid-out" into "eligible").
  const pendingCommissionMinor = attributions
    .filter((a) => a.status === "pending")
    .reduce((n, a) => n + (a.commissionAmountMinor ?? 0), 0);
  const approvedCommissionMinor = attributions
    .filter((a) => a.status === "eligible")
    .reduce((n, a) => n + (a.commissionAmountMinor ?? 0), 0);
  const paidOutCommissionMinor = attributions
    .filter((a) => a.status === "paid-out")
    .reduce((n, a) => n + (a.commissionAmountMinor ?? 0), 0);

  return (
    <AffiliateAuthedShell
      affiliate={aff}
      attributedRows={rows}
      totals={{
        pendingCommissionMinor,
        approvedCommissionMinor,
        paidOutCommissionMinor,
      }}
    />
  );
}

// "Marion Clarke" → "M. Clarke" — matches the sample display convention.
function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ?? name;
  const first = parts[0][0];
  const last = parts[parts.length - 1];
  return `${first}. ${last}`;
}
