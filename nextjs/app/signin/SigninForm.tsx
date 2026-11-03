"use client";

import Link from "next/link";
import { useActionState } from "react";
import styled from "styled-components";
import { signinAction } from "../(player)/account-actions";
import { FField, FLabel, FInput, FBtnGold, FBanner } from "@/components/feature/primitives";

export default function SigninForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signinAction, {} as { error?: string; ok?: boolean });
  return (
    <Form action={formAction}>
      {next && <input type="hidden" name="next" value={next} />}
      <FField>
        <FLabel htmlFor="identifier">Username or email</FLabel>
        <FInput id="identifier" name="identifier" required autoComplete="username" />
      </FField>
      <FField>
        <FLabel htmlFor="password">Password</FLabel>
        <FInput id="password" name="password" type="password" required autoComplete="current-password" />
      </FField>
      {state?.error && <FBanner $tone="danger" role="alert">{state.error}</FBanner>}
      <FBtnGold type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? "Signing in…" : "Sign in"}
      </FBtnGold>
      <AltLink>No account yet? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Create one</Link></AltLink>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;`;
const AltLink = styled.p`
  margin:14px 0 0;text-align:center;font-size:14px;color:var(--text-muted,#a89880);
  a{color:var(--gold-light,#f0c040);text-decoration:none;}
  a:hover{text-decoration:underline;}
`;
