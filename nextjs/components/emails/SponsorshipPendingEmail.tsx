import { EmailShell, EyebrowBar, H1, Lead, Muted, Panel, KV } from "./shell";

export type SponsorshipPendingEmailProps = {
  tierName: string;
  priceDisplay: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessWebsite?: string;
  notes?: string;
  ref: string;
};

export default function SponsorshipPendingEmail(
  props: SponsorshipPendingEmailProps,
) {
  return (
    <EmailShell previewText={`New sponsorship reservation — ${props.tierName}`}>
      <EyebrowBar>Sponsorship Reservation</EyebrowBar>
      <h1 style={H1}>New {props.tierName} reservation</h1>
      <p style={Lead}>
        A business just reserved a slot and is proceeding to payment. If
        payment doesn't complete within a reasonable window, you may want to
        reach out personally — their details are below.
      </p>

      <Panel tone="gold">
        <KV k="Business" v={props.businessName} />
        <KV k="Package" v={props.tierName} />
        <KV k="Price" v={props.priceDisplay} mono />
        <KV k="Reference" v={props.ref} mono />
        <KV k="Contact" v={`${props.contactName} <${props.contactEmail}>`} />
        {props.contactPhone ? <KV k="Phone" v={props.contactPhone} /> : null}
        {props.businessWebsite ? (
          <KV k="Website" v={props.businessWebsite} />
        ) : null}
      </Panel>

      {props.notes ? (
        <>
          <p style={Muted}>
            <strong>Notes from the sponsor:</strong>
          </p>
          <p style={Lead}>{props.notes}</p>
        </>
      ) : null}
    </EmailShell>
  );
}
