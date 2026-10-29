import { Wrap } from "@/components/shared";
import SponsorshipsAdmin from "@/components/admin/SponsorshipsAdmin";
import { listSponsorships } from "@/lib/db/collections/sponsorships";
import { listWaitlist } from "@/lib/db/collections/sponsorship-waitlist";
import { allTiers } from "@/lib/sponsorship";
import { getSponsorshipAvailability } from "@/app/sponsorship/actions";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipsPage() {
  const [sponsors, waitlist, availability] = await Promise.all([
    listSponsorships(),
    listWaitlist(),
    getSponsorshipAvailability(),
  ]);
  return (
    <section
      style={{ padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)" }}
    >
      <Wrap>
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#f5f0e8",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              margin: "0 0 6px",
              fontWeight: 800,
            }}
          >
            Sponsorships
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "#a89880",
              fontSize: "0.95rem",
              margin: 0,
            }}
          >
            Live view of paid sponsors, pending Stripe payments, and the
            notification waitlist. Pending reservations hold a slot until
            the Stripe payment resolves.
          </p>
        </header>
        <SponsorshipsAdmin
          sponsors={sponsors}
          waitlist={waitlist}
          availability={availability}
          tiers={allTiers()}
        />
      </Wrap>
    </section>
  );
}
