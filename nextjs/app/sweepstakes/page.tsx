import type { Metadata } from "next";
import Link from "next/link";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FSectionTitle, FBanner, FChip } from "@/components/feature/primitives";
import { flag } from "@/lib/feature-flags";
import AmoeForm from "./AmoeForm";

export const metadata: Metadata = {
  title: "Royal Sphere Giveaway · Sphere of Kings",
  description: "Share Sphere of Kings. Every 100 verified entrants wins one person a free spherical game board.",
};
export const dynamic = "force-dynamic";

// Rules counsel-signed on 2026-10-20. Bump the version string whenever
// the sponsor publishes an updated rules document; it is written onto
// every drawing round at seal time so winners can see which rules
// governed them.
const RULES_VERSION = "1.0";
const RULES_EFFECTIVE_DATE = "2026-10-20";

export default function SweepstakesPage() {
  const open = flag("sweepstakesEntries");
  return (
    <FeaturePage
      eyebrow="Royal Sphere Giveaway"
      title="Share. Enter. One winner every 100 entrants."
      subtitle={<>Every verified 100 entrants, one random qualifier wins a free Sphere of Kings game board. No purchase necessary. A free alternative-entry method is below.</>}
      centered
    >
      {open ? (
        <FBanner $tone="success" style={{ marginBottom: 24 }}>
          <strong>Entries are open.</strong> The official rules below are
          counsel-approved (v{RULES_VERSION}, effective {RULES_EFFECTIVE_DATE}).
          Share your referral link or enter via the free AMOE form.
        </FBanner>
      ) : (
        <FBanner $tone="info" style={{ marginBottom: 24 }}>
          <strong>Entries are temporarily paused.</strong> We're between
          drawing rounds. Check back shortly.
        </FBanner>
      )}

      <FGrid $min="260px">
        <FCard>
          <FChip>Step 1</FChip>
          <h3 style={{ marginTop: 10 }}>Share your link</h3>
          <p>Every signed-in player has a unique share link under
            <Link href="/me/referrals" style={{ color: "var(--gold-light,#f0c040)" }}> /me/referrals</Link>.
            Each click + verified signup counts toward the pool.</p>
        </FCard>
        <FCard>
          <FChip>Step 2</FChip>
          <h3 style={{ marginTop: 10 }}>Round seals at 100</h3>
          <p>Once the pool has 100 verified entrants (sign-ups + AMOE), the round
            seals. 50 qualifiers are selected by objective, published criteria.</p>
        </FCard>
        <FCard>
          <FChip>Step 3</FChip>
          <h3 style={{ marginTop: 10 }}>Random draw</h3>
          <p>One winner is drawn uniformly at random from the 50 qualifiers using
            cryptographic randomness. The winner is emailed within 24 hours.</p>
        </FCard>
      </FGrid>

      <section style={{ marginTop: 48 }}>
        <FSectionTitle>Free alternative method of entry (AMOE)</FSectionTitle>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          No purchase or share is required. Mail-in and web-form entries have
          equal odds. Fill out the form below for a free entry equivalent to
          one verified share. Limit: one AMOE entry per person per round.
        </p>
        <AmoeForm open={open} />
      </section>

      <section style={{ marginTop: 48 }}>
        <FSectionTitle>
          Official rules{" "}
          <FChip $tone="success" style={{ marginLeft: 8 }}>
            v{RULES_VERSION} · counsel-approved · effective {RULES_EFFECTIVE_DATE}
          </FChip>
        </FSectionTitle>
        <FCard>
          <p><strong>1. Sponsor.</strong> Sphere of Kings™, operated by James Scott Bowser.
            Contact: <a href="mailto:hello@sphereofkings.com" style={{ color: "var(--gold-light,#f0c040)" }}>hello@sphereofkings.com</a>.
            This promotion is in no way sponsored, endorsed, or administered by any
            social media platform.</p>
          <p style={{ marginTop: 12 }}><strong>2. Eligibility.</strong> Open to legal residents of the 50 United States
            and the District of Columbia, age 13 or older at the time of entry. Minors
            (ages 13–17) must have parental consent recorded on their account (see
            Sphere of Kings child-safety policy). Employees, officers, and immediate
            family or household members of the Sponsor are not eligible. Void where
            prohibited or restricted by law.</p>
          <p style={{ marginTop: 12 }}><strong>3. Entry period.</strong> Rolling — each drawing round opens the moment
            the previous round seals and closes when the verified-entrant pool reaches
            100. The Sponsor may pause or resume entries between rounds at its sole
            discretion by setting the <code>FEATURE_SWEEPSTAKES_ENTRIES</code> kill switch.</p>
          <p style={{ marginTop: 12 }}><strong>4. How to enter.</strong> Two methods, equal odds:
            <br/>(a) <em>Referral entry.</em> Create a free Sphere of Kings account, open{" "}
            <code>/me/referrals</code>, and share your unique referral link. Each new
            verified sign-up through your link is one entry. "Verified" means a human
            visitor with a passing anti-bot check, no duplicate browser cookie, and no
            self-referral; the Sponsor's verification criteria are objective and
            published in <code>lib/sweepstakes.ts</code>.
            <br/>(b) <em>Free AMOE.</em> Submit the free Alternative Method of Entry
            form above with your name, email, state, and mailing address. Equal odds.
            Limit one AMOE entry per person per round.</p>
          <p style={{ marginTop: 12 }}><strong>5. Round seal + qualifier selection.</strong> A round seals the moment
            100 verified entries have been received. The Sponsor's engine then selects
            50 qualifiers using objective, deterministic criteria — the earliest verified
            entry per unique entrant, with ties broken by a SHA-256 hash of
            <code> (entrantId + round.id)</code>. Procedure is fully published in{" "}
            <code>lib/sweepstakes.ts</code> and reproducible by any auditor.</p>
          <p style={{ marginTop: 12 }}><strong>6. Winner selection.</strong> One (1) winner is drawn uniformly at random
            from the 50 qualifiers using Node.js <code>crypto.randomBytes</code> with
            rejection sampling to eliminate modulo bias. Draw is not seeded; results
            cannot be reproduced in advance.</p>
          <p style={{ marginTop: 12 }}><strong>7. Prize.</strong> One (1) Royal Checkers – Two-Color Board & Checkers Set
            per round, approximate retail value US$179. No cash alternative, substitution,
            or transfer except at the Sponsor's sole discretion. Taxes, where applicable,
            are the winner's responsibility.</p>
          <p style={{ marginTop: 12 }}><strong>8. Winner notification + claim window.</strong> The winner is notified by
            email within 24 hours of the draw. Winner must respond within 72 hours with
            shipping confirmation. If unclaimed, a replacement winner is drawn from the
            remaining qualifiers.</p>
          <p style={{ marginTop: 12 }}><strong>9. Privacy.</strong> Entry information is used solely to administer the
            sweepstakes and ship the prize. The Sponsor does not sell, rent, or share
            entry data. Full policy: Privacy Policy linked in the footer.</p>
          <p style={{ marginTop: 12 }}><strong>10. Dispute resolution.</strong> By entering, you agree that any dispute
            arising from this sweepstakes will be resolved individually, under the laws
            of the State of Delaware, without resort to class action.</p>
          <p style={{ marginTop: 12 }}><strong>11. Winners list.</strong> Past round winners are published at{" "}
            <a href="/champions" style={{ color: "var(--gold-light,#f0c040)" }}>/champions</a>.
            A copy of these rules can be requested at any time from the Sponsor address above.</p>
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>
            Questions? Email <a href="mailto:hello@sphereofkings.com"
              style={{ color: "var(--gold-light,#f0c040)" }}>hello@sphereofkings.com</a>.
          </p>
        </FCard>
      </section>
    </FeaturePage>
  );
}
