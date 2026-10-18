import styled from "styled-components";
import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import WholesaleQueue from "@/components/admin/WholesaleQueue";
import { listQuotes } from "@/lib/store/quotes-store";

export const dynamic = "force-dynamic";

export default async function AdminWholesalePage() {
  const quotes = await listQuotes();
  return (
    <section style={pageStyle}>
      <Wrap>
        {quotes.length === 0 && <DemoBanner />}
        <header style={headStyle}>
          <h1 style={h1Style}>Wholesale quotes</h1>
          <p style={pStyle}>
            Review and decide on bulk-pricing inquiries. Automatic bands up to
            30% apply at checkout once prices are approved; the 40% tier
            always lands here for owner review. Click a row to open the full
            inquiry.
          </p>
        </header>
        <WholesaleQueue quotes={quotes} />
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
  fontWeight: 800,
};
const pStyle = {
  fontFamily: "'Inter', sans-serif",
  color: "#a89880",
  fontSize: "0.92rem",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 720,
};
