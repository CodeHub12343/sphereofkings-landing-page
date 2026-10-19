"use client";

import { useActionState } from "react";
import styled from "styled-components";
import { signoutAction, updateProfileAction } from "../(player)/account-actions";

interface Props {
  initial: { displayName: string; bio: string; publicProfile: boolean; isMinor: boolean; };
}

export default function MeForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {} as { error?: string; ok?: boolean });
  return (
    <>
      <Form action={formAction}>
        <Field>
          <label>Display name</label>
          <input name="displayName" defaultValue={initial.displayName} required maxLength={40} />
        </Field>
        <Field>
          <label>Bio</label>
          <textarea name="bio" defaultValue={initial.bio} maxLength={400} rows={3} />
        </Field>
        {!initial.isMinor && (
          <CheckRow>
            <input type="checkbox" name="publicProfile" id="publicProfile"
                   defaultChecked={initial.publicProfile} />
            <label htmlFor="publicProfile">
              Public profile — your rating and stats visible at /u/username
            </label>
          </CheckRow>
        )}
        {initial.isMinor && (
          <Note>Minors (under 18) have a private profile by default; it cannot be made public.</Note>
        )}
        {state?.error && <ErrorBanner role="alert">{state.error}</ErrorBanner>}
        {state?.ok && <OkBanner>Saved.</OkBanner>}
        <Submit disabled={pending}>{pending ? "Saving…" : "Save profile"}</Submit>
      </Form>
      <form action={signoutAction} style={{ marginTop: 20 }}>
        <SignOut type="submit">Sign out</SignOut>
      </form>
    </>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:12px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:13px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;}
  input,textarea{
    background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:6px;
    padding:10px 12px;font-size:14px;font-family:inherit;
  }
`;
const CheckRow = styled.div`
  display:flex;gap:10px;align-items:flex-start;
  input{margin-top:3px;}
  label{color:var(--text,#f5f0e8);font-size:14px;}
`;
const Note = styled.p`
  font-size:13px;color:var(--text-muted,#a89880);margin:0;
  padding:10px;background:rgba(76,124,224,.08);border:1px solid var(--minor-badge,#4c7ce0);border-radius:6px;
`;
const Submit = styled.button`
  align-self:flex-start;background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:10px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);}
  &:disabled{opacity:.6;}
`;
const SignOut = styled.button`
  background:transparent;color:var(--text-muted,#a89880);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:8px 12px;font-size:13px;cursor:pointer;
  &:hover{color:var(--status-urgent,#ff6b7a);border-color:var(--status-urgent,#ff6b7a);}
`;
const ErrorBanner = styled.div`
  padding:8px;border:1px solid var(--status-urgent,#ff6b7a);border-radius:6px;
  color:var(--status-urgent,#ff6b7a);background:rgba(255,107,122,.08);font-size:13px;
`;
const OkBanner = styled.div`
  padding:8px;border:1px solid var(--status-online,#4fb07d);border-radius:6px;
  color:var(--status-online,#4fb07d);background:rgba(79,176,125,.08);font-size:13px;
`;
