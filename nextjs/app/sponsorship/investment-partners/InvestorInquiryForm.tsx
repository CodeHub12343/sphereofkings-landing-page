"use client";

import { useState, useTransition } from "react";
import styled from "styled-components";
import { BtnGold, Input, Textarea } from "@/components/shared";
import { requestInvestorInfoAction } from "@/app/sponsorship/actions";

const Card = styled.div`
  background: linear-gradient(180deg, rgba(201, 162, 39, 0.06), #0e0c09);
  border: 1.5px solid #c9a227;
  border-radius: 14px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: 520px) {
    padding: 22px 20px;
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

const Select = styled.select`
  background: #0a0806;
  border: 1px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  padding: 10px 12px;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: #c9a227;
  }
`;

const Msg = styled.div<{ $error?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  background: ${(p) =>
    p.$error ? "rgba(255,107,122,0.1)" : "rgba(79,176,125,0.1)"};
  color: ${(p) => (p.$error ? "#ff6b7a" : "#4fb07d")};
  border: 1px solid
    ${(p) => (p.$error ? "rgba(255,107,122,0.4)" : "rgba(79,176,125,0.4)")};
`;

const SubmitBtn = styled(BtnGold)`
  width: 100%;
  padding: 14px 24px;
  font-size: 0.95rem;
`;

const emptyForm = {
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  organization: "",
  website: "",
  investmentRange: "",
  accredited: "",
  timeline: "",
  notes: "",
};

export default function InvestorInquiryForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onField<K extends keyof typeof emptyForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await requestInvestorInfoAction(form);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSuccess(
        `Thanks ${form.contactName}. James will personally reply to ${form.contactEmail} with the Investment Partners deck and next steps — usually within one business day.`,
      );
    });
  }

  if (success) {
    return (
      <Card>
        <Msg role="status">{success}</Msg>
      </Card>
    );
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
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
              placeholder="jane@yourfund.com"
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
            Organization / fund (optional)
            <Input
              value={form.organization}
              onChange={(e) => onField("organization", e.target.value)}
              placeholder="Acme Capital Partners"
            />
          </Label>
        </Grid2>
        <Label>
          Website (optional)
          <Input
            value={form.website}
            onChange={(e) => onField("website", e.target.value)}
            placeholder="acmecapital.com"
          />
        </Label>
        <Grid2>
          <Label>
            Investment range
            <Select
              required
              value={form.investmentRange}
              onChange={(e) => onField("investmentRange", e.target.value)}
            >
              <option value="">Select a range…</option>
              <option value="$25k – $100k">$25k – $100k</option>
              <option value="$100k – $250k">$100k – $250k</option>
              <option value="$250k – $500k">$250k – $500k</option>
              <option value="$500k – $1M">$500k – $1M</option>
              <option value="$1M+">$1M+</option>
            </Select>
          </Label>
          <Label>
            Accredited investor?
            <Select
              value={form.accredited}
              onChange={(e) => onField("accredited", e.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Unsure">Unsure</option>
            </Select>
          </Label>
        </Grid2>
        <Label>
          Timeline (optional)
          <Input
            value={form.timeline}
            onChange={(e) => onField("timeline", e.target.value)}
            placeholder="This quarter · 3–6 months · Exploring"
          />
        </Label>
        <Label>
          What are you looking for? (optional)
          <Textarea
            value={form.notes}
            onChange={(e) => onField("notes", e.target.value)}
            placeholder="Equity, revenue-share, naming-rights partnership, strategic distribution, etc. Any ROI expectations or structure preferences you want us to address."
          />
        </Label>

        {error && (
          <Msg $error role="alert">
            {error}
          </Msg>
        )}

        <SubmitBtn type="submit" disabled={pending}>
          {pending ? "Sending…" : "Apply for Investment Partner information"}
        </SubmitBtn>

        <p
          style={{
            color: "#5a4a38",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem",
            lineHeight: 1.55,
            margin: 0,
            textAlign: "center",
          }}
        >
          This is a request for information, not an offer to sell securities.
          Any investment, dividend or profit-sharing terms are agreed in a
          separate written agreement after direct conversation and due
          diligence. Projected returns are not guaranteed.
        </p>
      </form>
    </Card>
  );
}
