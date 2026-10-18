import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import AuditView from "@/components/admin/AuditView";
import { listAuditEvents } from "@/lib/db/collections/audit";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Audit log — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage() {
  const events = await listAuditEvents({ limit: 300 });
  return (
    <section style={pageStyle}>
      <Wrap>
        {events.length === 0 && <DemoBanner />}
        <header style={headStyle}>
          <h1 style={h1Style}>Audit log</h1>
          <p style={pStyle}>
            Every admin edit that touches a persisted record lands here —
            quote decisions, product changes, month-close and re-open.
            Click any row to see the full event payload.
          </p>
        </header>
        <AuditView events={events} />
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
