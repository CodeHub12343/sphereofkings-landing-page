"use client";

import { useActionState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { applyAction, ApplyState } from "./actions";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
  min-height: 72vh;
  display: flex;
  align-items: center;
`;

const Card = styled.form`
  max-width: 520px;
  margin: 0 auto;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Eye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a227;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  color: #a89880;
  margin: 0 0 4px;
  line-height: 1.55;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #a89880;

  &::after {
    content: " *";
    color: #b91c1c;
  }
`;

const Field = styled.div<{ $err?: boolean }>`
  background: #1a1612;
  border: 1.5px solid ${(p) => (p.$err ? "#b91c1c" : "#2e2618")};
  border-radius: 8px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:focus-within {
    border-color: ${(p) => (p.$err ? "#b91c1c" : "#c9a227")};
    box-shadow: 0 0 0 3px
      ${(p) =>
        p.$err ? "rgba(185, 28, 28, 0.14)" : "rgba(201, 162, 39, 0.12)"};
  }

  input {
    background: transparent;
    border: 0;
    outline: 0;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    flex: 1;
    width: 100%;
  }
  input::placeholder {
    color: #5a4a38;
  }
`;

const ErrorBox = styled.p`
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid #c62b44;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #ff6b7a;
  line-height: 1.45;
`;

const Submit = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 14px 20px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Foot = styled.p`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
  line-height: 1.55;
  text-align: center;

  a {
    color: #f0c040;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const initialState: ApplyState = {};

export default function AffiliateApplyPage() {
  const [state, formAction, pending] = useActionState(applyAction, initialState);

  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <Card action={formAction} noValidate>
              <Eye>Affiliate · Sign up</Eye>
              <Title>Join the affiliate program.</Title>
              <Sub>
                Fill in your details and pick a password. Your account is
                active immediately — once you submit, you land on your
                dashboard with a referral link, QR code and printable poster
                ready to share.
              </Sub>
              {state.error && <ErrorBox role="alert">{state.error}</ErrorBox>}
              <Row2>
                <Row>
                  <Label htmlFor="firstName">First name</Label>
                  <Field $err={!!state.error}>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                    />
                  </Field>
                </Row>
                <Row>
                  <Label htmlFor="lastName">Last name</Label>
                  <Field $err={!!state.error}>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                    />
                  </Field>
                </Row>
              </Row2>
              <Row>
                <Label htmlFor="email">Email</Label>
                <Field $err={!!state.error}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourcompany.com"
                    required
                  />
                </Field>
              </Row>
              <Row2>
                <Row>
                  <Label htmlFor="password">Password</Label>
                  <Field $err={!!state.error}>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="At least 8 characters"
                      required
                    />
                  </Field>
                </Row>
                <Row>
                  <Label htmlFor="confirm">Confirm</Label>
                  <Field $err={!!state.error}>
                    <input
                      id="confirm"
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </Field>
                </Row>
              </Row2>
              <Submit type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Submit>
              <Foot>
                Already an affiliate?{" "}
                <Link href="/affiliate/signin">Sign in</Link>
              </Foot>
            </Card>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
