import {
  Button,
  EmailShell,
  EyebrowBar,
  H1,
  H2,
  Lead,
  Muted,
  Panel,
  KV,
  Divider,
  Fine,
} from "./shell";

export type SponsorshipConfirmationEmailProps = {
  tierName: string;
  priceDisplay: string;
  businessName: string;
  contactName: string;
  ref: string;
  kickstarterLaunchDate: string;
};

export default function SponsorshipConfirmationEmail({
  tierName,
  priceDisplay,
  businessName,
  contactName,
  ref,
  kickstarterLaunchDate,
}: SponsorshipConfirmationEmailProps) {
  const firstName = contactName.split(/\s+/)[0] || contactName;
  return (
    <EmailShell previewText={`Your ${tierName} is confirmed — welcome aboard.`}>
      <EyebrowBar>Sponsorship Confirmed</EyebrowBar>
      <h1 style={H1}>Welcome to Sphere of Kings, {firstName}.</h1>
      <p style={Lead}>
        Thank you for sponsoring our Kickstarter launch. Your{" "}
        <strong>{tierName}</strong> payment of <strong>{priceDisplay}</strong> is
        confirmed and {businessName} is now officially on the roster.
      </p>

      <Panel tone="gold">
        <KV k="Sponsor" v={businessName} />
        <KV k="Package" v={tierName} />
        <KV k="Investment" v={priceDisplay} mono />
        <KV k="Reference" v={ref} mono />
      </Panel>

      <h2 style={H2}>Your sponsor dashboard</h2>
      <p style={Lead}>
        We've opened a dedicated dashboard for you. Sign in with the email
        on this account to track every shoutout, video, boosted post and
        business spotlight as it goes live, and to upload your brand assets
        for us to use.
      </p>
      <Button href="https://sphereofkings.com/sponsor/signin">
        Open my dashboard
      </Button>

      <h2 style={H2}>What happens next</h2>
      <p style={Lead}>
        Our sponsorship coordinator will reach out within one business day to
        confirm brand assets (logo, website link, business description) and the
        promotional calendar for your 90-day campaign.
      </p>
      <p style={Muted}>
        Our Kickstarter launches on <strong>{kickstarterLaunchDate}</strong>.
        Your 90-day promotional window runs from the launch date forward.
      </p>

      <Divider />

      <p style={Muted}>
        Questions in the meantime? Reply to this email or reach James Bowser
        directly:
        <br />
        James Bowser · Founder, Sphere of Kings
        <br />
        Email: Jbowser727@gmail.com · Phone: 209-622-9391
      </p>

      <p style={Fine}>
        Advertising budgets for boosted posts, physical printing, giveaways and
        shipping are governed by the sponsorship agreement sent separately. Reach,
        engagement and Kickstarter funding outcomes are not guaranteed.
      </p>
    </EmailShell>
  );
}
