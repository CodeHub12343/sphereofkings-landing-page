import { EmailShell, EyebrowBar, H1, Lead, Muted, Fine } from "./shell";

export type SponsorshipWaitlistEmailProps = {
  tierName: string;
  tierPriceDisplay: string;
  contactName: string;
  businessName: string;
};

export default function SponsorshipWaitlistEmail({
  tierName,
  tierPriceDisplay,
  contactName,
  businessName,
}: SponsorshipWaitlistEmailProps) {
  const firstName = contactName.split(/\s+/)[0] || contactName;
  return (
    <EmailShell
      previewText={`We'll email you the moment a ${tierName} slot opens.`}
    >
      <EyebrowBar>You're On The List</EyebrowBar>
      <h1 style={H1}>Thanks, {firstName}.</h1>
      <p style={Lead}>
        We have {businessName} on the notification list for our{" "}
        <strong>{tierName}</strong> package ({tierPriceDisplay}). The current
        slots are claimed, but if one opens up — a sponsor withdraws, a slot is
        released, or we add new slots to the program — we'll email you first.
      </p>
      <p style={Lead}>
        In the meantime, James Bowser (founder) may reach out personally if a
        slot opens or if a sponsorship structured for your business specifically
        becomes available.
      </p>

      <p style={Muted}>
        James Bowser · Founder, Sphere of Kings
        <br />
        Email: Jbowser727@gmail.com · Phone: 209-622-9391
      </p>

      <p style={Fine}>
        You are receiving this because you asked to be notified about Sphere of
        Kings sponsorship openings. Reply to this email to opt out.
      </p>
    </EmailShell>
  );
}
