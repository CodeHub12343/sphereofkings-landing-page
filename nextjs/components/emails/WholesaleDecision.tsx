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

export type DecisionLine = {
  productName: string;
  qty: number;
};

export type DecisionEmailProps = {
  contactName: string;
  business: string;
  ref: string;
  lines: DecisionLine[];
  decision: "approved" | "declined" | "counteroffer" | "info-required";
  // Owner's custom note; always surfaced if present.
  note?: string;
  // Only used when decision === "approved".
  checkoutUrl?: string;
  reservationExpires?: string; // "December 24, 2026 · 5:00 PM UTC"
  // Only used when decision === "counteroffer".
  counterTier?: string; // e.g. "30% + marketing bundle"
};

export default function WholesaleDecisionEmail({
  contactName,
  business,
  ref,
  lines,
  decision,
  note,
  checkoutUrl,
  reservationExpires,
  counterTier,
}: DecisionEmailProps) {
  const totalUnits = lines.reduce((n, l) => n + l.qty, 0);
  const greeting = `Hello ${contactName.split(" ")[0] || contactName},`;

  const title =
    decision === "approved"
      ? "Your wholesale quote is approved."
      : decision === "declined"
      ? "An update on your wholesale inquiry."
      : decision === "counteroffer"
      ? "A counteroffer for your wholesale inquiry."
      : "A quick question about your wholesale inquiry.";

  const previewText =
    decision === "approved"
      ? `Quote ${ref} approved. Reserve the units and check out from the link inside.`
      : decision === "declined"
      ? `Quote ${ref} — we cannot proceed on these terms.`
      : decision === "counteroffer"
      ? `Quote ${ref} — we proposed a counteroffer. Reply to confirm.`
      : `Quote ${ref} — we need a little more information to proceed.`;

  return (
    <EmailShell previewText={previewText}>
      <EyebrowBar
        tone={
          decision === "declined"
            ? "crim"
            : decision === "info-required" || decision === "counteroffer"
            ? "royal"
            : "gold"
        }
      >
        Wholesale · {ref}
      </EyebrowBar>
      <h1 style={H1}>{title}</h1>
      <p style={Lead}>{greeting}</p>

      <Panel>
        <KV k="Business" v={business} />
        <KV k="Reference" v={ref} mono />
        <KV
          k="Quantity"
          v={`${totalUnits.toLocaleString()} unit${totalUnits === 1 ? "" : "s"}`}
          mono
        />
      </Panel>

      {decision === "approved" && (
        <>
          <p style={Lead}>
            Your quote is approved. We have reserved the units below for a
            limited window and generated a one-click wholesale checkout link
            — paying through that link locks in the agreed pricing.
          </p>
          <Panel tone="gold">
            {lines.map((l, i) => (
              <KV
                key={i}
                k={l.productName}
                v={`× ${l.qty}`}
                mono
              />
            ))}
          </Panel>
          {checkoutUrl && <Button href={checkoutUrl}>Start wholesale checkout</Button>}
          {reservationExpires && (
            <p style={{ ...Lead, color: palette.goldSoft, fontWeight: 600 }}>
              Reservation expires {reservationExpires}.
            </p>
          )}
          <p style={Fine}>
            After the expiry we release the reserved units back to general
            inventory and you lose the agreed pricing. Reply to this email
            if you need the window extended.
          </p>
        </>
      )}

      {decision === "declined" && (
        <>
          <p style={Lead}>
            Thank you for considering Sphere of Kings. After reviewing your
            request we are not able to proceed on the terms you outlined.
          </p>
          {note && (
            <Panel tone="warn">
              <div style={{ fontWeight: 700, color: palette.ink, marginBottom: 4 }}>
                A note from the owner
              </div>
              <div style={{ color: palette.muted, lineHeight: 1.55 }}>{note}</div>
            </Panel>
          )}
          <p style={Lead}>
            If your situation changes or you would like to re-open the
            conversation on different terms, reply to this email and we will
            take another look.
          </p>
        </>
      )}

      {decision === "counteroffer" && (
        <>
          <p style={Lead}>
            We would love to work with {business} and have a proposal that
            we think gets us there.
          </p>
          {counterTier && (
            <Panel tone="royal">
              <div style={{ fontWeight: 700, color: palette.ink, marginBottom: 4 }}>
                Our proposal
              </div>
              <div style={{ color: palette.ink, lineHeight: 1.55 }}>
                {counterTier}
              </div>
            </Panel>
          )}
          {note && (
            <>
              <h2 style={H2}>Details</h2>
              <p style={{ ...Lead, color: palette.muted, whiteSpace: "pre-line" }}>
                {note}
              </p>
            </>
          )}
          <p style={Lead}>
            Reply to this email with a yes, a no, or a counter — we read
            every one.
          </p>
        </>
      )}

      {decision === "info-required" && (
        <>
          <p style={Lead}>
            We are keen to move forward, but we need a little more
            information before we can give you a firm quote.
          </p>
          {note && (
            <Panel tone="warn">
              <div style={{ fontWeight: 700, color: palette.ink, marginBottom: 4 }}>
                What we need
              </div>
              <div style={{ color: palette.ink, whiteSpace: "pre-line", lineHeight: 1.55 }}>
                {note}
              </div>
            </Panel>
          )}
          <p style={Lead}>
            Reply to this email with the details and we will come back with
            a decision within two business days.
          </p>
        </>
      )}

      <Divider />
      <p style={Fine}>
        Questions? Reply to this email or write to{" "}
        <strong>hello@sphereofkings.com</strong>. Quote reference:{" "}
        <strong>{ref}</strong>.
      </p>
    </EmailShell>
  );
}
