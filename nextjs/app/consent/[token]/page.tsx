import { notFound } from "next/navigation";
import Link from "next/link";
import { consentByToken } from "@/lib/db/collections/safety-io";
import { findPlayerById } from "@/lib/db/collections/players";
import FeaturePage from "@/components/feature/FeaturePage";
import { FBanner, FSectionTitle } from "@/components/feature/primitives";
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
      <FeaturePage
        eyebrow="Parental consent"
        title={`Already ${consent.status}`}
        subtitle="This consent request has already been resolved."
        centered
        narrow
      >
        <FBanner $tone="info">
          If you believe this is a mistake, contact support at <a href="mailto:hello@sphereofkings.com"
            style={{color:"var(--gold-light,#f0c040)"}}>hello@sphereofkings.com</a>.
        </FBanner>
      </FeaturePage>
    );
  }
  if (new Date(consent.tokenExpiresAt).getTime() < Date.now()) {
    return (
      <FeaturePage eyebrow="Parental consent" title="Link expired"
                   subtitle="Ask your child to request a new consent email." centered narrow>
        <div />
      </FeaturePage>
    );
  }
  const player = await findPlayerById(consent.playerId);
  if (!player) notFound();

  return (
    <FeaturePage
      eyebrow="Verifiable parental consent"
      title="Parental consent"
      subtitle={<>Your child <strong style={{color:"var(--gold-light,#f0c040)"}}>{player.displayName}</strong> (@{player.username}) is asking for consent to use Sphere of Kings.</>}
      centered
      narrow
    >
      <section style={{ marginBottom: 24, padding: 16,
                        background: "var(--bg2,#0d0b08)",
                        border: "1px solid var(--border,#2a2218)", borderRadius: 10 }}>
        <FSectionTitle>What Sphere of Kings does with their data</FSectionTitle>
        <ul style={{ color: "var(--text,#f5f0e8)", fontSize: 14, paddingLeft: 20, margin: 0, lineHeight: 1.75 }}>
          <li>Stores only year of birth (not full DOB).</li>
          <li>Keeps the profile private by default; the leaderboard hides minors.</li>
          <li>Blocks messaging and challenges until this consent is granted.</li>
          <li>No ad-tracking. No third-party profile sharing.</li>
          <li>Full details at <Link href="/content/policy/child-safety.md"
            style={{color:"var(--gold-light,#f0c040)"}}>our child-safety policy</Link>.</li>
        </ul>
      </section>
      <p style={{ color: "var(--text,#f5f0e8)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        To verify you are an adult (COPPA-compliant), we take a one-time{" "}
        <strong style={{color:"var(--gold-light,#f0c040)"}}>$0.50 USD</strong> charge and refund it immediately.
        The charge shows as <code>SPHEREOFKINGS CONSENT</code>.
      </p>
      <ConsentForm token={consent.token} />
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 20 }}>
        You can withdraw consent at any time by emailing hello@sphereofkings.com.
      </p>
    </FeaturePage>
  );
}
