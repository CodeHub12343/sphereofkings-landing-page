import type { Metadata } from "next";
import Link from "next/link";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FSectionTitle, FBanner, FBtnGoldLink } from "@/components/feature/primitives";
import { flag } from "@/lib/feature-flags";
import {
  SUBMISSION_FEE_CENTS, COMMISSION_TIER_1, COMMISSION_TIER_2, TIER_UPGRADE_UNITS,
} from "@/lib/db/collections/licensing";

export const metadata: Metadata = {
  title: "License your sphere design · Sphere of Kings",
};
export const dynamic = "force-dynamic";

export default function LicenseLandingPage() {
  const open = flag("licensingMarketplace");
  const fee = (SUBMISSION_FEE_CENTS / 100).toLocaleString("en-US",
    { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  return (
    <FeaturePage
      eyebrow="Designer Licensing"
      title="Turn your finished sphere into a product."
      subtitle="If you built a sphere design (puzzle, pattern, game piece, custom upload) you own and want to sell through Sphere of Kings, you can license it to us. We handle production, catalog listing, and payment — you earn commission on every unit sold."
      centered
    >
      {!open && (
        <FBanner $tone="info" style={{ marginBottom: 24 }}>
          <strong>Applications open soon.</strong> The license agreement + NDA are
          with counsel. Once reviewed, applications open at the button below.
        </FBanner>
      )}

      <FGrid $min="280px">
        <FCard>
          <h3>{fee} submission fee</h3>
          <p>Covers legal review, catalog setup, prototype production, and
            quality verification. Payable only after admin approval.</p>
        </FCard>
        <FCard>
          <h3>{Math.round(COMMISSION_TIER_1 * 100)}% commission</h3>
          <p>Standard tier. You earn {Math.round(COMMISSION_TIER_1 * 100)}% of net
            on every unit sold through Sphere of Kings.</p>
        </FCard>
        <FCard>
          <h3>{Math.round(COMMISSION_TIER_2 * 100)}% after {TIER_UPGRADE_UNITS.toLocaleString()} units</h3>
          <p>Tier upgrades automatically. Once your design hits
            {" "}{TIER_UPGRADE_UNITS.toLocaleString()} units sold, future sales
            earn {Math.round(COMMISSION_TIER_2 * 100)}%.</p>
        </FCard>
      </FGrid>

      <section style={{ marginTop: 48 }}>
        <FSectionTitle>How the process works</FSectionTitle>
        <ol style={{ color: "var(--text,#f5f0e8)", lineHeight: 1.75, paddingLeft: 20 }}>
          <li><strong>Submit your design.</strong> Up to 10 photos, your proposed
            retail price, and an IP disclosure (confirming the design is yours
            and doesn&apos;t infringe third-party rights).</li>
          <li><strong>We review.</strong> Our team evaluates the design for
            production feasibility, originality, and brand fit. Decision in
            7-10 business days.</li>
          <li><strong>If approved,</strong> you pay the {fee} submission fee via
            Stripe. The fee is non-refundable once production starts.</li>
          <li><strong>Sign the license agreement + NDA.</strong> Click-sign through
            the admin portal. Both documents become part of your account record.</li>
          <li><strong>Your design goes live</strong> in the Sphere of Kings catalog.
            You earn commission on every unit sold, paid monthly.</li>
        </ol>
      </section>

      <section style={{ marginTop: 48 }}>
        <FSectionTitle>Legal & privacy</FSectionTitle>
        <FCard>
          <p>Every licensed designer signs a <strong>license agreement</strong>
            (grants Sphere of Kings the right to produce and sell your design on
            agreed terms) and an <strong>NDA + non-compete</strong> (protects both
            parties while the design is under production and in-market).</p>
          <p style={{ marginTop: 12 }}>
            You retain copyright. The license is exclusive to Sphere of Kings for the
            licensed configuration (physical spherical product) and non-exclusive for
            your other uses (prints, digital art, personal display).</p>
          <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
            Final templates pending review by counsel. Preview versions available
            after application acceptance.
          </p>
        </FCard>
      </section>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        {open ? (
          <FBtnGoldLink href="/license/apply">Start application</FBtnGoldLink>
        ) : (
          <>
            <FBtnGoldLink href="/me" style={{ opacity: 0.5, pointerEvents: "none" }}>
              Applications open soon
            </FBtnGoldLink>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12 }}>
              Want to be notified? <Link href="/#signup"
                style={{ color: "var(--gold-light,#f0c040)" }}>Join the mailing list</Link>.
            </p>
          </>
        )}
      </div>
    </FeaturePage>
  );
}
