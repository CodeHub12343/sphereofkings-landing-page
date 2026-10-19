import { notFound } from "next/navigation";
import { consentByToken } from "@/lib/db/collections/safety-io";
import { findPlayerById } from "@/lib/db/collections/players";
import ConsentForm from "./ConsentForm";

export const dynamic = "force-dynamic";

export default async function ConsentPage(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const consent = await consentByToken(token);
  if (!consent) notFound();

  if (consent.status !== "pending") {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>
          Already {consent.status}
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>
          This consent request has already been resolved. If you believe this is a mistake,
          contact support at hello@sphereofkings.com.
        </p>
      </main>
    );
  }
  if (new Date(consent.tokenExpiresAt).getTime() < Date.now()) {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>Link expired</h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>Ask your child to request a new consent email.</p>
      </main>
    );
  }
  const player = await findPlayerById(consent.playerId);
  if (!player) notFound();

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 540, margin: "0 auto" }}>
      <h1 style={{ color: "var(--text,#f5f0e8)", margin: 0 }}>Parental consent</h1>
      <p style={{ color: "var(--text-muted,#a89880)", marginTop: 6 }}>
        Your child <strong>{player.displayName}</strong> (@{player.username}) is asking
        for consent to use Sphere of Kings.
      </p>
      <section style={{
        margin: "20px 0", padding: 16,
        background: "var(--bg2,#0d0b08)",
        border: "1px solid var(--border,#2a2218)", borderRadius: 8,
      }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>
          What Sphere of Kings does with their data
        </h2>
        <ul style={{ color: "var(--text,#f5f0e8)", fontSize: 14, paddingLeft: 20, margin: 0, lineHeight: 1.6 }}>
          <li>Stores only year of birth (not full DOB).</li>
          <li>Keeps the profile private by default; the leaderboard hides minors.</li>
          <li>Blocks messaging and challenges until this consent is granted.</li>
          <li>No ad-tracking. No third-party profile sharing.</li>
          <li>Full details at <a href="/content/policy/child-safety.md" style={{ color: "var(--gold-light,#f0c040)" }}>our child-safety policy</a>.</li>
        </ul>
      </section>
      <section style={{ margin: "16px 0" }}>
        <p style={{ color: "var(--text,#f5f0e8)", fontSize: 14, margin: "0 0 10px" }}>
          To verify you are an adult (COPPA-compliant), we take a one-time{" "}
          <strong>$0.50 USD</strong> charge and refund it immediately.
          The charge shows as <code>SPHEREOFKINGS CONSENT</code>.
        </p>
      </section>
      <ConsentForm token={consent.token} />
      <p style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginTop: 16 }}>
        You can withdraw consent at any time by emailing hello@sphereofkings.com.
      </p>
    </main>
  );
}
