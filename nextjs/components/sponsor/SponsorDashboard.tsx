"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import { BtnGold, Input, Textarea } from "@/components/shared";
import {
  SponsorshipActivity,
  SponsorshipActivityKind,
  SponsorshipBrandAssets,
} from "@/lib/db/collections/sponsorships";
import { SponsorshipCommitments } from "@/lib/sponsorship";
import { updateSponsorBrandAssetsAction } from "@/app/sponsor/actions";

/* ---------- layout primitives ---------- */

const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`;

const HeadLeft = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.p`
  margin: 0 0 6px;
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  color: #c9a227;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-family: "Cinzel", Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  font-weight: 800;
`;

const SubLine = styled.p`
  margin: 6px 0 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
`;

const SignOut = styled.a`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  text-decoration: none;
  border: 1px solid #2e2618;
  padding: 8px 14px;
  border-radius: 6px;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 22px;
`;

const CardHeading = styled.h2`
  margin: 0 0 14px;
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const KV = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #1a1510;
  color: #d9cfbe;
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;

  &:last-child {
    border-bottom: 0;
  }

  span:first-child {
    color: #a89880;
    font-size: 0.84rem;
  }
  span:last-child {
    font-weight: 600;
  }
`;

/* ---------- deliverable progress bars ---------- */

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RowHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: "Inter", sans-serif;
  font-size: 0.86rem;
  color: #d9cfbe;

  strong {
    color: #f5f0e8;
    font-family: "SF Mono", Menlo, Consolas, monospace;
  }
`;

const Bar = styled.div`
  position: relative;
  height: 8px;
  background: #1a1510;
  border-radius: 999px;
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: linear-gradient(90deg, #b8901e, #f0c040);
  transition: width 0.4s ease;
`;

/* ---------- activity feed ---------- */

const Feed = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeedItem = styled.li`
  background: #0a0806;
  border: 1px solid #1a1510;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FeedKind = styled.span<{ $kind: SponsorshipActivityKind }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: rgba(201, 162, 39, 0.12);
  color: #f0c040;
  border: 1px solid rgba(201, 162, 39, 0.4);
  align-self: flex-start;
`;

const FeedSummary = styled.p`
  margin: 2px 0 0;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.45;
`;

const FeedMeta = styled.div`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;

  a {
    color: #c9a227;
    text-decoration: underline;
    text-underline-offset: 3px;
    margin-left: 6px;
  }
`;

const Empty = styled.div`
  padding: 18px;
  border: 1px dashed #1a1510;
  border-radius: 10px;
  text-align: center;
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
`;

/* ---------- brand assets form ---------- */

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
`;

const Msg = styled.div<{ $error?: boolean }>`
  padding: 10px 14px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  background: ${(p) =>
    p.$error ? "rgba(255,107,122,0.1)" : "rgba(79,176,125,0.1)"};
  color: ${(p) => (p.$error ? "#ff6b7a" : "#4fb07d")};
  border: 1px solid
    ${(p) => (p.$error ? "rgba(255,107,122,0.4)" : "rgba(79,176,125,0.4)")};
`;

/* ---------- helpers ---------- */

const KIND_LABELS: Record<SponsorshipActivityKind, string> = {
  shoutout: "Shoutout",
  video: "Video",
  "boosted-post": "Boosted Post",
  "appreciation-post": "Appreciation",
  spotlight: "Spotlight",
  "dedicated-video": "Dedicated Video",
  report: "Report",
  note: "Note",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

type Props = {
  sponsorshipRef: string;
  tierName: string;
  tierPriceDisplay: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  campaignStartISO: string;
  campaignDays: number;
  kickstarterLaunchDate: string;
  commitments: SponsorshipCommitments;
  activities: SponsorshipActivity[];
  brandAssets: SponsorshipBrandAssets;
  existingWebsite?: string;
};

export default function SponsorDashboard({
  sponsorshipRef: ref,
  tierName,
  tierPriceDisplay,
  businessName,
  contactName,
  contactEmail,
  campaignStartISO,
  campaignDays,
  kickstarterLaunchDate,
  commitments,
  activities,
  brandAssets,
  existingWebsite,
}: Props) {
  const [assets, setAssets] = useState<SponsorshipBrandAssets>({
    logoUrl: brandAssets.logoUrl ?? "",
    description: brandAssets.description ?? "",
    linkUrl: brandAssets.linkUrl ?? existingWebsite ?? "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c = {
      shoutouts: 0,
      videos: 0,
      boostedPosts: 0,
      appreciationPosts: 0,
      spotlights: 0,
      dedicatedVideos: 0,
    };
    for (const a of activities) {
      switch (a.kind) {
        case "shoutout":
          c.shoutouts++;
          break;
        case "video":
          c.videos++;
          break;
        case "boosted-post":
          c.boostedPosts++;
          break;
        case "appreciation-post":
          c.appreciationPosts++;
          break;
        case "spotlight":
          c.spotlights++;
          break;
        case "dedicated-video":
          c.dedicatedVideos++;
          break;
      }
    }
    return c;
  }, [activities]);

  const campaignStart = new Date(campaignStartISO);
  const now = new Date();
  const daysElapsed = Math.max(0, daysBetween(campaignStart, now));
  const campaignPct = Math.min(100, (daysElapsed / campaignDays) * 100);
  const endDate = new Date(
    campaignStart.getTime() + campaignDays * 24 * 60 * 60 * 1000,
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateSponsorBrandAssetsAction({
        logoUrl: assets.logoUrl,
        description: assets.description,
        linkUrl: assets.linkUrl,
      });
      if (res.ok)
        setMsg({ ok: true, text: "Brand assets saved. We'll use these on upcoming shoutouts, videos, and website placements." });
      else setMsg({ ok: false, text: res.message });
    });
  }

  const rows: Array<{ label: string; delivered: number; total: number }> = [
    { label: "Social shoutouts", delivered: counts.shoutouts, total: commitments.shoutouts },
    { label: "Promotional videos", delivered: counts.videos, total: commitments.videos },
    { label: "Boosted posts", delivered: counts.boostedPosts, total: commitments.boostedPosts },
    {
      label: "Appreciation posts",
      delivered: counts.appreciationPosts,
      total: commitments.appreciationPosts,
    },
    { label: "Business spotlights", delivered: counts.spotlights, total: commitments.spotlights },
    {
      label: "Dedicated business videos",
      delivered: counts.dedicatedVideos,
      total: commitments.dedicatedVideos,
    },
  ];

  const totalDelivered = rows.reduce((n, r) => n + r.delivered, 0);
  const totalCommitted = rows.reduce((n, r) => n + r.total, 0);
  const overallPct = totalCommitted
    ? Math.round((totalDelivered / totalCommitted) * 100)
    : 0;

  return (
    <>
      <Head>
        <HeadLeft>
          <Eyebrow>Sponsor Dashboard · {tierName}</Eyebrow>
          <Title>{businessName}</Title>
          <SubLine>
            Welcome back, {contactName.split(/\s+/)[0] || contactName}. Here's
            where your 90-day campaign stands.
          </SubLine>
        </HeadLeft>
        <SignOut href="/sponsor/signout">Sign out</SignOut>
      </Head>

      <CardsGrid>
        <Card>
          <CardHeading>Sponsorship</CardHeading>
          <KV>
            <span>Reference</span>
            <span style={{ fontFamily: "SF Mono, monospace" }}>{ref}</span>
          </KV>
          <KV>
            <span>Package</span>
            <span>{tierName}</span>
          </KV>
          <KV>
            <span>Investment</span>
            <span>{tierPriceDisplay}</span>
          </KV>
          <KV>
            <span>Account email</span>
            <span>{contactEmail}</span>
          </KV>
        </Card>
        <Card>
          <CardHeading>Campaign Window</CardHeading>
          <KV>
            <span>Kickstarter launches</span>
            <span>{kickstarterLaunchDate}</span>
          </KV>
          <KV>
            <span>Campaign start</span>
            <span>{fmtDate(campaignStartISO)}</span>
          </KV>
          <KV>
            <span>Campaign end</span>
            <span>{fmtDate(endDate.toISOString())}</span>
          </KV>
          <div style={{ marginTop: 14 }}>
            <RowHead>
              <span>Progress</span>
              <strong>
                Day {Math.min(daysElapsed, campaignDays)} / {campaignDays}
              </strong>
            </RowHead>
            <Bar>
              <Fill $pct={campaignPct} />
            </Bar>
          </div>
        </Card>
      </CardsGrid>

      <Card style={{ marginBottom: 28 }}>
        <CardHeading>
          Deliverables · {totalDelivered}/{totalCommitted} ({overallPct}%
          complete)
        </CardHeading>
        <Progress>
          {rows.map((r) => {
            const pct = r.total ? (r.delivered / r.total) * 100 : 0;
            return (
              <Row key={r.label}>
                <RowHead>
                  <span>{r.label}</span>
                  <strong>
                    {r.delivered} / {r.total}
                  </strong>
                </RowHead>
                <Bar>
                  <Fill $pct={pct} />
                </Bar>
              </Row>
            );
          })}
        </Progress>
      </Card>

      <Card style={{ marginBottom: 28 }}>
        <CardHeading>Campaign Activity</CardHeading>
        {activities.length === 0 ? (
          <Empty>
            No activity logged yet. The Sphere of Kings team will log every
            shoutout, video and post here as it goes live.
          </Empty>
        ) : (
          <Feed>
            {activities.map((a) => (
              <FeedItem key={a.id}>
                <FeedKind $kind={a.kind}>{KIND_LABELS[a.kind]}</FeedKind>
                <FeedSummary>{a.summary}</FeedSummary>
                <FeedMeta>
                  {fmtDate(a.publishedISO)}
                  {a.channel ? ` · ${a.channel}` : ""}
                  {a.url ? (
                    <a href={a.url} target="_blank" rel="noreferrer">
                      View →
                    </a>
                  ) : null}
                </FeedMeta>
              </FeedItem>
            ))}
          </Feed>
        )}
      </Card>

      <Card>
        <CardHeading>Brand Assets</CardHeading>
        <p
          style={{
            margin: "0 0 14px",
            color: "#a89880",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            lineHeight: 1.55,
          }}
        >
          These are the assets we'll use on shoutouts, videos, website
          placements, and co-branded materials. Update them any time — changes
          apply to all future deliverables.
        </p>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Label>
            Logo URL (hosted image, PNG/SVG recommended)
            <Input
              type="url"
              value={assets.logoUrl ?? ""}
              onChange={(e) =>
                setAssets((a) => ({ ...a, logoUrl: e.target.value }))
              }
              placeholder="https://yourbiz.com/logo.png"
            />
          </Label>
          <Label>
            Business website / destination link
            <Input
              type="url"
              value={assets.linkUrl ?? ""}
              onChange={(e) =>
                setAssets((a) => ({ ...a, linkUrl: e.target.value }))
              }
              placeholder="https://yourbusiness.com"
            />
          </Label>
          <Label>
            Business description (shown on sponsor profile)
            <Textarea
              value={assets.description ?? ""}
              onChange={(e) =>
                setAssets((a) => ({ ...a, description: e.target.value }))
              }
              placeholder="One or two sentences our audience should know about your business."
            />
          </Label>
          {msg && (
            <Msg $error={!msg.ok} role={msg.ok ? "status" : "alert"}>
              {msg.text}
            </Msg>
          )}
          <BtnGold type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
            {pending ? "Saving…" : "Save brand assets"}
          </BtnGold>
        </form>
      </Card>
    </>
  );
}
