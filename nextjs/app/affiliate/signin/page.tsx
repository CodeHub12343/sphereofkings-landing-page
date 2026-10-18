"use client";

import { useActionState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { signInAction, SignInState } from "./actions";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
  min-height: 72vh;
  display: flex;
  align-items: center;
`;

const Card = styled.form`
  max-width: 440px;
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

const Label = styled.label<{ $req?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #a89880;

  ${(p) => p.$req && `&::after { content: " *"; color: #b91c1c; }`}
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
  svg {
    color: #a89880;
    flex-shrink: 0;
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

const initialState: SignInState = {};

export default function AffiliateSignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <Card action={formAction} noValidate>
              <Eye>Affiliate · Sign in</Eye>
              <Title>Welcome back.</Title>
              <Sub>
                Sign in to see your referral link, QR code, printable poster
                and attributed sales.
              </Sub>
              {state.error && <ErrorBox role="alert">{state.error}</ErrorBox>}
              <Row>
                <Label $req htmlFor="aff-email">
                  Email
                </Label>
                <Field $err={!!state.error}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="10"
                      height="7"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M3 5l4 3 4-3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    id="aff-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourcompany.com"
                    required
                  />
                </Field>
              </Row>
              <Row>
                <Label $req htmlFor="aff-password">
                  Password
                </Label>
                <Field $err={!!state.error}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="6"
                      width="8"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 6V4a2 2 0 1 1 4 0v2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  <input
                    id="aff-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                  />
                </Field>
              </Row>
              <Submit type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </Submit>
              <Foot>
                Not an affiliate yet?{" "}
                <Link href="/affiliate/apply">Sign up for the program</Link>
              </Foot>
            </Card>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
