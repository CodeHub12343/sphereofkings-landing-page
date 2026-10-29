import { Button, EmailShell, EyebrowBar, H1, Lead, Muted } from "./shell";

export type SponsorMagicLinkEmailProps = {
  contactName: string;
  businessName: string;
  tierName: string;
  linkUrl: string;
  ttlMinutes: number;
};

export default function SponsorMagicLinkEmail({
  contactName,
  businessName,
  tierName,
  linkUrl,
  ttlMinutes,
}: SponsorMagicLinkEmailProps) {
  const firstName = contactName.split(/\s+/)[0] || contactName;
  return (
    <EmailShell previewText={`Sign in to your Sphere of Kings sponsor portal.`}>
      <EyebrowBar>Sponsor Portal · Sign-In Link</EyebrowBar>
      <h1 style={H1}>Hi {firstName}.</h1>
      <p style={Lead}>
        Click the button below to sign in to your {businessName} sponsor
        dashboard — track your {tierName} deliverables, campaign progress, and
        monthly reports.
      </p>
      <Button href={linkUrl}>Open my sponsor dashboard</Button>
      <p style={Muted}>
        This link signs you in without a password. It expires in{" "}
        <strong>{ttlMinutes} minutes</strong> and can only be used once. If you
        didn't request this, you can safely ignore the email.
      </p>
      <p style={Muted}>
        Having trouble with the button? Paste this URL into your browser:
        <br />
        <span style={{ wordBreak: "break-all", color: "#f0c040" }}>
          {linkUrl}
        </span>
      </p>
    </EmailShell>
  );
}
