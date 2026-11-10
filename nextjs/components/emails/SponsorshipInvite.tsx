import type { CSSProperties, ReactNode } from "react";
import {
  EmailShell,
  EyebrowBar,
  H1,
  H2,
  Lead,
  Panel,
  Divider,
  Fine,
  palette,
} from "./shell";

/**
 * Generic sponsorship invitation — the "$1,000 entry · tiers up to $20k+"
 * pitch used for wide outreach to game developers, publishers, and brands
 * (distinct from SponsorshipPitch which is tuned to a single named company).
 * Mirrors the kit-email-sponsorship.html structure but ships as a React
 * email so /admin/emails can send it live.
 */
export default function SponsorshipInvite() {
  return (
    <EmailShell previewText="Partnership & sponsorship opportunity — Sphere of Kings · Starting at $1,000 · Kickstarter launch Nov 19, 2026.">
      <EyebrowBar>◆ Sponsorship &amp; Partnership Invitation</EyebrowBar>
      <h1 style={H1}>
        Partner with Sphere of Kings — starting at{" "}
        <span style={{ color: palette.goldSoft }}>$1,000</span>.
      </h1>
      <div style={{ fontSize: 14, color: palette.muted, lineHeight: 1.5, marginBottom: 14 }}>
        Kickstarter launches{" "}
        <strong style={{ color: palette.goldSoft }}>November 19, 2026</strong>.
        Sponsor slots are limited.
      </div>

      <p style={Lead}>Hello,</p>
      <p style={Lead}>
        My name is <strong style={{ color: palette.goldSoft }}>James Scott Bowser</strong>,
        Founder of Creative Design Networks and creator of{" "}
        <strong style={{ color: palette.goldSoft }}>Sphere of Kings</strong> — an
        innovative 7-in-1 spherical board game that brings a new dimension to
        tabletop gaming, puzzles, creativity, and entertainment.
      </p>
      <p style={Lead}>
        We&apos;re preparing to launch our Kickstarter campaign on{" "}
        <strong style={{ color: palette.goldSoft }}>November 19, 2026</strong>,
        and we&apos;re inviting select gaming companies, app developers,
        publishers, and innovative brands to become part of this opportunity.
      </p>

      {/* ---------- Sponsorship tiers ---------- */}
      <div
        style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.goldSoft,
          margin: "22px 0 12px",
        }}
      >
        Sponsorship Tiers
      </div>

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ width: "100%", borderCollapse: "separate", borderSpacing: 8 }}
      >
        <tbody>
          <tr>
            <TierCell label="Entry" amount="$1,000" />
            <TierCell label="Growth" amount="$3,000" />
            <TierCell label="Premier" amount="$10,000" accent />
            <TierCell label="Flagship" amount="$20k+" flagship />
          </tr>
        </tbody>
      </table>
      <div
        style={{
          fontSize: 12,
          color: palette.muted,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        Flagship tier opens the door to negotiated revenue-sharing on Kickstarter earnings.
      </div>

      {/* ---------- Why Partner panel ---------- */}
      <Panel tone="gold">
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: palette.goldSoft,
            marginBottom: 12,
          }}
        >
          Why Partner With Sphere of Kings
        </div>
        <Benefit title="Innovative 7-in-1 game">
          A unique spherical platform combining strategy, puzzles, and creative
          experiences.
        </Benefit>
        <Benefit title="Kickstarter exposure">
          Sponsor recognition throughout our crowdfunding campaign.
        </Benefit>
        <Benefit title="Marketing partnerships">
          Collaborating with{" "}
          <em style={{ color: palette.goldSoft, fontStyle: "normal" }}>Jellop</em>{" "}
          and{" "}
          <em style={{ color: palette.goldSoft, fontStyle: "normal" }}>
            PostcardMania
          </em>{" "}
          on campaign initiatives.
        </Benefit>
        <Benefit title="Millions of views (projected)">
          Digital ads, social, influencer outreach, and additional promotional
          channels.
        </Benefit>
        <Benefit title="Digital gaming opportunities">
          Open to collaborations with mobile app developers to bring SoK into
          digital play.
        </Benefit>
        <Benefit title="Licensing &amp; branded editions">
          IP licensing, co-branded game editions, and custom designs.
        </Benefit>
        <Benefit title="Long-term growth">
          A distributed 3D-printing manufacturing network, digital tournaments,
          and an international gaming brand.
        </Benefit>
      </Panel>

      {/* ---------- Opportunities ---------- */}
      <h2 style={H2}>Sponsorship opportunities</h2>
      <p style={Lead}>
        Whether you&apos;re interested in a{" "}
        <strong style={{ color: palette.goldSoft }}>
          $1,000 introductory sponsorship
        </strong>
        , a larger promotional partnership, or a strategic collaboration, we&apos;d
        love to explore how we can create mutual value. For select higher-tier
        sponsorships, we are also open to discussing{" "}
        <strong style={{ color: palette.goldSoft }}>
          negotiated revenue-sharing arrangements
        </strong>{" "}
        tied to our Kickstarter campaign.
      </p>
      <p style={Lead}>
        Our goal is to build meaningful, long-term partnerships that help
        sponsors gain exposure while supporting the launch and expansion of
        Sphere of Kings.
      </p>

      <h2 style={H2}>Let&apos;s collaborate</h2>
      <p style={Lead}>
        We&apos;d love to learn more about your company and discuss how we might
        work together — through sponsorships, digital game development,
        licensing, cross-promotion, or other creative opportunities.
      </p>
      <p style={Lead}>
        <strong style={{ color: palette.goldSoft }}>
          Would your company be open to reviewing our sponsorship opportunities
          or discussing a potential collaboration?
        </strong>
      </p>

      {/* ---------- CTAs ---------- */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "16px 0" }}>
        <tbody>
          <tr>
            <td
              align="center"
              style={{ backgroundColor: palette.gold, borderRadius: 6 }}
            >
              <a
                href="https://sphereofkings.com/sponsorship"
                style={{
                  display: "inline-block",
                  padding: "14px 28px",
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: palette.bg,
                  textDecoration: "none",
                }}
              >
                Review Sponsorship Packages
              </a>
            </td>
            <td style={{ width: 12 }} />
            <td
              align="center"
              style={{ border: `1px solid ${palette.gold}`, borderRadius: 6 }}
            >
              <a
                href="mailto:Jbowser727@gmail.com?subject=Sphere%20of%20Kings%20Sponsorship%20%E2%80%94%20Interested"
                style={{
                  display: "inline-block",
                  padding: "13px 24px",
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: palette.goldSoft,
                  textDecoration: "none",
                }}
              >
                Reply to James
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 6, textAlign: "center" }}>
        <a
          href="https://sphereofkings.com"
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: palette.muted,
            textDecoration: "none",
          }}
        >
          SphereofKings.com →
        </a>
      </div>

      <Divider />

      <p style={Lead}>
        Thank you for your time and consideration. We look forward to the
        possibility of working together.
      </p>
      <p style={{ ...Lead, color: palette.muted }}>Best regards,</p>
      <div
        style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 16,
          fontWeight: 700,
          color: palette.ink,
          letterSpacing: "0.02em",
        }}
      >
        James Scott Bowser
      </div>
      <div style={{ fontSize: 13, color: palette.muted, marginTop: 2 }}>
        Founder &amp; CEO · Creative Design Networks · Creator of Sphere of Kings
      </div>
      <div style={{ fontSize: 13, color: palette.goldSoft, marginTop: 8, lineHeight: 1.7 }}>
        <a href="https://sphereofkings.com" style={{ color: palette.goldSoft, textDecoration: "none" }}>
          sphereofkings.com
        </a>
        <br />
        <a href="mailto:Jbowser727@gmail.com" style={{ color: palette.goldSoft, textDecoration: "none" }}>
          Jbowser727@gmail.com
        </a>
        <br />
        <a href="tel:+12096229391" style={{ color: palette.goldSoft, textDecoration: "none" }}>
          209-622-9391
        </a>
      </div>

      <p style={Fine}>
        You are receiving this because your company was identified as a
        potential partner or sponsor for Sphere of Kings. Kickstarter launch:
        November 19, 2026.
      </p>
    </EmailShell>
  );
}

/* ---------------- helpers ---------------- */

function TierCell({
  label,
  amount,
  accent,
  flagship,
}: {
  label: string;
  amount: string;
  accent?: boolean;
  flagship?: boolean;
}) {
  const bg = flagship
    ? "linear-gradient(135deg, rgba(201,162,39,0.18), rgba(198,43,68,0.08))"
    : accent
    ? "rgba(201,162,39,0.10)"
    : palette.surfaceAlt;
  const border = accent || flagship ? palette.gold : palette.border;
  const labelColor = accent ? palette.gold : palette.muted;
  const cellStyle: CSSProperties = {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: "14px 8px",
    textAlign: "center",
    width: "25%",
  };
  return (
    <td style={cellStyle}>
      <div
        style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: flagship ? palette.goldSoft : labelColor,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 20,
          fontWeight: 700,
          color: palette.goldSoft,
          marginTop: 4,
        }}
      >
        {amount}
      </div>
    </td>
  );
}

function Benefit({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "6px 0",
        borderTop: `1px solid ${palette.border}`,
        fontSize: 13.5,
        lineHeight: 1.55,
        color: palette.ink,
      }}
    >
      <span
        style={{
          color: palette.gold,
          fontWeight: 700,
          fontFamily: "'Cinzel', Georgia, serif",
        }}
      >
        ◆
      </span>
      &nbsp;<strong style={{ color: palette.goldSoft }}>{title}</strong> —{" "}
      {children}
    </div>
  );
}
