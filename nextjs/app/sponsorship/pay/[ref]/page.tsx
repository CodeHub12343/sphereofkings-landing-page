import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { findSponsorshipByRef } from "@/lib/db/collections/sponsorships";
import { tier as tierOf } from "@/lib/sponsorship";
import SponsorshipPay from "@/components/sponsorship/SponsorshipPay";

export const dynamic = "force-dynamic";

export default async function SponsorshipPayPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const row = await findSponsorshipByRef(ref);
  if (!row) notFound();
  const t = tierOf(row.tier);

  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a", minHeight: "60vh" }}>
        <section style={{ padding: "clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px)" }}>
          <Wrap>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <p
                style={{
                  color: "#c9a227",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                  textAlign: "center",
                }}
              >
                Secure Payment · Powered by Stripe
              </p>
              <h1
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                  color: "#f5f0e8",
                  textAlign: "center",
                  margin: "0 0 12px",
                  fontWeight: 800,
                }}
              >
                Complete your {t.name}
              </h1>
              <p
                style={{
                  color: "#a89880",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.95rem",
                  lineHeight: 1.55,
                  margin: "0 0 24px",
                  textAlign: "center",
                }}
              >
                Reservation <strong style={{ color: "#f5f0e8" }}>{row.ref}</strong>{" "}
                · {row.businessName} · {t.priceDisplay} charged in full on
                submit.
              </p>
              <SponsorshipPay
                sponsorshipRef={row.ref}
                tierName={t.name}
                priceDisplay={t.priceDisplay}
                businessName={row.businessName}
                state={row.state}
              />
            </div>
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
