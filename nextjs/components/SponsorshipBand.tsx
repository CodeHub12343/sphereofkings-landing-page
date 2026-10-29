import Link from "next/link";
import { getSponsorshipAvailability } from "@/app/sponsorship/actions";
import { allTiers, KICKSTARTER_LAUNCH_DATE } from "@/lib/sponsorship";
import SponsorshipBandClient from "./SponsorshipBandClient";

// Landing-page teaser for the full /sponsorship program. Server-rendered
// so slot availability is honest at paint time — the full purchase +
// waitlist flow lives on /sponsorship, this band just surfaces the
// opportunity and funnels interested businesses there.
export default async function SponsorshipBand() {
  const availability = await getSponsorshipAvailability();
  return (
    <SponsorshipBandClient
      availability={availability}
      tiers={allTiers()}
      launchDate={KICKSTARTER_LAUNCH_DATE}
    />
  );
}
