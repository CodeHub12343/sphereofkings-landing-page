import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SponsorSigninForm from "@/components/sponsor/SponsorSigninForm";
import { Wrap } from "@/components/shared";

export const metadata: Metadata = {
  title: "Sponsor Sign In — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function SponsorSigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorText =
    error === "expired"
      ? "That sign-in link expired. Enter your email to get a fresh one."
      : error === "invalid"
      ? "That sign-in link is no longer valid. Request a new one below."
      : error === "no-match"
      ? "No paid sponsorship is on file for that email. Contact James at Jbowser727@gmail.com if that's unexpected."
      : null;
  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a", minHeight: "60vh" }}>
        <section
          style={{
            padding: "clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px)",
          }}
        >
          <Wrap>
            <div style={{ maxWidth: 440, margin: "0 auto" }}>
              <p
                style={{
                  color: "#c9a227",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.76rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  margin: "0 0 8px",
                  textAlign: "center",
                }}
              >
                Sponsor Portal
              </p>
              <h1
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  color: "#f5f0e8",
                  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                  textAlign: "center",
                  margin: "0 0 14px",
                  fontWeight: 800,
                }}
              >
                Sign in to your dashboard
              </h1>
              <p
                style={{
                  color: "#a89880",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  margin: "0 0 24px",
                  lineHeight: 1.55,
                }}
              >
                We'll email you a one-click sign-in link. No password needed —
                enter the email you used when you purchased your sponsorship.
              </p>
              <SponsorSigninForm initialError={errorText} />
            </div>
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
