"use client";

import { useActionState, useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { BtnGold, Input, SUBSCRIBED_EVENT } from "./shared";
import SubscriberCounter from "./SubscriberCounter";
import {
  subscribeAction,
  SignupState,
} from "@/app/subscribe/actions";

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

  p.title {
    color: #f5f0e8;
    font-family: "Cinzel", serif;
    margin: 0 0 6px;
    font-size: 1.1rem;
    text-align: center;
  }
  p.sub {
    color: #a89880;
    margin: 0 0 14px;
    font-size: 0.9rem;
    line-height: 1.5;
    text-align: center;
  }
`;

const ConfirmPanel = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px dashed #e0a94a;
  border-radius: 8px;
  padding: 14px;
  margin-top: 12px;

  .k {
    font-family: "Cinzel", serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #e0a94a;
    margin: 0 0 6px;
  }
  .url {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.78rem;
    color: #f5f0e8;
    word-break: break-all;
    margin: 0 0 10px;
    background: #0a0a0a;
    padding: 8px 10px;
    border-radius: 4px;
    border: 1px solid #2e2618;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .btn {
    font-family: "Cinzel", serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    border: 0;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary {
    background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
    color: #0a0a0a;
  }
  .btn-ghost {
    background: transparent;
    border: 1px solid #2e2618;
    color: #a89880;
  }
  .fine {
    font-size: 0.72rem;
    color: #a89880;
    margin: 10px 0 0;
    line-height: 1.5;
  }
`;

const LoadingBox = styled.div`
  text-align: center;
  padding: 24px 20px;

  p {
    color: #c9a227;
    font-family: "Cinzel", serif;
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

const AlreadyBox = styled.div`
  background: rgba(79, 176, 125, 0.08);
  border: 1px solid #4fb07d;
  border-radius: 8px;
  padding: 20px;
  text-align: center;

  p.title {
    color: #4fb07d;
    font-family: "Cinzel", serif;
    margin: 0 0 6px;
    font-size: 1.05rem;
  }
  p.sub {
    color: #a89880;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const INITIAL: SignupState = { kind: "idle" };

// Keeps the Formspree notification working as a side-channel so the
// owner's inbox still gets a nudge while a real email provider is being
// wired. Failing silently is fine — the primary signup lands in the
// app-side subscribers store either way.
const FORMSPREE_URL = "https://formspree.io/f/mjgavdkg";

export default function SignupForm({
  source,
  maxWidth,
  finePrint,
}: {
  source: string;
  maxWidth?: string;
  finePrint: string;
}) {
  const [state, formAction, pending] = useActionState(subscribeAction, INITIAL);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  // Fire the SUBSCRIBED_EVENT so the counter refreshes, and ping
  // Formspree once per successful submission.
  useEffect(() => {
    if (state.kind === "pending-confirm" && !state.resent) {
      window.dispatchEvent(new Event(SUBSCRIBED_EVENT));
      try {
        void fetch(FORMSPREE_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: state.email,
            name: state.firstName,
            source,
            _subject: `Sphere of Kings waitlist signup (${source})`,
          }),
          mode: "cors",
          keepalive: true,
        });
      } catch {
        // best-effort side channel; the real record is in the store
      }
    }
  }, [state, source]);

  const copyConfirmUrl = async (url: string) => {
    const absolute =
      typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  };

  if (state.kind === "pending-confirm") {
    return (
      <SuccessBox>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f0c040"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ display: "block", margin: "0 auto 10px" }}
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        <p className="title">
          {state.resent ? "Confirmation link resent." : "Check your inbox."}
        </p>
        <p className="sub">
          We saved <strong style={{ color: "#f5f0e8" }}>{state.email}</strong>{" "}
          as pending. Confirm once from the link below and you're on the list.
        </p>
        <ConfirmPanel>
          <p className="k">Email provider not yet wired</p>
          <p className="url">{state.confirmPath}</p>
          <div className="row">
            <Link href={state.confirmPath} className="btn btn-primary">
              Confirm now →
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => copyConfirmUrl(state.confirmPath)}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="fine">
            Once an email provider is wired (Resend / Postmark), this link
            will arrive by email instead of showing here. Owner is still
            notified by email via Formspree in the meantime.
          </p>
        </ConfirmPanel>
      </SuccessBox>
    );
  }

  if (state.kind === "already-consented") {
    return (
      <AlreadyBox>
        <p className="title">You&apos;re already on the list.</p>
        <p className="sub">
          {state.email} is confirmed. We will email you on launch day.
        </p>
      </AlreadyBox>
    );
  }

  if (state.kind === "unsubscribed") {
    return (
      <AlreadyBox style={{ borderColor: "#e0a94a", background: "rgba(224,169,74,0.08)" }}>
        <p className="title" style={{ color: "#e0a94a" }}>
          {state.email} previously unsubscribed.
        </p>
        <p className="sub">
          Write to <strong>hello@sphereofkings.com</strong> if you&apos;d like to re-join
          the list — we won&apos;t re-opt you in automatically.
        </p>
      </AlreadyBox>
    );
  }

  if (pending) {
    return (
      <LoadingBox>
        <p>Joining the Kingdom…</p>
      </LoadingBox>
    );
  }

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="source" value={source} />
      <Column $maxWidth={maxWidth}>
        <Input
          type="text"
          name="firstName"
          placeholder="First name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="First name, optional"
          autoComplete="given-name"
        />
        <Input
          type="email"
          name="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address, required"
          aria-required="true"
          autoComplete="email"
          $error={state.kind === "error"}
          required
        />
        {state.kind === "error" ? (
          <ErrorText role="alert">{state.message}</ErrorText>
        ) : null}
        <SubmitBtn type="submit">Notify Me at Launch</SubmitBtn>
        <SubscriberCounter />
      </Column>
      <FinePrint>{finePrint}</FinePrint>
    </form>
  );
}
