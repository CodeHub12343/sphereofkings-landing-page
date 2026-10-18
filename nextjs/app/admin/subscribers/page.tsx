import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import SubscribersAdmin from "@/components/admin/SubscribersAdmin";
import { listSubscribers } from "@/lib/store/subscribers-store";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();
  return (
    <section style={pageStyle}>
      <Wrap>
        {subscribers.length === 0 && (
          <DemoBanner
            title="No subscribers yet."
            message={
              <>
                The launch list fills as visitors confirm their email from the
                sign-up form. Nothing is faked here — this view stays empty
                until a real subscriber opts in.
              </>
            }
          />
        )}
        <header style={headStyle}>
          <h1 style={h1Style}>Subscribers</h1>
          <p style={pStyle}>
            The launch list, read from the file-backed subscribers store.
            Resend the confirmation URL to anyone still pending — the URL
            is kept stable per record. Pending and Unsubscribed accounts
            are excluded from launch-email sends.
          </p>
        </header>
        <SubscribersAdmin subscribers={subscribers} />
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
