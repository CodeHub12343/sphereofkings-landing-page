import type { Metadata } from "next";
import { listTradingPartners } from "@/lib/store/trading-partners-store";
import TradingPartnersAdmin from "@/components/admin/TradingPartnersAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Trading partners — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function TradingPartnersPage() {
  const partners = await listTradingPartners().catch(() => []);
  return <TradingPartnersAdmin partners={partners} />;
}
