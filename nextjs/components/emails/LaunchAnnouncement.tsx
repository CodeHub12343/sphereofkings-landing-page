import {
  EmailShell,
  EyebrowBar,
  H1,
  Lead,
  Button,
  Panel,
  Divider,
  Fine,
  palette,
} from "./shell";

export type LaunchAnnouncementProps = {
  firstName?: string;
  shopUrl?: string;
  kickstarterUrl?: string;
};

// The one-time launch-day email. Sent to Consented subscribers. Wording
// matches the brand rules: deliveries start December 1 (never "arrives"),
// Kickstarter mid-December as an expectation.
export default function LaunchAnnouncement({
  firstName,
  shopUrl = "https://sphereofkings.com/shop",
  kickstarterUrl = "{{kickstarter_url}}",
}: LaunchAnnouncementProps) {
  const greeting = firstName ? `Hello, ${firstName}.` : "Hello.";
  return (
    <EmailShell previewText="Christmas Early Bird preorders are open. Deliveries start December 1, 2026.">
      <EyebrowBar>Christmas Early Bird · Live Now</EyebrowBar>
      <h1 style={H1}>Your Sphere of Kings is a click away.</h1>
      <p style={Lead}>{greeting}</p>
      <p style={Lead}>
        The Christmas Early Bird shop is open. You can now preorder the
        Sphere of Kings 7-in-1 — a spherical, customizable board game with
        seven ways to play — in time for Christmas morning.
      </p>
      <Panel tone="gold">
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: palette.goldSoft,
            marginBottom: 6,
          }}
        >
          Deliveries start December 1, 2026
        </div>
        <div style={{ fontSize: 13, color: palette.muted, lineHeight: 1.55 }}>
          We ship orders in the sequence they are paid. Not every parcel
          will arrive on December 1 — your tracking number lands in your
          inbox the moment your Sphere leaves the workshop.
        </div>
      </Panel>
      <Button href={shopUrl}>Shop the Early Bird</Button>
      <Divider />
      <p style={Lead}>
        If you prefer the Kickstarter route, the campaign launches on{" "}
        <strong style={{ color: palette.goldSoft }}>
          November 19, 2026
        </strong>
        . Kickstarter deliveries are expected around mid-December 2026 —
        an expectation, not a guarantee.
      </p>
      <p style={Lead}>
        <a
          href={kickstarterUrl}
          style={{ color: palette.goldSoft, textDecoration: "underline" }}
        >
          Learn more about the Kickstarter chapter →
        </a>
      </p>
      <p style={Fine}>
        You received this because you joined the Sphere of Kings launch
        list. If this went to spam, add{" "}
        <strong>hello@sphereofkings.com</strong> to your contacts so you
        don't miss shipping updates.
      </p>
    </EmailShell>
  );
}
