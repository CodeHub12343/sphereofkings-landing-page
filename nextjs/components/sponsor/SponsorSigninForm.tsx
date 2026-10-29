"use client";

import { useState, useTransition } from "react";
import styled from "styled-components";
import { BtnGold, Input } from "@/components/shared";
import { requestSponsorMagicLinkAction } from "@/app/sponsor/signin/actions";

const Wrap = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

const Msg = styled.div<{ $error?: boolean }>`
  padding: 10px 14px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  background: ${(p) =>
    p.$error ? "rgba(255,107,122,0.1)" : "rgba(79,176,125,0.08)"};
  color: ${(p) => (p.$error ? "#ff6b7a" : "#4fb07d")};
  border: 1px solid
    ${(p) => (p.$error ? "rgba(255,107,122,0.4)" : "rgba(79,176,125,0.4)")};
`;

export default function SponsorSigninForm({
  initialError,
}: {
  initialError: string | null;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestSponsorMagicLinkAction(email);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <Wrap>
        <Msg role="status">
          <strong>Check your inbox.</strong> If an active sponsorship is on
          file for <strong>{email}</strong>, we just sent you a sign-in link.
          It expires in 30 minutes.
        </Msg>
        <p
          style={{
            color: "#a89880",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Didn't get it? Check your spam folder. If nothing arrives in a few
          minutes, email James at Jbowser727@gmail.com.
        </p>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <Label>
          Email on file
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            autoComplete="email"
          />
        </Label>
        {error && (
          <Msg $error role="alert">
            {error}
          </Msg>
        )}
        <BtnGold type="submit" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Sending link…" : "Email me the sign-in link"}
        </BtnGold>
      </form>
    </Wrap>
  );
}
