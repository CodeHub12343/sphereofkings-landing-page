"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import { BtnGold, Input, Textarea } from "@/components/shared";
import {
  SponsorshipActivity,
  SponsorshipActivityKind,
  SponsorshipBrandAssets,
  SponsorshipState,
} from "@/lib/db/collections/sponsorships";
import {
  SponsorshipCommitments,
  SponsorshipTierId,
} from "@/lib/sponsorship";
import {
  logSponsorshipActivityAction,
  removeSponsorshipActivityAction,
  sendSponsorMagicLinkAction,
  setCampaignStartAction,
} from "@/app/admin/sponsorships/actions";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
`;

const H2 = styled.h2`
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
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid #1a1510;
  color: #d9cfbe;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;

  &:last-child {
    border-bottom: 0;
  }
  span:first-child {
    color: #a89880;
    font-size: 0.82rem;
  }
  span:last-child {
    font-weight: 600;
    text-align: right;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
`;

const Select = styled.select`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  padding: 12px 16px;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: #c9a227;
  }
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RowHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  color: #d9cfbe;

  strong {
    color: #f5f0e8;
    font-family: "SF Mono", Menlo, Consolas, monospace;
  }
`;

const Bar = styled.div`
  position: relative;
  height: 7px;
  background: #1a1510;
  border-radius: 999px;
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: linear-gradient(90deg, #b8901e, #f0c040);
`;

const Feed = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.li`
  background: #0a0806;
  border: 1px solid #1a1510;
  border-radius: 10px;
  padding: 12px 14px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const Kind = styled.span`
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
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 107, 122, 0.4);
  color: #ff6b7a;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 107, 122, 0.08);
  }
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

const KINDS: Array<{ v: SponsorshipActivityKind; label: string; count?: keyof SponsorshipCommitments }> = [
  { v: "shoutout", label: "Shoutout", count: "shoutouts" },
  { v: "video", label: "Promotional Video", count: "videos" },
  { v: "boosted-post", label: "Boosted Post", count: "boostedPosts" },
  { v: "appreciation-post", label: "Appreciation Post", count: "appreciationPosts" },
  { v: "spotlight", label: "Business Spotlight", count: "spotlights" },
  { v: "dedicated-video", label: "Dedicated Business Video", count: "dedicatedVideos" },
  { v: "report", label: "Monthly Report" },
  { v: "note", label: "Note" },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  sponsorshipRef: string;
  tier: SponsorshipTierId;
  state: SponsorshipState;
  tierName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessWebsite?: string;
  businessCategory?: string;
  notes?: string;
  campaignStartISO: string;
  campaignDays: number;
  kickstarterLaunchDate: string;
  commitments: SponsorshipCommitments;
  activities: SponsorshipActivity[];
  brandAssets: SponsorshipBrandAssets;
};

export default function SponsorAdminEditor(props: Props) {
  const [kind, setKind] = useState<SponsorshipActivityKind>("shoutout");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [channel, setChannel] = useState("");
  const [publishedDate, setPublishedDate] = useState(todayISO());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const [campaignStart, setCampaignStart] = useState<string>(
    props.campaignStartISO.slice(0, 10),
  );
  const [startMsg, setStartMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const counts = useMemo(() => {
    const c: Record<SponsorshipActivityKind, number> = {
      shoutout: 0,
      video: 0,
      "boosted-post": 0,
      "appreciation-post": 0,
      spotlight: 0,
      "dedicated-video": 0,
      report: 0,
      note: 0,
    };
    for (const a of props.activities) c[a.kind]++;
    return c;
  }, [props.activities]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await logSponsorshipActivityAction({
        ref: props.sponsorshipRef,
        kind,
        summary,
        url: url || undefined,
        channel: channel || undefined,
        publishedISO: new Date(publishedDate).toISOString(),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Logged. The sponsor sees it immediately." });
        setSummary("");
        setUrl("");
        setChannel("");
      } else {
        setMsg({ ok: false, text: res.message });
      }
    });
  }

  function handleRemove(activityId: string) {
    if (!confirm("Remove this activity entry? This affects the sponsor's progress counters."))
      return;
    startTransition(async () => {
      await removeSponsorshipActivityAction({
        ref: props.sponsorshipRef,
        activityId,
      });
    });
  }

  function handleResetStart(e: React.FormEvent) {
    e.preventDefault();
    setStartMsg(null);
    startTransition(async () => {
      const res = await setCampaignStartAction({
        ref: props.sponsorshipRef,
        startISO: new Date(campaignStart).toISOString(),
      });
      if (res.ok)
        setStartMsg({ ok: true, text: "Campaign start updated." });
      else setStartMsg({ ok: false, text: res.message });
    });
  }

  function handleSendMagicLink() {
    if (
      !confirm(
        `Email a sign-in link to ${props.contactEmail}? It will be valid for 30 minutes.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await sendSponsorMagicLinkAction({
        ref: props.sponsorshipRef,
      });
      if (res.ok) alert(`Sign-in link sent to ${props.contactEmail}.`);
      else alert(res.message);
    });
  }

  const rows: Array<{ label: string; delivered: number; total: number }> = [
    { label: "Shoutouts", delivered: counts.shoutout, total: props.commitments.shoutouts },
    { label: "Videos", delivered: counts.video, total: props.commitments.videos },
    { label: "Boosted posts", delivered: counts["boosted-post"], total: props.commitments.boostedPosts },
    {
      label: "Appreciation posts",
      delivered: counts["appreciation-post"],
      total: props.commitments.appreciationPosts,
    },
    { label: "Spotlights", delivered: counts.spotlight, total: props.commitments.spotlights },
    {
      label: "Dedicated videos",
      delivered: counts["dedicated-video"],
      total: props.commitments.dedicatedVideos,
    },
  ];

  return (
    <>
      <Grid>
        <div>
          <Card>
            <H2>Log Campaign Activity</H2>
            <p
              style={{
                margin: "0 0 14px",
                color: "#a89880",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.55,
              }}
            >
              Every entry logged here increments the sponsor's progress bars
              and shows up in their dashboard activity feed.
            </p>
            <form
              onSubmit={handleAdd}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <Row2>
                <Label>
                  Type
                  <Select
                    value={kind}
                    onChange={(e) =>
                      setKind(e.target.value as SponsorshipActivityKind)
                    }
                  >
                    {KINDS.map((k) => (
                      <option key={k.v} value={k.v}>
                        {k.label}
                      </option>
                    ))}
                  </Select>
                </Label>
                <Label>
                  Published date
                  <Input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                  />
                </Label>
              </Row2>
              <Label>
                Summary (what the sponsor will read)
                <Input
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Instagram shoutout featuring HobbyTown Elkhorn storefront"
                />
              </Label>
              <Row2>
                <Label>
                  Channel (optional)
                  <Input
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="Instagram · TikTok · YouTube Shorts"
                  />
                </Label>
                <Label>
                  Link (optional)
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://instagram.com/p/..."
                  />
                </Label>
              </Row2>
              {msg && (
                <Msg $error={!msg.ok} role={msg.ok ? "status" : "alert"}>
                  {msg.text}
                </Msg>
              )}
              <BtnGold
                type="submit"
                disabled={pending}
                style={{ alignSelf: "flex-start" }}
              >
                {pending ? "Saving…" : "Log activity"}
              </BtnGold>
            </form>
          </Card>

          <Card>
            <H2>Activity Log ({props.activities.length})</H2>
            {props.activities.length === 0 ? (
              <p style={{ color: "#5a4a38", margin: 0, textAlign: "center" }}>
                No activity logged yet.
              </p>
            ) : (
              <Feed>
                {props.activities.map((a) => (
                  <Item key={a.id}>
                    <ItemRow>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Kind>{a.kind.replace("-", " ")}</Kind>
                        <p
                          style={{
                            margin: "6px 0 2px",
                            color: "#f5f0e8",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.92rem",
                          }}
                        >
                          {a.summary}
                        </p>
                        <div
                          style={{
                            color: "#a89880",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.78rem",
                          }}
                        >
                          {fmtDate(a.publishedISO)}
                          {a.channel ? ` · ${a.channel}` : ""}
                          {a.url ? (
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#c9a227", marginLeft: 6 }}
                            >
                              View →
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <DeleteBtn
                        type="button"
                        onClick={() => handleRemove(a.id)}
                        disabled={pending}
                      >
                        Remove
                      </DeleteBtn>
                    </ItemRow>
                  </Item>
                ))}
              </Feed>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <H2>Contact</H2>
            <KV>
              <span>Business</span>
              <span>{props.contactName}</span>
            </KV>
            <KV>
              <span>Email</span>
              <span>
                <a
                  href={`mailto:${props.contactEmail}`}
                  style={{ color: "#c9a227" }}
                >
                  {props.contactEmail}
                </a>
              </span>
            </KV>
            {props.contactPhone && (
              <KV>
                <span>Phone</span>
                <span>{props.contactPhone}</span>
              </KV>
            )}
            {props.businessWebsite && (
              <KV>
                <span>Website</span>
                <span>{props.businessWebsite}</span>
              </KV>
            )}
            {props.businessCategory && (
              <KV>
                <span>Category</span>
                <span>{props.businessCategory}</span>
              </KV>
            )}
            {props.notes && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "#0a0806",
                  borderRadius: 8,
                  color: "#d9cfbe",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.86rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong style={{ color: "#a89880" }}>Notes:</strong>{" "}
                {props.notes}
              </div>
            )}
            <button
              type="button"
              onClick={handleSendMagicLink}
              disabled={pending || props.state !== "paid"}
              style={{
                marginTop: 14,
                background: "transparent",
                border: "1.5px solid #c9a227",
                color: "#f0c040",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "10px 16px",
                borderRadius: 4,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Email Sign-In Link
            </button>
          </Card>

          <Card>
            <H2>Deliverable Progress</H2>
            <Progress>
              {rows.map((r) => {
                const pct = r.total ? (r.delivered / r.total) * 100 : 0;
                return (
                  <PRow key={r.label}>
                    <RowHead>
                      <span>{r.label}</span>
                      <strong>
                        {r.delivered} / {r.total}
                      </strong>
                    </RowHead>
                    <Bar>
                      <Fill $pct={pct} />
                    </Bar>
                  </PRow>
                );
              })}
            </Progress>
          </Card>

          <Card>
            <H2>Campaign Window</H2>
            <form
              onSubmit={handleResetStart}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <Label>
                Campaign start date
                <Input
                  type="date"
                  value={campaignStart}
                  onChange={(e) => setCampaignStart(e.target.value)}
                />
              </Label>
              <p style={{ margin: 0, color: "#a89880", fontSize: "0.82rem" }}>
                Launches: {props.kickstarterLaunchDate} · 90-day window
              </p>
              {startMsg && (
                <Msg $error={!startMsg.ok} role={startMsg.ok ? "status" : "alert"}>
                  {startMsg.text}
                </Msg>
              )}
              <BtnGold type="submit" disabled={pending}>
                {pending ? "Saving…" : "Update start date"}
              </BtnGold>
            </form>
          </Card>

          <Card>
            <H2>Brand Assets (sponsor-provided)</H2>
            {props.brandAssets && (props.brandAssets.logoUrl || props.brandAssets.linkUrl || props.brandAssets.description) ? (
              <>
                {props.brandAssets.logoUrl && (
                  <KV>
                    <span>Logo URL</span>
                    <span>
                      <a
                        href={props.brandAssets.logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#c9a227" }}
                      >
                        {props.brandAssets.logoUrl}
                      </a>
                    </span>
                  </KV>
                )}
                {props.brandAssets.linkUrl && (
                  <KV>
                    <span>Destination</span>
                    <span>
                      <a
                        href={props.brandAssets.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#c9a227" }}
                      >
                        {props.brandAssets.linkUrl}
                      </a>
                    </span>
                  </KV>
                )}
                {props.brandAssets.description && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      background: "#0a0806",
                      borderRadius: 8,
                      color: "#d9cfbe",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.86rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {props.brandAssets.description}
                  </div>
                )}
                {props.brandAssets.updatedISO && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#5a4a38",
                      fontSize: "0.75rem",
                    }}
                  >
                    Updated by sponsor on {fmtDate(props.brandAssets.updatedISO)}
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: "#5a4a38", margin: 0 }}>
                Sponsor hasn't uploaded brand assets yet.
              </p>
            )}
          </Card>
        </div>
      </Grid>
    </>
  );
}
