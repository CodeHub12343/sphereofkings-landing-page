"use client";

import { useActionState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { Wrap } from "@/components/shared";
import { adminSignInAction, AdminSignInState } from "./actions";

const Section = styled.section`
  background: #0a0a0a;
  min-height: 100vh;
  padding: clamp(48px, 7vw, 96px) 0;
  display: flex;
  align-items: center;
`;

const Card = styled.form`
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #f5f0e8;
  text-decoration: none;
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const Sphere = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 32% 28%,
    #e7cb70 0%,
    #d4af37 25%,
    #8a6e1f 55%,
    #1a1510 85%
  );
`;

const Badge = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(185, 28, 28, 0.14);
  color: #ff6b7a;
  padding: 3px 8px;
  border: 1px solid rgba(255, 107, 122, 0.35);
  border-radius: 4px;
  margin-left: auto;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
  margin: 0;
  line-height: 1.55;
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

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #a89880;
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

const Submit = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 13px 20px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
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

const Fine = styled.p`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #5a4a38;
  line-height: 1.5;
`;

const INITIAL: AdminSignInState = {};

export default function AdminSignInPage() {
  const [state, formAction, pending] = useActionState(adminSignInAction, INITIAL);
  return (
    <Section>
      <Wrap>
        <Card action={formAction} noValidate>
          <Brand href="/">
            <Sphere aria-hidden="true" />
            Sphere of Kings
            <Badge>Admin</Badge>
          </Brand>
          <Title>Sign in to the admin console.</Title>
          <Sub>
            Per-account signin. Add new operators from <strong>Admin → Settings</strong>{" "}
            once you're in.
          </Sub>
          {state.error && <ErrorBox role="alert">{state.error}</ErrorBox>}
          <Row>
            <Label htmlFor="admin-email">Email</Label>
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
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@sphereofkings.com"
                required
              />
            </Field>
          </Row>
          <Row>
            <Label htmlFor="admin-password">Password</Label>
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
                id="admin-password"
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
          <Fine>
            First time? The first owner is seeded from the{" "}
            <code
              style={{
                fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
                color: "#f0c040",
              }}
            >
              ADMIN_USER
            </code>{" "}
            /{" "}
            <code
              style={{
                fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
                color: "#f0c040",
              }}
            >
              ADMIN_PASSWORD
            </code>{" "}
            env vars on first signin. Rotate the seed password out of your
            env after you're in.
          </Fine>
        </Card>
      </Wrap>
    </Section>
  );
}
