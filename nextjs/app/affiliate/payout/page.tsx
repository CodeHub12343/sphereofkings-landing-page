import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AFF_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import PayoutMethodForm from "@/components/affiliate/PayoutMethodForm";

export const metadata = {
  title: "Payout method — Sphere of Kings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AffiliatePayoutPage() {
  const jar = await cookies();
  const cookie = jar.get(AFF_SESSION_COOKIE)?.value;
  const payload = await readSessionToken(cookie, "affiliate").catch(() => null);
  if (!payload) redirect("/affiliate/signin");

  const aff = await findAffiliateByCode(payload.id);
  if (!aff || aff.state !== "active") redirect("/affiliate/signin");

  return (
    <PayoutMethodForm
      currentMethod={aff.payoutMethod ?? null}
      currentDetails={aff.payoutDetails ?? ""}
      updatedISO={aff.payoutUpdatedISO ?? null}
    />
  );
}
