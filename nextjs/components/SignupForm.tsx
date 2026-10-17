"use client";

import { useState } from "react";
import styled from "styled-components";
import { BtnGold, Input, SUBSCRIBED_EVENT } from "./shared";
import SubscriberCounter from "./SubscriberCounter";

type State = "idle" | "loading" | "success";

const Column = styled.div<{ $maxWidth?: string }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: ${(p) => p.$maxWidth ?? "none"};
`;

const SuccessBox = styled.div`
  background: #0a1f0a;
  border: 1px solid #1a5c1a;
  border-radius: 8px;
  padding: 24px 20px;
  text-align: center;

  p.title {
    color: #f5f0e8;
    font-family: 'Cinzel', serif;
    margin: 0 0 6px;
    font-size: 1.1rem;
  }
  p.sub {
    color: #a89880;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const LoadingBox = styled.div`
  text-align: center;
  padding: 24px 20px;

  p {
    color: #c9a227;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    margin: 0;
    letter-spacing: 0.08em;
  }
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 0.83rem;
  margin: 0;
  line-height: 1.4;
`;

const FinePrint = styled.p<{ $align?: string }>`
  color: #a89880;
  font-size: 0.82rem;
  margin: 10px 0 0;
  line-height: 1.5;
  text-align: ${(p) => p.$align ?? "left"};
`;

const SubmitBtn = styled(BtnGold)`
  width: 100%;
  padding: 16px;
  font-size: 1rem;
`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupForm({
  source,
  maxWidth,
  finePrint,
}: {
  source: "hero" | "final";
  maxWidth?: string;
  finePrint: string;
}) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    const e = email.trim();
    const n = name.trim();
    if (!e) {
      setError("Please enter your email.");
      return;
    }
    if (!EMAIL_RE.test(e)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setState("loading");
    try {
      const res = await fetch("https://formspree.io/f/mjgavdkg", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e,
          name: n,
          source,
          _subject: `Sphere of Kings waitlist signup (${source})`,
        }),
      });
      if (res.ok) {
        setState("success");
        window.dispatchEvent(new Event(SUBSCRIBED_EVENT));
      } else {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data && Array.isArray(data.errors) && data.errors[0]?.message) {
            msg = data.errors[0].message;
          }
        } catch {
          /* ignore */
        }
        setState("idle");
        setError(msg);
      }
    } catch {
      setState("idle");
      setError("Network error. Please check your connection and try again.");
    }
  }

  if (state === "success") {
    return (
      <SuccessBox>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ marginBottom: 10 }}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
        <p className="title">Welcome to the Kingdom!</p>
        <p className="sub">We&apos;ll email you on launch day, November 19, 2026.</p>
      </SuccessBox>
    );
  }

  if (state === "loading") {
    return (
      <LoadingBox>
        <p>Joining the Kingdom…</p>
      </LoadingBox>
    );
  }

  return (
    <div>
      <Column $maxWidth={maxWidth}>
        <Input
          type="text"
          placeholder="First name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="First name, optional"
          autoComplete="given-name"
        />
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          aria-label="Email address, required"
          aria-required="true"
          autoComplete="email"
          $error={!!error}
        />
        {error ? <ErrorText role="alert">{error}</ErrorText> : null}
        <SubmitBtn type="button" onClick={submit}>
          Notify Me at Launch
        </SubmitBtn>
        <SubscriberCounter />
      </Column>
      <FinePrint>{finePrint}</FinePrint>
    </div>
  );
}
