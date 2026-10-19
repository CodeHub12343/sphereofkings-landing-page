"use client";

import Link from "next/link";
import { useActionState } from "react";
import styled from "styled-components";
import { signupAction } from "../(player)/account-actions";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, {} as { error?: string; ok?: boolean });
  return (
    <Form action={formAction}>
      <Field>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" required
               autoComplete="username" maxLength={20}
               pattern="^[a-zA-Z0-9_]{3,20}$"
               aria-describedby="hint-username" />
        <Hint id="hint-username">3–20 chars, letters / numbers / underscore. Shown in your profile URL.</Hint>
      </Field>
      <Field>
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required maxLength={40} autoComplete="nickname" />
      </Field>
      <Field>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={10}
               autoComplete="new-password" aria-describedby="hint-password" />
        <Hint id="hint-password">At least 10 characters.</Hint>
      </Field>
      <Field>
        <label htmlFor="yearOfBirth">Year of birth</label>
        <input id="yearOfBirth" name="yearOfBirth" required inputMode="numeric"
               pattern="^(19|20)[0-9]{2}$" placeholder="e.g. 1998" />
        <Hint>We store only the year, not the full date. Under 13 cannot sign up.</Hint>
      </Field>
      {state?.error && <ErrorBanner role="alert">{state.error}</ErrorBanner>}
      <Submit disabled={pending}>{pending ? "Creating…" : "Create account"}</Submit>
      <AltLink>Already have one? <Link href="/signin">Sign in</Link></AltLink>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:14px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:13px;color:var(--text-muted,#a89880);letter-spacing:.05em;text-transform:uppercase;}
  input{
    background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:6px;
    padding:10px 12px;font-size:15px;
  }
  input:focus{outline:none;border-color:var(--gold,#c9a227);}
`;
const Hint = styled.span`font-size:12px;color:var(--text-muted,#a89880);`;
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
