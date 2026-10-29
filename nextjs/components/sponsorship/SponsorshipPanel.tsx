"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { BtnGold, Input, Textarea } from "@/components/shared";
import {
  SponsorshipTier,
  SponsorshipTierId,
} from "@/lib/sponsorship";
import {
  AvailabilityByTier,
  joinWaitlistAction,
  reserveSponsorshipAction,
} from "@/app/sponsorship/actions";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $gold?: boolean }>`
  background: ${(p) =>
    p.$gold
      ? "linear-gradient(180deg, rgba(201,162,39,0.08), #0e0c09)"
      : "#0e0c09"};
  border: 1.5px solid ${(p) => (p.$gold ? "#c9a227" : "#1e1a12")};
  border-radius: 14px;
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 520px) {
    padding: 22px 20px 20px;
  }
`;

const Eyebrow = styled.p<{ $gold?: boolean }>`
  margin: 0;
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${(p) => (p.$gold ? "#f0c040" : "#a89880")};
`;

const TierName = styled.h2`
  margin: 0;
  font-family: "Cinzel", Georgia, serif;
  font-size: clamp(1.4rem, 2.4vw, 1.8rem);
  color: #f5f0e8;
  font-weight: 800;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const PriceAmount = styled.span`
  font-family: "Cinzel", serif;
  font-size: 2.4rem;
  font-weight: 900;
  color: #f5f0e8;
`;

const PriceTag = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
`;

const Tagline = styled.p`
  margin: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.55;
`;

const Avail = styled.div<{ $soldOut: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: ${(p) =>
    p.$soldOut ? "rgba(255,107,122,0.1)" : "rgba(79,176,125,0.1)"};
  color: ${(p) => (p.$soldOut ? "#ff6b7a" : "#4fb07d")};
  border: 1px solid
    ${(p) => (p.$soldOut ? "rgba(255,107,122,0.4)" : "rgba(79,176,125,0.4)")};
  align-self: flex-start;
`;

const Dot = styled.span<{ $soldOut: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => (p.$soldOut ? "#ff6b7a" : "#4fb07d")};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.li`
  position: relative;
  padding-left: 22px;
  color: #d9cfbe;
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.5;

  &::before {
    content: "✦";
    position: absolute;
    left: 0;
    top: 0;
    color: #c9a227;
    font-size: 0.85rem;
  }
`;

const DetailsToggle = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-start;
  transition: color 0.2s, border-color 0.2s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const DetailBlock = styled.div`
  background: #0a0806;
  border: 1px solid #1a1510;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  h3 {
    margin: 0;
    font-family: "Cinzel", serif;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #c9a227;
    font-weight: 700;
  }
  ul {
    margin: 6px 0 0;
    padding: 0 0 0 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #d9cfbe;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ActionBtn = styled(BtnGold)<{ $block?: boolean }>`
  ${(p) => (p.$block ? "width:100%;" : "")}
  padding: 14px 24px;
  font-size: 0.95rem;
`;

const SecondaryBtn = styled.button`
  background: transparent;
  border: 1.5px solid #c9a227;
  color: #f0c040;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 13px 24px;
  border-radius: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;

  &:hover,
  &:focus-visible {
    background: rgba(201, 162, 39, 0.08);
  }
`;

/* ---------- Modal / form containers ---------- */

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(6px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: #0e0c09;
  border: 1px solid #2e2618;
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 520px) {
    padding: 22px 20px;
  }
`;

const CloseX = styled.button`
  background: transparent;
  border: none;
  color: #a89880;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  position: absolute;
  top: 14px;
  right: 18px;

  &:hover,
  &:focus-visible {
    color: #f0c040;
  }
`;

const ModalShell = styled.div`
  position: relative;
  width: 100%;
  max-width: 560px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.03em;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
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

type Props = {
  availability: AvailabilityByTier;
  tiers: SponsorshipTier[];
};

type FormValues = {
  businessName: string;
  businessWebsite: string;
  businessCategory: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const emptyForm: FormValues = {
  businessName: "",
  businessWebsite: "",
  businessCategory: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

export default function SponsorshipPanel({ availability, tiers }: Props) {
  const router = useRouter();
  const [activeDetails, setActiveDetails] = useState<SponsorshipTierId | null>(
    null,
  );
  const [modal, setModal] = useState<
    | { kind: "purchase"; tier: SponsorshipTier }
    | { kind: "waitlist"; tier: SponsorshipTier }
    | null
  >(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openPurchase(t: SponsorshipTier) {
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setModal({ kind: "purchase", tier: t });
  }
  function openWaitlist(t: SponsorshipTier) {
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setModal({ kind: "waitlist", tier: t });
  }
  function closeModal() {
    if (pending) return;
    setModal(null);
  }

  function onField<K extends keyof FormValues>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      if (modal.kind === "purchase") {
        const res = await reserveSponsorshipAction({
          tier: modal.tier.id,
          businessName: form.businessName,
          businessWebsite: form.businessWebsite || undefined,
          businessCategory: form.businessCategory || undefined,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || undefined,
          notes: form.notes || undefined,
        });
        if (!res.ok) {
          if (res.reason === "sold-out") {
            setError(
              `${modal.tier.name} just sold out while you were filling this out — switching you to the waitlist.`,
            );
            setTimeout(() => {
              setModal({ kind: "waitlist", tier: modal.tier });
              setError(null);
            }, 1200);
            return;
          }
          if (res.reason === "validation") {
            setError(res.message);
            return;
          }
          setError("Something went wrong. Please try again.");
          return;
        }
        // Reservation accepted — hand off to the Stripe payment page.
        router.push(`/sponsorship/pay/${encodeURIComponent(res.ref)}`);
      } else {
        const res = await joinWaitlistAction({
          tier: modal.tier.id,
          businessName: form.businessName,
          businessWebsite: form.businessWebsite || undefined,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || undefined,
          notes: form.notes || undefined,
        });
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setSuccess(
          `You're on the list. We'll email ${form.contactEmail} the moment a ${modal.tier.name} slot opens.`,
        );
      }
    });
  }

  return (
    <>
      <Grid>
        {tiers.map((t) => {
          const avail = availability[t.id];
          const soldOut = avail.remaining <= 0;
          const open = activeDetails === t.id;
          const isGold = t.id === "gold";
          return (
            <Card key={t.id} $gold={isGold}>
              <Eyebrow $gold={isGold}>
                {isGold ? "Premium Partnership" : "Promotional Partnership"}
              </Eyebrow>
              <TierName>{t.name}</TierName>
              <Tagline>{t.summary}</Tagline>
              <Price>
                <PriceAmount>{t.priceDisplay}</PriceAmount>
                <PriceTag>· {t.tagline}</PriceTag>
              </Price>
              <Avail $soldOut={soldOut} aria-live="polite">
                <Dot $soldOut={soldOut} />
                {soldOut
                  ? `All ${avail.total} slots claimed — join the waitlist`
                  : `${avail.remaining} of ${avail.total} slots available`}
              </Avail>
              <List>
                {t.highlights.map((h) => (
                  <Item key={h}>{h}</Item>
                ))}
              </List>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
                {soldOut ? (
                  <SecondaryBtn
                    type="button"
                    onClick={() => openWaitlist(t)}
                  >
                    Notify Me When A Slot Opens
                  </SecondaryBtn>
                ) : (
                  <ActionBtn
                    type="button"
                    $block
                    onClick={() => openPurchase(t)}
                  >
                    Sponsor at {t.priceDisplay}
                  </ActionBtn>
                )}
                <DetailsToggle
                  type="button"
                  aria-expanded={open}
                  onClick={() => setActiveDetails(open ? null : t.id)}
                >
                  {open ? "Hide full benefits" : "View full benefits"}
                </DetailsToggle>
              </div>
              {open && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {t.benefits.map((b) => (
                    <DetailBlock key={b.heading}>
                      <h3>{b.heading}</h3>
                      <ul>
                        {b.items.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </DetailBlock>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </Grid>

      {modal && (
        <Scrim role="dialog" aria-modal="true" onClick={closeModal}>
          <ModalShell onClick={(e) => e.stopPropagation()}>
            <Modal>
              <CloseX
                type="button"
                aria-label="Close"
                onClick={closeModal}
                disabled={pending}
              >
                ×
              </CloseX>
              <div>
                <p
                  style={{
                    color: "#c9a227",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                  }}
                >
                  {modal.kind === "purchase"
                    ? "Reserve & pay"
                    : "Join the waitlist"}
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Cinzel', Georgia, serif",
                    color: "#f5f0e8",
                    fontSize: "1.4rem",
                  }}
                >
                  {modal.tier.name} · {modal.tier.priceDisplay}
                </h2>
                <p
                  style={{
                    color: "#a89880",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    margin: "8px 0 0",
                    lineHeight: 1.55,
                  }}
                >
                  {modal.kind === "purchase"
                    ? "Tell us about your business. On submit you'll go to a secure Stripe payment page to complete your sponsorship."
                    : "We'll email you the moment a slot opens — before we announce availability publicly."}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <Label>
                  Business name
                  <Input
                    required
                    value={form.businessName}
                    onChange={(e) => onField("businessName", e.target.value)}
                    placeholder="HobbyTown Elkhorn"
                  />
                </Label>
                <Grid2>
                  <Label>
                    Your name
                    <Input
                      required
                      value={form.contactName}
                      onChange={(e) => onField("contactName", e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </Label>
                  <Label>
                    Email
                    <Input
                      required
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => onField("contactEmail", e.target.value)}
                      placeholder="jane@yourbiz.com"
                    />
                  </Label>
                </Grid2>
                <Grid2>
                  <Label>
                    Phone (optional)
                    <Input
                      value={form.contactPhone}
                      onChange={(e) => onField("contactPhone", e.target.value)}
                      placeholder="555-867-5309"
                    />
                  </Label>
                  <Label>
                    Business website (optional)
                    <Input
                      value={form.businessWebsite}
                      onChange={(e) =>
                        onField("businessWebsite", e.target.value)
                      }
                      placeholder="hobbytown.com/elkhorn"
                    />
                  </Label>
                </Grid2>
                {modal.kind === "purchase" && (
                  <Label>
                    Business category (optional)
                    <Input
                      value={form.businessCategory}
                      onChange={(e) =>
                        onField("businessCategory", e.target.value)
                      }
                      placeholder="Hobby retail · Toy store · Family entertainment"
                    />
                  </Label>
                )}
                <Label>
                  Anything we should know? (optional)
                  <Textarea
                    value={form.notes}
                    onChange={(e) => onField("notes", e.target.value)}
                    placeholder="Preferred brand assets, questions about the agreement, timing considerations…"
                  />
                </Label>

                {error && (
                  <Msg $error role="alert">
                    {error}
                  </Msg>
                )}
                {success && <Msg role="status">{success}</Msg>}

                {!success && (
                  <ActionBtn $block type="submit" disabled={pending}>
                    {pending
                      ? "Submitting…"
                      : modal.kind === "purchase"
                      ? `Reserve & continue to payment · ${modal.tier.priceDisplay}`
                      : "Add me to the waitlist"}
                  </ActionBtn>
                )}
              </form>
            </Modal>
          </ModalShell>
        </Scrim>
      )}
    </>
  );
}
