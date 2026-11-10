import {
  EmailShell,
  EyebrowBar,
  H1,
  H2,
  Lead,
  Muted,
  Button,
  Panel,
  Divider,
  Fine,
  palette,
} from "./shell";

export type SponsorshipPitchProps = {
  /** Named company / team in the greeting. Defaults to a generic open. */
  companyName?: string;
  /** Headline amount: "$20,000", "$1,000", etc. */
  sponsorshipAmount?: string;
  /** Rev-share offered against campaign net earnings. */
  revenueSharePct?: number;
  /** Website CTA destination. */
  siteUrl?: string;
  /** Preview text that appears in the inbox summary. */
  previewText?: string;
};

/**
 * One-off strategic sponsorship pitch — large-value proposal to a named
 * company (e.g. Exploding Kittens). Not a broadcast. Written as a
 * persuasive long-form letter with the SoK gold/dark brand system.
 */
export default function SponsorshipPitch({
  companyName = "Exploding Kittens Marketing Team",
  sponsorshipAmount = "$20,000",
  revenueSharePct = 5,
  siteUrl = "https://sphereofkings.com",
  previewText = "A strategic $20,000 sponsorship opportunity — Sphere of Kings · Kickstarter launches November 19, 2026.",
}: SponsorshipPitchProps = {}) {
  return (
    <EmailShell previewText={previewText}>
      <EyebrowBar>Strategic Sponsorship Proposal</EyebrowBar>
      <h1 style={H1}>A partnership opportunity for {companyName.split(" ")[0]}.</h1>
      <p style={Lead}>Hello {companyName},</p>
      <p style={Lead}>
        Thank you for your response and for considering forwarding our proposal
        to your marketing department.
      </p>
      <p style={Lead}>
        My name is <strong style={{ color: palette.goldSoft }}>James Scott Bowser</strong>,
        founder of Creative Design Networks and creator of{" "}
        <strong style={{ color: palette.goldSoft }}>Sphere of Kings</strong> —
        an innovative 7-in-1 spherical game board launching on Kickstarter on{" "}
        <strong style={{ color: palette.goldSoft }}>November 19, 2026</strong>.
      </p>

      <Panel tone="gold">
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: palette.goldSoft,
            marginBottom: 8,
          }}
        >
          Congratulations on your extraordinary success
        </div>
        <div style={{ fontSize: 14, color: palette.ink, lineHeight: 1.6 }}>
          Exploding Kittens is one of the greatest Kickstarter success stories
          in tabletop gaming history — raising roughly{" "}
          <strong style={{ color: palette.goldSoft }}>$8.7 million</strong> from
          more than <strong style={{ color: palette.goldSoft }}>219,000 backers</strong>.
          Your company&apos;s creativity, marketing expertise, and remarkable
          growth are exactly why we believe a partnership between Exploding
          Kittens and Sphere of Kings could be an extraordinary opportunity.
        </div>
      </Panel>

      <h2 style={H2}>Our exclusive {sponsorshipAmount} sponsorship proposal</h2>
      <p style={Lead}>
        We would like to offer Exploding Kittens the opportunity to become a
        featured sponsor of our upcoming Kickstarter campaign.
      </p>
      <p style={Muted}>
        For a <strong style={{ color: palette.goldSoft }}>{sponsorshipAmount}</strong>{" "}
        sponsorship investment, we are offering:
      </p>

      <Panel tone="neutral">
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: palette.ink,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <li>
            <strong style={{ color: palette.goldSoft }}>
              {revenueSharePct}% of Kickstarter campaign net earnings
            </strong>
            , subject to a mutually agreed written definition of net earnings
            and payment terms.
          </li>
          <li>
            Featured sponsorship recognition throughout our Kickstarter
            marketing campaign.
          </li>
          <li>
            Brand exposure through planned social media, digital advertising,
            influencer outreach, and promotional activities.
          </li>
          <li>
            Potential exposure to more than{" "}
            <strong style={{ color: palette.goldSoft }}>1 million viewers</strong>,
            with an ambitious goal of exceeding 5 million as additional
            marketing partnerships and funding are secured.
          </li>
          <li>
            Opportunities for cross-promotion, co-branded products, and future
            licensing collaborations.
          </li>
          <li>
            Potential long-term participation in our growing Sphere of Kings
            ecosystem.
          </li>
        </ul>
      </Panel>

      <h2 style={H2}>Why we believe this is special</h2>
      <p style={Lead}>
        Sphere of Kings is more than an ordinary board game. Our innovative
        spherical platform combines seven different gaming and creative
        experiences — including Royal Checkers, Imperial Kings, customizable
        puzzles, and paintable game boards.
      </p>
      <p style={Lead}>
        We envision a future where major entertainment brands, game publishers,
        artists, and creators can license their intellectual property for
        customized spherical games and collectibles.
      </p>
      <Panel tone="royal">
        <div style={{ fontSize: 14, color: palette.ink, lineHeight: 1.65 }}>
          <strong style={{ color: palette.goldSoft }}>
            Imagine an officially licensed Exploding Kittens edition of
            Sphere of Kings.
          </strong>{" "}
          The possibilities for co-branded products, limited editions, retail
          distribution, and collectible game pieces could create exciting new
          revenue opportunities for both companies.
        </div>
      </Panel>

      <h2 style={H2}>Our marketing strategy</h2>
      <p style={Lead}>
        We are preparing a coordinated marketing campaign with multiple
        promotional channels. Current relationships and plans include:
      </p>
      <Panel tone="neutral">
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: palette.ink,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <li>
            <strong style={{ color: palette.goldSoft }}>Jellop</strong> — our
            Kickstarter marketing partner, specializing in crowdfunding
            advertising and campaign growth.
          </li>
          <li>
            <strong style={{ color: palette.goldSoft }}>PostcardMania</strong>{" "}
            — direct-mail marketing collaboration and promotional outreach.
          </li>
          <li>
            <strong style={{ color: palette.goldSoft }}>iHeartMedia</strong> —
            potential radio and media opportunities currently being explored.
          </li>
          <li>
            Social media advertising, influencer outreach, and promotional
            video campaigns.
          </li>
          <li>
            Business sponsorships, strategic partnerships, and direct outreach
            to prospective customers.
          </li>
        </ul>
      </Panel>
      <p style={Muted}>
        Audience reach and campaign results will depend on finalized marketing
        commitments and performance.
      </p>

      <h2 style={H2}>Why Exploding Kittens?</h2>
      <p style={Lead}>
        Your company understands how a creative gaming concept can become a
        globally recognized entertainment brand. We believe your experience and
        our innovative product could complement each other exceptionally well.
      </p>
      <p style={Lead}>
        Beyond this initial sponsorship, we would welcome discussions about
        licensing, manufacturing, retail distribution, co-branded games, and a
        broader strategic relationship.
      </p>
      <p style={Lead}>
        We are not simply looking for a sponsor. We are looking for a company
        that could help us build the next great legacy tabletop gaming brand
        while sharing in our success.
      </p>

      <Divider />

      <h2 style={{ ...H2, marginTop: 10 }}>Let&apos;s discuss this opportunity</h2>
      <p style={Lead}>
        Our Kickstarter launches on{" "}
        <strong style={{ color: palette.goldSoft }}>November 19</strong>, and we
        would love to schedule a brief conversation with your marketing or
        business development leadership as soon as possible. We are also open
        to structuring a customized agreement that provides additional value to
        Exploding Kittens.
      </p>

      <Button href={siteUrl}>Visit SphereofKings.com</Button>

      <p style={Lead}>
        Thank you for considering this exciting opportunity. We would be
        honored to explore a partnership with the company that helped redefine
        what is possible through crowdfunding.
      </p>
      <p style={Lead}>
        <strong style={{ color: palette.goldSoft }}>
          Together, we could create something truly extraordinary.
        </strong>
      </p>

      <Divider />

      {/* Signature */}
      <p style={Lead}>Warm regards,</p>
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
        <a href="tel:+12096229391" style={{ color: palette.goldSoft, textDecoration: "none" }}>
          209-622-9391
        </a>
        <br />
        <a
          href="mailto:Jbowser727@gmail.com"
          style={{ color: palette.goldSoft, textDecoration: "none" }}
        >
          Jbowser727@gmail.com
        </a>
        <br />
        <a href={siteUrl} style={{ color: palette.goldSoft, textDecoration: "none" }}>
          sphereofkings.com
        </a>
      </div>

      <p style={Fine}>
        Kickstarter launch: November 19, 2026. All figures and projections in
        this message are proposed terms, not guaranteed outcomes.
      </p>
    </EmailShell>
  );
}
