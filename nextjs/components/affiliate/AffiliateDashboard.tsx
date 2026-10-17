"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  SAMPLE_AFFILIATE,
  TIER_LADDER,
  AttributedStatus,
  Affiliate,
} from "@/lib/affiliate";

type Filter = "all" | "eligible" | "pending" | "refund";

const Hello = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Eye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a227;
  margin-bottom: 4px;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0 0 6px;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  color: #a89880;
  margin: 0;
  line-height: 1.55;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Chip = styled.span<{ $tone: "ok" | "warn" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;

  ${(p) =>
    p.$tone === "ok" &&
    `background: rgba(79,176,125,0.12); border: 1px solid #4fb07d; color: #4fb07d;`}
  ${(p) =>
    p.$tone === "warn" &&
    `background: rgba(224,169,74,0.12); border: 1px solid #e0a94a; color: #e0a94a;`}
`;

const ChipDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

const KPIs = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Kpi = styled.div<{ $stale?: boolean }>`
  background: #0e0c09;
  border: 1px solid ${(p) => (p.$stale ? "#e0a94a" : "#1e1a12")};
  border-radius: 12px;
  padding: 16px 18px;
  position: relative;

  ${(p) =>
    p.$stale &&
    `&::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #e0a94a; border-radius: 12px 12px 0 0; }`}
`;

const KpiK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const KpiV = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f5f0e8;
  margin: 10px 0 2px;
  font-variant-numeric: tabular-nums;
`;

const KpiVMuted = styled(KpiV)`
  color: #5a4a38;
  font-size: 1.1rem;
  letter-spacing: 0.08em;
`;

const KpiD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const KpiUp = styled.span`
  color: #4fb07d;
  font-weight: 700;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
`;

const CardTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

const CardSub = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const Url = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 8px;
  padding: 10px 12px;
`;

const UrlMono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f5f0e8;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Copy = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  transition: box-shadow 0.2s;

  &:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(240, 192, 64, 0.25);
  }
  &.copied {
    background: rgba(79, 176, 125, 0.18);
    color: #4fb07d;
  }
`;

const Note = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0;
`;

const QrRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
`;

const Qr = styled.div`
  width: 112px;
  height: 112px;
  background: #FBF9F4;
  padding: 6px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 1px;
  flex-shrink: 0;

  span {
    background: #15110A;
  }
`;

const DlRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const BtnSec = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const BtnDl = styled(BtnSec)`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border-color: transparent;

  &:hover {
    color: #0a0a0a;
    box-shadow: 0 0 20px rgba(240, 192, 64, 0.25);
  }
`;

const PosterRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 14px;
  align-items: center;
`;

const Poster = styled.div`
  aspect-ratio: 8.5 / 11;
  background: #FBF9F4;
  color: #15110A;
  border-radius: 4px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 4px;
    border: 1px solid #B8912A;
    border-radius: 2px;
    pointer-events: none;
  }
`;

const PosterM = styled.div`
  font-family: "Cinzel", serif;
  font-size: 7px;
  font-weight: 700;
  text-align: center;
  color: #9C7A1E;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const PosterH = styled.div`
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, #1a1620 0%, #0d0a12 100%);
  border: 1px solid #9C7A1E;
  border-radius: 1px;
  display: grid;
  place-items: center;
`;

const PosterSphere = styled.div`
  width: 60%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #d4af37 0%, #8a6e1f 35%, #1a1510 70%, #050303 100%);
`;

const PosterT = styled.div`
  font-family: "Cinzel", serif;
  font-size: 10px;
  line-height: 10px;
  font-weight: 700;
  text-align: center;
`;

const PosterC = styled.div`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 6px;
  text-align: center;
  color: #4A4232;
`;

const PosterFoot = styled.div`
  margin-top: auto;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 5px;
  color: #7A6F57;
  text-align: center;
`;

const ShareRow = styled.div`
  display: flex;
  gap: 6px;
`;

const TierMini = styled.div`
  background: #1a1612;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TierTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const TierName = styled.div`
  font-family: "Cinzel", serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f0c040;
  line-height: 1;
`;

const TierRate = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #f0c040;
  font-variant-numeric: tabular-nums;
`;

const TierSub = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  margin-top: 2px;
`;

const Bar = styled.div`
  background: #0e0c09;
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number }>`
  background: linear-gradient(90deg, #b8901e, #f0c040);
  height: 100%;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const TierProg = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
`;

const TierProgK = styled.span`
  color: #a89880;
`;

const TierProgV = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: #f5f0e8;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  background: #1a1612;
  border-radius: 8px;
`;

const PeriodChip = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
  font-weight: 700;
`;

const F = styled.button<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${(p) => (p.$on ? "rgba(201,162,39,0.14)" : "#0e0c09")};
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  border: 1px solid ${(p) => (p.$on ? "#c9a227" : "#1e1a12")};
  cursor: pointer;

  &:hover {
    color: #f5f0e8;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
  margin: 0 -18px -18px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  min-width: 560px;

  thead th {
    text-align: left;
    padding: 10px 18px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    background: #1a1612;
    border-top: 1px solid #1e1a12;
    border-bottom: 1px solid #1e1a12;
  }

  tbody td {
    padding: 12px 18px;
    border-bottom: 1px solid #1e1a12;
    vertical-align: middle;
    color: #f5f0e8;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover td {
    background: #140f0a;
  }
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
`;

const Right = styled.td`
  text-align: right;
`;

const Pill = styled.span<{ $tone: PillTone }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  white-space: nowrap;

  ${(p) => pillStyles[p.$tone]}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const Amount = styled.span<{ $neg?: boolean }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: ${(p) => (p.$neg ? "#ff6b7a" : "#f5f0e8")};
`;

const TableFoot = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-top: 1px solid #1e1a12;
  background: #0a0a0a;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

type PillTone = "elig" | "pend" | "ref" | "cnc" | "prov";
const pillStyles: Record<PillTone, string> = {
  elig: "background: rgba(79,176,125,0.14); color: #4fb07d;",
  pend: "background: rgba(224,169,74,0.14); color: #e0a94a;",
  ref: "background: rgba(185,28,28,0.14); color: #ff6b7a;",
  cnc: "background: #1a1612; color: #5a4a38;",
  prov: "background: rgba(224,169,74,0.14); color: #e0a94a;",
};

function StatusPill({ s }: { s: AttributedStatus }) {
  switch (s) {
    case "eligible":
      return (
        <Pill $tone="elig">
          <PillDot aria-hidden="true" />
          Eligible
        </Pill>
      );
    case "pending":
      return (
        <Pill $tone="pend">
          <PillDot aria-hidden="true" />
          Pending
        </Pill>
      );
    case "refund-pending":
      return <Pill $tone="ref">Refund pending</Pill>;
    case "cancelled":
      return <Pill $tone="cnc">Cancelled</Pill>;
    case "window-pending":
      return <Pill $tone="prov">Window pending</Pill>;
  }
}

function matchesFilter(s: AttributedStatus, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "eligible") return s === "eligible";
  if (f === "pending") return s === "pending" || s === "window-pending";
  if (f === "refund") return s === "refund-pending" || s === "cancelled";
  return true;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AffiliateDashboard({
  affiliate = SAMPLE_AFFILIATE,
}: {
  affiliate?: Affiliate;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    return {
      all: affiliate.rows.length,
      eligible: affiliate.rows.filter((r) => matchesFilter(r.status, "eligible")).length,
      pending: affiliate.rows.filter((r) => matchesFilter(r.status, "pending")).length,
      refund: affiliate.rows.filter((r) => matchesFilter(r.status, "refund")).length,
    };
  }, [affiliate.rows]);

  const filtered = affiliate.rows.filter((r) => matchesFilter(r.status, filter));
  const tierPct = (affiliate.eligibleSales / affiliate.nextThreshold) * 100;

  const onCopy = () => {
    navigator.clipboard?.writeText(`https://${affiliate.referralUrl}`).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {
        // best-effort; cart isn't an error-blocking surface
      },
    );
  };

  const toNext = affiliate.nextThreshold - affiliate.eligibleSales;

  return (
    <>
      <Hello>
        <div>
          <Eye>Affiliate dashboard</Eye>
          <Title>Good morning, {affiliate.firstName}.</Title>
          <Sub>
            You are {toNext} eligible sales from the {affiliate.tier.nextName}{" "}
            tier ({affiliate.tier.nextRate}%). Keep going.
          </Sub>
        </div>
        <ChipRow>
          <Chip $tone="ok">
            <ChipDot aria-hidden="true" />
            Account · Active
          </Chip>
          <Chip $tone="warn">Attribution rules provisional</Chip>
        </ChipRow>
      </Hello>

      <KPIs aria-label="Headline affiliate numbers">
        <Kpi>
          <KpiK>Eligible sales</KpiK>
          <KpiV>{affiliate.eligibleSales}</KpiV>
          <KpiD>
            <KpiUp>↑ {affiliate.salesLastWeek}</KpiUp> this week
          </KpiD>
        </Kpi>
        <Kpi>
          <KpiK>Pending commission</KpiK>
          <KpiV>$—</KpiV>
          <KpiD>{affiliate.pendingOrders} orders awaiting webhook</KpiD>
        </Kpi>
        <Kpi>
          <KpiK>Approved commission</KpiK>
          <KpiVMuted>— — —</KpiVMuted>
          <KpiD>Syncing with finance</KpiD>
        </Kpi>
        <Kpi $stale>
          <KpiK>Paid out · lifetime</KpiK>
          <KpiV>$—</KpiV>
          <KpiD>Payout schedule pending</KpiD>
        </Kpi>
      </KPIs>

      <Layout>
        <Col>
          <Card>
            <CardHead>
              <CardTitle>Your referral link</CardTitle>
              <CardSub>Code · {affiliate.code}</CardSub>
            </CardHead>
            <Url>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                style={{ color: "#a89880", flexShrink: 0 }}
              >
                <path
                  d="M8.5 2.5a3 3 0 0 1 0 4.2L7 8.3M5.5 11.5a3 3 0 0 1 0-4.2L7 5.7"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M5.5 8.5l3-3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <UrlMono>{affiliate.referralUrl}</UrlMono>
              <Copy
                type="button"
                onClick={onCopy}
                className={copied ? "copied" : ""}
                aria-live="polite"
              >
                {copied ? "Copied" : "Copy"}
              </Copy>
            </Url>
            <Note>
              Any order placed from this link within the configured attribution
              window will credit you. Window length is pending owner approval.
            </Note>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>QR code</CardTitle>
              <CardSub>Static · never changes</CardSub>
            </CardHead>
            <QrRow>
              <Qr aria-hidden="true">
                {[...Array(100)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      // Deterministic pseudo-random pattern — a visual
                      // placeholder, not a real QR. Replace with the real
                      // generator in production.
                      background: (i * 11 + 7) % 3 === 0 ? "transparent" : undefined,
                    }}
                  />
                ))}
              </Qr>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Note style={{ color: "#f5f0e8", fontSize: "0.78rem" }}>
                  Prints clean at 1 inch (2.5 cm) and larger.
                </Note>
                <DlRow>
                  <BtnSec>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M6 1v7m-3-3 3 3 3-3M2 11h8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    PNG
                  </BtnSec>
                  <BtnSec>SVG</BtnSec>
                  <BtnSec>EPS</BtnSec>
                </DlRow>
              </div>
            </QrRow>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>Printable poster</CardTitle>
              <CardSub>US Letter · 8.5 × 11 in</CardSub>
            </CardHead>
            <PosterRow>
              <Poster aria-hidden="true">
                <PosterM>Sphere of Kings</PosterM>
                <PosterH>
                  <PosterSphere />
                </PosterH>
                <PosterT>
                  Seven games.
                  <br />
                  One royal sphere.
                </PosterT>
                <PosterC>{affiliate.referralUrl}</PosterC>
                <PosterFoot>
                  {affiliate.code} · Early Bird · Dec 1
                </PosterFoot>
              </Poster>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <BtnDl>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M6 1v7m-3-3 3 3 3-3M2 11h8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download PDF
                </BtnDl>
                <BtnSec>Reprint with current offer</BtnSec>
                <Note>
                  Generated per affiliate — the file and QR are unique to{" "}
                  {affiliate.code}.
                </Note>
              </div>
            </PosterRow>
            <ShareRow>
              <BtnSec style={{ flex: 1, justifyContent: "center" }}>
                Share on X
              </BtnSec>
              <BtnSec style={{ flex: 1, justifyContent: "center" }}>
                Share on Facebook
              </BtnSec>
            </ShareRow>
          </Card>
        </Col>

        <Col>
          <Card>
            <CardHead>
              <CardTitle>Your commission tier</CardTitle>
              <BtnSec type="button" style={{ padding: "4px 10px", fontSize: "0.7rem" }}>
                View ladder
              </BtnSec>
            </CardHead>
            <TierMini>
              <TierTop>
                <div>
                  <TierName>{affiliate.tier.name}</TierName>
                  <TierSub>Currently earning</TierSub>
                </div>
                <TierRate>{affiliate.tier.rate}%</TierRate>
              </TierTop>
              <Bar aria-hidden="true">
                <BarFill $pct={tierPct} />
              </Bar>
              <TierProg>
                <TierProgK>
                  Next tier · {affiliate.tier.nextName} ({affiliate.tier.nextRate}%)
                </TierProgK>
                <TierProgV>
                  {affiliate.eligibleSales} / {affiliate.nextThreshold}
                </TierProgV>
              </TierProg>
            </TierMini>
            <Note>
              Rates: {TIER_LADDER.map((t) => `${t.rate}%`).join(" · ")}. Thresholds,
              the definition of "sales", attribution window and retroactivity
              remain pending owner approval.
            </Note>
          </Card>

          <Card style={{ padding: 0 }}>
            <div
              style={{
                padding: "18px 18px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <CardTitle>Attributed sales</CardTitle>
              <BtnSec type="button" style={{ padding: "4px 10px", fontSize: "0.7rem" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M5 1v6m-2-2 2 2 2-2M2 9h6"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Export CSV
              </BtnSec>
            </div>
            <Toolbar style={{ margin: "0 18px 10px", borderRadius: 8 }}>
              <PeriodChip>{affiliate.period.label}</PeriodChip>
              <F $on={filter === "all"} onClick={() => setFilter("all")}>
                All · {counts.all}
              </F>
              <F $on={filter === "eligible"} onClick={() => setFilter("eligible")}>
                Eligible · {counts.eligible}
              </F>
              <F $on={filter === "pending"} onClick={() => setFilter("pending")}>
                Pending · {counts.pending}
              </F>
              <F $on={filter === "refund"} onClick={() => setFilter("refund")}>
                Refund / cancelled · {counts.refund}
              </F>
            </Toolbar>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th style={{ textAlign: "right" }}>Units</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>
                      Commission ({affiliate.tier.rate}%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const neg = r.status === "refund-pending" || r.status === "cancelled";
                    return (
                      <tr key={r.orderRef}>
                        <td style={{ color: "#a89880" }}>{formatDay(r.dateISO)}</td>
                        <td>
                          <Mono>{r.orderRef}</Mono>
                        </td>
                        <td>{r.customer}</td>
                        <Right>
                          <Mono>{r.units}</Mono>
                        </Right>
                        <td>
                          <StatusPill s={r.status} />
                        </td>
                        <Right>
                          <Amount $neg={neg}>
                            {neg ? "− $—" : "$—"}
                          </Amount>
                        </Right>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrap>
            <TableFoot>
              <span>
                Showing {filtered.length} of {counts.all}
              </span>
              <span>
                Commission values stay <Mono>$—</Mono> while product pricing is
                pending.
              </span>
            </TableFoot>
          </Card>
        </Col>
      </Layout>
    </>
  );
}
