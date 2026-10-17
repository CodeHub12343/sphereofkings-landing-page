"use client";

import { useRef, useState } from "react";
import styled from "styled-components";
import { Wrap, GoldTitle, SectionEyebrow, BtnGold, Input, Textarea } from "./shared";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg2);
  border-top: 1px solid #1a1510;
`;

const Heading = styled(GoldTitle)`
  text-align: center;
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 12px;
  font-weight: 900;
`;

const Sub = styled.p`
  text-align: center;
  color: #a89880;
  max-width: 560px;
  margin: 0 auto 36px;
  font-size: 1rem;
  line-height: 1.65;
`;

const FormBox = styled.form`
  max-width: 720px;
  margin: 0 auto;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: clamp(20px, 4vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;

  @media (max-width: 540px) {
    > * {
      width: 100%;
      justify-content: center;
      text-align: center;
    }
  }
`;

const SubmitBtn = styled(BtnGold)`
  padding: 14px 28px;
`;

const Ghost = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1.5px solid #4a3a18;
  color: #c9a227;
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 12px 20px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;

  &:hover {
    border-color: #c9a227;
    color: #f0c040;
    background: rgba(201, 162, 39, 0.06);
  }
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 0.86rem;
  margin: 0;
  line-height: 1.4;
`;

const Success = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0a1f0a;
  border: 1px solid #1a5c1a;
  border-radius: 8px;
  padding: 14px 18px;
  color: #d7f5d7;
  font-size: 0.95rem;
`;

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function submit() {
    const e = email.trim();
    const m = message.trim();
    if (!e || !EMAIL_RE.test(e)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (!m) {
      setErr("Please include a message.");
      return;
    }
    setErr("");
    setSending(true);
    try {
      const res = await fetch("https://formspree.io/f/mjgavdkg", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e,
          name: name.trim(),
          subject: subject.trim(),
          message: m,
          source: "contact",
          _subject: "Sphere of Kings — contact message",
        }),
      });
      if (res.ok) {
        setOk(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOk(false), 6000);
      } else {
        setErr("Could not send. Please try again or email hello@sphereofkings.com.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Section id="contact">
      <Wrap>
        <SectionEyebrow>Get in Touch</SectionEyebrow>
        <Heading>Send us a message</Heading>
        <Sub>Inquiry, sponsorship, partnerships — we&apos;d love to hear from you.</Sub>
        <FormBox noValidate onSubmit={(e) => e.preventDefault()}>
          <Row>
            <Input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              aria-label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Your email"
              autoComplete="email"
              aria-label="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Row>
          <Input
            type="text"
            placeholder="Subject (e.g. Partnership)"
            aria-label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            rows={5}
            placeholder="Your message..."
            aria-label="Your message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {err ? <ErrorText role="alert">{err}</ErrorText> : null}
          <Actions>
            <SubmitBtn type="button" disabled={sending} onClick={submit}>
              {sending ? "Sending…" : "Send Message"}
            </SubmitBtn>
            <Ghost href="mailto:hello@sphereofkings.com?subject=Speak%20to%20a%20representative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Speak to a representative
            </Ghost>
          </Actions>
          {ok ? (
            <Success>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="8 12 11 15 16 9" />
              </svg>
              <span>Thanks — we&apos;ll be in touch soon.</span>
            </Success>
          ) : null}
        </FormBox>
      </Wrap>
    </Section>
  );
}
