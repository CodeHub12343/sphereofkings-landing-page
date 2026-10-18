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

export type OrderConfirmationLine = {
  name: string;
  qty: number;
  totalDisplay: string; // e.g. "$149.00" or "$—"
};

export type OrderConfirmationProps = {
  firstName?: string;
  orderRef: string;
  lines: OrderConfirmationLine[];
  subtotalDisplay: string;
  shippingDisplay: string;
  taxDisplay: string;
  totalDisplay: string;
  shipTo: string; // multi-line string ("Marion Clarke\n12 Grove Lane\n…")
  orderUrl?: string;
  affiliateCode?: string;
};

export default function OrderConfirmationEmail({
  firstName,
  orderRef,
  lines,
  subtotalDisplay,
  shippingDisplay,
  taxDisplay,
  totalDisplay,
  shipTo,
  orderUrl = `https://sphereofkings.com/order/${encodeURIComponent("{{order_ref}}")}`,
  affiliateCode,
}: OrderConfirmationProps) {
  const greeting = firstName ? `Thank you, ${firstName}.` : "Thank you.";
  return (
    <EmailShell previewText={`Order ${orderRef} confirmed. Deliveries start December 1, 2026.`}>
      <EyebrowBar>Christmas Early Bird · Paid</EyebrowBar>
      <h1 style={H1}>Order confirmed.</h1>
      <p style={Lead}>{greeting} Your preorder is in the first batch.</p>

      <Panel tone="gold">
        <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Order
              </td>
              <td
                align="right"
                style={{
                  fontFamily:
                    "'SF Mono', 'Menlo', 'Consolas', monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                {orderRef}
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <h2 style={H2}>Items</h2>
      {lines.map((l, i) => (
        <KV
          key={i}
          k={`${l.name} × ${l.qty}`}
          v={l.totalDisplay}
          mono
        />
      ))}
      <Divider />
      <KV k="Subtotal" v={subtotalDisplay} mono />
      {affiliateCode && (
        <KV k={`Affiliate · ${affiliateCode}`} v={`− ${subtotalDisplay === "$—" ? "$—" : "configured"}`} mono tone="pos" />
      )}
      <KV k="Shipping" v={shippingDisplay} mono />
      <KV k="Tax" v={taxDisplay} mono />
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{
          width: "100%",
          margin: "10px 0 0",
          borderTop: `1px solid ${palette.border}`,
          paddingTop: 10,
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
              Total charged
            </td>
            <td
              align="right"
              style={{
                paddingTop: 10,
                fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
                fontSize: 20,
                fontWeight: 800,
                color: palette.ink,
              }}
            >
              {totalDisplay}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={H2}>Ship to</h2>
      <p
        style={{
          ...Lead,
          whiteSpace: "pre-line",
          margin: 0,
          color: palette.ink,
        }}
      >
        {shipTo}
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
            marginBottom: 6,
          }}
        >
          Deliveries start December 1, 2026
        </div>
        <div style={{ fontSize: 13, color: palette.muted, lineHeight: 1.55 }}>
          Orders ship in the sequence they are paid. We will send a
          tracking number the moment your parcel leaves the workshop.
        </div>
      </Panel>

      <Button href={orderUrl}>View your order</Button>

      <p style={Fine}>
        Questions? Reply to this email or write to{" "}
        <strong>hello@sphereofkings.com</strong>. Save this message — it is
        your receipt.
      </p>
    </EmailShell>
  );
}
