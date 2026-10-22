import { Wrap } from "@/components/shared";
import AffiliatesAdmin from "@/components/admin/AffiliatesAdmin";
import { aggregateByAffiliate } from "@/lib/db/collections/attributed-orders";
import { listAffiliates } from "@/lib/db/collections/affiliates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Affiliates · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function AdminAffiliatesPage() {
  // Two sources read in parallel. Affiliates are the actual records
  // (seeded from SAMPLE_AFFILIATES on an empty collection); aggregates
  // are rolled up per-code from attributedOrders.
  const [affiliates, aggregates] = await Promise.all([
    listAffiliates(),
    aggregateByAffiliate(),
  ]);

  return (
    <section style={pageStyle}>
      <Wrap>
        <header style={headStyle}>
          <h1 style={h1Style}>Affiliates</h1>
          <p style={pStyle}>
            Approve new applications and suspend misbehaving accounts. Each
            row's record lives in the <strong>affiliates</strong> collection;
            counts and commissions come from <strong>attributedOrders</strong>
            and flip as the Stripe webhook confirms payments.
          </p>
        </header>
        <AffiliatesAdmin affiliates={affiliates} aggregates={aggregates} />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};
const headStyle = { marginBottom: 20 };
const h1Style = {
  fontFamily: "'Cinzel', serif",
  color: "#f5f0e8",
  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
  margin: "0 0 6px",
  fontWeight: 800 as const,
};
const pStyle = {
  fontFamily: "'Inter', sans-serif",
  color: "#a89880",
  fontSize: "0.92rem",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 720,
};
