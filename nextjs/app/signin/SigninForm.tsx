"use client";

import Link from "next/link";
import { useActionState } from "react";
import styled from "styled-components";
import { signinAction } from "../(player)/account-actions";

export default function SigninForm() {
  const [state, formAction, pending] = useActionState(signinAction, {} as { error?: string; ok?: boolean });
  return (
    <Form action={formAction}>
      <Field>
        <label htmlFor="identifier">Username or email</label>
        <input id="identifier" name="identifier" required autoComplete="username" />
      </Field>
      <Field>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>
      {state?.error && <ErrorBanner role="alert">{state.error}</ErrorBanner>}
      <Submit disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Submit>
      <AltLink>No account yet? <Link href="/signup">Create one</Link></AltLink>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:14px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:13px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;}
  input{
    background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:6px;
    padding:10px 12px;font-size:15px;
  }
  input:focus{outline:none;border-color:var(--gold,#c9a227);}
`;
const Submit = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:12px 14px;font-size:15px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);}
  &:disabled{opacity:.6;cursor:not-allowed;}
`;
const ErrorBanner = styled.div`
  padding:10px;border:1px solid var(--status-urgent,#ff6b7a);border-radius:6px;
  color:var(--status-urgent,#ff6b7a);background:rgba(255,107,122,.08);font-size:14px;
`;
const AltLink = styled.p`
  margin:0;text-align:center;font-size:14px;color:var(--text-muted,#a89880);
  a{color:var(--gold-light,#f0c040);text-decoration:none;}
  a:hover{text-decoration:underline;}
`;
