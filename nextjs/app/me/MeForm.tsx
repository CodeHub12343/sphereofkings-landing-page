"use client";

import { useActionState } from "react";
import styled from "styled-components";
import { signoutAction, updateProfileAction } from "../(player)/account-actions";
import {
  FField, FLabel, FInput, FSelect, FTextarea,
  FBtnGold, FBtnDanger, FBanner,
} from "@/components/feature/primitives";

interface Props {
  initial: { displayName: string; bio: string; publicProfile: boolean; isMinor: boolean; region: string; };
}

export default function MeForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {} as { error?: string; ok?: boolean });
  return (
    <>
      <Form action={formAction}>
        <FField>
          <FLabel>Display name</FLabel>
          <FInput name="displayName" defaultValue={initial.displayName} required maxLength={40} />
        </FField>
        <FField>
          <FLabel>Bio</FLabel>
          <FTextarea name="bio" defaultValue={initial.bio} maxLength={400} rows={3} />
        </FField>
        <FField>
          <FLabel>Region</FLabel>
          <FSelect name="region" defaultValue={initial.region}>
            <option value="global">Global (no region)</option>
            <option value="na">North America</option>
            <option value="sa">South America</option>
            <option value="eu">Europe</option>
            <option value="africa">Africa</option>
            <option value="asia">Asia</option>
            <option value="oceania">Oceania</option>
          </FSelect>
        </FField>
        {!initial.isMinor && (
          <CheckRow>
            <input type="checkbox" name="publicProfile" id="publicProfile" defaultChecked={initial.publicProfile} />
            <label htmlFor="publicProfile">
              Public profile — your rating and stats visible at /u/username
            </label>
          </CheckRow>
        )}
        {initial.isMinor && (
          <FBanner $tone="info">Minors (under 18) have a private profile by default; it cannot be made public.</FBanner>
        )}
        {state?.error && <FBanner $tone="danger" role="alert">{state.error}</FBanner>}
        {state?.ok && <FBanner $tone="success">Saved.</FBanner>}
        <FBtnGold type="submit" disabled={pending} style={{ alignSelf: "flex-start", marginTop: 6 }}>
          {pending ? "Saving…" : "Save profile"}
        </FBtnGold>
      </Form>
      <form action={signoutAction} style={{ marginTop: 24 }}>
        <FBtnDanger type="submit">Sign out</FBtnDanger>
      </form>
    </>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;`;
const CheckRow = styled.div`
  display:flex;gap:10px;align-items:flex-start;margin:6px 0 10px;
  input{margin-top:3px;accent-color:var(--gold,#c9a227);}
  label{color:var(--text,#f5f0e8);font-size:14px;}
`;
