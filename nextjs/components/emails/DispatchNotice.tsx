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

export type DispatchNoticeProps = {
  firstName?: string;
  orderRef: string;
  // Carrier + tracking are optional. When unknown the email ships
  // without a tracking row rather than inventing one — the fulfillment
  // page doesn't persist those inputs yet.
  carrier?: string; // e.g. "DHL Express"
  trackingNumber?: string;
  trackingUrl?: string;
  shipTo: string;
  itemsSummary: string; // "1 × Complete 7-in-1 · 2 × Royal Checkers refill"
};

export default function DispatchNotice({
  firstName,
  orderRef,
  carrier,
  trackingNumber,
  trackingUrl,
  shipTo,
  itemsSummary,
}: DispatchNoticeProps) {
  const greeting = firstName ? `Hello, ${firstName}.` : "Hello.";
  return (
    <EmailShell
      previewText={
        trackingNumber
          ? `Your Sphere of Kings has left the workshop. Tracking: ${trackingNumber}`
          : "Your Sphere of Kings has left the workshop."
      }
    >
      <EyebrowBar tone="royal">Dispatched</EyebrowBar>
      <h1 style={H1}>Your Sphere is on its way.</h1>
      <p style={Lead}>
        {greeting} Order <strong>{orderRef}</strong> left the workshop
        today. {itemsSummary}.
      </p>

      <Panel tone="royal">
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: palette.royal,
            marginBottom: 4,
          }}
        >
          Carrier
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: palette.ink,
            marginBottom: 10,
          }}
        >
          {carrier}
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: palette.royal,
            marginBottom: 4,
          }}
        >
          Tracking number
        </div>
        <div
          style={{
            fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: palette.ink,
            letterSpacing: "0.02em",
          }}
        >
          {trackingNumber}
        </div>
      </Panel>

      {trackingUrl && <Button href={trackingUrl}>Track your parcel</Button>}

      <Divider />

      <div
        style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: palette.muted,
          marginBottom: 6,
        }}
      >
        Ship to
      </div>
      <p
        style={{
          whiteSpace: "pre-line",
          margin: 0,
          fontSize: 14,
          lineHeight: 1.55,
          color: palette.ink,
        }}
      >
        {shipTo}
      </p>

      <p style={Fine}>
        Delivery times depend on the carrier and destination. If something
        goes wrong — delayed, damaged, or lost in transit — reply to this
        email and we will make it right.
      </p>
    </EmailShell>
  );
}
