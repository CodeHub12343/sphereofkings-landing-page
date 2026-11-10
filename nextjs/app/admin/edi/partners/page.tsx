import type { Metadata } from "next";
import { Wrap } from "@/components/shared";
import { listTradingPartners } from "@/lib/store/trading-partners-store";
import TradingPartnersAdmin from "@/components/admin/TradingPartnersAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Trading partners — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function TradingPartnersPage() {
  const partners = await listTradingPartners().catch(() => []);
  return (
    <section style={pageStyle}>
      <Wrap>
        <TradingPartnersAdmin partners={partners} />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};
