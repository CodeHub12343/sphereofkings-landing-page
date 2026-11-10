import type { Metadata } from "next";
import { Wrap } from "@/components/shared";
import { listEdiOrders } from "@/lib/store/edi-orders-store";
import { listTradingPartners } from "@/lib/store/trading-partners-store";
import { getEdiProvider } from "@/lib/edi/provider";
import EdiDashboard from "@/components/admin/EdiDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · EDI Operations — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function EdiPage() {
  const [orders, partners] = await Promise.all([
    listEdiOrders().catch(() => []),
    listTradingPartners().catch(() => []),
  ]);
  const provider = getEdiProvider();
  return (
    <section style={pageStyle}>
      <Wrap>
        <EdiDashboard
          orders={orders}
          providerName={provider.name}
          partnerCount={partners.length}
        />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};
