"use client";

import Link from "next/link";
import { useActionState } from "react";
import styled from "styled-components";
import { signupAction } from "../(player)/account-actions";
import {
  FField, FLabel, FInput, FBtnGold, FBanner,
} from "@/components/feature/primitives";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, {} as { error?: string; ok?: boolean });
  return (
    <Form action={formAction}>
      <FField>
        <FLabel htmlFor="username">Username</FLabel>
        <FInput id="username" name="username" required
                autoComplete="username" maxLength={20}
                pattern="^[a-zA-Z0-9_]{3,20}$"
                aria-describedby="hint-username" />
        <Hint id="hint-username">3–20 chars, letters / numbers / underscore. Shown in your profile URL.</Hint>
      </FField>
      <FField>
        <FLabel htmlFor="displayName">Display name</FLabel>
        <FInput id="displayName" name="displayName" required maxLength={40} autoComplete="nickname" />
      </FField>
      <FField>
        <FLabel htmlFor="email">Email</FLabel>
        <FInput id="email" name="email" type="email" required autoComplete="email" />
      </FField>
      <FField>
        <FLabel htmlFor="password">Password</FLabel>
        <FInput id="password" name="password" type="password" required minLength={10}
                autoComplete="new-password" aria-describedby="hint-password" />
        <Hint id="hint-password">At least 10 characters.</Hint>
      </FField>
      <FField>
        <FLabel htmlFor="yearOfBirth">Year of birth</FLabel>
        <FInput id="yearOfBirth" name="yearOfBirth" required inputMode="numeric"
                pattern="^(19|20)[0-9]{2}$" placeholder="e.g. 1998" />
        <Hint>We store only the year, not the full date. Under 13 cannot sign up.</Hint>
      </FField>
      {state?.error && <FBanner $tone="danger" role="alert">{state.error}</FBanner>}
      <FBtnGold type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? "Creating…" : "Create account"}
      </FBtnGold>
      <AltLink>Already have one? <Link href="/signin">Sign in</Link></AltLink>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;`;
const Hint = styled.span`font-size:12px;color:var(--text-muted,#a89880);`;
const AltLink = styled.p`
  margin:14px 0 0;text-align:center;font-size:14px;color:var(--text-muted,#a89880);
  a{color:var(--gold-light,#f0c040);text-decoration:none;}
  a:hover{text-decoration:underline;}
`;
