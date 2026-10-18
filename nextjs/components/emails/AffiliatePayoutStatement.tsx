import {
  EmailShell,
  EyebrowBar,
  H1,
  H2,
  Lead,
  Button,
  Panel,
  Divider,
  Fine,
  KV,
  palette,
} from "./shell";

export type PayoutLineType = "approved" | "refunded" | "cancelled";

export type AffiliatePayoutLine = {
  dateDisplay: string; // "Sep 24"
  orderRef: string;
  type: PayoutLineType;
  commissionDisplay: string; // "$12.50" or "− $12.50" or "$—"
};

export type AffiliatePayoutProps = {
  firstName: string;
  code: string;
  periodLabel: string; // "September 2026"
  tierName: string;
  tierRate: number;
  approvedCount: number;
  payoutDisplay: string; // "$—" or "$284.50"
  payoutMethod: string; // "Bank transfer · pending confirmation"
  lines: AffiliatePayoutLine[];
  dashboardUrl?: string;
};

const lineLabel: Record<PayoutLineType, string> = {
  approved: "Approved",
  refunded: "Refund-adjusted",
  cancelled: "Cancelled",
};

export default function AffiliatePayoutStatement({
  firstName,
  code,
  periodLabel,
  tierName,
  tierRate,
  approvedCount,
  payoutDisplay,
  payoutMethod,
  lines,
  dashboardUrl = "https://sphereofkings.com/affiliate",
}: AffiliatePayoutProps) {
  return (
    <EmailShell
      previewText={`${periodLabel} commission statement · ${payoutDisplay}`}
    >
      <EyebrowBar>Affiliate Statement · {periodLabel}</EyebrowBar>
      <h1 style={H1}>Your {tierName}-tier earnings.</h1>
      <p style={Lead}>Hello, {firstName}.</p>
      <p style={Lead}>
        Here is your commission statement for{" "}
        <strong style={{ color: palette.goldSoft }}>{periodLabel}</strong>.
        You are earning at the{" "}
        <strong style={{ color: palette.goldSoft }}>
          {tierName} tier ({tierRate}%)
        </strong>{" "}
        under affiliate code <strong>{code}</strong>.
      </p>

      <Panel tone="gold">
        <KV k="Approved orders" v={String(approvedCount)} mono />
        <KV k="Tier rate" v={`${tierRate}%`} mono />
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            width: "100%",
            marginTop: 8,
            borderTop: `1px solid ${palette.border}`,
            paddingTop: 8,
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  paddingTop: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                Payout
              </td>
              <td
                align="right"
                style={{
                  paddingTop: 10,
                  fontFamily:
                    "'SF Mono', 'Menlo', 'Consolas', monospace",
                  fontSize: 20,
                  fontWeight: 800,
                  color: palette.goldSoft,
                }}
              >
                {payoutDisplay}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ fontSize: 12, color: palette.muted }}>
                {payoutMethod}
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <h2 style={H2}>Line items</h2>
      {lines.map((l, i) => (
        <KV
          key={`${l.orderRef}-${i}`}
          k={
            <>
              <span
                style={{
                  fontFamily:
                    "'SF Mono', 'Menlo', 'Consolas', monospace",
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                {l.orderRef}
              </span>
              <span style={{ color: palette.muted }}>
                {" · "}
                {l.dateDisplay} · {lineLabel[l.type]}
              </span>
            </>
          }
          v={l.commissionDisplay}
          mono
          tone={l.type === "approved" ? "pos" : l.type === "refunded" ? "neg" : "muted"}
        />
      ))}

      <Divider />

      <Button href={dashboardUrl}>Open your dashboard</Button>

      <p style={Fine}>
        Commission thresholds, attribution window and payout schedule are
        set by the project owner. Refunds and cancellations are reflected
        above per the approved policy. Reply to this email if any line
        looks wrong — we would rather fix a mistake than let it stand.
      </p>
    </EmailShell>
  );
}
